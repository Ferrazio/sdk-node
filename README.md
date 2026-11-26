# Ferrazio SDK para Node.js

Cliente oficial da API da Ferrazio para Node.js e TypeScript. Cobre todas as
operações do gateway com tipos, paginação automática, novas tentativas, erros
com classe própria e verificação de assinatura de webhook.

- Sem dependência em tempo de execução: usa o `fetch` nativo.
- ESM e CommonJS, com tipos nos dois.
- Node.js 20 ou mais novo. Funciona também em Bun, Deno e React Native (ver [App mobile](#app-mobile-react-native)).

## Instalação

```bash
npm install @ferrazio/sdk
```

## Primeiros passos

Crie uma chave de API no painel (Configurações > Chaves de API) ou por
`POST /v1/iam/api-keys`. O segredo `fz_...` aparece uma única vez, na criação.

```ts
import { Ferrazio } from '@ferrazio/sdk';

const fz = new Ferrazio({ apiKey: process.env.FERRAZIO_API_KEY });

const pagina = await fz.pay.receivables.list({ page_size: 20 });
console.log(pagina);
```

Em CommonJS:

```js
const { Ferrazio } = require('@ferrazio/sdk');
```

Os métodos seguem as tags da API: `fz.<módulo>.<área>.<operação>()`. A lista
completa, com a rota de cada um, está em [`docs/api.md`](docs/api.md). O editor
mostra a documentação da rota ao passar o mouse sobre o método.

Os nomes de campo são os da API (`snake_case`), sem conversão: o que está na
documentação do gateway é o que você escreve e o que você recebe.

## Configuração

| Opção | Variável de ambiente | Padrão | O que é |
|---|---|---|---|
| `apiKey` | `FERRAZIO_API_KEY` | | Chave `fz_...`, enviada como `Authorization: ApiKey` |
| `token` | `FERRAZIO_TOKEN` | | Token de sessão, enviado como `Authorization: Bearer`. Tem precedência sobre a chave |
| `accessToken` | | | Provedor do token de app OAuth (veja [App OAuth](#app-oauth-loja-conectada)). Tem precedência sobre os dois |
| `organizationId` | `FERRAZIO_ORGANIZATION_ID` | | Organização em que os pedidos rodam (`X-Organization-Id`) |
| `baseUrl` | `FERRAZIO_BASE_URL` | `https://gate.ferrazio.com` | Endereço do gateway. Só `https`; `http` apenas em loopback e rede privada |
| `allowInsecureHttp` | | `false` | Aceita `http` em qualquer host. A credencial trafega sem cifra |
| `timeout` | | `30000` | Prazo de cada tentativa, em ms. `0` desliga |
| `maxRetries` | | `2` | Novas tentativas depois de uma falha |
| `maxRetryAfter` | | `30000` | Maior espera de `Retry-After` aceita, em ms |
| `defaultHeaders` | | | Cabeçalhos somados a todo pedido |
| `fetch` | | `fetch` global | Implementação própria (proxy, instrumentação, teste) |
| `env` | | `true` | `false` ignora as variáveis `FERRAZIO_*`: o cliente usa só o que foi passado |

Toda chamada aceita um último argumento com ajustes só para ela:

```ts
await fz.pay.receivables.list(
  { page_size: 50 },
  { timeout: 5000, maxRetries: 0, organizationId: '43791531487657985', signal: controller.signal },
);
```

### Organizações

A chave nasce numa organização e por padrão vale só nela. Com
`organization_scope: "subtree"` ela serve também às organizações abaixo, e cada
pedido escolhe a sua:

```ts
const filial = fz.withOrganization('43791531487657990');
await filial.pay.receivables.list();
```

`withOrganization` devolve outro cliente e não mexe no original, então é seguro
em servidor que atende várias organizações ao mesmo tempo.

Um processo que atende várias contas, cada uma com a sua chave, deve criar os
clientes com `env: false`. Sem isso, uma `FERRAZIO_TOKEN` exportada no servidor
passa na frente da chave de todas elas, e uma `FERRAZIO_ORGANIZATION_ID` vale
para todas. `withOrganization` e `withOptions` preservam a opção.

```ts
const loja = new Ferrazio({ apiKey: chaveDaLoja, baseUrl, env: false });
```

## Paginação

Toda listagem usa cursor: a resposta traz `next_page_token` e o pedido seguinte
o devolve em `page_token`. Cada método de listagem tem um irmão `*All` que faz
isso sozinho:

```ts
for await (const titulo of fz.pay.receivables.listAll({ page_size: 100 })) {
  console.log(titulo.id);
}

const primeiros = await fz.hooks.listSubscriptionsAll().toArray({ limit: 500 });

for await (const pagina of fz.hooks.listSubscriptionsAll().pages()) {
  console.log(pagina.items.length, pagina.next_page_token);
}
```

As páginas são buscadas sob demanda: sair do laço interrompe a busca.

Os itens chegam com o tipo declarado na especificação para a página.

## Erros

Toda resposta fora de 2xx vira uma exceção `FerrazioApiError`, com subclasse
por status:

| Status | Classe | Quando |
|---|---|---|
| 400 | `BadRequestError` | Pedido malformado |
| 401 | `AuthenticationError` | Credencial recusada no login |
| 402 | `ModuleNotEntitledError` | A organização não contratou o módulo da rota |
| 403 | `PermissionDeniedError` | Falta permissão ao membro ou ao escopo da chave |
| 404 | `NotFoundError` | Recurso inexistente neste tenant ou organização |
| 409 | `ConflictError` | Conflito com o estado atual |
| 412 | `PreconditionFailedError` | Pré-condição da operação não atendida |
| 422 | `ValidationError` | Validação. Veja `details` |
| 428 | `StepUpRequiredError` | A rota (dinheiro, em `/v1/pay`) exige sessão que passou pelo segundo fator |
| 429 | `RateLimitError` | Limite de pedidos. Veja `retryAfter` |
| 5xx | `ServerError` | Falha da plataforma. Veja `incidentId` |

```ts
import { FerrazioApiError, ValidationError } from '@ferrazio/sdk';

try {
  await fz.pay.receivables.create(corpo);
} catch (erro) {
  if (erro instanceof ValidationError) {
    for (const campo of erro.details ?? []) console.error(campo.field, campo.message);
  } else if (erro instanceof FerrazioApiError) {
    console.error(erro.status, erro.error, erro.code, erro.requestId);
  } else {
    throw erro;
  }
}
```

Decida pelo `error` (classe estável, como `validation` ou `not_found`) ou pelo
`code` (motivo específico da rota). Nunca pela `message`, que é texto para
humano e muda. Ao falar com o suporte, informe o `requestId`.

A `message` traz método, rota e status na frente (`GET /v1/... failed with 422: ...`),
para log. Para mostrar ao usuário, use `apiMessage`: só a frase do gateway, ou
`undefined` quando a resposta não trouxe nenhuma (corpo vazio, página da borda).

Falhas sem resposta HTTP são `FerrazioConnectionError` (rede),
`FerrazioTimeoutError` (prazo) e `FerrazioAbortError` (cancelada por você).

> **Credencial ausente ou inválida responde 404 com o motivo `unidentified`**,
> não 401. O gateway esconde as rotas protegidas de quem ele não identifica. Esse
> caso chega como `NotFoundError` com `unidentified: true`: sessão expirada ou
> revogada, chave inválida ou organização fora do escopo. Um 404 de recurso
> inexistente tem o motivo `not_found` e `unidentified: false`.

## Novas tentativas

O cliente repete sozinho, com espera exponencial e variação aleatória:

- `429` em qualquer método, respeitando `Retry-After`;
- falha de rede, prazo estourado, `502`, `503`, `504` e `520` a `530` em `GET`.

Os `520` a `530` são da borda (Cloudflare), não do gateway: ela não conseguiu
resposta da origem. Chegam como `ServerError` com `edge: true`.

`POST`, `PUT`, `PATCH` e `DELETE` não são repetidos nesses casos, porque o efeito
pode já ter acontecido: um `PUT` com `expected_version` responde `409` na
repetição e um `DELETE` responde `404`, depois de a primeira tentativa ter dado
certo. Quando a rota aceita chave de idempotência, envie-a e libere a
repetição:

```ts
await fz.pay.receivables.create({ ...corpo, idempotency_key: 'pedido-1042' }, { idempotent: true });
```

Um `Retry-After` maior que `maxRetryAfter` não é esperado: vira `RateLimitError`
na hora, com o prazo em `retryAfter` (segundos).

## E-mail transacional

Para mandar um e-mail já pronto (redefinição de senha, convite) em nome da
organização, sem template na Ferrazio. A chave precisa da permissão
`mailer.disparos.envio.create` e a organização, do módulo `mailer`.

```ts
import { PreconditionFailedError } from '@ferrazio/sdk';

const { ready } = await fz.mailer.emails.readiness();
if (ready) {
  try {
    const { id } = await fz.mailer.emails.send({
      to: 'cliente@exemplo.com',
      subject: 'Redefinir senha',
      text: 'Use o link: https://loja.exemplo.com/senha/abc',
      html: '<p>Use o <a href="https://loja.exemplo.com/senha/abc">link</a>.</p>',
      reply_to: 'suporte@loja.exemplo.com',
    });
  } catch (erro) {
    if (erro instanceof PreconditionFailedError && erro.code === 'recipient_suppressed') {
      // o endereço está na lista de supressão
    } else {
      throw erro;
    }
  }
}
```

- O e-mail sai pelo SMTP próprio da organização (ou do tenant). A Ferrazio
  nunca envia em nome dela no lugar do cliente: sem remetente configurado,
  `readiness()` responde `ready: false` com `reason: 'sender_not_configured'`
  e `send` falha com `412` e o mesmo `code`.
- `202` quer dizer "na fila". A entrega é assíncrona: o desfecho aparece no
  histórico, com o `id` em `send_id`
  (`fz.mailer.deliveries.list({ send_id: id })`).
- Cada organização tem um teto de envios por hora (padrão 200). Acima dele vem
  `429` sem `Retry-After`: o cliente repete com a espera curta de sempre e
  depois lança `RateLimitError`. Para falhar na hora, passe `{ maxRetries: 0 }`.
- A lista de supressão fica em `fz.mailer.suppressions` (`list`, `add`,
  `remove`). Endereço suprimido responde `412` com `code = recipient_suppressed`.

## Cartão (Pagar.me)

O número do cartão nunca passa pelo Ferrazio: o app pega a chave pública numa rota
`card-key` (`fz.billing.getCardKey()`, `fz.pay.acquiring.cardPublicKey()` ou a do
checkout público), tokeniza direto na adquirente e manda só o token.

```ts
import { CardTokenizationError, tokenizeCardPagarme } from '@ferrazio/sdk';

try {
  const token = await tokenizeCardPagarme(chavePublica, {
    number: '4000 0000 0000 0010',
    holderName: 'Maria Silva',
    expMonth: 3,
    expYear: 29,
    cvv: '123',
  });
} catch (erro) {
  if (!(erro instanceof CardTokenizationError)) throw erro;
  // erro.reason: 'invalid_card' | 'connection' | 'invalid_response'
}
```

Com a chave `pk_test_mock` (dev e testes) nada sai do aparelho: o cartão final `0028`
vira `MOCKTOKEN_REFUSE` e qualquer outro vira `MOCKTOKEN_OK`. A Stripe fica de fora de
propósito: ela só aceita o cartão digitado dentro do Elements ou do SDK nativo dela.

## App OAuth (loja conectada)

Em vez de `apiKey`, um app instalado na organização usa `accessToken`, um provedor. O cliente pede o token a cada chamada. Em `401 token_expired` chama `refresh` uma vez (as chamadas concorrentes esperam a mesma renovação) e repete a chamada. `401 app_installation_revoked` vira `AppInstallationRevokedError`: renovar não adianta, é preciso reconectar.

```ts
const fz = new Ferrazio({
  env: false,
  accessToken: {
    getAccessToken: () => cofre.access(installationId),
    refresh: (rejeitado) => cofre.renovar(installationId, rejeitado),
  },
});
const par = await fz.oauthApp.token({ clientId, clientSecret }, { grantType: 'refresh_token', refreshToken });
```

`fz.oauthApp` tem `token`, `revoke`, `installation`, `signingKeys` e `verifier()` (eventos de app, mesmo esquema dos webhooks; as chaves vêm com o access token do app). `403 human_required` vira `HumanRequiredError`. O refresh token gira a cada uso, então guarde o par novo sempre.

## Webhooks

Cada entrega é assinada com Ed25519 sobre `v1:{timestamp}:{corpo cru}`. O
verificador busca as chaves públicas, guarda em cache, casa pelo `kid` e
acompanha a rotação sozinho.

```ts
import { createServer } from 'node:http';
import { Ferrazio, WebhookVerificationError } from '@ferrazio/sdk';

const fz = new Ferrazio();
const verificador = fz.webhooks.verifier(); // um por processo

createServer(async (req, res) => {
  const partes = [];
  for await (const parte of req) partes.push(parte);
  const corpoCru = Buffer.concat(partes);

  try {
    const evento = await verificador.verify(corpoCru, req.headers);
    console.log(evento.type, evento.eventId, evento.deliveryId, evento.payload);
    res.writeHead(204).end();
  } catch (erro) {
    if (!(erro instanceof WebhookVerificationError)) throw erro;
    res.writeHead(400).end(erro.reason);
  }
}).listen(3000);
```

Quatro cuidados:

1. **Verifique o corpo cru.** Com Express, use `express.raw({ type: 'application/json' })`
   nessa rota. Um corpo já convertido em objeto e serializado de novo não confere.
2. **Só o corpo é assinado.** `type` e `eventId` saem do corpo (`type` e
   `event_id`), nunca dos cabeçalhos `X-Ferrazio-Event` e `X-Ferrazio-Event-Id`,
   que quem tiver uma entrega pode trocar e reenviar. Se um desses cabeçalhos
   divergir do corpo, a entrega é recusada (`invalid_payload`). Corpo
   personalizado de um bloco de fluxo pode não ter esses campos: aí eles vêm
   `undefined`. Entrega sem corpo chega com `payload` `undefined`.
3. **Entregas com mais de 5 minutos são recusadas** (proteção contra repetição).
   Ajuste com `verifier({ toleranceSeconds })` se o relógio do servidor não for confiável.
4. **A entrega é ao menos uma vez.** Descarte duplicatas pelo `eventId`: uma nova tentativa
   e uma repetição dentro da janela de 5 minutos trazem o mesmo `eventId`.

O verificador busca as chaves de novo quando a assinatura falha ou o `kid` é
desconhecido (no máximo uma vez por minuto, `minRefetchIntervalMs`). Para
renovar também por idade, use `maxKeyAgeMs`. Em teste com relógio falso, passe
`now: () => milissegundos`.

Para verificar com chaves que você mesmo guarda, use `verifyWebhookSignature`.

## Login de usuário

Integração de servidor usa chave de API. Para agir como um usuário:

```ts
const fz = new Ferrazio();
let login = await fz.auth.login({ identifier: email, password: senha });
// Entrada fora do padrão da conta (aparelho, país ou região nunca vistos): mostrar
// `login.channels` (contatos mascarados), a pessoa escolhe um e digita o contato
// inteiro, e o código chega por ele. A verificação devolve um login de novo.
if ('verification_required' in login) {
  const { verification_token } = login;
  await fz.auth.loginVerificationSend({ verification_token, channel: 'whatsapp', contact });
  login = await fz.auth.loginVerificationVerify({ verification_token, code: codigoRecebido });
}
// Senha que confere em mais de uma empresa: mostrar `login.tenants` e seguir
// com `fz.auth.loginTenant({ choice_token, ... })`.
if ('tenant_choice_required' in login) throw new Error('escolha a empresa');
if ('verification_required' in login) throw new Error('verificação pendente');

const token =
  'token' in login
    ? login.token
    : (await fz.mfa.verifyMfa({ mfa_challenge_token: login.mfa_challenge_token, totp_code: codigo })).token;

fz.setToken(token);
```

Senha certa com segundo fator pendente é resposta 200 com `mfa_required: true`,
não erro. Entrada fora do padrão da conta também é 200, com
`verification_required: true` e nenhuma sessão: o login tem quatro formas desde a
7.0.0, e código que trata só três deixa de compilar. Código de verificação errado,
vencido ou contato que não confere volta 400 com `code` `login_verification_invalid`.
O link "não fui eu" do aviso de entrada vai para `fz.auth.loginAlertNotMe({ token })`.

## App mobile (React Native)

O SDK roda no React Native (Hermes) sem polyfill: usa só `fetch`, `Headers`,
`Response` e `AbortController`, que o React Native já traz, e não depende de
`process`, `URL`, `URLSearchParams` nem `ReadableStream`. Somado ao bundle, ocupa
cerca de 230 KB minificado (30 KB com gzip).

Três regras:

1. **Nunca embuta chave de API no app.** Ela é segredo de servidor e qualquer um
   extrai do pacote. O app entra como o usuário, com login e token de sessão.
2. **Informe `baseUrl`.** No app não há variável de ambiente; sem ele o cliente
   fala com produção.
3. **Webhook é coisa de servidor.** `fz.webhooks` precisa de `crypto.subtle` com
   Ed25519, que o Hermes não tem.

```ts
import * as SecureStore from 'expo-secure-store';
import { Ferrazio, FerrazioApiError, StepUpRequiredError } from '@ferrazio/sdk';

export const fz = new Ferrazio({ baseUrl: 'https://gate.ferrazio.com' });

export async function entrar(email: string, senha: string, codigo?: () => Promise<string>) {
  const login = await fz.auth.login({ identifier: email, password: senha });
  if ('tenant_choice_required' in login) throw new Error('escolha a empresa');
  if ('verification_required' in login) throw new Error('verificar a entrada'); // ver "Login de usuário"
  const sessao =
    'token' in login
      ? login
      : await fz.mfa.verifyMfa({ mfa_challenge_token: login.mfa_challenge_token, totp_code: await codigo!() });
  fz.setToken(sessao.token);
  await fz.sessions.rememberSession(); // "manter conectado": 30 dias sem uso em vez de 12 horas
  await SecureStore.setItemAsync('fz_token', sessao.token);
}

export async function retomar(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('fz_token');
  if (!token) return false;
  fz.setToken(token);
  try {
    await fz.auth.me();
    return true;
  } catch (erro) {
    if (erro instanceof FerrazioApiError && erro.unidentified) return sair();
    throw erro; // sem rede, por exemplo: mantém o token e tenta depois
  }
}

export async function sair(): Promise<false> {
  await fz.auth.logout().catch(() => undefined);
  fz.setToken(undefined);
  await SecureStore.deleteItemAsync('fz_token');
  return false;
}
```

Em qualquer chamada, `erro.unidentified` quer dizer que a sessão acabou: volte
para o login. `StepUpRequiredError` (428) aparece em rotas de dinheiro quando a
sessão não passou pelo segundo fator: peça o login de novo com o código TOTP.

Para enviar arquivo, as rotas `multipart` aceitam o `FormData` do React Native
com `{ uri, name, type }`. Rotas que devolvem binário entregam o `Response`:
use `await resposta.blob()` ou `arrayBuffer()`.

## Arquivos e respostas que não são JSON

Rotas que devolvem arquivo (PDF, XML, CSV, imagem) entregam `string` quando o
conteúdo é texto e o `Response` do `fetch` quando é binário ou fluxo:

```ts
const resposta = await fz.stock.purchasing.purchaseOrderPdf(id);
await writeFile('pedido.pdf', Buffer.from(await resposta.arrayBuffer()));
```

## Inteiros de 64 bits

Todo identificador da API é texto (desde a 0.3.0, também `user_id` e
`tenant_id` do login e do `me`). Se algum inteiro de 64 bits ainda chegar como
número, ele não cabe no `number` do JavaScript: para o valor não chegar
arredondado, o cliente entrega como **texto** todo inteiro fora da faixa
segura, e campos assim são tipados `number | string`.

Vale em todo motor: onde o `JSON.parse` entrega o texto original ao reviver
(Node.js 22, Bun) o cliente usa isso; nos outros (Node.js 20, Hermes do React
Native) ele põe aspas nesses inteiros antes de converter, com o mesmo resultado.

## Dinheiro

Valores monetários trafegam como texto decimal (`"150.00"`). Não converta para
`number` para fazer conta: use uma biblioteca decimal.

## Rota que o SDK ainda não conhece

```ts
const resposta = await fz.request<{ id: string }>('POST', '/v1/rota/nova', {
  query: { page_size: 10 },
  body: { nome: 'x' },
});
```

Passa pela mesma autenticação, pelas mesmas tentativas e pelos mesmos erros.

## Tipos

Todos os corpos e respostas da API estão em `Schemas`:

```ts
import type { Schemas } from '@ferrazio/sdk';

function total(titulo: Schemas.AccountsReceivableDto) {}
```

## Desenvolvimento

O código em `src/generated` e o arquivo `docs/api.md` saem do documento OpenAPI do
gateway. Não edite à mão: mude o gerador ou a especificação e gere de novo.

```bash
bun install
bun run generate                      # lê a cópia em openapi/openapi.json
bun run generate caminho/openapi.json # ou outro arquivo, ou uma URL (a cópia é atualizada)
bun run typecheck
bun test
bun run build                         # dist/ com ESM, CommonJS e tipos
```

O gerador publica o texto da especificação limpo de referências internas (veja
`publicText` em `scripts/spec.ts`); rotas, esquemas e todo campo lido por máquina
ficam como estão.

A versão anda junto com a especificação. `openapi/version.json` guarda qual versão
saiu de qual documento (hash SHA-256 da cópia), e o gerador recusa um documento novo
com a mesma versão: suba `package.json` e `src/version.ts` antes de gerar. Em semver:
**major** só quando a spec quebra quem já usa (operação ou campo removido, tipo
trocado, campo de entrada que virou obrigatório, valor de enum removido); **minor**
quando a spec ou o contrato da borda ganham algo sem quebrar; **patch** quando nenhum
dos dois muda (correção em `src/core`, docs, empacotamento). O gerador lista o que
quebrou e recusa uma versão abaixo da exigida, sem gravar nada.

O pacote leva `openapi/edge-contract.json`, o comportamento da borda que um cliente
observa (CORS, cabeçalhos, conta retida, motivos de erro), e
`openapi/openapi.min.json.gz`, a especificação sem espaços em gzip. Os hashes dos dois
ficam em `openapi/version.json`, e o `prepack` recusa empacotar se não baterem.

Os testes têm três camadas. `tests/client.test.ts` e `tests/webhooks.test.ts` provam o
núcleo contra um servidor local. `tests/contract.test.ts` chama cada operação da
especificação e confere verbo, rota, query, credencial, corpo e leitura da resposta.
A terceira roda contra um gateway de verdade e não entra no `bun test`:

```bash
FERRAZIO_BASE_URL=https://seu-ambiente-de-teste FERRAZIO_TOKEN=... bun scripts/live-sweep.ts relatorio.json
```

Ela lê todo `GET` com ids reais e confere a resposta contra o esquema declarado. As
escritas vão com id inexistente ou corpo vazio, para provar a rota sem gravar nada, e a
que não cabe em nenhum dos dois casos fica de fora e sai listada. Nunca aponte para produção.

| Pasta | Conteúdo |
|---|---|
| `src/core` | Motor HTTP, erros, paginação, webhooks, OAuth de app e tokenização de cartão (escrito à mão) |
| `src/generated` | Recursos e tipos (gerado) |
| `scripts/generate.ts` | Gerador |
| `scripts/spec.ts` | Limpeza da especificação e detecção de quebra |
| `scripts/live-sweep.ts` | Varredura ao vivo de todas as operações |
| `tests` | Testes do núcleo e de contrato |
| `openapi` | Cópia da especificação, a lista de operações geradas e a versão que saiu dela |
| `examples` | Exemplos que passam pela checagem de tipos |

## Segurança

Para relatar uma vulnerabilidade, veja [SECURITY.md](SECURITY.md). Não abra issue pública.

## Licença

Proprietária. Copyright (c) Ferrazio, todos os direitos reservados. O uso é permitido só para integrar com a API Ferrazio, nos termos da [LICENSE](LICENSE).
