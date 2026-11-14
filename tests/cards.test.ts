import { describe, expect, test } from 'bun:test';
import { CardTokenizationError, MOCK_CARD_PUBLIC_KEY, tokenizeCardPagarme, type CardInput, type FetchLike } from '../src/index.js';

const card: CardInput = { number: '4000 0000 0000 0010', holderName: 'Maria Silva', expMonth: '03', expYear: 29, cvv: '123' };
const reason = async (promise: Promise<unknown>) => promise.then(() => 'ok', (error) => (error instanceof CardTokenizationError ? error.reason : error));

describe('tokenizeCardPagarme', () => {
  test('the mock key answers locally, refusing only the card ending in 0028', async () => {
    const fetch: FetchLike = () => {
      throw new Error('no request expected');
    };
    expect(await tokenizeCardPagarme(MOCK_CARD_PUBLIC_KEY, card, { fetch })).toBe('MOCKTOKEN_OK');
    expect(await tokenizeCardPagarme(MOCK_CARD_PUBLIC_KEY, { ...card, number: '4000-0000-0000-0028' }, { fetch })).toBe('MOCKTOKEN_REFUSE');
  });

  test('posts the card to Pagar.me with the public key and returns the token id', async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const fetch: FetchLike = async (url, init) => {
      seen = { url, init };
      return Response.json({ id: 'token_abc', type: 'card' });
    };
    expect(await tokenizeCardPagarme('pk_live_x/y', card, { fetch })).toBe('token_abc');
    expect(seen!.url).toBe('https://api.pagar.me/core/v5/tokens?appId=pk_live_x%2Fy');
    expect(seen!.init.method).toBe('POST');
    expect(JSON.parse(String(seen!.init.body))).toEqual({
      type: 'card',
      card: { number: '4000000000000010', holder_name: 'Maria Silva', exp_month: 3, exp_year: 2029, cvv: '123' },
    });
  });

  test('a refusal, a network failure and a reply without token each have their reason', async () => {
    const answer = (response: () => Response): FetchLike => async () => response();
    expect(await reason(tokenizeCardPagarme('pk', card, { fetch: answer(() => Response.json({}, { status: 422 })) }))).toBe('invalid_card');
    expect(await reason(tokenizeCardPagarme('pk', card, { fetch: () => Promise.reject(new TypeError('offline')) }))).toBe('connection');
    expect(await reason(tokenizeCardPagarme('pk', card, { fetch: answer(() => Response.json({ type: 'card' })) }))).toBe('invalid_response');
    expect(await reason(tokenizeCardPagarme('pk', card, { fetch: answer(() => new Response('<html>')) }))).toBe('invalid_response');
  });
});
