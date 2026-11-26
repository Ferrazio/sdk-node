import { describe, expect, test } from 'bun:test';
import { generateKeyPairSync, sign } from 'node:crypto';
import { WebhookVerificationError, WebhookVerifier, verifyWebhookSignature, type WebhookKey } from '../src/index.js';

function keyPair(kid: string) {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const jwk = publicKey.export({ format: 'jwk' });
  const key: WebhookKey = { kid, kty: 'OKP', crv: 'Ed25519', x: jwk.x! };
  const deliver = (body: string, timestamp = Math.floor(Date.now() / 1000), event: Record<string, string> = {}) => ({
    'X-Ferrazio-Key-Id': kid,
    'X-Ferrazio-Timestamp': String(timestamp),
    'X-Ferrazio-Signature': sign(null, Buffer.from(`v1:${timestamp}:${body}`), privateKey).toString('base64'),
    'X-Ferrazio-Event': 'pay.pix.received',
    'X-Ferrazio-Event-Id': '7345219876543210',
    'X-Ferrazio-Delivery': 'dlv-1',
    ...event,
  });
  return { key, deliver };
}

const body = JSON.stringify({ event_id: '7345219876543210', type: 'pay.pix.received', id: '99', note: 'acentuação' });
const reason = (error: unknown) => (error instanceof WebhookVerificationError ? error.reason : error);

describe('verifyWebhookSignature', () => {
  const { key, deliver } = keyPair('v1');

  test('accepts a valid delivery as string, bytes or Headers', async () => {
    const headers = deliver(body);
    expect((await verifyWebhookSignature({ rawBody: body, headers, keys: [key] })).keyId).toBe('v1');
    await verifyWebhookSignature({ rawBody: new TextEncoder().encode(body), headers, keys: [key] });
    await verifyWebhookSignature({ rawBody: body, headers: new Headers(headers), keys: [key] });
  });

  test('refuses a tampered body, an old timestamp, an unknown key and missing headers', async () => {
    const headers = deliver(body);
    const check = (input: Partial<Parameters<typeof verifyWebhookSignature>[0]>) =>
      verifyWebhookSignature({ rawBody: body, headers, keys: [key], ...input }).catch(reason);
    expect(await check({ rawBody: body + ' ' })).toBe('invalid_signature');
    expect(await check({ headers: deliver(body, Math.floor(Date.now() / 1000) - 301) })).toBe('timestamp_out_of_tolerance');
    expect(await check({ keys: [] })).toBe('unknown_key');
    expect(await check({ headers: {} })).toBe('missing_headers');
    expect(await check({ keys: [keyPair('v1').key] })).toBe('invalid_signature');
  });
});

describe('WebhookVerifier', () => {
  test('returns the parsed event', async () => {
    const { key, deliver } = keyPair('v1');
    const verifier = new WebhookVerifier({ fetchKeys: async () => [key] });
    const event = await verifier.verify<{ id: string }>(body, deliver(body));
    expect(event.type).toBe('pay.pix.received');
    expect(event.eventId).toBe('7345219876543210');
    expect(event.deliveryId).toBe('dlv-1');
    expect(event.payload.id).toBe('99');
  });

  test('type and event id come from the signed body; a rewritten header is refused', async () => {
    const { key, deliver } = keyPair('v1');
    const verifier = new WebhookVerifier({ fetchKeys: async () => [key] });
    const forgedType = deliver(body, undefined, { 'X-Ferrazio-Event': 'pay.charge.paid' });
    expect(await verifier.verify(body, forgedType).catch(reason)).toBe('invalid_payload');
    const forgedId = deliver(body, undefined, { 'X-Ferrazio-Event-Id': '1' });
    expect(await verifier.verify(body, forgedId).catch(reason)).toBe('invalid_payload');

    const { 'X-Ferrazio-Event': _type, 'X-Ferrazio-Event-Id': _id, ...bare } = deliver(body);
    const event = await verifier.verify(body, bare);
    expect([event.type, event.eventId]).toEqual(['pay.pix.received', '7345219876543210']);
  });

  test('legacy, custom and empty bodies', async () => {
    const { key, deliver } = keyPair('v1');
    const verifier = new WebhookVerifier({ fetchKeys: async () => [key] });

    const legacy = JSON.stringify({ event_id: 7345219876543210, event_type: 'pay.pix.received', data: {} });
    const fromLegacy = await verifier.verify(legacy, deliver(legacy));
    expect([fromLegacy.type, fromLegacy.eventId]).toEqual(['pay.pix.received', '7345219876543210']);

    // A flow block's own body: the unsigned headers are not taken in its place.
    const custom = JSON.stringify({ pedido: 42 });
    const fromCustom = await verifier.verify(custom, deliver(custom));
    expect([fromCustom.type, fromCustom.eventId]).toEqual([undefined, undefined]);

    const empty = await verifier.verify('', deliver(''));
    expect([empty.payload, empty.type, empty.deliveryId]).toEqual([undefined, undefined, 'dlv-1']);
    expect(await verifier.verify('{', deliver('{')).catch(reason)).toBe('invalid_payload');
  });

  test('runs on an injected clock, for tolerance and for key age', async () => {
    const { key, deliver } = keyPair('v1');
    let clock = Date.UTC(2030, 0, 1);
    let fetches = 0;
    const verifier = new WebhookVerifier({
      now: () => clock,
      maxKeyAgeMs: 600_000,
      fetchKeys: async () => (fetches++, [key]),
    });
    const at = (ms: number) => Math.floor(ms / 1000);

    await verifier.verify(body, deliver(body, at(clock)));
    expect(await verifier.verify(body, deliver(body)).catch(reason)).toBe('timestamp_out_of_tolerance');
    expect(fetches).toBe(1);

    clock += 599_000;
    await verifier.verify(body, deliver(body, at(clock)));
    expect(fetches).toBe(1);
    clock += 1_000;
    await verifier.verify(body, deliver(body, at(clock)));
    expect(fetches).toBe(2);
  });

  test('refetches once on an unknown kid, then respects the rate limit', async () => {
    const old = keyPair('v1');
    const next = keyPair('v2');
    let served: WebhookKey[] = [old.key];
    let fetches = 0;
    const verifier = new WebhookVerifier({
      minRefetchIntervalMs: 0,
      fetchKeys: async () => {
        fetches++;
        return served;
      },
    });
    await verifier.verify(body, old.deliver(body));
    served = [next.key, old.key];
    await verifier.verify(body, next.deliver(body));
    expect(fetches).toBe(2);

    const limited = new WebhookVerifier({ fetchKeys: async () => (fetches++, [old.key]) });
    await limited.verify(body, old.deliver(body));
    const before = fetches;
    expect(await limited.verify(body, keyPair('v9').deliver(body)).catch(reason)).toBe('unknown_key');
    expect(fetches).toBe(before);
  });
});
