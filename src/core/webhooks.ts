import { FerrazioError } from './errors.js';

/** Public Ed25519 key as served by `GET /v1/hooks/signing-keys` (JWKS, OKP). */
export interface WebhookKey {
  /** Opaque key id. Matches the `X-Ferrazio-Key-Id` header. */
  kid: string;
  /** Public key, base64url, 32 bytes. */
  x: string;
  kty?: string;
  crv?: string;
  [extra: string]: unknown;
}

/** Headers of an incoming webhook: a `Headers` object or a Node.js header bag. */
export type WebhookHeaders = Headers | Record<string, string | string[] | undefined>;

/**
 * A webhook whose signature and timestamp were verified.
 *
 * Only the body is signed. `type` and `eventId` therefore come from the body,
 * never from the `X-Ferrazio-Event` and `X-Ferrazio-Event-Id` headers, which
 * anyone holding a delivery could rewrite and replay.
 */
export interface WebhookEvent<TPayload = unknown> {
  /**
   * Event type from the signed body, e.g. `pay.pix.received` (`type`, or
   * `event_type` in the legacy body). `undefined` when the body does not carry
   * it: a custom body written by a flow block, or no body at all.
   */
  type: string | undefined;
  /** Event id from the signed body (`event_id`), as text. `undefined` when the body does not carry it. */
  eventId: string | undefined;
  /**
   * Id of this delivery (`X-Ferrazio-Delivery`). Not signed: use it only to
   * drop duplicates, together with `eventId`.
   */
  deliveryId: string | undefined;
  /** Signature time, Unix seconds. */
  timestamp: number;
  /** Id of the key that signed the delivery. */
  keyId: string;
  /** Parsed JSON body. `undefined` when the delivery has no body. */
  payload: TPayload;
}

/** Why a webhook was refused. */
export type WebhookFailureReason =
  | 'missing_headers'
  | 'timestamp_out_of_tolerance'
  | 'unknown_key'
  | 'invalid_signature'
  /** The body is not JSON, or an event header disagrees with the signed body. */
  | 'invalid_payload';

/** The webhook could not be trusted. Answer it with 400 and do not process it. */
export class WebhookVerificationError extends FerrazioError {
  constructor(
    readonly reason: WebhookFailureReason,
    message: string,
  ) {
    super(message);
  }
}

/** Input of {@link verifyWebhookSignature}. */
export interface VerifySignatureInput {
  /** The request body exactly as received, before any JSON parsing. */
  rawBody: string | Uint8Array;
  headers: WebhookHeaders;
  /** Keys to try, matched by `kid`. */
  keys: readonly WebhookKey[];
  /** Largest accepted distance between now and the signature time. Default 300 s. */
  toleranceSeconds?: number;
  /** Current time in Unix seconds. Defaults to the system clock. */
  now?: number;
}

const DEFAULT_TOLERANCE_SECONDS = 300;

/**
 * Verifies one webhook against a known set of keys.
 *
 * The signed message is `v1:{X-Ferrazio-Timestamp}:{raw body}`, signed with
 * Ed25519 and sent in standard base64 in `X-Ferrazio-Signature`.
 *
 * @throws WebhookVerificationError when anything does not check out.
 */
export async function verifyWebhookSignature(input: VerifySignatureInput): Promise<{ timestamp: number; keyId: string }> {
  const keyId = header(input.headers, 'x-ferrazio-key-id');
  const signature = header(input.headers, 'x-ferrazio-signature');
  const timestampText = header(input.headers, 'x-ferrazio-timestamp');
  if (!keyId || !signature || !timestampText) {
    throw new WebhookVerificationError(
      'missing_headers',
      'Missing X-Ferrazio-Key-Id, X-Ferrazio-Signature or X-Ferrazio-Timestamp.',
    );
  }
  const timestamp = Number(timestampText);
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (!/^\d+$/.test(timestampText) || Math.abs(now - timestamp) > tolerance) {
    throw new WebhookVerificationError(
      'timestamp_out_of_tolerance',
      `Webhook timestamp is outside the ${tolerance} s tolerance.`,
    );
  }
  const key = input.keys.find((candidate) => candidate.kid === keyId);
  if (!key) throw new WebhookVerificationError('unknown_key', `No signing key with kid "${keyId}".`);

  const encoder = new TextEncoder();
  const prefix = encoder.encode(`v1:${timestampText}:`);
  const body = typeof input.rawBody === 'string' ? encoder.encode(input.rawBody) : input.rawBody;
  const message = new Uint8Array(prefix.length + body.length);
  message.set(prefix, 0);
  message.set(body, prefix.length);

  let valid = false;
  try {
    const publicKey = await globalThis.crypto.subtle.importKey(
      'jwk',
      { kty: 'OKP', crv: 'Ed25519', x: key.x },
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    valid = await globalThis.crypto.subtle.verify({ name: 'Ed25519' }, publicKey, fromBase64(signature) as BufferSource, message as BufferSource);
  } catch {
    valid = false;
  }
  if (!valid) throw new WebhookVerificationError('invalid_signature', 'Webhook signature does not match.');
  return { timestamp, keyId };
}

/** Options of {@link WebhookVerifier}. */
export interface WebhookVerifierOptions {
  /** Loads the current key set. The client wires this to `GET /v1/hooks/signing-keys`. */
  fetchKeys: () => Promise<readonly WebhookKey[]>;
  /** Largest accepted distance between now and the signature time. Default 300 s. */
  toleranceSeconds?: number;
  /** Shortest interval between two key fetches. Default 60000 ms. */
  minRefetchIntervalMs?: number;
  /**
   * Age after which the cached key set is fetched again before the next
   * verification, in milliseconds. Off by default: an unknown key or a failing
   * signature already triggers a fetch, which covers rotation.
   */
  maxKeyAgeMs?: number;
  /** Current time in Unix milliseconds. Defaults to `Date.now`. For tests with a fake clock. */
  now?: () => number;
}

/**
 * Verifies webhooks with a cached key set that follows key rotation.
 *
 * Keys are resolved by `kid`. An unknown `kid` or a failing signature triggers
 * one refetch of the key set (at most once per `minRefetchIntervalMs`) before
 * the delivery is refused, so a rotation never drops valid deliveries.
 *
 * @example
 * const verifier = fz.webhooks.verifier();
 * const event = await verifier.verify(rawBody, request.headers);
 */
export class WebhookVerifier {
  private keys: readonly WebhookKey[] = [];
  private lastFetch = 0;
  private pending: Promise<void> | undefined;
  private readonly fetchKeys: () => Promise<readonly WebhookKey[]>;
  private readonly toleranceSeconds: number;
  private readonly minRefetchIntervalMs: number;
  private readonly maxKeyAgeMs: number | undefined;
  private readonly now: () => number;

  constructor(options: WebhookVerifierOptions) {
    this.fetchKeys = options.fetchKeys;
    this.toleranceSeconds = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
    this.minRefetchIntervalMs = options.minRefetchIntervalMs ?? 60_000;
    this.maxKeyAgeMs = options.maxKeyAgeMs;
    this.now = options.now ?? Date.now;
  }

  /**
   * Verifies signature and timestamp, then parses the body.
   *
   * @param rawBody The body exactly as received. Never a re-serialized object.
   * @throws WebhookVerificationError when the delivery cannot be trusted.
   */
  async verify<TPayload = unknown>(rawBody: string | Uint8Array, headers: WebhookHeaders): Promise<WebhookEvent<TPayload>> {
    const expired = this.maxKeyAgeMs !== undefined && this.now() - this.lastFetch >= this.maxKeyAgeMs;
    if (this.keys.length === 0 || expired) await this.refresh(true);
    let verified: { timestamp: number; keyId: string };
    try {
      verified = await this.check(rawBody, headers);
    } catch (error) {
      const stale =
        error instanceof WebhookVerificationError &&
        (error.reason === 'unknown_key' || error.reason === 'invalid_signature');
      if (!stale || !(await this.refresh(false))) throw error;
      verified = await this.check(rawBody, headers);
    }

    const text = typeof rawBody === 'string' ? rawBody : new TextDecoder().decode(rawBody);
    let payload: TPayload;
    try {
      payload = (text.trim() === '' ? undefined : JSON.parse(text)) as TPayload;
    } catch {
      throw new WebhookVerificationError('invalid_payload', 'Webhook body is not valid JSON.');
    }
    const body = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
    const type = text_(body.type) ?? text_(body.event_type);
    const eventId = text_(body.event_id);
    agree('X-Ferrazio-Event', header(headers, 'x-ferrazio-event'), type);
    agree('X-Ferrazio-Event-Id', header(headers, 'x-ferrazio-event-id'), eventId);
    return {
      type,
      eventId,
      deliveryId: header(headers, 'x-ferrazio-delivery'),
      timestamp: verified.timestamp,
      keyId: verified.keyId,
      payload,
    };
  }

  private check(rawBody: string | Uint8Array, headers: WebhookHeaders) {
    return verifyWebhookSignature({
      rawBody,
      headers,
      keys: this.keys,
      toleranceSeconds: this.toleranceSeconds,
      now: Math.floor(this.now() / 1000),
    });
  }

  /** Reloads the key set. Returns `false` when the rate limit held it back. */
  private async refresh(force: boolean): Promise<boolean> {
    if (this.pending) {
      await this.pending;
      return true;
    }
    if (!force && this.now() - this.lastFetch < this.minRefetchIntervalMs) return false;
    this.pending = (async () => {
      try {
        this.keys = await this.fetchKeys();
        this.lastFetch = this.now();
      } finally {
        this.pending = undefined;
      }
    })();
    await this.pending;
    return true;
  }
}

/** A string field, or an integer one as its digits. */
function text_(value: unknown): string | undefined {
  if (typeof value === 'string' && value !== '') return value;
  if (typeof value === 'number' && Number.isInteger(value)) return String(value);
  return undefined;
}

/** An unsigned header that names something the signed body also says must say the same. */
function agree(name: string, fromHeader: string | undefined, fromBody: string | undefined): void {
  if (fromHeader !== undefined && fromBody !== undefined && fromHeader !== fromBody) {
    throw new WebhookVerificationError('invalid_payload', `${name} disagrees with the signed body.`);
  }
}

function header(headers: WebhookHeaders, name: string): string | undefined {
  if (typeof (headers as Headers).get === 'function') return (headers as Headers).get(name) ?? undefined;
  for (const [key, value] of Object.entries(headers as Record<string, string | string[] | undefined>)) {
    if (key.toLowerCase() === name) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
