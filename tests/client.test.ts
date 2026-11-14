import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import {
  AuthenticationError,
  Ferrazio,
  FerrazioAbortError,
  FerrazioConnectionError,
  FerrazioTimeoutError,
  ModuleNotEntitledError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  FerrazioError,
} from '../src/index.js';

interface Seen {
  method: string;
  path: string;
  search: string;
  headers: Headers;
  body: string;
}

type Handler = (seen: Seen, hit: number) => Response | Promise<Response>;

let server: ReturnType<typeof Bun.serve>;
let handler: Handler;
let seen: Seen[] = [];

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      const entry = { method: request.method, path: url.pathname, search: url.search, headers: request.headers, body: await request.text() };
      seen.push(entry);
      return handler(entry, seen.length);
    },
  });
});

afterAll(() => server.stop(true));

beforeEach(() => {
  seen = [];
  handler = () => json({});
});

const client = (options: ConstructorParameters<typeof Ferrazio>[0] = {}) =>
  new Ferrazio({ baseUrl: `http://127.0.0.1:${server.port}/`, apiKey: 'fz_test', ...options });

describe('authentication and scope', () => {
  test('sends the API key with the ApiKey scheme', async () => {
    await client().auth.me();
    expect(seen[0]!.headers.get('authorization')).toBe('ApiKey fz_test');
    expect(seen[0]!.headers.get('user-agent')).toStartWith('ferrazio-sdk-node/');
  });

  test('a session token wins over the API key and can be cleared', async () => {
    const fz = client().setToken('sess');
    await fz.auth.me();
    await fz.setToken(undefined).auth.me();
    expect(seen.map((entry) => entry.headers.get('authorization'))).toEqual(['Bearer sess', 'ApiKey fz_test']);
  });

  test('public routes go without credentials', async () => {
    await client().auth.login({ identifier: 'a@b.c', password: 'x' });
    expect(seen[0]!.headers.get('authorization')).toBeNull();
    expect(seen[0]!.method).toBe('POST');
    expect(JSON.parse(seen[0]!.body)).toEqual({ identifier: 'a@b.c', password: 'x' });
  });

  test('organization comes from the client, a derived client or the call', async () => {
    const fz = client({ organizationId: '1' });
    await fz.auth.me();
    await fz.withOrganization('2').auth.me();
    await fz.auth.me({ organizationId: '3' });
    expect(seen.map((entry) => entry.headers.get('x-organization-id'))).toEqual(['1', '2', '3']);
    expect(seen[1]!.headers.get('authorization')).toBe('ApiKey fz_test');
  });

  test('env: false keeps the FERRAZIO_* variables out, in derived clients too', async () => {
    process.env.FERRAZIO_TOKEN = 'sess_from_env';
    process.env.FERRAZIO_ORGANIZATION_ID = '77';
    try {
      await client().auth.me();
      const isolated = client({ env: false });
      await isolated.auth.me();
      await isolated.withOrganization('2').setToken(undefined).auth.me();
      await isolated.withOptions({ timeout: 1000 }).auth.me();
      expect(seen.map((entry) => [entry.headers.get('authorization'), entry.headers.get('x-organization-id')])).toEqual([
        ['Bearer sess_from_env', '77'],
        ['ApiKey fz_test', null],
        ['ApiKey fz_test', '2'],
        ['ApiKey fz_test', null],
      ]);
    } finally {
      delete process.env.FERRAZIO_TOKEN;
      delete process.env.FERRAZIO_ORGANIZATION_ID;
    }
  });
});

describe('request building', () => {
  test('encodes path parameters and repeats array query keys', async () => {
    await client().iam.cadastro.removeAddress('a/b c');
    await client().marketing.leads.listLeads({ city: ['Sao Paulo', 'Rio'], page_size: 5 });
    expect(seen[0]!.path).toBe('/v1/addresses/a%2Fb%20c');
    expect(seen[0]!.method).toBe('DELETE');
    expect(seen[1]!.search).toBe('?city=Sao+Paulo&city=Rio&page_size=5');
  });

  test('204 resolves to undefined', async () => {
    handler = () => new Response(null, { status: 204 });
    expect(await client().iam.cadastro.removeAddress('1')).toBeUndefined();
  });

  test('raw request reaches any route', async () => {
    handler = () => json({ ok: true });
    const out = await client().request<{ ok: boolean }>('POST', '/v1/new/route', { query: { a: 1 }, body: { b: 2 } });
    expect(out.ok).toBe(true);
    expect(seen[0]!.path + seen[0]!.search).toBe('/v1/new/route?a=1');
    expect(seen[0]!.headers.get('content-type')).toBe('application/json');
  });
});

describe('errors', () => {
  test('maps the canonical envelope', async () => {
    handler = () =>
      json(
        {
          error: 'validation',
          code: 'payer_zip_missing',
          message: 'payer zip code is required',
          request_id: '77',
          correlation_id: '78',
          timestamp: '2026-01-01T00:00:00Z',
          details: [{ field: 'payer.zip', message: 'required' }],
        },
        422,
      );
    const error = await client().auth.me().catch((caught) => caught);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.status).toBe(422);
    expect(error.error).toBe('validation');
    expect(error.code).toBe('payer_zip_missing');
    expect(error.requestId).toBe('77');
    expect(error.details).toEqual([{ field: 'payer.zip', message: 'required' }]);
    expect(error.message).toContain('payer zip code is required');
    expect(error.apiMessage).toBe('payer zip code is required');
  });

  test('maps the thin form and statuses', async () => {
    handler = () => json({ error: 'missing session' }, 401);
    const unauthenticated = await client().auth.me().catch((caught) => caught);
    expect(unauthenticated).toBeInstanceOf(AuthenticationError);
    expect(unauthenticated.error).toBe('unauthenticated');
    expect(unauthenticated.message).toContain('missing session');
    expect(unauthenticated.apiMessage).toBe('missing session');

    handler = () => json({ error: 'module_not_entitled', code: 'module_not_entitled', message: 'no module' }, 402);
    expect(await client().auth.me().catch((caught) => caught)).toBeInstanceOf(ModuleNotEntitledError);

    handler = () => new Response('<html>bad gateway</html>', { status: 502 });
    const bad = await client({ maxRetries: 0 }).auth.me().catch((caught) => caught);
    expect(bad).toBeInstanceOf(ServerError);
    expect(bad.body).toBe('<html>bad gateway</html>');
    expect(bad.apiMessage).toBeUndefined();
    expect(bad.edge).toBe(false);

    handler = () => new Response(null, { status: 404 });
    const opaque = await client().auth.me().catch((caught) => caught);
    expect([opaque.unidentified, opaque.apiMessage]).toEqual([true, undefined]);
  });

  test('an expired session reaches the caller as unidentified, a missing resource does not', async () => {
    const edge = (code: string) => () =>
      json({ error: 'not_found', code, message: 'resource not found', request_id: 'req_1' }, 404);

    handler = edge('unidentified');
    const expired = await client().auth.me().catch((caught) => caught);
    expect(expired).toBeInstanceOf(NotFoundError);
    expect([expired.unidentified, expired.code, expired.requestId]).toEqual([true, 'unidentified', 'req_1']);

    handler = edge('not_found');
    const missing = await client().auth.me().catch((caught) => caught);
    expect(missing).toBeInstanceOf(NotFoundError);
    expect([missing.unidentified, missing.code]).toEqual([false, 'not_found']);
  });
});

describe('retries', () => {
  test('retries 429 on any method honoring Retry-After', async () => {
    handler = (_, hit) => (hit === 1 ? json({ error: 'rate_limited' }, 429, { 'retry-after': '0' }) : json({ ok: true }));
    await client().auth.logout();
    expect(seen.length).toBe(2);
  });

  test('a long Retry-After is thrown instead of slept', async () => {
    handler = () => json({ error: 'rate_limited', code: 'rate_limited', message: 'slow down' }, 429, { 'retry-after': '86400' });
    const error = await client().auth.me().catch((caught) => caught);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBe(86400);
    expect(seen.length).toBe(1);
  });

  test('503 is retried on GET but not on POST unless marked idempotent', async () => {
    handler = (_, hit) => (hit % 2 === 1 ? json({ error: 'unavailable' }, 503, { 'retry-after': '0' }) : json({}));
    await client().auth.me();
    expect(seen.length).toBe(2);
    seen = [];
    await expect(client().auth.logout()).rejects.toBeInstanceOf(ServerError);
    expect(seen.length).toBe(1);
    seen = [];
    await client().auth.logout({ idempotent: true });
    expect(seen.length).toBe(2);
  });

  test('503 is not retried on PUT or DELETE unless marked idempotent', async () => {
    handler = (_, hit) => (hit % 2 === 1 ? json({ error: 'unavailable' }, 503, { 'retry-after': '0' }) : json({}));
    const fz = client();
    await expect(fz.request('DELETE', '/v1/x/1')).rejects.toBeInstanceOf(ServerError);
    expect(seen.length).toBe(1);
    seen = [];
    await expect(fz.request('PUT', '/v1/x/1', { body: {} })).rejects.toBeInstanceOf(ServerError);
    expect(seen.length).toBe(1);
    seen = [];
    await fz.request('DELETE', '/v1/x/1', { idempotent: true });
    expect(seen.length).toBe(2);
  });

  test('edge statuses (520 to 530) are retried like 502 to 504 and flagged', async () => {
    handler = (_, hit) => (hit % 2 === 1 ? new Response('<html>cloudflare</html>', { status: 520, headers: { 'retry-after': '0' } }) : json({}));
    await client().auth.me();
    expect(seen.length).toBe(2);
    seen = [];
    const error = await client().auth.logout().catch((caught) => caught);
    expect(error).toBeInstanceOf(ServerError);
    expect([error.status, error.edge, seen.length]).toEqual([520, true, 1]);
  });

  test('gives up after maxRetries', async () => {
    handler = () => json({ error: 'unavailable' }, 503, { 'retry-after': '0' });
    await expect(client({ maxRetries: 1 }).auth.me()).rejects.toBeInstanceOf(ServerError);
    expect(seen.length).toBe(2);
  });
});

describe('timeouts and aborts', () => {
  test('times out', async () => {
    handler = () => new Promise((resolve) => setTimeout(() => resolve(json({})), 300));
    await expect(client({ timeout: 30, maxRetries: 0 }).auth.me()).rejects.toBeInstanceOf(FerrazioTimeoutError);
  });

  test('caller abort is not retried', async () => {
    handler = () => new Promise((resolve) => setTimeout(() => resolve(json({})), 300));
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);
    await expect(client().auth.me({ signal: controller.signal })).rejects.toBeInstanceOf(FerrazioAbortError);
    expect(seen.length).toBe(1);
  });

  test('connection failure is reported as such', async () => {
    const fz = new Ferrazio({ baseUrl: 'http://127.0.0.1:1', maxRetries: 0 });
    await expect(fz.auth.me()).rejects.toBeInstanceOf(FerrazioConnectionError);
  });
});

describe('pagination', () => {
  const pages: Record<string, unknown> = {
    '': { items: [{ id: 1 }, { id: 2 }], next_page_token: 'p2' },
    p2: { items: [{ id: 3 }], next_page_token: 'p3' },
    p3: { items: [{ id: 4 }], next_page_token: '' },
  };

  beforeEach(() => {
    handler = (entry) => json(pages[new URLSearchParams(entry.search).get('page_token') ?? '']);
  });

  test('walks every page keeping the filters', async () => {
    const ids: unknown[] = [];
    for await (const item of client().hooks.listSubscriptionsAll({ page_size: 2 })) ids.push((item as unknown as { id: number }).id);
    expect(ids).toEqual([1, 2, 3, 4]);
    expect(seen.map((entry) => entry.search)).toEqual(['?page_size=2', '?page_size=2&page_token=p2', '?page_size=2&page_token=p3']);
  });

  test('toArray stops at the limit without fetching further pages', async () => {
    const items = await client().hooks.listSubscriptionsAll().toArray({ limit: 3 });
    expect(items.length).toBe(3);
    expect(seen.length).toBe(2);
  });
});

describe('64-bit integers', () => {
  test('an id beyond the safe range arrives as its exact digits', async () => {
    handler = () => new Response('{"user_id":49575241143283713,"n":42,"amount":"10.50","ratio":1.5}', { headers: { 'content-type': 'application/json' } });
    expect(await client().request<unknown>('GET', '/v1/x')).toEqual({ user_id: '49575241143283713', n: 42, amount: '10.50', ratio: 1.5 });
  });
});

describe('pagination without a declared items field', () => {
  test('finds the only array of the page', async () => {
    handler = (entry) =>
      json(new URLSearchParams(entry.search).get('page_token') ? { persons: [{ id: 3 }], next_page_token: '' } : { persons: [{ id: 1 }, { id: 2 }], next_page_token: 'n' });
    expect((await client().iam.cadastro.listPersonsAll().toArray()).length).toBe(3);
  });
});

describe('responses the API document does not describe', () => {
  test('JSON is parsed, a file comes as the Response, an empty body is undefined', async () => {
    // The PSP callback is the one route that declares a 200 with no body.
    const ingest = () => client().pay.acquiring.ingest('pluggo', '{}', { headers: { 'x-webhook-signature': 's' } });
    handler = () => json({ members: [1] });
    expect(await ingest()).toEqual({ members: [1] });
    handler = () => new Response('abc', { headers: { 'content-type': 'text/plain' } });
    const file = (await ingest()) as Response;
    expect(await file.text()).toBe('abc');
    handler = () => new Response(null, { status: 200 });
    expect(await ingest()).toBeUndefined();
  });

  test('an empty path parameter is refused before any request', async () => {
    expect(() => client().archive.download('')).toThrow('path parameter is empty');
    expect(seen.length).toBe(0);
  });

  test('a dot segment id is refused, other ids are percent-encoded', async () => {
    for (const id of ['..', '.', '%2e%2E', '.%2E']) expect(() => client().archive.download(id)).toThrow('would change the route');
    expect(seen.length).toBe(0);
    await client().archive.download('a/../b').catch(() => undefined);
    expect(seen.at(-1)?.path).toContain('a%2F..%2Fb');
  });
});

describe('baseUrl transport safety', () => {
  test('https anywhere, plain http only on loopback and private addresses unless allowed', () => {
    const make = (baseUrl: string, allowInsecureHttp?: boolean) => () => new Ferrazio({ baseUrl, env: false, allowInsecureHttp });
    for (const ok of ['https://gate.example.com', 'http://localhost:3000', 'http://127.0.0.1:1', 'http://10.0.0.5', 'http://192.168.1.2', 'http://172.20.0.1', 'http://[::1]:8080']) {
      expect(make(ok)).not.toThrow();
    }
    expect(make('http://gate.example.com')).toThrow(FerrazioError);
    expect(make('http://172.32.0.1')).toThrow(FerrazioError);
    expect(make('ftp://x')).toThrow(FerrazioError);
    expect(make('gate.example.com')).toThrow(FerrazioError);
    expect(make('http://gate.example.com', true)).not.toThrow();
  });
});
