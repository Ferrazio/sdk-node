// Runs the SDK with the globals React Native (Hermes) lacks removed before the
// SDK is loaded, and prints what happened as JSON for tests/runtime.test.ts.
const globals = globalThis as Record<string, unknown>;
delete globals.process;
delete globals.URL;
delete globals.URLSearchParams;
delete globals.ReadableStream;
const nativeParse = JSON.parse;
// Hermes calls the reviver without the source text.
JSON.parse = ((text: string, reviver?: (key: string, value: unknown) => unknown) =>
  reviver ? nativeParse(text, (key, value) => reviver(key, value)) : nativeParse(text)) as typeof JSON.parse;

const { Ferrazio } = await import('../../src/index.js');

let reviverSource = false;
JSON.parse('1', ((_key: string, value: unknown, context?: { source?: string }) => {
  reviverSource = context?.source === '1';
  return value;
}) as (key: string, value: unknown) => unknown);

const json = (body: string, status = 200) => new Response(body, { status, headers: { 'content-type': 'application/json' } });
const replies: Array<() => Response> = [
  () => json('{"items":[],"next_page_token":""}'),
  () => json('{"confirmation_code":"c","url":"u"}'),
  () => json('{"user_id":43791531487657988,"token":"t","mfa_required":false}'),
  () => {
    throw new TypeError('offline');
  },
  () => new Response(null, { status: 404 }),
  () => json('{"error":"step_up_required","code":"step_up_required","message":"multi-factor authentication required"}', 428),
];

const calls: Array<Record<string, unknown>> = [];
const fz = new Ferrazio({
  baseUrl: 'https://gw.test',
  token: 'tok_mobile',
  maxRetries: 0,
  fetch: async (url, init) => {
    const headers = init.headers as Headers;
    calls.push({
      method: init.method,
      url,
      authorization: headers.get('authorization') ?? undefined,
      contentType: headers.get('content-type') ?? undefined,
      body: init.body,
    });
    return replies.shift()!();
  },
});

await fz.pay.receivables.list({ page_size: 20, status: 'open now' } as never);
await fz.social.metaDataDeletion({ signed_request: 'a b!' });
const login = (await fz.auth.login({ identifier: 'a', password: 'b' })) as { user_id: unknown };

async function failure(call: () => Promise<unknown>): Promise<any> {
  try {
    await call();
  } catch (error) {
    return error;
  }
  throw new Error('expected a failure');
}
const connection = await failure(() => fz.auth.me());
const expired = await failure(() => fz.auth.me());
const stepUp = await failure(() => fz.auth.me());

console.log(
  JSON.stringify({
    reviverSource,
    calls: [
      { method: calls[0]!.method, url: calls[0]!.url, authorization: calls[0]!.authorization },
      { body: calls[1]!.body, contentType: calls[1]!.contentType },
    ],
    userId: login.user_id,
    connection: { name: connection.name, message: connection.message, hasCause: connection.cause instanceof Error },
    expired: { name: expired.name, unidentified: expired.unidentified },
    stepUp: { name: stepUp.name, error: stepUp.error, unidentified: stepUp.unidentified },
  }),
);

export {};
