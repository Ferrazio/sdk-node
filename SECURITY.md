# Segurança

## Como relatar uma vulnerabilidade

Não abra issue pública. Use o relato privado do GitHub: aba **Security** deste
repositório, botão **Report a vulnerability**. Descreva o impacto, os passos para
reproduzir e a versão do SDK.

Respondemos o recebimento em até 3 dias úteis e combinamos com você a data de
divulgação depois da correção.

## Versões cobertas

Só a versão mais recente da série principal recebe correções de segurança.

## O que o SDK faz para proteger você

- **Credenciais só por TLS.** O `baseUrl` precisa ser `https`. `http` só é aceito em
  loopback e em endereço de rede privada (desenvolvimento local), ou com
  `allowInsecureHttp` explícito.
- **Credencial fora de erro e de log.** Os erros guardam o status, o corpo e os
  cabeçalhos da resposta, nunca os cabeçalhos da requisição.
- **`env: false`** desliga a leitura das variáveis `FERRAZIO_*`. Use em processo que
  atende várias contas, para uma variável do host não vazar para todas.
- **Webhooks e eventos de app** são verificados com Ed25519 sobre o corpo cru, com
  tolerância de 5 minutos no carimbo de tempo. Descarte duplicatas pelo `eventId`.
- **Cartão** é tokenizado direto no adquirente com a chave pública. O número do
  cartão nunca passa pela API Ferrazio.

## O que fica com você

- Guarde a chave de API, o token de sessão e o refresh token OAuth num cofre, nunca
  no código nem no repositório.
- O refresh token OAuth gira a cada uso: grave o par novo antes de usar o access
  token, e trate `AppInstallationRevokedError` pedindo para reconectar.
- Num app móvel, guarde o token de sessão no armazenamento seguro do sistema
  (Keychain, Keystore), não em armazenamento comum.
