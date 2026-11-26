// Type-checks the snippets shown in the README.
import { Ferrazio, FerrazioApiError, StepUpRequiredError, type Schemas } from '../src/index.js';

const fz = new Ferrazio();
const controller = new AbortController();

await fz.pay.receivables.list({ page_size: 50 }, { timeout: 5000, maxRetries: 0, organizationId: '1', signal: controller.signal });
await fz.withOrganization('2').pay.receivables.list();
for await (const receivable of fz.pay.receivables.listAll({ page_size: 100 })) console.log(receivable.id);
for await (const page of fz.hooks.listSubscriptionsAll().pages()) console.log(page.items.length, page.next_page_token);
const first: Schemas.HookSubscriptionDto[] = await fz.hooks.listSubscriptionsAll().toArray({ limit: 500 });
const body = {} as Schemas.CreateReceivableBody;
const created: Schemas.AccountsReceivableDto = await fz.pay.receivables.create({ ...body, idempotency_key: 'order-1042' }, { idempotent: true });
const pdf: Response = await fz.stock.purchasing.purchaseOrderPdf('1');
console.log(first, created, pdf);

// "App mobile (React Native)", with an in-memory stand-in for expo-secure-store.
{
  const store = new Map<string, string>();
  const SecureStore = {
    setItemAsync: async (key: string, value: string) => void store.set(key, value),
    getItemAsync: async (key: string) => store.get(key) ?? null,
    deleteItemAsync: async (key: string) => void store.delete(key),
  };
  const app = new Ferrazio({ baseUrl: 'https://gate.ferrazio.com' });

  async function entrar(email: string, senha: string, codigo?: () => Promise<string>) {
    const login = await app.auth.login({ identifier: email, password: senha });
    if ('tenant_choice_required' in login) throw new Error('escolha a empresa');
    if ('verification_required' in login) throw new Error('verificar a entrada');
    const sessao =
      'token' in login
        ? login
        : await app.mfa.verifyMfa({ mfa_challenge_token: login.mfa_challenge_token, totp_code: await codigo!() });
    app.setToken(sessao.token);
    await app.sessions.rememberSession();
    await SecureStore.setItemAsync('fz_token', sessao.token);
  }

  async function retomar(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('fz_token');
    if (!token) return false;
    app.setToken(token);
    try {
      await app.auth.me();
      return true;
    } catch (erro) {
      if (erro instanceof FerrazioApiError && erro.unidentified) return sair();
      throw erro;
    }
  }

  async function sair(): Promise<false> {
    await app.auth.logout().catch(() => undefined);
    app.setToken(undefined);
    await SecureStore.deleteItemAsync('fz_token');
    return false;
  }

  const passo: unknown = StepUpRequiredError;
  console.log(entrar, retomar, passo);
}

// "Organizações" (várias contas no mesmo processo) and the webhook verifier options.
{
  const loja = new Ferrazio({ apiKey: 'fz_loja', baseUrl: 'https://api.exemplo.com', env: false });
  const verificador = loja.webhooks.verifier({ toleranceSeconds: 300, maxKeyAgeMs: 600_000, now: () => Date.now() });
  console.log(verificador);
}
