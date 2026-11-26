/** One field-level failure inside a validation error (`details`). */
export interface FieldError {
  /** Path of the field in the payload, e.g. `email` or `items[0].sku`. */
  field: string;
  /** Sanitized validator message, in English. */
  message: string;
}

/** Base class of every error thrown by the SDK. */
export class FerrazioError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    // Engines without ES2022 error causes (older Hermes) drop the option.
    if (options && 'cause' in options && !('cause' in this)) {
      Object.defineProperty(this, 'cause', { value: options.cause, writable: true, configurable: true });
    }
  }
}

/** The request never produced an HTTP response (DNS, TLS, socket reset). */
export class FerrazioConnectionError extends FerrazioError {}

/** The request exceeded the configured `timeout`. */
export class FerrazioTimeoutError extends FerrazioConnectionError {}

/** The caller aborted the request through `options.signal`. */
export class FerrazioAbortError extends FerrazioError {}

/** Fields carried by {@link FerrazioApiError}. */
export interface ApiErrorInit {
  status: number;
  method: string;
  path: string;
  headers: Headers;
  body: unknown;
}

/**
 * The API answered with a non-2xx status.
 *
 * Branch on {@link FerrazioApiError.error} (stable class slug) or
 * {@link FerrazioApiError.code} (per-endpoint reason), never on `message`,
 * which is prose and may change.
 */
export class FerrazioApiError extends FerrazioError {
  /** HTTP status code. */
  readonly status: number;
  /** Stable slug of the error class, e.g. `validation`, `not_found`, `forbidden`. */
  readonly error: string;
  /** Per-endpoint reason; equals `error` when the service declares none. */
  readonly code: string;
  /**
   * The gateway's own sentence about the failure (`message`, or `error` in the
   * thin form), without the method, path and status that `message` adds.
   * `undefined` when the response carried none: an empty body, or an HTML
   * page from the edge.
   */
  readonly apiMessage?: string;
  /** Id of the request. Quote it when contacting support. */
  readonly requestId?: string;
  /** Correlation id that crosses services. */
  readonly correlationId?: string;
  /** Present only on internal errors (500). */
  readonly incidentId?: string;
  /** Present only on field validation errors (422). */
  readonly details?: FieldError[];
  /** Seconds the server asked the client to wait (`Retry-After`), when sent. */
  readonly retryAfter?: number;
  /** HTTP method of the failed request. */
  readonly method: string;
  /** Path of the failed request. */
  readonly path: string;
  /** Response headers. */
  readonly headers: Headers;
  /** Parsed response body (object, string or `undefined`). */
  readonly body: unknown;
  /**
   * The gateway did not identify the caller: `404` with the reason
   * `unidentified` (or an empty body, from older gateways), its answer to
   * an expired or revoked session token, an invalid key and an organization
   * out of the credential's scope. On a route this SDK knows, it is the signal
   * to sign the user in again.
   */
  readonly unidentified: boolean;

  constructor(init: ApiErrorInit) {
    const body = isRecord(init.body) ? init.body : undefined;
    const slug = str(body?.error) ?? defaultSlug(init.status);
    // The thin form is `{ "error": "<human message>" }`: no `message` field.
    const thin = body !== undefined && body.message === undefined && body.code === undefined;
    // The gateway hides protected routes from callers it cannot identify.
    const unidentified = init.status === 404 && (init.body === undefined || body?.code === 'unidentified');
    const opaque = unidentified
        ? 'not found (the gateway answers this way for unknown routes and for missing, invalid or out-of-scope credentials)'
        : undefined;
    const apiMessage = str(body?.message) ?? (thin ? str(body?.error) : undefined);
    const message = apiMessage ?? opaque ?? `HTTP ${init.status}`;
    super(`${init.method} ${init.path} failed with ${init.status}: ${message}`);
    this.status = init.status;
    this.error = thin ? defaultSlug(init.status) : slug;
    this.code = str(body?.code) ?? this.error;
    this.apiMessage = apiMessage;
    this.requestId = str(body?.request_id) ?? init.headers.get('x-request-id') ?? undefined;
    this.correlationId = str(body?.correlation_id);
    this.incidentId = str(body?.incident_id);
    this.details = Array.isArray(body?.details) ? (body.details as FieldError[]) : undefined;
    this.retryAfter = parseRetryAfter(init.headers.get('retry-after'));
    this.method = init.method;
    this.path = init.path;
    this.headers = init.headers;
    this.body = init.body;
    this.unidentified = unidentified;
  }
}

/** 400: malformed request. */
export class BadRequestError extends FerrazioApiError {}
/** 401: missing, invalid or expired credentials. */
export class AuthenticationError extends FerrazioApiError {}
/** `401 token_expired`: the OAuth access token expired; renew and repeat. */
export class TokenExpiredError extends AuthenticationError {}
/**
 * `401 app_installation_revoked`: the owner disconnected the app. Renewing
 * does not help; the store has to be connected again.
 */
export class AppInstallationRevokedError extends AuthenticationError {}
/** 402: the organization does not have the paid module this route belongs to. */
export class ModuleNotEntitledError extends FerrazioApiError {}
/** 403: the member or the API key scope lacks the required permission. */
export class PermissionDeniedError extends FerrazioApiError {}
/**
 * `403 human_required`: the action needs a person (MFA step-up, own KYC,
 * withdrawal) and an app token cannot do it.
 */
export class HumanRequiredError extends PermissionDeniedError {}
/** 404: the resource does not exist in this tenant or organization. */
export class NotFoundError extends FerrazioApiError {}
/** 409: the request conflicts with the current state of the resource. */
export class ConflictError extends FerrazioApiError {}
/** 412: a precondition of the operation is not met. */
export class PreconditionFailedError extends FerrazioApiError {}
/** 422: the payload is well formed but fails validation. See `details`. */
export class ValidationError extends FerrazioApiError {}
/**
 * 428: the operation needs a session that passed a second factor
 * (`step_up_required`, e.g. money routes under `/v1/pay`). The session's
 * `mfa_passed` is false: the user signs in again through the TOTP step.
 */
export class StepUpRequiredError extends FerrazioApiError {}
/** 429: rate limit reached. See `retryAfter`. */
export class RateLimitError extends FerrazioApiError {}
/**
 * 5xx: the platform failed. See `incidentId`. 520 to 530 come from the edge in
 * front of the gateway (Cloudflare), not from the gateway itself: see `edge`.
 */
export class ServerError extends FerrazioApiError {
  /** The status is one the edge proxy writes (520 to 530): the gateway was not reached or did not answer in time. */
  get edge(): boolean {
    return isEdgeStatus(this.status);
  }
}

/** Statuses Cloudflare answers with when it cannot get a response from the origin. */
export function isEdgeStatus(status: number): boolean {
  return status >= 520 && status <= 530;
}

/** Builds the most specific {@link FerrazioApiError} subclass for a status. */
export function apiErrorFrom(init: ApiErrorInit): FerrazioApiError {
  switch (init.status) {
    case 400:
      return new BadRequestError(init);
    case 401: {
      const code = isRecord(init.body) ? init.body.code : undefined;
      if (code === 'token_expired') return new TokenExpiredError(init);
      if (code === 'app_installation_revoked') return new AppInstallationRevokedError(init);
      return new AuthenticationError(init);
    }
    case 402:
      return new ModuleNotEntitledError(init);
    case 403:
      return isRecord(init.body) && init.body.code === 'human_required' ? new HumanRequiredError(init) : new PermissionDeniedError(init);
    case 404:
      return new NotFoundError(init);
    case 409:
      return new ConflictError(init);
    case 412:
      return new PreconditionFailedError(init);
    case 422:
      return new ValidationError(init);
    case 428:
      return new StepUpRequiredError(init);
    case 429:
      return new RateLimitError(init);
    default:
      return init.status >= 500 ? new ServerError(init) : new FerrazioApiError(init);
  }
}

/** Parses `Retry-After` (delta seconds or HTTP date) into seconds. */
export function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);
  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, (date - Date.now()) / 1000);
}

function defaultSlug(status: number): string {
  const slugs: Record<number, string> = {
    400: 'bad_request',
    401: 'unauthenticated',
    402: 'payment_required',
    403: 'forbidden',
    404: 'not_found',
    409: 'conflict',
    412: 'precondition_failed',
    422: 'validation',
    428: 'step_up_required',
    429: 'rate_limited',
  };
  return slugs[status] ?? (status >= 500 ? 'internal' : 'error');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
