import { describe, expect, test } from 'bun:test';
import { AppInstallationRevokedError, HumanRequiredError, PermissionDeniedError, Ferrazio, TokenExpiredError, type FetchLike } from '../src/index.js';

const expired = () => Response.json({ error: 'unauthorized', code: 'token_expired' }, { status: 401 });

describe('OAuth access token provider', () => {
  test('sends the bearer, renews once on token_expired shared by concurrent calls and repeats', async () => {
    let current = 'fzat_old';
    let refreshes = 0;
    const seen: string[] = [];
    const fetch: FetchLike = async (_url, init) => {
      const auth = new Headers(init.headers).get('authorization')!;
      seen.push(auth);
      return auth === 'Bearer fzat_new' ? Response.json({ ok: true }) : expired();
    };
    const fz = new Ferrazio({
      env: false,
      fetch,
      accessToken: {
        getAccessToken: () => current,
        refresh: async (rejected) => {
          expect(rejected).toBe('fzat_old');
          refreshes++;
          await new Promise((r) => setTimeout(r, 5));
          current = 'fzat_new';
          return current;
        },
      },
    });
    const results = await Promise.all([fz.request('GET', '/v1/me'), fz.request('GET', '/v1/me')]);
    expect(results).toEqual([{ ok: true }, { ok: true }]);
    expect(refreshes).toBe(1);
    expect(seen.filter((h) => h === 'Bearer fzat_new').length).toBe(2);
  });

  test('a second token_expired after renewing is thrown, and revoked is its own error', async () => {
    const fz = new Ferrazio({ env: false, fetch: async () => expired(), accessToken: { getAccessToken: () => 'a', refresh: () => 'b' } });
    expect(fz.request('GET', '/v1/me')).rejects.toBeInstanceOf(TokenExpiredError);
    let refreshed = false;
    const revoked = new Ferrazio({
      env: false,
      fetch: async () => Response.json({ code: 'app_installation_revoked' }, { status: 401 }),
      accessToken: { getAccessToken: () => 'a', refresh: () => ((refreshed = true), 'b') },
    });
    expect(revoked.request('GET', '/v1/me')).rejects.toBeInstanceOf(AppInstallationRevokedError);
    expect(refreshed).toBe(false);
  });

  test('oauthApp.token posts a form with basic client auth and no bearer', async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const fz = new Ferrazio({
      env: false,
      accessToken: { getAccessToken: () => 'fzat_x' },
      fetch: async (url, init) => ((seen = { url, init }), Response.json({ access_token: 'fzat_y' })),
    });
    await fz.oauthApp.token({ clientId: 'app', clientSecret: 's' }, { grantType: 'refresh_token', refreshToken: 'fzrt_1' });
    expect(seen!.url.endsWith('/v1/oauth/token')).toBe(true);
    expect(new Headers(seen!.init.headers).get('authorization')).toBe(`Basic ${btoa('app:s')}`);
    expect(String(seen!.init.body)).toBe('grant_type=refresh_token&refresh_token=fzrt_1');
  });

  test('403 human_required has its own class; app signing keys are fetched with the app token', async () => {
    const urls: string[] = [];
    const fz = new Ferrazio({
      env: false,
      accessToken: { getAccessToken: () => 'fzat_app' },
      fetch: async (url, init) => {
        urls.push(url);
        const auth = new Headers(init.headers).get('authorization');
        expect(auth).toBe(url.endsWith('/signing-keys') ? 'Bearer fzat_app' : null);
        return url.endsWith('/signing-keys') ? Response.json({ keys: [{ kid: 'k1' }] }) : Response.json({ code: 'human_required' }, { status: 403 });
      },
    });
    const error = await fz.request('POST', '/v1/x', { auth: false }).catch((e) => e);
    expect(error).toBeInstanceOf(HumanRequiredError);
    expect(error).toBeInstanceOf(PermissionDeniedError);
    expect(await fz.oauthApp.signingKeys()).toEqual([{ kid: 'k1' }] as never);
    expect(urls[1]!.endsWith('/v1/oauth/signing-keys')).toBe(true);
  });

  test('a per-call Authorization header wins over the provider, in any letter case', async () => {
    let auth = null as string | null;
    const fz = new Ferrazio({
      env: false,
      accessToken: { getAccessToken: () => 'fzat_app' },
      fetch: async (_url, init) => ((auth = new Headers(init.headers).get('authorization')), Response.json({})),
    });
    await fz.request('GET', '/v1/me', { headers: { Authorization: 'Bearer mine' } });
    expect(auth).toBe('Bearer mine');
  });
});
