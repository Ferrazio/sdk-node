import {
  FerrazioAbortError,
  FerrazioConnectionError,
  FerrazioError,
  FerrazioTimeoutError,
  apiErrorFrom,
  isEdgeStatus,
  parseRetryAfter,
} from './errors.js';
import { VERSION } from '../version.js';

/** Production gateway. */
export const DEFAULT_BASE_URL = 'https://gate.ferrazio.com';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_MAX_RETRY_AFTER_MS = 30_000;
// `PUT` and `DELETE` are idempotent by the verb, not by the gateway: a `PUT`
// with `expected_version` answers 409 on the repeat and a strict `DELETE`
// answers 404, after the first try already worked. They repeat only when the
// caller says the route allows it (`idempotent: true`).
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** A `fetch` compatible function. */
export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/**
 * Source of OAuth access tokens. Keep renewal where the refresh token lives
 * (for example a lock per installation); the client only asks.
 */
export interface AccessTokenProvider {
  /** Current access token. */
  getAccessToken(): string | Promise<string>;
  /**
   * Renews after the API rejected `rejected` as expired and returns the new
   * access token. Without it, `token_expired` is thrown as is.
   */
  refresh?(rejected: string): string | Promise<string>;
}

/** Configuration of a {@link HttpClient}. */
export interface ClientOptions {
  /**
   * API key (`fz_...`), sent as `Authorization: ApiKey <key>`.
   * Defaults to the `FERRAZIO_API_KEY` environment variable.
   */
  apiKey?: string;
  /**
   * Opaque session token, sent as `Authorization: Bearer <token>`.
   * Takes precedence over `apiKey`. Defaults to `FERRAZIO_TOKEN`.
   */
  token?: string;
  /**
   * OAuth app credential (`Authorization: Bearer fzat_...`). Takes precedence
   * over `token` and `apiKey`. The client asks the provider for the token on
   * every request and, on `401 token_expired`, calls `refresh` once (shared by
   * concurrent requests) and repeats the request with the new token.
   */
  accessToken?: AccessTokenProvider;
  /**
   * Organization every request runs in (`X-Organization-Id`). Without it the
   * request runs in the organization the key or the session belongs to.
   * Defaults to `FERRAZIO_ORGANIZATION_ID`.
   */
  organizationId?: string;
  /**
   * Gateway URL. Defaults to `FERRAZIO_BASE_URL`, then to production. Must be
   * `https`; plain `http` is accepted only for loopback and private network
   * addresses (local development), unless `allowInsecureHttp` is set.
   */
  baseUrl?: string;
  /**
   * Accepts a plain `http` gateway URL on any host. Credentials then travel in
   * clear text: use it only on a network you trust.
   */
  allowInsecureHttp?: boolean;
  /** Per-attempt timeout in milliseconds. Default 30000. `0` disables it. */
  timeout?: number;
  /** How many times a failed request is retried. Default 2. */
  maxRetries?: number;
  /**
   * Longest `Retry-After` the client is willing to sleep, in milliseconds.
   * A longer wait is thrown as an error right away. Default 30000.
   */
  maxRetryAfter?: number;
  /** Headers added to every request. */
  defaultHeaders?: Record<string, string>;
  /** Replaces the default `User-Agent`. */
  userAgent?: string;
  /** Custom `fetch` (proxy, instrumentation, tests). Defaults to the global one. */
  fetch?: FetchLike;
  /**
   * `false` ignores the `FERRAZIO_*` environment variables: the client uses
   * only what these options say. Set it when one process serves several
   * accounts, so a variable exported on the host cannot leak into all of them.
   */
  env?: boolean;
}

/** Per-call overrides, accepted as the last argument of every method. */
export interface RequestOptions {
  /** Extra headers for this call. */
  headers?: Record<string, string | undefined>;
  /** Cancels the call. */
  signal?: AbortSignal;
  /** Overrides the client `timeout` (milliseconds). */
  timeout?: number;
  /** Overrides the client `maxRetries`. */
  maxRetries?: number;
  /** Overrides the client organization for this call. */
  organizationId?: string;
  /**
   * Marks a `POST`, `PUT`, `PATCH` or `DELETE` as safe to repeat, so it is
   * retried on network failure and 5xx like a `GET`. Set it only when the
   * route deduplicates or a repeat answers the current state.
   */
  idempotent?: boolean;
}

/** Value accepted in a query string. Arrays repeat the key. */
export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number | boolean>;

/** How the request body is encoded. */
export type BodyType = 'json' | 'binary' | 'form' | 'multipart';

/** How the response body is decoded. */
/**
 * `auto` is for routes whose response the API document does not describe: an
 * empty body gives `undefined`, JSON is parsed, anything else is handed over
 * as the `Response` itself.
 */
export type ResponseType = 'json' | 'text' | 'raw' | 'void' | 'auto';

/** Full description of one HTTP call. */
export interface RequestSpec {
  method: string;
  /** Path starting with `/`, already with path parameters filled in. */
  path: string;
  query?: object;
  body?: unknown;
  bodyType?: BodyType;
  responseType?: ResponseType;
  /**
   * `manual` for routes that answer with a redirect meant for a browser: the
   * 3xx `Response` is returned as is instead of being followed.
   */
  redirect?: 'follow' | 'manual';
  /** `false` for public routes: no `Authorization` header is sent. */
  auth?: boolean;
  options?: RequestOptions;
}

/**
 * HTTP engine shared by every resource: authentication, organization scope,
 * timeout, retries with backoff and error mapping.
 */
export class HttpClient {
  readonly baseUrl: string;
  private apiKey: string | undefined;
  private token: string | undefined;
  private accessToken: AccessTokenProvider | undefined;
  private refreshing: Promise<string> | undefined;
  private organizationId: string | undefined;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly maxRetryAfter: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly userAgent: string;
  private readonly fetchImpl: FetchLike;
  private readonly source: ClientOptions;

  constructor(options: ClientOptions = {}) {
    this.source = options;
    const fromEnv = options.env === false ? () => undefined : env;
    this.apiKey = options.apiKey ?? fromEnv('FERRAZIO_API_KEY');
    this.token = options.token ?? fromEnv('FERRAZIO_TOKEN');
    this.accessToken = options.accessToken;
    this.organizationId = options.organizationId ?? fromEnv('FERRAZIO_ORGANIZATION_ID');
    this.baseUrl = (options.baseUrl ?? fromEnv('FERRAZIO_BASE_URL') ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    assertSafeBaseUrl(this.baseUrl, options.allowInsecureHttp === true);
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.maxRetryAfter = options.maxRetryAfter ?? DEFAULT_MAX_RETRY_AFTER_MS;
    this.defaultHeaders = { ...options.defaultHeaders };
    this.userAgent = options.userAgent ?? `ferrazio-sdk-node/${VERSION}`;
    const fetchImpl = options.fetch ?? (globalThis.fetch as FetchLike | undefined);
    if (!fetchImpl) {
      throw new FerrazioError('No global fetch found. Use Node.js 20 or newer, or pass `fetch` in the options.');
    }
    this.fetchImpl = options.fetch ?? ((input, init) => fetchImpl(input, init));
  }

  /** Options this client was built with, merged with the current credentials. */
  snapshot(): ClientOptions {
    return {
      ...this.source,
      apiKey: this.apiKey,
      token: this.token,
      accessToken: this.accessToken,
      organizationId: this.organizationId,
      baseUrl: this.baseUrl,
    };
  }

  /** Replaces the session token used from now on. `undefined` clears it. */
  setToken(token: string | undefined): void {
    this.token = token;
  }

  /** Replaces the OAuth token provider. `undefined` clears it. */
  setAccessToken(provider: AccessTokenProvider | undefined): void {
    this.accessToken = provider;
    this.refreshing = undefined;
  }

  /** Replaces the API key used from now on. `undefined` clears it. */
  setApiKey(apiKey: string | undefined): void {
    this.apiKey = apiKey;
  }

  /** Replaces the default organization. `undefined` clears it. */
  setOrganizationId(organizationId: string | undefined): void {
    this.organizationId = organizationId;
  }

  /** Performs one call and decodes the response as declared in `spec`. */
  async request<T = unknown>(spec: RequestSpec): Promise<T> {
    const method = spec.method.toUpperCase();
    const options = spec.options ?? {};
    const url = this.baseUrl + spec.path + serializeQuery(spec.query);
    const { body, contentType, replayable } = encodeBody(spec.body, spec.bodyType ?? 'json');
    const headers = this.buildHeaders(spec, options, contentType);
    const ownAuthorization = Object.entries(options.headers ?? {}).some(([name, value]) => value !== undefined && name.toLowerCase() === 'authorization');
    const provider = spec.auth !== false && !ownAuthorization ? this.accessToken : undefined;
    let bearer = provider ? await provider.getAccessToken() : undefined;
    if (bearer) headers.set('authorization', `Bearer ${bearer}`);
    let renewed = false;
    const maxRetries = Math.max(0, options.maxRetries ?? this.maxRetries);
    const timeout = options.timeout ?? this.timeout;
    const canRepeat = replayable && (IDEMPOTENT_METHODS.has(method) || options.idempotent === true);

    for (let attempt = 0; ; attempt++) {
      const last = attempt >= maxRetries;
      let response: Response;
      try {
        response = await this.attempt(url, { method, headers, body, redirect: spec.redirect }, timeout, options.signal);
      } catch (error) {
        if (error instanceof FerrazioAbortError || last || !canRepeat) throw error;
        await sleep(backoff(attempt), options.signal);
        continue;
      }

      if (response.ok) return (await decode(response, spec.responseType ?? 'json')) as T;
      if (spec.redirect === 'manual' && response.status >= 300 && response.status < 400) return response as T;

      const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
      const waitMs = retryAfter !== undefined ? retryAfter * 1000 : backoff(attempt);
      // 429 is refused before any handler runs, so it is safe for every method.
      const retryable =
        replayable &&
        waitMs <= this.maxRetryAfter &&
        (response.status === 429 || (canRepeat && ([502, 503, 504].includes(response.status) || isEdgeStatus(response.status))));
      if (provider?.refresh && bearer && !renewed && replayable && response.status === 401) {
        const errorBody = await readErrorBody(response);
        if (isRecord(errorBody) && errorBody.code === 'token_expired') {
          renewed = true;
          bearer = await this.renew(provider, bearer);
          headers.set('authorization', `Bearer ${bearer}`);
          attempt--;
          continue;
        }
        throw apiErrorFrom({ status: 401, method, path: spec.path, headers: response.headers, body: errorBody });
      }
      if (!last && retryable) {
        await response.body?.cancel().catch(() => undefined);
        await sleep(waitMs, options.signal);
        continue;
      }
      throw apiErrorFrom({
        status: response.status,
        method,
        path: spec.path,
        headers: response.headers,
        body: await readErrorBody(response),
      });
    }
  }

  /** One refresh at a time per client; concurrent 401s wait for the same one. */
  private renew(provider: AccessTokenProvider, rejected: string): Promise<string> {
    if (!this.refreshing) {
      this.refreshing = Promise.resolve()
        .then(() => provider.refresh!(rejected))
        .finally(() => {
          this.refreshing = undefined;
        });
    }
    return this.refreshing;
  }

  private buildHeaders(spec: RequestSpec, options: RequestOptions, contentType: string | undefined): Headers {
    const headers = new Headers({ accept: 'application/json', 'user-agent': this.userAgent, ...this.defaultHeaders });
    if (contentType) headers.set('content-type', contentType);
    if (spec.auth !== false) {
      if (this.token) headers.set('authorization', `Bearer ${this.token}`);
      else if (this.apiKey) headers.set('authorization', `ApiKey ${this.apiKey}`);
    }
    const organizationId = options.organizationId ?? this.organizationId;
    if (organizationId) headers.set('x-organization-id', organizationId);
    for (const [name, value] of Object.entries(options.headers ?? {})) {
      if (value !== undefined) headers.set(name, value);
    }
    return headers;
  }

  private async attempt(
    url: string,
    init: { method: string; headers: Headers; body: BodyInit | undefined; redirect?: 'follow' | 'manual' },
    timeout: number,
    signal: AbortSignal | undefined,
  ): Promise<Response> {
    if (signal?.aborted) throw new FerrazioAbortError('Request aborted by the caller.');
    const controller = new AbortController();
    let timedOut = false;
    const timer =
      timeout > 0
        ? setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeout)
        : undefined;
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const requestInit: RequestInit & { duplex?: string } = { ...init, signal: controller.signal };
      if (isStream(init.body)) requestInit.duplex = 'half';
      return await this.fetchImpl(url, requestInit);
    } catch (error) {
      if (timedOut) throw new FerrazioTimeoutError(`Request timed out after ${timeout} ms.`, { cause: error });
      if (signal?.aborted) throw new FerrazioAbortError('Request aborted by the caller.', { cause: error });
      throw new FerrazioConnectionError(`Could not reach ${originOf(url)}: ${describe(error)}`, { cause: error });
    } finally {
      if (timer) clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}

/** Serializes a query object. Arrays repeat the key; null and undefined are dropped. */
export function serializeQuery(query: object | undefined): string {
  const text = query ? formEncode(Object.entries(query)) : '';
  return text ? `?${text}` : '';
}

/**
 * `application/x-www-form-urlencoded`, byte for byte what `URLSearchParams`
 * writes, without depending on it: React Native ships only a partial one.
 */
function formEncode(entries: Array<[string, unknown]>): string {
  const pairs: string[] = [];
  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) pairs.push(`${formComponent(key)}=${formComponent(String(item))}`);
    }
  }
  return pairs.join('&');
}

function formComponent(text: string): string {
  const wellFormed = (text as { toWellFormed?: () => string }).toWellFormed?.() ?? text;
  return encodeURIComponent(wellFormed)
    .replace(/[!'()~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

function encodeBody(
  body: unknown,
  bodyType: BodyType,
): { body: BodyInit | undefined; contentType: string | undefined; replayable: boolean } {
  if (body === undefined) return { body: undefined, contentType: undefined, replayable: true };
  switch (bodyType) {
    case 'json':
      return { body: JSON.stringify(body), contentType: 'application/json', replayable: true };
    case 'form': {
      const text =
        typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams
          ? body.toString()
          : formEncode(Object.entries(body as Record<string, unknown>));
      return { body: text, contentType: 'application/x-www-form-urlencoded', replayable: true };
    }
    case 'multipart':
      // fetch writes the multipart boundary itself.
      return { body: body as FormData, contentType: undefined, replayable: true };
    case 'binary':
      return {
        body: body as BodyInit,
        contentType: 'application/octet-stream',
        replayable: !isStream(body),
      };
  }
}

async function decode(response: Response, responseType: ResponseType): Promise<unknown> {
  if (responseType === 'raw') return response;
  if (responseType === 'auto') {
    const type = response.headers.get('content-type') ?? '';
    if (response.status !== 204 && response.status !== 205 && type !== '' && !/json/i.test(type)) return response;
  }
  if (responseType === 'void' || response.status === 204 || response.status === 205) {
    await response.body?.cancel().catch(() => undefined);
    return undefined;
  }
  const text = await response.text();
  if (responseType === 'text') return text;
  if (text === '') return undefined;
  try {
    return parseJson(text);
  } catch (error) {
    throw new FerrazioError(`Expected a JSON body from ${response.url}, got: ${text.slice(0, 120)}`, { cause: error });
  }
}

/**
 * `JSON.parse` that keeps 64-bit ids intact: an integer outside the safe range
 * is returned as the string of its digits instead of a rounded number.
 * Runtimes that hand the source text to the reviver (Node.js 22+, Bun) use it;
 * the others (Node.js 20, Hermes on React Native) get the integers quoted
 * before parsing, with the same result.
 */
export function parseJson(text: string): unknown {
  if (REVIVER_HAS_SOURCE) {
    return JSON.parse(text, function (this: unknown, _key: string, value: unknown, context?: { source?: string }) {
      if (typeof value === 'number' && !Number.isSafeInteger(value) && context?.source && /^-?\d+$/.test(context.source)) {
        return context.source;
      }
      return value;
    } as (key: string, value: unknown) => unknown);
  }
  return JSON.parse(quoteUnsafeIntegers(text));
}

const REVIVER_HAS_SOURCE = (() => {
  let source: string | undefined;
  try {
    JSON.parse('1', ((_key: string, value: unknown, context?: { source?: string }) => {
      source = context?.source;
      return value;
    }) as (key: string, value: unknown) => unknown);
  } catch {
    return false;
  }
  return source === '1';
})();

/**
 * Wraps in quotes every integer literal of a JSON text that a `number` cannot
 * hold exactly. Strings are skipped, so digits inside them are never touched.
 */
export function quoteUnsafeIntegers(text: string): string {
  // Below 16 digits every integer is safe: skip the scan.
  if (!/\d{16}/.test(text)) return text;
  let out = '';
  let copied = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    if (char === 34 /* " */) {
      for (i++; i < text.length && text.charCodeAt(i) !== 34; i++) if (text.charCodeAt(i) === 92 /* \ */) i++;
      continue;
    }
    if (char !== 45 /* - */ && (char < 48 || char > 57)) continue;
    let end = i + 1;
    while (end < text.length && /[0-9.eE+-]/.test(text.charAt(end))) end++;
    const literal = text.slice(i, end);
    if (/^-?\d{16,}$/.test(literal) && !Number.isSafeInteger(Number(literal))) {
      out += `${text.slice(copied, i)}"${literal}"`;
      copied = end;
    }
    i = end - 1;
  }
  return copied === 0 ? text : out + text.slice(copied);
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function backoff(attempt: number): number {
  const ceiling = Math.min(8_000, 500 * 2 ** attempt);
  return ceiling / 2 + Math.random() * (ceiling / 2);
}

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new FerrazioAbortError('Request aborted by the caller.'));
    const onAbort = () => {
      clearTimeout(timer);
      reject(new FerrazioAbortError('Request aborted by the caller.'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function isStream(body: unknown): boolean {
  return typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;
}

/** `scheme://host[:port]` of a URL, without `URL`, whose getters React Native leaves unimplemented. */
function originOf(url: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(url)?.[0] ?? url;
}

function env(name: string): string | undefined {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  return value ? value : undefined;
}

function describe(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as { cause?: unknown }).cause;
    return cause instanceof Error ? `${error.message} (${cause.message})` : error.message;
  }
  return String(error);
}

/**
 * Refuses a gateway URL that would send credentials in clear text over a
 * network the developer does not control.
 */
export function assertSafeBaseUrl(baseUrl: string, allowInsecureHttp: boolean): void {
  const match = /^([a-z][a-z0-9+.-]*):\/\/(\[[^\]]+\]|[^/:?#]+)/i.exec(baseUrl);
  if (!match) throw new FerrazioError(`Invalid baseUrl "${baseUrl}": expected an absolute https URL.`);
  const scheme = match[1]!.toLowerCase();
  if (scheme === 'https') return;
  if (scheme !== 'http') throw new FerrazioError(`Invalid baseUrl "${baseUrl}": only https (or http for local development) is supported.`);
  if (allowInsecureHttp || isLocalHost(match[2]!.toLowerCase())) return;
  throw new FerrazioError(
    `Refusing plain http baseUrl "${baseUrl}": credentials would travel in clear text. Use https, or set allowInsecureHttp on a network you trust.`,
  );
}

function isLocalHost(host: string): boolean {
  if (host === 'localhost' || host.endsWith('.localhost') || host === '[::1]') return true;
  const octets = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(host);
  if (!octets) return false;
  const [a, b] = [Number(octets[1]), Number(octets[2])];
  return a === 127 || a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
