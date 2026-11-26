import { FerrazioError } from './errors.js';
import type { FetchLike } from './http.js';

/**
 * Public key of the mock acquirer used by dev and tests. With it no request
 * leaves the device: the card ending in `0028` becomes `MOCKTOKEN_REFUSE`
 * (exercises the refusal) and any other number becomes `MOCKTOKEN_OK`.
 */
export const MOCK_CARD_PUBLIC_KEY = 'pk_test_mock';

/** Card typed by the buyer. It goes straight to the acquirer, never to Ferrazio. */
export interface CardInput {
  /** Card number; spaces and dashes are ignored. */
  number: string;
  /** Name printed on the card. */
  holderName: string;
  /** Expiry month, 1-12. */
  expMonth: number | string;
  /** Expiry year, with 2 or 4 digits (`29` is read as `2029`). */
  expYear: number | string;
  /** Security code. */
  cvv: string;
}

/** Why {@link tokenizeCardPagarme} failed. */
export type CardTokenizationFailure = 'invalid_card' | 'connection' | 'invalid_response';

/** The acquirer did not hand back a card token. */
export class CardTokenizationError extends FerrazioError {
  constructor(
    readonly reason: CardTokenizationFailure,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** Options of {@link tokenizeCardPagarme}. */
export interface TokenizeCardOptions {
  /** `fetch` to use. Defaults to the global one. */
  fetch?: FetchLike;
  /** Aborts the request. */
  signal?: AbortSignal;
}

const PAGARME_TOKENS_URL = 'https://api.pagar.me/core/v5/tokens';

/**
 * Turns a card into a single-use Pagar.me token, calling the acquirer directly
 * with the public key (PCI: the card number never reaches Ferrazio). The key
 * comes from the `card-key` routes, e.g. `fz.billing.getCardKey()` or
 * `fz.pay.acquiring.cardPublicKey()`; send the token where the route asks for
 * a card token. With {@link MOCK_CARD_PUBLIC_KEY} nothing is sent.
 *
 * Stripe is not covered on purpose: it only accepts card data typed inside its
 * own Elements or native SDK.
 */
export async function tokenizeCardPagarme(publicKey: string, card: CardInput, options: TokenizeCardOptions = {}): Promise<string> {
  const number = card.number.replace(/[\s-]/g, '');
  if (publicKey === MOCK_CARD_PUBLIC_KEY) return number.endsWith('0028') ? 'MOCKTOKEN_REFUSE' : 'MOCKTOKEN_OK';

  const year = Number.parseInt(String(card.expYear), 10) || 0;
  const body = {
    type: 'card',
    card: {
      number,
      holder_name: card.holderName,
      exp_month: Number.parseInt(String(card.expMonth), 10) || 0,
      exp_year: year < 100 ? 2000 + year : year,
      cvv: card.cvv,
    },
  };
  const send = options.fetch ?? globalThis.fetch;
  let response: Response;
  try {
    response = await send(`${PAGARME_TOKENS_URL}?appId=${encodeURIComponent(publicKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (cause) {
    throw new CardTokenizationError('connection', 'Could not reach the acquirer.', { cause });
  }
  if (!response.ok) throw new CardTokenizationError('invalid_card', `The acquirer refused the card (HTTP ${response.status}).`);
  let reply: unknown;
  try {
    reply = await response.json();
  } catch (cause) {
    throw new CardTokenizationError('invalid_response', 'The acquirer answered with something that is not JSON.', { cause });
  }
  const id = (reply as { id?: unknown } | null)?.id;
  if (typeof id !== 'string' || id === '') throw new CardTokenizationError('invalid_response', 'The acquirer did not return a card token.');
  return id;
}
