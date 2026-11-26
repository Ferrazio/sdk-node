import { HttpClient, type AccessTokenProvider, type ClientOptions, type RequestOptions, type RequestSpec } from './core/http.js';
import { OAuth } from './core/oauth.js';
import { WebhookVerifier, verifyWebhookSignature, type WebhookKey, type WebhookVerifierOptions } from './core/webhooks.js';
import { Api } from './generated/index.js';

/** Options of {@link Ferrazio.request}. */
export interface RawRequestOptions extends RequestOptions {
  /** Query string parameters. Arrays repeat the key. */
  query?: object;
  /** JSON body. */
  body?: unknown;
  /** `false` sends the call without credentials. */
  auth?: boolean;
  /** How to decode the response. Default `json`. */
  responseType?: RequestSpec['responseType'];
}

/** Webhook helpers bound to a client. */
export class Webhooks {
  /** Low-level check against keys you already hold. */
  readonly verifySignature = verifyWebhookSignature;

  constructor(private readonly http: HttpClient) {}

  /** Current public keys (`GET /v1/hooks/signing-keys`). */
  async keys(options?: RequestOptions): Promise<WebhookKey[]> {
    const jwks = await this.http.request<{ keys?: WebhookKey[] }>({
      method: 'GET',
      path: '/v1/hooks/signing-keys',
      options,
    });
    return jwks?.keys ?? [];
  }

  /**
   * Builds a verifier that caches the keys and follows rotation.
   * Create it once and reuse it for every delivery.
   */
  verifier(options: Omit<WebhookVerifierOptions, 'fetchKeys'> & Partial<Pick<WebhookVerifierOptions, 'fetchKeys'>> = {}): WebhookVerifier {
    return new WebhookVerifier({ fetchKeys: () => this.keys(), ...options });
  }
}

/**
 * Client of the Ferrazio API.
 *
 * @example
 * import { Ferrazio } from '@ferrazio/sdk';
 *
 * const fz = new Ferrazio({ apiKey: process.env.FERRAZIO_API_KEY });
 * const page = await fz.pay.receivables.list({ page_size: 20 });
 */
export class Ferrazio extends Api {
  /** Verification of the webhooks the platform sends you. */
  readonly webhooks: Webhooks;
  /** OAuth app routes: token exchange, revoke and installation. */
  readonly oauthApp: OAuth;

  constructor(options: ClientOptions = {}) {
    super(new HttpClient(options));
    this.webhooks = new Webhooks(this._http);
    this.oauthApp = new OAuth(this._http);
  }

  /** Gateway this client talks to. */
  get baseUrl(): string {
    return this._http.baseUrl;
  }

  /** Uses this session token from now on. `undefined` goes back to the API key. */
  setToken(token: string | undefined): this {
    this._http.setToken(token);
    return this;
  }

  /** Uses this OAuth token provider from now on. `undefined` clears it. */
  setAccessToken(provider: AccessTokenProvider | undefined): this {
    this._http.setAccessToken(provider);
    return this;
  }

  /** Uses this API key from now on. */
  setApiKey(apiKey: string | undefined): this {
    this._http.setApiKey(apiKey);
    return this;
  }

  /** Runs every following request in this organization. */
  setOrganization(organizationId: string | undefined): this {
    this._http.setOrganizationId(organizationId);
    return this;
  }

  /** A new client with the same credentials, scoped to another organization. */
  withOrganization(organizationId: string): Ferrazio {
    return new Ferrazio({ ...this._http.snapshot(), organizationId });
  }

  /** A new client with the same configuration and some options replaced. */
  withOptions(options: ClientOptions): Ferrazio {
    return new Ferrazio({ ...this._http.snapshot(), ...options });
  }

  /**
   * Calls any route by hand. Meant for routes newer than this SDK version;
   * prefer the typed methods.
   *
   * @example
   * const me = await fz.request<{ id: string }>('GET', '/v1/me');
   */
  request<T = unknown>(method: string, path: string, options: RawRequestOptions = {}): Promise<T> {
    const { query, body, auth, responseType, ...rest } = options;
    return this._http.request<T>({ method, path, query, body, auth, responseType, options: rest });
  }
}
