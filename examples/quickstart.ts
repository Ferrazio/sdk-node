import { Ferrazio, FerrazioApiError, ValidationError } from '../src/index.js';

// Reads FERRAZIO_API_KEY (and FERRAZIO_BASE_URL, FERRAZIO_ORGANIZATION_ID) from the environment.
const fz = new Ferrazio();

// One page.
const page = await fz.pay.receivables.list({ page_size: 20 });
console.log(page);

// Every item, page after page.
for await (const subscription of fz.hooks.listSubscriptionsAll()) {
  console.log(subscription.subscription_id, subscription.url);
}

// Create, and tell failures apart.
try {
  const receivable = await fz.pay.receivables.create({
    iam_person_id: '49575241143283713',
    destination_wallet_id: '43791531487657999',
    original_amount: '150.00',
    currency: 'BRL',
    due_date: '2026-12-10',
    idempotency_key: 'order-1042',
  });
  console.log(receivable);
} catch (error) {
  if (error instanceof ValidationError) {
    for (const detail of error.details ?? []) console.error(detail.field, detail.message);
  } else if (error instanceof FerrazioApiError) {
    console.error(error.status, error.error, error.code, error.requestId);
  } else {
    throw error;
  }
}
