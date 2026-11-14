import type { HttpClient, RequestOptions } from './http.js';
import { WebhookVerifier, type WebhookKey, type WebhookVerifierOptions } from './webhooks.js';

/** App credentials, sent as HTTP Basic (`client_secret_basic`). */
export interface OAuthClientCredentials {
  clientId: string;
  clientSecret: string;
}

/** Grant of `POST /v1/oauth/token`. */
export type OAuthTokenGrant =
  | { grantType: 'authorization_code'; code: string; redirectUri: string; codeVerifier: string }
  | { grantType: 'refresh_token'; refreshToken: string; scope?: string };

/** Token pair. The refresh token rotates: keep the new one every time. */
export interface OAuthTokens {
  access_token: string;
  token_type: 'Bearer';
  /** Seconds until `access_token` expires. */
  expires_in: number;
  refresh_token: string;
  scope: string;
  installation_id: string;
  tenant_id: string;
  organization_id: string;
}

/** `GET /v1/oauth/installation`: the installation behind the current token. */
export interface OAuthInstallation {
  installation_id: string;
  client_id: string;
  tenant_id: string;
  organization_id: string;
  /** Scopes the owner granted to this installation. */
  granted_scopes: string[];
  /** Scopes the app declares as required. */
  required_scopes: string[];
  /** Scopes the app declares as optional. */
  optional_scopes: string[];
}

/**
 * OAuth app routes (authorization code with PKCE, refresh, revoke and
 * self-introspection). Errors follow RFC 6749 (`invalid_grant`,
 * `invalid_client`, `invalid_scope`) in {@link FerrazioApiError.code}.
 */
export class OAuth {
  constructor(private readonly http: HttpClient) {}

  /** Exchanges a code or a refresh token for a new pair. */
  token(client: OAuthClientCredentials, grant: OAuthTokenGrant, options?: RequestOptions): Promise<OAuthTokens> {
    const body =
      grant.grantType === 'authorization_code'
        ? { grant_type: grant.grantType, code: grant.code, redirect_uri: grant.redirectUri, code_verifier: grant.codeVerifier }
        : { grant_type: grant.grantType, refresh_token: grant.refreshToken, scope: grant.scope };
    return this.http.request<OAuthTokens>({
      method: 'POST',
      path: '/v1/oauth/token',
      body,
      bodyType: 'form',
      auth: false,
      options: withBasic(client, options),
    });
  }

  /** Revokes an access or refresh token (RFC 7009). */
  async revoke(
    client: OAuthClientCredentials,
    token: string,
    tokenTypeHint?: 'access_token' | 'refresh_token',
    options?: RequestOptions,
  ): Promise<void> {
    await this.http.request({
      method: 'POST',
      path: '/v1/oauth/revoke',
      body: { token, token_type_hint: tokenTypeHint },
      bodyType: 'form',
      responseType: 'void',
      auth: false,
      options: withBasic(client, options),
    });
  }

  /** Installation and granted scopes of the access token in use. */
  installation(options?: RequestOptions): Promise<OAuthInstallation> {
    return this.http.request<OAuthInstallation>({ method: 'GET', path: '/v1/oauth/installation', options });
  }

  /**
   * Keys that sign app events (`GET /v1/oauth/signing-keys`). Authenticated:
   * sent with the client credential (the app `accessToken`), permission
   * `hooks.webhook.subscription.read`.
   */
  async signingKeys(options?: RequestOptions): Promise<WebhookKey[]> {
    const jwks = await this.http.request<{ keys?: WebhookKey[] }>({ method: 'GET', path: '/v1/oauth/signing-keys', options });
    return jwks?.keys ?? [];
  }

  /**
   * Verifier of app events (`X-Ferrazio-Timestamp`, `X-Ferrazio-Signature`,
   * `X-Ferrazio-Key-Id`; Ed25519 over `v1:{ts}:{raw body}`), with cached keys
   * that follow rotation. Keys are fetched with this client's credential;
   * pass `fetchKeys` to bring them from elsewhere. Create it once and reuse it.
   */
  verifier(options: Omit<WebhookVerifierOptions, 'fetchKeys'> & Partial<Pick<WebhookVerifierOptions, 'fetchKeys'>> = {}): WebhookVerifier {
    return new WebhookVerifier({ fetchKeys: () => this.signingKeys(), ...options });
  }
}

function withBasic(client: OAuthClientCredentials, options: RequestOptions = {}): RequestOptions {
  const pair = `${encodeURIComponent(client.clientId)}:${encodeURIComponent(client.clientSecret)}`;
  return { ...options, headers: { ...options.headers, authorization: `Basic ${btoa(pair)}` } };
}
