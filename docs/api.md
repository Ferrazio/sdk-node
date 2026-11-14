# Referência da API

Gerado por `scripts/generate.ts` a partir do OpenAPI do gateway (versão `1.0.0`).
2287 operações. `fz` é uma instância de `Ferrazio`. Métodos com `*All` percorrem todas as páginas.

## fz.archive

| Método | Rota | O que faz |
|---|---|---|
| `addGrant` | `POST /v1/archive/files/{id}/grants` | Concede acesso de exceção (view) a org/pessoa. |
| `createFolder` | `POST /v1/archive/folders` | Cria uma pasta no cofre. |
| `createShareLink` | `POST /v1/archive/files/{id}/share-links` | Cria um link (public/self) p/ o arquivo. |
| `deleteFile` | `DELETE /v1/archive/files/{id}` | Remove um arquivo do cofre (o `archive` aplica a ACL de delete). |
| `download` | `GET /v1/archive/files/{id}` | Baixa um arquivo do cofre (bytes). O `archive` aplica a ACL. |
| `downloadBlocked` | `GET /v1/archive/files/{id}/blocked-content` | Baixa um arquivo em quarentena, depois de a tela ter pedido a confirmação de risco. Só arquivo bloqueado passa por aqui; o comum responde 409. |
| `forceDeleteFile` | `DELETE /v1/archive/files/{id}/force` | Força a deleção de um arquivo **gerenciado** pelo sistema. Restrito a `platform_admin`; o `archive` honra `force` independentemente do flag managed. |
| `getFileMeta` | `GET /v1/archive/files/{id}/meta` | Metadados (com política de acesso) de um arquivo. |
| `getPolicies` | `GET /v1/archive/policies` | A política de guarda da organização da sessão. |
| `getUsage` | `GET /v1/archive/usage` | Quanto cada categoria de arquivo ocupa. |
| `getVault` | `GET /v1/archive/vault` | Cofre do tenant (quota + estado). |
| `getVaultFilesUsage` | `GET /v1/archive/vault-files/usage` | Espaço dos cofres de segredos. |
| `list`, `listAll` | `GET /v1/archive/files` | Lista arquivos do cofre (filtrados pela ACL do `archive`). |
| `listBlocked`, `listBlockedAll` | `GET /v1/archive/files/blocked` | Os arquivos bloqueados que a sessão vê. |
| `listDeleted`, `listDeletedAll` | `GET /v1/archive/files/trash` | Lista os arquivos soft-deletados do usuário. |
| `listFolders` | `GET /v1/archive/folders` | Lista as subpastas diretas de `parent_id` (raiz se vazio). |
| `listGrants` | `GET /v1/archive/files/{id}/grants` | Lista as concessões de exceção do arquivo. |
| `listManaged`, `listManagedAll` | `GET /v1/archive/files/managed` | Arquivos gerenciados (anexos do sistema). |
| `listPurges`, `listPurgesAll` | `GET /v1/archive/files/trash/purges` | Registro de arquivos apagados de vez. |
| `listQuarantined`, `listQuarantinedAll` | `GET /v1/archive/quarantine` | Fila de revisão: arquivos bloqueados pela varredura de conteúdo. Restrito a `platform_admin`. |
| `listQuarantineReviews`, `listQuarantineReviewsAll` | `GET /v1/archive/quarantine/{id}/reviews` | Histórico de decisões de um arquivo. Restrito a `platform_admin`. |
| `listRecent`, `listRecentAll` | `GET /v1/archive/files/recent` | Últimos arquivos abertos pelo caller. |
| `listShared`, `listSharedAll` | `GET /v1/archive/files/shared` | Arquivos visíveis ao caller mas de outro dono. |
| `listShareLinks` | `GET /v1/archive/files/{id}/share-links` | Lista os links ativos do arquivo. |
| `moveFile` | `POST /v1/archive/files/{id}/move` | Move o arquivo para uma pasta (raiz se vazio). |
| `purgeFile` | `DELETE /v1/archive/files/{id}/purge` | Purga definitiva (blob + metadata) de um arquivo na lixeira. Só o dono; irreversível. |
| `removeGrant` | `DELETE /v1/archive/files/{id}/grants/{grant_id}` | Revoga uma concessão. |
| `renameFolder` | `PATCH /v1/archive/folders/{id}` | Renomeia uma pasta. |
| `requestFileThaw` | `POST /v1/archive/files/{id}/thaw-request` | Pede a recuperação de um arquivo congelado. |
| `resolvePublic` | `GET /v1/archive/public/{token}` (pública) | Resolve um link **público** (anônimo) e devolve os bytes. Sem `RequestContext` de usuário; só a prova de caller interno. O `archive` valida o token + a política `public`. |
| `restoreFile` | `POST /v1/archive/files/{id}/restore` | Restaura um arquivo da lixeira. |
| `reviewQuarantine` | `POST /v1/archive/quarantine/{id}/review` | Decide sobre um arquivo em quarentena. Restrito a `platform_admin`. |
| `revokeShareLink` | `DELETE /v1/archive/files/{id}/share-links/{link_id}` | Revoga um link. |
| `setAccess` | `PUT /v1/archive/files/{id}/access` | Define visibilidade × escopo do arquivo. |
| `setPolicy` | `PUT /v1/archive/policies` | Grava os prazos de um escopo da organização. |
| `upload` | `POST /v1/archive/files` | Faz upload de um arquivo ao cofre (corpo = bytes; Content-Type = tipo do arquivo). |

## fz.audit

| Método | Rota | O que faz |
|---|---|---|
| `downloadDailyArchive` | `GET /v1/audit/archives/{file_id}/download` | Baixa um arquivo diário. |
| `getCapturePolicy` | `GET /v1/audit/capture-policy` | O que a trilha da organização ativa grava. |
| `getRetentionPolicy` | `GET /v1/audit/retention-policy` | Por quanto tempo a trilha fica no banco. |
| `listCaptureCatalog` | `GET /v1/audit/capture-catalog` | O que dá para escolher na política. |
| `listDailyArchives`, `listDailyArchivesAll` | `GET /v1/audit/archives` | Os arquivos diários da organização ativa. |
| `listRequests`, `listRequestsAll` | `GET /v1/audit/requests` | Audits de requisição visíveis na organização ativa (keyset). |
| `listWriteEvents`, `listWriteEventsAll` | `GET /v1/audit/events` | Write-events do tenant, filtráveis; agrupar por `correlation_id` = "tudo que a requisição X alterou". |
| `updateCapturePolicy` | `PUT /v1/audit/capture-policy` | Escolhe o que a trilha da organização grava. |
| `updateRetentionPolicy` | `PUT /v1/audit/retention-policy` | Escolhe por quanto tempo a trilha fica no banco. |
| `verifyChain` | `GET /v1/audit/entities/{entity_type}/{entity_id}/verify` | Verifica a cadeia da entidade. |

## fz.auth

| Método | Rota | O que faz |
|---|---|---|
| `acceptAccountantInvite` | `POST /v1/auth/accountant/accept` | Aceita o convite de contador. |
| `acceptLoginInvite` | `POST /v1/auth/login-invite/accept` (pública) | Cria a senha a partir do link do convite. |
| `current` | `GET /v1/auth/accountant/current` | Diz se a sessão é de contador dentro de um cliente. |
| `discover` | `GET /v1/auth/sso/discover` (pública) | IdPs que atendem o e-mail. |
| `enterClient` | `POST /v1/auth/accountant/clients/{link_id}/enter` | Entra no cliente. |
| `entryConfig` | `GET /v1/auth/entry-config` (pública) | O que a tela de entrar precisa antes da sessão. |
| `ingressChallenge` | `POST /v1/auth/ingress/challenge` (pública) | Public route; issues the liveness challenge. |
| `ingressComplete` | `POST /v1/auth/ingress/complete` (pública) | Public route; trades the ingress for a session. |
| `leaveClient` | `POST /v1/auth/accountant/leave` | Volta para o escritório. |
| `listClients`, `listClientsAll` | `GET /v1/auth/accountant/clients` | Lista os clientes do contador. |
| `login` | `POST /v1/auth/login` (pública) | Public route. |
| `loginAlertNotMe` | `POST /v1/auth/login-alert/not-me` (pública) | Encerra na hora a sessão que o link "Não fui eu" do aviso de entrada aponta. |
| `loginDomain` | `GET /v1/auth/login-domain` (pública) | Tenant dono do host do login. |
| `loginTenant` | `POST /v1/auth/login/tenant` (pública) | Rota pública; conclui a entrada pelo hub no tenant escolhido. |
| `loginVerificationSend` | `POST /v1/auth/login/verification/send` (pública) | Rota pública; manda o código da verificação de entrada fora do padrão. |
| `loginVerificationVerify` | `POST /v1/auth/login/verification/verify` (pública) | Rota pública; confere o código e conclui a entrada. |
| `logout` | `POST /v1/auth/logout` | Public route; invalidates the session token in `auth`. |
| `me` | `GET /v1/auth/me` | Retorna dados da sessão autenticada. Útil para smoke test do fluxo de autenticação. |
| `passwordResetConfirm` | `POST /v1/auth/password-reset/confirm` (pública) | Rota pública. |
| `passwordResetRequest` | `POST /v1/auth/password-reset/request` (pública) | Public route; requests a password-reset email. |
| `quitClient` | `DELETE /v1/auth/accountant/clients/{link_id}` | Deixa de ser contador do cliente. |
| `redeemGhost` | `POST /v1/auth/ghost/redeem` (pública) | Public route. |

## fz.billing

| Método | Rota | O que faz |
|---|---|---|
| `activateModule` | `POST /v1/billing/modules/{module_key}/activate` | Liga um módulo **grátis** para o tenant/org da sessão, com efeito imediato, ou reabre um módulo pago cujo fim estava agendado e ainda não chegou. |
| `assignLicense` | `PUT /v1/billing/licenses/holders/{person_id}` | Escolhe qual organização paga a licença da pessoa. |
| `deactivateModule` | `POST /v1/billing/modules/{module_key}/deactivate` | Agenda o fim de um módulo contratado. |
| `getAccount` | `GET /v1/billing/account` | A conta de cobrança do tenant/org da sessão. |
| `getAiUsageBreakdown`, `getAiUsageBreakdownAll` | `GET /v1/billing/ai-usage` | Detalhe do consumo de I.A. da organização. |
| `getCardKey` | `GET /v1/billing/card-key` | Chave pública do adquirente da plataforma, para tokenizar o cartão no navegador antes de comprar ou de ligar o débito automático. |
| `getCatalog` | `GET /v1/billing/catalog` | Catálogo da loja de módulos: o que existe para contratar e por quanto. |
| `getEnterpriseTrial` | `GET /v1/billing/enterprise-trial` | O teste empresarial do tenant da sessão: estado, termo e janela. |
| `getInvoice` | `GET /v1/billing/invoices/{invoice_id}` | Uma fatura. É o que faz a tela virar sozinha enquanto o cliente olha o QR. |
| `getLeadPackPurchase` | `GET /v1/billing/lead-packs/purchases/{purchase_id}` | Estado de uma compra de pacotes. |
| `getLicensePurchase` | `GET /v1/billing/licenses/purchases/{purchase_id}` | Estado de uma compra de licenças. |
| `getLicenses` | `GET /v1/billing/licenses` | Licenças de usuário da organização. |
| `getPurchase` | `GET /v1/billing/purchases/{purchase_id}` | Estado de uma compra. É o que faz a tela virar sozinha enquanto o cliente olha o QR. |
| `getReportsUsage`, `getReportsUsageAll` | `GET /v1/billing/usage/reports` | Detalhe da cobrança de Relatórios. |
| `getWallet` | `GET /v1/billing/wallet` | O saldo pré-pago da conta do tenant/org da sessão. |
| `getWalletTopUp` | `GET /v1/billing/wallet/top-ups/{top_up_id}` | Estado de uma recarga. É o que faz a tela virar sozinha enquanto o cliente olha o QR. |
| `listContracts` | `GET /v1/billing/modules` | Contratações de módulo do tenant/org da sessão. |
| `listInvoices`, `listInvoicesAll` | `GET /v1/billing/invoices` | Faturas mensais da conta, da mais nova para a mais antiga, com as linhas. |
| `listLicenseActivations`, `listLicenseActivationsAll` | `GET /v1/billing/licenses/activations` | Detalhe da cobrança por ativação. |
| `listLicenseHolders`, `listLicenseHoldersAll` | `GET /v1/billing/licenses/holders` | Pessoas com licença no tenant. |
| `listPlanPolicies` | `GET /v1/billing/plan-policies` | Políticas de excedente dos planos contratados. |
| `listPurchases`, `listPurchasesAll` | `GET /v1/billing/purchases` | Histórico do que a conta já comprou da plataforma. |
| `listWalletEntries`, `listWalletEntriesAll` | `GET /v1/billing/wallet/entries` | Extrato do saldo pré-pago, da linha mais nova para a mais velha. |
| `payInvoice` | `POST /v1/billing/invoices/{invoice_id}/pay` | Gera o Pix de uma fatura em aberto. |
| `purchaseLeadPacks` | `POST /v1/billing/lead-packs/purchases` | Compra pacotes de leads, R$ por par nicho x município no modo pedido, compra única. |
| `purchaseLicenses` | `POST /v1/billing/licenses/purchases` | Compra licenças de usuário para a organização do contexto: quantidade x meses x preço, pago na hora. |
| `purchaseModule` | `POST /v1/billing/modules/{module_key}/purchase` | Compra um módulo agora, pagando. |
| `purchasePackage` | `POST /v1/billing/packages/{package_key}/purchase` | Compra um pacote inteiro numa cobrança só. |
| `requestQuote` | `POST /v1/billing/quotes` | Pede proposta de um plano vendido sob consulta (`quote: true`). |
| `setPaymentMethod` | `PUT /v1/billing/account/payment-method` | Escolhe como a conta paga as faturas: um Pix a cada mês, ou débito automático no cartão. |
| `setPlanPolicy` | `PUT /v1/billing/plan-policies/{module_key}/{metric}` | Escolhe o que acontece quando a métrica chega ao incluído do plano. |
| `startTrial` | `POST /v1/billing/packages/{package_key}/trial` | Começa o teste grátis de um pacote, sem cartão. |
| `topUpWallet` | `POST /v1/billing/wallet/top-ups` | Recarrega o saldo pré-pago. |

## fz.boards

| Método | Rota | O que faz |
|---|---|---|
| `archiveBoard` | `POST /v1/boards/{id}/archive` | Arquiva o quadro. |
| `cardHistory`, `cardHistoryAll` | `GET /v1/boards/cards/{card_id}/history` | O histórico do cartão. |
| `createBoard` | `POST /v1/boards` | Cria um quadro a partir de um modelo. |
| `createCard` | `POST /v1/boards/{id}/cards` | Cartão novo. |
| `createCardType` | `POST /v1/boards/card-types` | Tipo novo. |
| `createColumn` | `POST /v1/boards/{id}/columns` | Coluna nova no fim. |
| `createField` | `POST /v1/boards/fields` | Campo novo. |
| `createProcess` | `POST /v1/boards/processes` | Processo novo, de um modelo ou copiando outro. |
| `deleteBoard` | `DELETE /v1/boards/{id}` | Manda o quadro para a lixeira. |
| `deleteCard` | `DELETE /v1/boards/cards/{card_id}` | Manda o cartão para a lixeira. |
| `deleteCardType` | `DELETE /v1/boards/card-types/{type_id}` | Manda o tipo para a lixeira. |
| `deleteColumn` | `DELETE /v1/boards/{id}/columns/{column_id}` | Apaga a coluna. |
| `deleteField` | `DELETE /v1/boards/fields/{field_id}` | Manda o campo para a lixeira. |
| `deleteProcess` | `DELETE /v1/boards/processes/{process_id}` | Apaga o processo sem uso. |
| `emptyTrash` | `POST /v1/boards/trash/empty` | Esvazia a lixeira que a pessoa vê. |
| `getBoard` | `GET /v1/boards/{id}` | Um quadro com as colunas. |
| `getCard` | `GET /v1/boards/cards/{card_id}` | Um cartão. |
| `getProcess` | `GET /v1/boards/processes/{process_id}` | Um processo. |
| `listBoards`, `listBoardsAll` | `GET /v1/boards` | Os quadros que a pessoa vê. |
| `listCards`, `listCardsAll` | `GET /v1/boards/{id}/cards` | Página de cartões. |
| `listCardTypes` | `GET /v1/boards/card-types` | Os tipos de cartão da organização. |
| `listFields` | `GET /v1/boards/fields` | Os campos personalizados da organização. |
| `listMembers` | `GET /v1/boards/{id}/members` | Os membros do quadro. |
| `listProcesses` | `GET /v1/boards/processes` | Os processos da organização. |
| `listTemplates` | `GET /v1/boards/templates` | Os modelos de quadro. |
| `listTrash`, `listTrashAll` | `GET /v1/boards/trash` | A lixeira dos quadros. |
| `listTypeFields` | `GET /v1/boards/card-types/fields` | Os campos de cada tipo de cartão. |
| `moveCard` | `POST /v1/boards/cards/{card_id}/move` | Move dentro do quadro. |
| `purgeTrashItem` | `DELETE /v1/boards/trash/{kind}/{id}` | Apaga de vez um item da lixeira. |
| `reorderColumns` | `PUT /v1/boards/{id}/columns/order` | A ordem das colunas. |
| `restoreBoard` | `POST /v1/boards/{id}/restore` | Tira o quadro da lixeira. |
| `restoreCard` | `POST /v1/boards/cards/{card_id}/restore` | Tira o cartão da lixeira. |
| `restoreCardType` | `POST /v1/boards/card-types/{type_id}/restore` | O tipo de volta. |
| `restoreColumn` | `POST /v1/boards/{id}/columns/{column_id}/restore` | A coluna de volta. |
| `restoreField` | `POST /v1/boards/fields/{field_id}/restore` | O campo de volta, com os valores. |
| `saveProcess` | `PUT /v1/boards/processes/{process_id}` | Salva o processo inteiro. |
| `setDefaultProcess` | `POST /v1/boards/processes/{process_id}/default` | Torna o processo o padrão. |
| `setMembers` | `PUT /v1/boards/{id}/members` | Troca a lista de membros inteira. |
| `setTypeFields` | `PUT /v1/boards/card-types/{type_id}/fields` | Troca os campos do tipo. |
| `swapProcess` | `PUT /v1/boards/{id}/process` | Troca o processo do quadro. |
| `transferCard` | `POST /v1/boards/cards/{card_id}/transfer` | Leva para outro quadro. |
| `unarchiveBoard` | `POST /v1/boards/{id}/unarchive` | Desarquiva o quadro. |
| `updateBoard` | `PATCH /v1/boards/{id}` | Nome, descrição, visibilidade, unidade e tipos. |
| `updateCard` | `PATCH /v1/boards/cards/{card_id}` | Título, descrição, tipo, prazo e responsáveis. |
| `updateCardType` | `PATCH /v1/boards/card-types/{type_id}` | Nome, cor, ícone, ordem e aposentadoria. |
| `updateColumn` | `PATCH /v1/boards/{id}/columns/{column_id}` | Nome, tipo, cor e limite. |
| `updateField` | `PATCH /v1/boards/fields/{field_id}` | Nome, unidade, descrição, opções e ordem. |
| `updateSettings` | `PATCH /v1/boards/{id}/settings` | Raias e regra de arquivamento. |

## fz.catalog.attributes

| Método | Rota | O que faz |
|---|---|---|
| `addAttributeValue` | `POST /v1/catalog/attributes/{id}/values` | Acrescenta um valor ao eixo. |
| `createAttribute` | `POST /v1/catalog/attributes` | Cria um eixo com os valores iniciais. |
| `listAttributes`, `listAttributesAll` | `GET /v1/catalog/attributes` | Lista os eixos do tenant, com valores. |

## fz.catalog.brands

| Método | Rota | O que faz |
|---|---|---|
| `createBrand` | `POST /v1/catalog/brands` | Cadastra uma marca. |
| `deleteBrand` | `DELETE /v1/catalog/brands/{id}` | Apaga a marca sem produto vivo. |
| `listBrands`, `listBrandsAll` | `GET /v1/catalog/brands` | As marcas do tenant. |
| `updateBrand` | `PATCH /v1/catalog/brands/{id}` | Remendo da marca. |

## fz.catalog.categories

| Método | Rota | O que faz |
|---|---|---|
| `clearCategoryImage` | `DELETE /v1/catalog/categories/{id}/image` | Tira a imagem da categoria. |
| `createCategory` | `POST /v1/catalog/categories` | `POST /v1/catalog/categories`. |
| `deleteCategory` | `DELETE /v1/catalog/categories/{id}` | `DELETE /v1/catalog/categories/{id}`. |
| `listCategories`, `listCategoriesAll` | `GET /v1/catalog/categories` | `GET /v1/catalog/categories`. |
| `renameCategory` | `PATCH /v1/catalog/categories/{id}` | Remendo da categoria. |
| `reorderCategories` | `PUT /v1/catalog/categories/order` | A ordem das categorias de um pai. |
| `setCategoryImage` | `PUT /v1/catalog/categories/{id}/image` | Põe a imagem ou o ícone da categoria. |

## fz.catalog.collections

| Método | Rota | O que faz |
|---|---|---|
| `addCollectionProducts` | `POST /v1/catalog/collections/{id}/products` | Põe produtos na coleção. |
| `createCollection` | `POST /v1/catalog/collections` | Cria uma coleção vazia. |
| `deleteCollection` | `DELETE /v1/catalog/collections/{id}` | Apaga a coleção. |
| `getCollection` | `GET /v1/catalog/collections/{id}` | Uma coleção. |
| `listCollectionProducts`, `listCollectionProductsAll` | `GET /v1/catalog/collections/{id}/products` | Os produtos da coleção. |
| `listCollections`, `listCollectionsAll` | `GET /v1/catalog/collections` | As coleções do tenant. |
| `listManagedCollections`, `listManagedCollectionsAll` | `GET /v1/catalog/collections/managed/{managed_by}` | As vagas vivas de uma integração. |
| `releaseManagedCollection` | `DELETE /v1/catalog/collections/managed/{managed_by}/{managed_key}` | Solta a vaga quando ela deixa de existir no site. |
| `removeCollectionProduct` | `DELETE /v1/catalog/collections/{id}/products/{product_id}` | Tira o produto da coleção. |
| `reorderCollectionProducts` | `PUT /v1/catalog/collections/{id}/products/order` | A ordem nova dos produtos. |
| `updateCollection` | `PUT /v1/catalog/collections/{id}` | Troca nome, descrição, limite e ordem. |
| `upsertManagedCollection` | `PUT /v1/catalog/collections/managed/{managed_by}/{managed_key}` | Cria ou atualiza a vaga da integração. |

## fz.catalog.customFields

| Método | Rota | O que faz |
|---|---|---|
| `createCustomField` | `POST /v1/catalog/custom-fields` | Cria a definição. |
| `listCustomFields`, `listCustomFieldsAll` | `GET /v1/catalog/custom-fields` | Lista as definições do tenant. |
| `setProductCustomValues` | `PUT /v1/catalog/products/{id}/custom-values` | `PUT /v1/catalog/products/{id}/custom-values`. |
| `setVariantCustomValues` | `PUT /v1/catalog/variants/{id}/custom-values` | `PUT /v1/catalog/variants/{id}/custom-values`. |
| `updateCustomField` | `PATCH /v1/catalog/custom-fields/{id}` | Rótulo, obrigatoriedade e ordem. |

## fz.catalog.fichasTecnicas

| Método | Rota | O que faz |
|---|---|---|
| `archiveBom` | `POST /v1/catalog/boms/{id}/archive` | Aposenta a ficha. |
| `createBom` | `POST /v1/catalog/boms` | Cadastra a ficha técnica. |
| `getBom` | `GET /v1/catalog/boms/{id}` | A ficha, com as linhas. |
| `listBoms`, `listBomsAll` | `GET /v1/catalog/boms` | Lista as fichas do tenant. |
| `updateBom` | `PUT /v1/catalog/boms/{id}` | Substitui cabeçalho e linhas. |

## fz.catalog.labels

| Método | Rota | O que faz |
|---|---|---|
| `createLabelTemplate` | `POST /v1/catalog/label-templates` | Grava um modelo novo. |
| `deleteLabelTemplate` | `DELETE /v1/catalog/label-templates/{id}` | Apaga o modelo. |
| `getLabelTemplate` | `GET /v1/catalog/label-templates/{id}` | Um modelo. |
| `listLabelTemplates`, `listLabelTemplatesAll` | `GET /v1/catalog/label-templates` | Os modelos de etiqueta do tenant. |
| `updateLabelTemplate` | `PUT /v1/catalog/label-templates/{id}` | Troca o desenho inteiro. |

## fz.catalog.optionGroups

| Método | Rota | O que faz |
|---|---|---|
| `createOptionGroup` | `POST /v1/catalog/option-groups` | Grava um grupo novo. |
| `deleteOptionGroup` | `DELETE /v1/catalog/option-groups/{id}` | Arquiva o grupo e as opções. |
| `getOptionGroup` | `GET /v1/catalog/option-groups/{id}` | Um grupo. |
| `getProductOptionGroups` | `GET /v1/catalog/products/{id}/option-groups` | Os grupos do produto. |
| `listOptionGroups`, `listOptionGroupsAll` | `GET /v1/catalog/option-groups` | Os grupos de opção do tenant. |
| `setOptionAvailability` | `PUT /v1/catalog/options/{id}/availability` | Liga ou desliga uma opção. |
| `setProductOptionGroups` | `PUT /v1/catalog/products/{id}/option-groups` | Troca os grupos do produto. |
| `updateOptionGroup` | `PUT /v1/catalog/option-groups/{id}` | Troca o grupo inteiro. |

## fz.catalog.products

| Método | Rota | O que faz |
|---|---|---|
| `addProductMedia` | `POST /v1/catalog/products/{id}/media` | Põe no produto uma foto ou o vídeo que a pessoa subiu no Files. |
| `archiveProduct` | `DELETE /v1/catalog/products/{id}` | Arquiva o modelo **e as suas variantes**. |
| `createProduct` | `POST /v1/catalog/products` | Cria o modelo **e a sua primeira variante**. |
| `deleteProductPaymentRule` | `DELETE /v1/catalog/products/{id}/payment-rule` | Remove a regra de pagamento do produto. |
| `deleteVariantPaymentRule` | `DELETE /v1/catalog/products/{id}/variants/{variant_id}/payment-rule` | Remove a regra própria da variante. |
| `generateVariants` | `POST /v1/catalog/products/{id}/generate-variants` | Produto cartesiano. |
| `getProduct` | `GET /v1/catalog/products/{id}` | `GET /v1/catalog/products/{id}`. |
| `getProductPaymentRule` | `GET /v1/catalog/products/{id}/payment-rule` | Lê os meios e as parcelas aceitos pelo produto. |
| `getVariantPaymentRule` | `GET /v1/catalog/products/{id}/variants/{variant_id}/payment-rule` | Lê os meios e as parcelas próprios da variante. |
| `importProducts` | `POST /v1/catalog/products/import` | Importa produtos de uma planilha. |
| `listProductMedia` | `GET /v1/catalog/products/{id}/media` | Lista as fotos e o vídeo do produto, com o que ainda cabe. |
| `listProducts`, `listProductsAll` | `GET /v1/catalog/products` | Lista com keyset. |
| `migrateProductToVariants` | `POST /v1/catalog/products/{id}/migrate-to-variants` | Modelo simples vira modelo com variação. |
| `removeProductMedia` | `DELETE /v1/catalog/products/{id}/media/{media_id}` | Tira a foto ou o vídeo do produto. |
| `reorderProductMedia` | `PUT /v1/catalog/products/{id}/media/order` | Troca a ordem das fotos (ou do vídeo) do produto. |
| `setProductAttributes` | `PUT /v1/catalog/products/{id}/attributes` | Declara os eixos do modelo. |
| `setProductPaymentRule` | `PUT /v1/catalog/products/{id}/payment-rule` | Grava os meios e as parcelas aceitos pelo produto. |
| `setVariantPaymentRule` | `PUT /v1/catalog/products/{id}/variants/{variant_id}/payment-rule` | Grava os meios e as parcelas próprios da variante. |
| `updateProduct` | `PATCH /v1/catalog/products/{id}` | `PATCH /v1/catalog/products/{id}`. |

## fz.catalog.resolve

| Método | Rota | O que faz |
|---|---|---|
| `resolveItem` | `GET /v1/catalog/resolve` | Resolve um código lido para uma variante. |

## fz.catalog.supplierCodes

| Método | Rota | O que faz |
|---|---|---|
| `listSupplierCodes`, `listSupplierCodesAll` | `GET /v1/catalog/supplier-codes` | Exige filtro por fornecedor ou variante. |
| `upsertSupplierCode` | `POST /v1/catalog/supplier-codes` | Grava o de-para aprendido na conferência. |

## fz.catalog.uoms

| Método | Rota | O que faz |
|---|---|---|
| `createUom` | `POST /v1/catalog/uoms` | Cria unidade **do tenant** (as globais são semeadas). |
| `deleteUom` | `DELETE /v1/catalog/uoms/{id}` | `DELETE /v1/catalog/uoms/{id}`. |
| `listUoms`, `listUomsAll` | `GET /v1/catalog/uoms` | Globais do sistema + as do tenant. |
| `renameUom` | `PATCH /v1/catalog/uoms/{id}` | `PATCH /v1/catalog/uoms/{id}`. |

## fz.catalog.variants

| Método | Rota | O que faz |
|---|---|---|
| `createVariant` | `POST /v1/catalog/variants` | `POST /v1/catalog/variants`. |
| `getVariant` | `GET /v1/catalog/variants/{id}` | Resolve a herança fiscal e traz embalagens. |
| `listVariants`, `listVariantsAll` | `GET /v1/catalog/variants` | `GET /v1/catalog/variants`. |
| `removePackaging` | `DELETE /v1/catalog/variants/{id}/packagings/{uom_id}` | `DELETE /v1/catalog/variants/{id}/packagings/{uom_id}`. |
| `updateVariant` | `PATCH /v1/catalog/variants/{id}` | `PATCH /v1/catalog/variants/{id}`. |
| `upsertPackaging` | `PUT /v1/catalog/variants/{id}/packagings/{uom_id}` | Cria/atualiza embalagem. |

## fz.checkout

| Método | Rota | O que faz |
|---|---|---|
| `captureLeadPublic` | `POST /v1/checkout/public/checkouts/{token}/lead` (pública) | Guarda o contato digitado, para que a cesta abandonada tenha a quem avisar. **Sem sessão.** |
| `cardKeyPublic` | `GET /v1/checkout/public/checkouts/{token}/card-key` (pública) | Publica a chave com que o navegador tokeniza o cartão. **Sem sessão.** |
| `cardKeyRoutedPublic` | `POST /v1/checkout/public/checkouts/{token}/card-key` (pública) | A chave de tokenização para um número de parcelas. **Sem sessão.** |
| `chooseShippingPublic` | `POST /v1/checkout/public/checkouts/{token}/shipping/choice` (pública) | Escolhe uma opção da cotação desta cesta. **Sem sessão**. |
| `clearCheckoutAppearance` | `DELETE /v1/checkout/appearance` | Desfaz a escolha de aparência do escopo da sessão. |
| `clearCheckoutLogo` | `DELETE /v1/checkout/appearance/logo` | Tira a logo da loja do escopo da sessão. |
| `clearCheckoutTracking` | `DELETE /v1/checkout/appearance/tracking` | Tira a medição da loja do escopo da sessão. |
| `create` | `POST /v1/checkout/checkouts` | Monta e publica a cesta que o cliente final compra. |
| `createSavedForm` | `POST /v1/checkout/forms` | Grava um formulário novo no escopo da sessão. |
| `deleteSavedForm` | `DELETE /v1/checkout/forms/{id}` | Apaga um formulário do escopo da sessão. |
| `exchangeHandoffTicket` | `POST /v1/checkout/handoff/{ticket}` | Troca o ticket pela sessão identificada. **Servidor-a-servidor.** |
| `getCheckoutAppearance` | `GET /v1/checkout/appearance` | Layout e paleta da página de pagamento no escopo da sessão. |
| `getCodeChannel` | `GET /v1/checkout/code-channel` | Por onde o código de posse sai neste tenant. |
| `getOne` | `GET /v1/checkout/checkouts/{id}` | Confere se a cesta publicada virou venda, e qual documento nasceu dela. |
| `getSavedForm` | `GET /v1/checkout/forms/{id}` | Um formulário salvo que o escopo da sessão lê. |
| `identifyPublic` | `POST /v1/checkout/public/checkouts/{token}/identify` (pública) | Manda um código de uso único ao canal **cadastrado** da pessoa da cesta. **Sem sessão.** |
| `issueHandoffTicket` | `POST /v1/checkout/checkouts/{id}/handoff-ticket` | Emite o ticket que transfere a identificação já feita pelo lojista. |
| `issuePowChallenge` | `POST /v1/checkout/public/challenge` (pública) | Emite o desafio de prova de trabalho da borda anônima. **Sem sessão.** |
| `list`, `listAll` | `GET /v1/checkout/checkouts` | Lista as cestas do tenant, por keyset. |
| `listSavedForms` | `GET /v1/checkout/forms` | Os formulários salvos que o escopo da sessão lê. |
| `listStuckProjections`, `listStuckProjectionsAll` | `GET /v1/checkout/projections/stuck` | A fila do que ficou para trás. |
| `listTenantDomains` | `GET /v1/checkout/domains` | Os domínios do tenant, provados ou não. |
| `payPublic` | `POST /v1/checkout/public/checkouts/{token}/pay` (pública) | Transforma a cesta em documento e emite o instrumento. **Sem sessão.** |
| `previewCouponPublic` | `POST /v1/checkout/public/checkouts/{token}/coupon` (pública) | Simula o cupom digitado e devolve o valor corrigido. **Sem sessão.** |
| `quoteInstallmentsPublic` | `POST /v1/checkout/public/checkouts/{token}/installments` (pública) | Cota as parcelas do cartão sobre o total da cesta. **Sem sessão**. |
| `quotePaymentOfferPublic` | `POST /v1/checkout/public/checkouts/{token}/payment-offer` (pública) | Cota o total da cesta em cada meio de pagamento. **Sem sessão**. |
| `quoteShippingPublic` | `POST /v1/checkout/public/checkouts/{token}/shipping/quotes` (pública) | Cota o frete da cesta para o CEP digitado. **Sem sessão**. |
| `registerTenantDomain` | `POST /v1/checkout/domains` | Registra o domínio do lojista e devolve o desafio a publicar. |
| `removeTenantDomain` | `DELETE /v1/checkout/domains/{id}` | Tira o domínio da lista. |
| `reportClientErrorPublic` | `POST /v1/checkout/public/checkouts/{token}/client-errors` (pública) | A página de pagamento conta um erro que só aconteceu no navegador : o cartão que o PSP não tokenizou, o 3DS que falhou, a tela que quebrou. **Sem sessão.** Vira evento de log com a cesta e o tenant (`target = "checkout.client_error"` no OpenObserve) e nada é gravado. |
| `resolvePublic` | `GET /v1/checkout/public/checkouts/{token}` (pública) | Resolve o token da cesta e devolve o que há para comprar. **Sem sessão.** |
| `retryProjection` | `POST /v1/checkout/projections/{id}/retry` | Empurra uma cesta parada de volta para a fila da varredura. |
| `revoke` | `POST /v1/checkout/checkouts/{id}/revoke` | Tira a cesta do ar. |
| `sandboxCardTokenPublic` | `POST /v1/checkout/public/checkouts/{token}/sandbox-card-token` (pública) | Troca o cartão de TESTE digitado na página pelo token de sandbox. **Sem sessão**, e só fora de produção. |
| `setCheckoutAppearance` | `PUT /v1/checkout/appearance` | Grava a aparência da página de pagamento no escopo da sessão. |
| `setCheckoutLogo` | `PUT /v1/checkout/appearance/logo` | Grava a logo da loja no escopo da sessão. |
| `setCheckoutTracking` | `PUT /v1/checkout/appearance/tracking` | Grava a medição da loja no escopo da sessão. |
| `setCodeChannel` | `PUT /v1/checkout/code-channel` | Grava por onde o código de posse sai neste tenant. |
| `updateSavedForm` | `PUT /v1/checkout/forms/{id}` | Substitui um formulário do escopo da sessão. |
| `verifyIdentityPublic` | `POST /v1/checkout/public/checkouts/{token}/identify/verify` (pública) | Confere o código e abre a sessão identificada. **Sem sessão.** |
| `verifyTenantDomain` | `POST /v1/checkout/domains/{id}/verify` | Consulta o TXT e, achando o desafio, prova a posse. |

## fz.clientReports

| Método | Rota | O que faz |
|---|---|---|
| `submitClientReports` | `POST /v1/client-reports` (pública) | Recebe um lote de relatórios de falha do app nativo. |

## fz.community.availability

| Método | Rota | O que faz |
|---|---|---|
| `createSchedule` | `POST /v1/community/schedules` | Cria uma grade. |
| `deleteSchedule` | `DELETE /v1/community/schedules/{id}` | Apaga uma grade que não é a padrão. |
| `listSchedules` | `GET /v1/community/schedules` | As grades de horário de quem pede. |
| `queryFreeBusy` | `GET /v1/community/free-busy` | O livre e ocupado. |
| `updateSchedule` | `PUT /v1/community/schedules/{id}` | Troca uma grade. |

## fz.community.calendar

| Método | Rota | O que faz |
|---|---|---|
| `createCalendar` | `POST /v1/community/calendars` | Cria um calendário do próprio membro. |
| `createEvent` | `POST /v1/community/events` | Cria um evento único ou uma série. |
| `deleteCalendar` | `DELETE /v1/community/calendars/{id}` | Apaga o calendário e os eventos. |
| `deleteCalendarFeed` | `DELETE /v1/community/calendars/{id}/feed` | Revoga o link de assinatura. |
| `deleteEvent` | `DELETE /v1/community/events/{id}` | Apaga. |
| `exportEvent` | `GET /v1/community/events/{id}/ics` | Baixa o evento como `.ics`. |
| `getCalendarFeed` | `GET /v1/community/calendars/{id}/feed` | A assinatura de quem pede neste calendário. |
| `getEvent` | `GET /v1/community/events/{id}` | Um evento. |
| `getPreferences` | `GET /v1/community/preferences` | Fuso, início da semana, visão e duração. |
| `importIcs` | `POST /v1/community/calendars/{id}/import` | Importa um `.ics` (multipart, campo `file`). |
| `listCalendars`, `listCalendarsAll` | `GET /v1/community/calendars` | Os calendários que quem pede vê. |
| `listOccurrences` | `GET /v1/community/occurrences` | A leitura das visões ano, mês, semana e dia. |
| `listTrash`, `listTrashAll` | `GET /v1/community/trash` | A lixeira de quem pede. |
| `putCalendarFeed` | `POST /v1/community/calendars/{id}/feed` | Cria ou gira o link de assinatura. |
| `putPreferences` | `PUT /v1/community/preferences` | Grava as preferências. |
| `respondEvent` | `POST /v1/community/events/{id}/response` | A resposta ao convite. |
| `restoreCalendar` | `POST /v1/community/calendars/{id}/restore` | Tira o calendário da lixeira. |
| `restoreEvent` | `POST /v1/community/events/{id}/restore` | Tira o evento da lixeira. |
| `searchAudiences` | `GET /v1/community/audiences` | Unidades, grupos e times para convidar ou para dar acesso a um calendário. |
| `searchEvents`, `searchEventsAll` | `GET /v1/community/events/search` | Busca eventos pelo texto. |
| `updateCalendar` | `PUT /v1/community/calendars/{id}` | Troca nome, cor, fuso e compartilhamento (este só o dono). |
| `updateEvent` | `PUT /v1/community/events/{id}` | Edita um evento, uma ocorrência, as seguintes ou a série. |

## fz.community.chat

| Método | Rota | O que faz |
|---|---|---|
| `addMembers` | `POST /v1/community/chat/conversations/{id}/members` | Inclui pessoas. |
| `addReaction` | `PUT /v1/community/chat/messages/{id}/reactions/{emoji}` | Reage (idempotente). |
| `assistAsk` | `POST /v1/community/chat/assist/conversations/{id}/ask` | Pergunta sobre a conversa. |
| `assistReply` | `POST /v1/community/chat/assist/conversations/{id}/reply` | Sugere uma resposta. |
| `assistRewrite` | `POST /v1/community/chat/assist/rewrite` | Reescreve o rascunho. |
| `assistSearch` | `POST /v1/community/chat/assist/search` | Pergunta sobre o chat inteiro. |
| `assistSummary` | `POST /v1/community/chat/assist/conversations/{id}/summary` | Resume a conversa. |
| `browseChannels` | `GET /v1/community/chat/channels/browse` | Canais abertos para entrar. |
| `cancelScheduled` | `DELETE /v1/community/chat/scheduled/{id}` | Cancela antes de sair. |
| `createBroadcast` | `POST /v1/community/chat/broadcasts` | Cria uma lista de transmissao. |
| `createChannel` | `POST /v1/community/chat/channels` | Cria um canal (exige `community.chat.manage` pela tabela de rotas). |
| `createGroup` | `POST /v1/community/chat/groups` | Cria um grupo. |
| `createSection` | `POST /v1/community/chat/sections` | Cria um agrupamento (exige `community.chat.manage` pela tabela de rotas). |
| `deleteMessage` | `DELETE /v1/community/chat/messages/{id}` | Apaga (fica "mensagem apagada"). |
| `deleteSection` | `DELETE /v1/community/chat/sections/{id}` | Apaga um agrupamento (exige `community.chat.manage` pela tabela de rotas). |
| `downloadAttachment` | `GET /v1/community/chat/attachments/{id}` | Baixa um anexo, se quem pede lê a conversa dele. |
| `editMessage` | `PATCH /v1/community/chat/messages/{id}` | Edita a própria mensagem. |
| `followThread` | `PUT /v1/community/chat/messages/{id}/follow` | Segue a thread. |
| `getConversation` | `GET /v1/community/chat/conversations/{id}` | A conversa e os participantes. |
| `getLinkPreview` | `GET /v1/community/chat/messages/{id}/link-preview` | Previa do link. |
| `getMessage` | `GET /v1/community/chat/messages/{id}` | Uma mensagem. |
| `getPresence` | `GET /v1/community/chat/presence` | Presença de até 100 pessoas. |
| `joinConversation` | `POST /v1/community/chat/conversations/{id}/join` | Entra num canal aberto. |
| `leaveConversation` | `POST /v1/community/chat/conversations/{id}/leave` | Sai do grupo ou canal. |
| `listConversations` | `GET /v1/community/chat/conversations` | As conversas de quem pede. |
| `listMessages` | `GET /v1/community/chat/conversations/{id}/messages` | A linha principal. |
| `listPins` | `GET /v1/community/chat/conversations/{id}/pins` | As fixadas da conversa. |
| `listReactions` | `GET /v1/community/chat/messages/{id}/reactions` | Quem reagiu. |
| `listReplies` | `GET /v1/community/chat/messages/{id}/replies` | As respostas de uma thread. |
| `listSaved` | `GET /v1/community/chat/saved` | As mensagens salvas. |
| `listScheduled` | `GET /v1/community/chat/scheduled` | As agendadas de quem pede. |
| `listSections` | `GET /v1/community/chat/sections` | Os agrupamentos de canais da organização. |
| `listThreads` | `GET /v1/community/chat/threads` | As threads seguidas. |
| `markRead` | `POST /v1/community/chat/conversations/{id}/read` | Avança a última lida. |
| `muteConversation` | `PUT /v1/community/chat/conversations/{id}/mute` | Silencia (até um instante ou para sempre). |
| `openDirect` | `POST /v1/community/chat/directs` | Abre a direta com outra pessoa. |
| `orderSections` | `PUT /v1/community/chat/sections/order` | Reordena os agrupamentos (exige `community.chat.manage` pela tabela de rotas). |
| `pinMessage` | `PUT /v1/community/chat/messages/{id}/pin` | Fixa na conversa. |
| `placeChannels` | `PUT /v1/community/chat/sections/channels` | Põe canais num agrupamento (exige `community.chat.manage` pela tabela de rotas). |
| `removeMember` | `DELETE /v1/community/chat/conversations/{id}/members/{user_id}` | Tira uma pessoa. |
| `removeReaction` | `DELETE /v1/community/chat/messages/{id}/reactions/{emoji}` | Tira a própria reação (idempotente). |
| `saveMessage` | `PUT /v1/community/chat/messages/{id}/saved` | Salva para depois. |
| `scheduleMessage` | `POST /v1/community/chat/conversations/{id}/scheduled` | Agenda uma mensagem (idempotente por `client_id`). |
| `searchMessages` | `GET /v1/community/chat/search` | Busca nas mensagens. |
| `sendMessage` | `POST /v1/community/chat/conversations/{id}/messages` | Envia (idempotente por `client_id`). |
| `sendTyping` | `POST /v1/community/chat/conversations/{id}/typing` | Avisa "digitando". |
| `setPresence` | `PUT /v1/community/chat/presence` | Declara `online` ou `away`. |
| `stream` | `GET /v1/community/chat/stream` | Os avisos das conversas de quem pede, em SSE. |
| `unfollowThread` | `DELETE /v1/community/chat/messages/{id}/follow` | Deixa de seguir a thread. |
| `unmuteConversation` | `DELETE /v1/community/chat/conversations/{id}/mute` | Reativa os avisos. |
| `unpinMessage` | `DELETE /v1/community/chat/messages/{id}/pin` | Desafixa. |
| `unsaveMessage` | `DELETE /v1/community/chat/messages/{id}/saved` | Tira das salvas. |
| `updateConversation` | `PATCH /v1/community/chat/conversations/{id}` | Título, descrição e arquivamento. |
| `updateScheduled` | `PATCH /v1/community/chat/scheduled/{id}` | Edita antes de sair. |
| `updateSection` | `PATCH /v1/community/chat/sections/{id}` | Renomeia um agrupamento (exige `community.chat.manage` pela tabela de rotas). |
| `uploadAttachment` | `POST /v1/community/chat/conversations/{id}/attachments` | Sobe um anexo (multipart, campo `file`), em fluxo até o `archive`. |

## fz.community.mail

| Método | Rota | O que faz |
|---|---|---|
| `meAttachment` | `GET /v1/community/mail/me/mailboxes/{id}/messages/{folder}/{uid}/attachments/{index}` | Baixa um anexo da mensagem, direto do servidor da caixa. |
| `meByAddress` | `GET /v1/community/mail/me/by-address` | Lista as mensagens guardadas nas caixas do escopo de ou para um endereço (ficha do cadastro). |
| `meConnect` | `POST /v1/community/mail/me/mailboxes` | Liga uma caixa com a senha no Cofre: liga o cofre à caixa e, se ele já autoriza o Mailer, testa IMAP e SMTP antes de gravar; senão a caixa fica pendente até o admin do cofre autorizar. |
| `meCreateFolder` | `POST /v1/community/mail/me/mailboxes/{id}/folders` | Cria uma pasta no servidor, no topo ou dentro de outra. |
| `meDelete` | `DELETE /v1/community/mail/me/mailboxes/{id}` | Desliga uma caixa e apaga os cabeçalhos guardados. |
| `meDeleteFolder` | `DELETE /v1/community/mail/me/mailboxes/{id}/folders/{folder}` | Apaga uma pasta da pessoa, só se estiver vazia e sem pastas dentro. |
| `meFolderRead` | `POST /v1/community/mail/me/mailboxes/{id}/folders/{folder}/read` | Marca todas as mensagens da pasta como lidas, no servidor. |
| `meFolders` | `GET /v1/community/mail/me/mailboxes/{id}/folders` | Lista as pastas da caixa, com total e não lidas. |
| `meList` | `GET /v1/community/mail/me/mailboxes` | Lista as caixas ligadas e os provedores de login disponíveis. |
| `meMessages`, `meMessagesAll` | `GET /v1/community/mail/me/mailboxes/{id}/messages` | Lista os cabeçalhos de uma pasta (últimas 300), do mais novo ao mais velho. |
| `meMove` | `POST /v1/community/mail/me/mailboxes/{id}/messages/{folder}/{uid}/move` | Move uma mensagem para outra pasta (Spam, Lixeira, Entrada ou da pessoa), no servidor. |
| `meOauthFinish` | `POST /v1/community/mail/me/oauth/finish` | Conclui o login com Google ou Microsoft com o bilhete da volta do provedor: só a sessão de quem começou o login liga a caixa. |
| `meOauthStart` | `POST /v1/community/mail/me/oauth/start` | Começa o login com Google ou Microsoft: devolve a URL do provedor. |
| `meOpen` | `GET /v1/community/mail/me/mailboxes/{id}/messages/{folder}/{uid}` | Abre uma mensagem no servidor (corpo e anexos) e a marca como lida. |
| `meOutgoingCancel` | `POST /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}/cancel` | Desfazer ou cancelar: a agendada, a recusada ou a incerta (com `confirm_unknown=true`) volta a rascunho. |
| `meOutgoingCreate` | `POST /v1/community/mail/me/mailboxes/{id}/outgoing` | Começa um rascunho: novo, resposta, encaminhamento (com os anexos da original) ou continuação de um rascunho do servidor. Idempotente pela chave. |
| `meOutgoingDiscard` | `DELETE /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}` | Apaga um rascunho ou uma mensagem que não saiu (e a cópia na pasta Rascunhos do servidor). |
| `meOutgoingFile` | `GET /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}/files/{file_id}` | Baixa um anexo do rascunho. |
| `meOutgoingFileRemove` | `DELETE /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}/files/{file_id}` | Tira um anexo do rascunho. |
| `meOutgoingGet` | `GET /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}` | Abre uma mensagem escrita aqui, com o corpo e os anexos. |
| `meOutgoingList` | `GET /v1/community/mail/me/mailboxes/{id}/outgoing` | Lista as mensagens escritas aqui: rascunhos, saída (agendadas, recusadas, incertas) ou enviadas. |
| `meOutgoingSchedule` | `POST /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}/schedule` | Enviar (sem data: sai depois da espera da caixa, o tempo de desfazer) ou Agendar (com data, até um ano). |
| `meOutgoingUpdate` | `PUT /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}` | Troca o que está escrito num rascunho (salvamento automático). |
| `meOutgoingUpload` | `POST /v1/community/mail/me/mailboxes/{id}/outgoing/{oid}/files` | Anexa um arquivo ou imagem colada ao rascunho (multipart, campo `file`). |
| `meRenameFolder` | `PATCH /v1/community/mail/me/mailboxes/{id}/folders/{folder}` | Renomeia uma pasta da pessoa (Entrada, Enviados, Spam e as demais de papel não). |
| `meSearch` | `GET /v1/community/mail/me/mailboxes/{id}/search` | Busca no servidor da caixa, além das 300 guardadas: numa pasta ou em todas menos Spam e Lixeira. |
| `meSend` | `POST /v1/community/mail/me/mailboxes/{id}/send` | Envia pelo SMTP da caixa (novo, resposta ou encaminhamento). Idempotente pela chave. |
| `meSettings` | `PUT /v1/community/mail/me/mailboxes/{id}/settings` | Grava a assinatura, a espera do Enviar (tempo de desfazer) e o aviso de e-mail novo da caixa. |
| `meSync` | `POST /v1/community/mail/me/mailboxes/{id}/sync` | Pede sincronização já (o worker lê o servidor em segundos). |
| `meTest` | `POST /v1/community/mail/me/test` | Testa a leitura (IMAP) e o envio (SMTP) com os dados do formulário, sem gravar nem enviar nada. |
| `meUpdate` | `PATCH /v1/community/mail/me/mailboxes/{id}` | Altera nome, servidores ou a senha no Cofre de uma caixa (servidor novo é testado antes, quando o cofre já autoriza o Mailer). |
| `meUpdateMessage` | `PATCH /v1/community/mail/me/mailboxes/{id}/messages/{folder}/{uid}` | Marca uma mensagem como lida ou não lida e liga ou desliga a estrela, no servidor. |
| `oauthCallback` | `GET /v1/community/mail/oauth/callback` (pública) | Retorno do login com Google ou Microsoft (público). |
| `sharedAttachment` | `GET /v1/community/mail/shared/mailboxes/{id}/messages/{folder}/{uid}/attachments/{index}` | Baixa um anexo da mensagem, direto do servidor da caixa. |
| `sharedByAddress` | `GET /v1/community/mail/shared/by-address` | Lista as mensagens guardadas nas caixas do escopo de ou para um endereço (ficha do cadastro). |
| `sharedConnect` | `POST /v1/community/mail/shared/mailboxes` | Liga uma caixa com a senha no Cofre: liga o cofre à caixa e, se ele já autoriza o Mailer, testa IMAP e SMTP antes de gravar; senão a caixa fica pendente até o admin do cofre autorizar. |
| `sharedCreateFolder` | `POST /v1/community/mail/shared/mailboxes/{id}/folders` | Cria uma pasta no servidor, no topo ou dentro de outra. |
| `sharedDelete` | `DELETE /v1/community/mail/shared/mailboxes/{id}` | Desliga uma caixa e apaga os cabeçalhos guardados. |
| `sharedDeleteFolder` | `DELETE /v1/community/mail/shared/mailboxes/{id}/folders/{folder}` | Apaga uma pasta da pessoa, só se estiver vazia e sem pastas dentro. |
| `sharedFolderRead` | `POST /v1/community/mail/shared/mailboxes/{id}/folders/{folder}/read` | Marca todas as mensagens da pasta como lidas, no servidor. |
| `sharedFolders` | `GET /v1/community/mail/shared/mailboxes/{id}/folders` | Lista as pastas da caixa, com total e não lidas. |
| `sharedList` | `GET /v1/community/mail/shared/mailboxes` | Lista as caixas ligadas e os provedores de login disponíveis. |
| `sharedMessages`, `sharedMessagesAll` | `GET /v1/community/mail/shared/mailboxes/{id}/messages` | Lista os cabeçalhos de uma pasta (últimas 300), do mais novo ao mais velho. |
| `sharedMove` | `POST /v1/community/mail/shared/mailboxes/{id}/messages/{folder}/{uid}/move` | Move uma mensagem para outra pasta (Spam, Lixeira, Entrada ou da pessoa), no servidor. |
| `sharedOauthFinish` | `POST /v1/community/mail/shared/oauth/finish` | Conclui o login com Google ou Microsoft com o bilhete da volta do provedor: só a sessão de quem começou o login liga a caixa. |
| `sharedOauthStart` | `POST /v1/community/mail/shared/oauth/start` | Começa o login com Google ou Microsoft: devolve a URL do provedor. |
| `sharedOpen` | `GET /v1/community/mail/shared/mailboxes/{id}/messages/{folder}/{uid}` | Abre uma mensagem no servidor (corpo e anexos) e a marca como lida. |
| `sharedOutgoingCancel` | `POST /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}/cancel` | Desfazer ou cancelar: a agendada, a recusada ou a incerta (com `confirm_unknown=true`) volta a rascunho. |
| `sharedOutgoingCreate` | `POST /v1/community/mail/shared/mailboxes/{id}/outgoing` | Começa um rascunho: novo, resposta, encaminhamento (com os anexos da original) ou continuação de um rascunho do servidor. Idempotente pela chave. |
| `sharedOutgoingDiscard` | `DELETE /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}` | Apaga um rascunho ou uma mensagem que não saiu (e a cópia na pasta Rascunhos do servidor). |
| `sharedOutgoingFile` | `GET /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}/files/{file_id}` | Baixa um anexo do rascunho. |
| `sharedOutgoingFileRemove` | `DELETE /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}/files/{file_id}` | Tira um anexo do rascunho. |
| `sharedOutgoingGet` | `GET /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}` | Abre uma mensagem escrita aqui, com o corpo e os anexos. |
| `sharedOutgoingList` | `GET /v1/community/mail/shared/mailboxes/{id}/outgoing` | Lista as mensagens escritas aqui: rascunhos, saída (agendadas, recusadas, incertas) ou enviadas. |
| `sharedOutgoingSchedule` | `POST /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}/schedule` | Enviar (sem data: sai depois da espera da caixa, o tempo de desfazer) ou Agendar (com data, até um ano). |
| `sharedOutgoingUpdate` | `PUT /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}` | Troca o que está escrito num rascunho (salvamento automático). |
| `sharedOutgoingUpload` | `POST /v1/community/mail/shared/mailboxes/{id}/outgoing/{oid}/files` | Anexa um arquivo ou imagem colada ao rascunho (multipart, campo `file`). |
| `sharedRenameFolder` | `PATCH /v1/community/mail/shared/mailboxes/{id}/folders/{folder}` | Renomeia uma pasta da pessoa (Entrada, Enviados, Spam e as demais de papel não). |
| `sharedSearch` | `GET /v1/community/mail/shared/mailboxes/{id}/search` | Busca no servidor da caixa, além das 300 guardadas: numa pasta ou em todas menos Spam e Lixeira. |
| `sharedSend` | `POST /v1/community/mail/shared/mailboxes/{id}/send` | Envia pelo SMTP da caixa (novo, resposta ou encaminhamento). Idempotente pela chave. |
| `sharedSettings` | `PUT /v1/community/mail/shared/mailboxes/{id}/settings` | Grava a assinatura, a espera do Enviar (tempo de desfazer) e o aviso de e-mail novo da caixa. |
| `sharedSync` | `POST /v1/community/mail/shared/mailboxes/{id}/sync` | Pede sincronização já (o worker lê o servidor em segundos). |
| `sharedTest` | `POST /v1/community/mail/shared/test` | Testa a leitura (IMAP) e o envio (SMTP) com os dados do formulário, sem gravar nem enviar nada. |
| `sharedUpdate` | `PATCH /v1/community/mail/shared/mailboxes/{id}` | Altera nome, servidores ou a senha no Cofre de uma caixa (servidor novo é testado antes, quando o cofre já autoriza o Mailer). |
| `sharedUpdateMessage` | `PATCH /v1/community/mail/shared/mailboxes/{id}/messages/{folder}/{uid}` | Marca uma mensagem como lida ou não lida e liga ou desliga a estrela, no servidor. |

## fz.community.meetings

| Método | Rota | O que faz |
|---|---|---|
| `admitAllLobby` | `POST /v1/community/meetings/{code}/lobby/admit-all` | Admite todos os que esperam. |
| `admitLobby` | `POST /v1/community/meetings/{code}/lobby/{request_id}/admit` | Admite. |
| `askAsGuest` | `POST /v1/community/public/meetings/{code}/lobby` (pública) | O convidado pede entrada. **Sem sessão.** |
| `askLobby` | `POST /v1/community/meetings/{code}/lobby` | Pede entrada pela sala de espera. |
| `askParticipant` | `POST /v1/community/meetings/{code}/participants/{participant_id}/ask` | Pede que ligue câmera ou microfone. |
| `cancelLobby` | `DELETE /v1/community/meetings/{code}/lobby/me` | Desiste do pedido. |
| `chatMeeting` | `GET /v1/community/chat/conversations/{id}/meeting` | A reunião aberta da conversa. |
| `deleteRecording` | `DELETE /v1/community/meetings/{code}/recordings/{recording_id}` | Exclui a gravação parada. |
| `denyLobby` | `POST /v1/community/meetings/{code}/lobby/{request_id}/deny` | Recusa. |
| `downloadPart` | `GET /v1/community/meetings/{code}/recordings/{recording_id}/parts/{track}/{seq}` | Baixa uma parte. |
| `endMeeting` | `POST /v1/community/meetings/{code}/end` | Encerra para todos. |
| `getMeeting` | `GET /v1/community/meetings/{code}` | A reunião pelo código do link. |
| `getRecording` | `GET /v1/community/meetings/{code}/recordings/{recording_id}` | A gravação e as partes. |
| `getSummary` | `GET /v1/community/meetings/{code}/recordings/{recording_id}/summary` | O resumo. |
| `getTranscript` | `GET /v1/community/meetings/{code}/recordings/{recording_id}/transcript` | A transcrição. |
| `guestAdmitAll` | `POST /v1/community/public/meetings/{code}/lobby/admit-all` (pública) | `POST.../public/meetings/{code}/lobby/admit-all` - o convidado dentro admite todos (política `anyone`). |
| `guestAdmitLobby` | `POST /v1/community/public/meetings/{code}/lobby/{request_id}/admit` (pública) | `POST.../public/meetings/{code}/lobby/{request_id}/admit` - o convidado dentro admite (política `anyone`). |
| `guestCancelLobby` | `DELETE /v1/community/public/meetings/{code}/lobby/me` (pública) | `DELETE.../public/meetings/{code}/lobby/me` - o convidado desiste. |
| `guestChatMessages` | `GET /v1/community/public/meetings/{code}/chat/messages` (pública) | `GET.../public/meetings/{code}/chat/messages` - a linha principal do chat da sala para o convidado. |
| `guestDeny` | `POST /v1/community/public/meetings/{code}/lobby/{request_id}/deny` (pública) | `POST.../public/meetings/{code}/lobby/{request_id}/deny` - o convidado dentro recusa (política `anyone`). |
| `guestHeartbeat` | `POST /v1/community/public/meetings/{code}/heartbeat` (pública) | `POST.../public/meetings/{code}/heartbeat` - o batimento do convidado. |
| `guestJoin` | `POST /v1/community/public/meetings/{code}/join` (pública) | `POST.../public/meetings/{code}/join` - o convidado admitido entra. |
| `guestLeave` | `POST /v1/community/public/meetings/{code}/leave` (pública) | `POST.../public/meetings/{code}/leave` - o convidado sai. |
| `guestListLobby` | `GET /v1/community/public/meetings/{code}/lobby` (pública) | `GET.../public/meetings/{code}/lobby` - quem espera (convidado dentro, na política `anyone`; sem e-mail). |
| `guestLobbyStream` | `GET /v1/community/public/meetings/{code}/lobby/me/stream` (pública) | `GET.../public/meetings/{code}/lobby/me/stream` - o convidado espera a decisão, em SSE. |
| `guestMeetingChat` | `GET /v1/community/public/meetings/{code}/chat` (pública) | `GET.../public/meetings/{code}/chat` - a conversa da sala para o convidado. |
| `guestMyLobby` | `GET /v1/community/public/meetings/{code}/lobby/me` (pública) | `GET.../public/meetings/{code}/lobby/me` - o pedido do convidado. |
| `guestNegotiate` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/negotiate` (pública) | `POST.../connections/{connection_id}/negotiate` - uma volta da negociação. |
| `guestOpenConnection` | `POST /v1/community/public/meetings/{code}/connections` (pública) | `POST.../public/meetings/{code}/connections` - a conexão de mídia do convidado. |
| `guestParticipants` | `GET /v1/community/public/meetings/{code}/participants` (pública) | `GET.../public/meetings/{code}/participants` - quem está dentro. |
| `guestPause` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/pause` (pública) | `POST.../connections/{connection_id}/pause` - pausa ou retoma. |
| `guestPublish` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/tracks` (pública) | `POST.../connections/{connection_id}/tracks` - publica uma faixa. |
| `guestQuality` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/quality` (pública) | `POST.../connections/{connection_id}/quality` - teto de qualidade. |
| `guestRaiseHand` | `POST /v1/community/public/meetings/{code}/hand` (pública) | `POST.../public/meetings/{code}/hand` - o convidado levanta ou baixa a mão. |
| `guestReact` | `POST /v1/community/public/meetings/{code}/reactions` (pública) | `POST.../public/meetings/{code}/reactions` - a reação rápida do convidado. |
| `guestRelayKeys` | `POST /v1/community/public/meetings/{code}/keys` (pública) | `POST.../public/meetings/{code}/keys` - o convidado repassa a chave da sala. |
| `guestRenewIce` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/ice` (pública) | `POST.../connections/{connection_id}/ice` - renova a credencial do TURN. |
| `guestRequestKey` | `POST /v1/community/public/meetings/{code}/keys/request` (pública) | `POST.../public/meetings/{code}/keys/request` - o convidado pede a chave da sala. |
| `guestSendChatMessage` | `POST /v1/community/public/meetings/{code}/chat/messages` (pública) | `POST.../public/meetings/{code}/chat/messages` - o convidado escreve no chat da sala. |
| `guestStream` | `GET /v1/community/public/meetings/{code}/stream` (pública) | `GET.../public/meetings/{code}/stream` - os avisos da reunião, em SSE. |
| `guestSubscribe` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/subscriptions` (pública) | `POST.../connections/{connection_id}/subscriptions` - assina faixas. |
| `guestUnpublish` | `DELETE /v1/community/public/meetings/{code}/connections/{connection_id}/tracks/{track_id}` (pública) | `DELETE.../connections/{connection_id}/tracks/{track_id}` - tira uma faixa. |
| `guestUnsubscribe` | `POST /v1/community/public/meetings/{code}/connections/{connection_id}/unsubscribe` (pública) | `POST.../connections/{connection_id}/unsubscribe` - deixa de assinar. |
| `heartbeat` | `POST /v1/community/meetings/{code}/heartbeat` | O batimento do lugar. |
| `hostCommands` | `POST /v1/community/public/meet-hosts/{id}/commands` (pública) | O nó busca os comandos. **Sem sessão.** |
| `hostReply` | `POST /v1/community/public/meet-hosts/{id}/replies` (pública) | O nó responde um comando. **Sem sessão.** |
| `issueChallenge` | `POST /v1/community/public/meetings/challenges` (pública) | O desafio do pedido anônimo. **Sem sessão.** |
| `joinMeeting` | `POST /v1/community/meetings/{code}/join` | Entra na reunião. |
| `leaveMeeting` | `POST /v1/community/meetings/{code}/leave` | Sai da reunião. |
| `listLobby` | `GET /v1/community/meetings/{code}/lobby` | Quem espera. |
| `listParticipants` | `GET /v1/community/meetings/{code}/participants` | Quem está dentro. |
| `listRecordings` | `GET /v1/community/meetings/{code}/recordings` | As gravações da reunião. |
| `lobbyStream` | `GET /v1/community/meetings/{code}/lobby/me/stream` | Espera a decisão, em SSE. |
| `meetingChat` | `GET /v1/community/meetings/{code}/chat` | A conversa da sala. |
| `meetingChatMessages` | `GET /v1/community/meetings/{code}/chat/messages` | A linha principal do chat da sala. |
| `meetingDefaults` | `GET /v1/community/meeting-defaults` | O padrão das reuniões novas da organização. |
| `muteAll` | `POST /v1/community/meetings/{code}/mute-all` | Silencia todos. |
| `muteParticipant` | `POST /v1/community/meetings/{code}/participants/{participant_id}/mute` | Silencia alguém. |
| `myLobby` | `GET /v1/community/meetings/{code}/lobby/me` | O meu pedido. |
| `negotiate` | `POST /v1/community/meetings/{code}/connections/{connection_id}/negotiate` | Repassa uma mensagem do navegador. |
| `openConnection` | `POST /v1/community/meetings/{code}/connections` | Abre (ou retoma) a conexão de mídia. |
| `postSummary` | `POST /v1/community/meetings/{code}/recordings/{recording_id}/summary/post` | Publica o resumo. |
| `publicMeeting` | `GET /v1/community/public/meetings/{code}` (pública) | A reunião pelo link. **Sem sessão.** |
| `publish` | `POST /v1/community/meetings/{code}/connections/{connection_id}/tracks` | Publica uma faixa. |
| `raiseHand` | `POST /v1/community/meetings/{code}/hand` | Levanta ou baixa a mão. |
| `react` | `POST /v1/community/meetings/{code}/reactions` | Uma reação rápida. |
| `registerHost` | `POST /v1/community/meet/hosts` | Registra o nó de mídia do computador. |
| `relayKeys` | `POST /v1/community/meetings/{code}/keys` | Repassa a chave da sala (E2EE). |
| `removeParticipant` | `DELETE /v1/community/meetings/{code}/participants/{participant_id}` | Tira alguém. |
| `renewIce` | `POST /v1/community/meetings/{code}/connections/{connection_id}/ice` | Renova a credencial do TURN. |
| `requestKey` | `POST /v1/community/meetings/{code}/keys/request` | Pede a chave da sala. |
| `requestQuality` | `POST /v1/community/meetings/{code}/connections/{connection_id}/quality` | O teto de qualidade de uma assinatura de vídeo. |
| `revokeHost` | `DELETE /v1/community/meet/hosts/{id}` | Revoga o nó do computador. |
| `sendMeetingChatMessage` | `POST /v1/community/meetings/{code}/chat/messages` | Escreve no chat da sala (idempotente por `client_id`). |
| `setAudioLock` | `PUT /v1/community/meetings/{code}/audio-lock` | Trava ou destrava o áudio. |
| `setPaused` | `POST /v1/community/meetings/{code}/connections/{connection_id}/pause` | Pausa ou retoma. |
| `setPresenter` | `PUT /v1/community/meetings/{code}/participants/{participant_id}/presenter` | Faz ou desfaz apresentador. |
| `setSpotlight` | `PUT /v1/community/meetings/{code}/spotlight` | O destaque para todos. |
| `startChatMeeting` | `POST /v1/community/chat/conversations/{id}/meeting` | Reunir agora. |
| `startRecording` | `POST /v1/community/meetings/{code}/recordings` | Começa a gravar. |
| `stopRecording` | `POST /v1/community/meetings/{code}/recordings/{recording_id}/stop` | Para a gravação. |
| `stream` | `GET /v1/community/meetings/{code}/stream` | Os avisos da reunião, em SSE. |
| `subscribe` | `POST /v1/community/meetings/{code}/connections/{connection_id}/subscriptions` | Assina faixas em lote. |
| `summarize` | `POST /v1/community/meetings/{code}/recordings/{recording_id}/summary` | Resume. |
| `unpublish` | `DELETE /v1/community/meetings/{code}/connections/{connection_id}/tracks/{track_id}` | Retira uma faixa própria. |
| `unsubscribe` | `POST /v1/community/meetings/{code}/connections/{connection_id}/unsubscribe` | Encerra assinaturas próprias. |
| `updateMeeting` | `PATCH /v1/community/meetings/{code}` | Política de entrada e coorganizadores. |
| `updateMeetingDefaults` | `PUT /v1/community/meeting-defaults` | Grava o padrão da organização. |
| `uploadPart` | `PUT /v1/community/meetings/{code}/recordings/{recording_id}/parts/{track}/{seq}` | Sobe uma parte, em fluxo até o Files. |

## fz.community.public

| Método | Rota | O que faz |
|---|---|---|
| `downloadPublicInviteIcs` | `GET /v1/community/public/invite/ics` (pública) | O `.ics` do convite, para pôr na agenda do convidado. |
| `getPublicInvite` | `GET /v1/community/public/invite` (pública) | O convite pelo token do cabeçalho. |
| `readCalendarFeed` | `GET /v1/community/public/feeds/{token}` (pública) | A assinatura do calendário. |
| `respondPublicInvite` | `POST /v1/community/public/invite/respond` (pública) | A resposta do convidado de fora. |

## fz.community.settings

| Método | Rota | O que faz |
|---|---|---|
| `getSettings` | `GET /v1/community/settings` | A política de convidados. |
| `putSettings` | `PUT /v1/community/settings` | Grava a política de convidados (`community.settings.manage`). |

## fz.entitlements

| Método | Rota | O que faz |
|---|---|---|
| `listModules` | `GET /v1/modules` | Módulos pagos ativos do tenant/org da sessão. Alimenta o hub dinâmico (front mostra card ativo × cadeado por assinatura). |

## fz.fiscal.aliquotasPorUf

| Método | Rota | O que faz |
|---|---|---|
| `deleteOne` | `DELETE /v1/fiscal/icms-uf-rates/{uf}/{valid_from}` | Apaga a linha de uma UF numa data de início. |
| `list`, `listAll` | `GET /v1/fiscal/icms-uf-rates` | Lista a tabela de alíquota interna e FCP por UF do tenant. |
| `putOne` | `PUT /v1/fiscal/icms-uf-rates` | Grava a alíquota interna e o FCP de uma UF a partir de uma data. |

## fz.fiscal.autorizador

| Método | Rota | O que faz |
|---|---|---|
| `check` | `GET /v1/fiscal/authorizer-status` | Consulta a saúde do autorizador SEFAZ de uma UF/ambiente. |
| `panel` | `GET /v1/fiscal/sefaz-status` | Painel de status da SEFAZ: rollout inteiro, última leitura observada. |

## fz.fiscal.certificados

| Método | Rota | O que faz |
|---|---|---|
| `checkLink` | `POST /v1/fiscal/certificate-links/{id}/check` | Confere a ligação no Cofre agora, sem esperar o vigia. |
| `link` | `POST /v1/fiscal/certificate-links` | Liga o emitente a um certificado A1 do Cofre. |
| `list`, `listAll` | `GET /v1/fiscal/certificates` | Lista os certificados do tenant (só metadados) com paginação por cursor. |
| `listLinks`, `listLinksAll` | `GET /v1/fiscal/certificate-links` | Lista as ligações de certificado do Cofre do tenant, da mais nova. |
| `unlink` | `DELETE /v1/fiscal/certificate-links/{id}` | Desfaz a ligação com o certificado do Cofre. |
| `upload` | `POST /v1/fiscal/certificates` | Carrega o certificado A1 (PKCS#12) de um emitente. |

## fz.fiscal.csc

| Método | Rota | O que faz |
|---|---|---|
| `status` | `GET /v1/fiscal/csc` | Diz se o (emitente, ambiente) já tem CSC cadastrado. |
| `upsert` | `PUT /v1/fiscal/csc` | Cadastra ou troca o CSC de um emitente para um ambiente. |

## fz.fiscal.distribuicaoDfE

| Método | Rota | O que faz |
|---|---|---|
| `download` | `POST /v1/fiscal/dfe/documents/{id}/download` | Baixa o documento completo de um resumo, por chave de acesso (`consChNFe`). |
| `getItems` | `GET /v1/fiscal/dfe/documents/{id}/items` | Itens (`<det>`) do documento recebido - insumo da conferência de recebimento. |
| `getOne` | `GET /v1/fiscal/dfe/documents/{id}` | Retorna um documento recebido + o XML byte-a-byte (base64). |
| `list`, `listAll` | `GET /v1/fiscal/dfe/documents` | Lista os documentos recebidos do AN com paginação por cursor (mais recente primeiro). |
| `manifest` | `POST /v1/fiscal/dfe/documents/{id}/manifest` | Manifesta o destinatário (evento 2102xx registrado no Ambiente Nacional). |
| `setSync` | `PUT /v1/fiscal/dfe/sync` | Liga/desliga o poll do NFeDistribuicaoDFe (AN) para um emitente do tenant. |
| `supplierReturn` | `POST /v1/fiscal/dfe/documents/{id}/return` | Emite a devolução ao fornecedor de uma nota de compra recebida. |

## fz.fiscal.documentos

| Método | Rota | O que faz |
|---|---|---|
| `cancel` | `POST /v1/fiscal/documents/{id}/cancel` | Cancela um documento autorizado (evento 110111, dentro do prazo da UF). |
| `correct` | `POST /v1/fiscal/documents/{id}/correction` | Registra uma Carta de Correção (CC-e 110110) - não altera valores nem estado. |
| `create` | `POST /v1/fiscal/xml-packages` | Pede o pacote de XMLs de um mês. |
| `getDocument` | `GET /v1/fiscal/documents/{id}` | Retorna um documento fiscal pelo id. |
| `getPayload` | `GET /v1/fiscal/documents/{id}/payload` | O pedido de emissão de uma nota, como chegou. |
| `getXml` | `GET /v1/fiscal/documents/{id}/xml` | Baixa o XML de um documento fiscal. |
| `getXmlPackage` | `GET /v1/fiscal/xml-packages/{id}` | Retorna um pedido de pacote de XMLs. |
| `issue` | `POST /v1/fiscal/documents` | Emite um documento fiscal (aceita e enfileira; acompanhe por `GET`). |
| `listDocuments`, `listDocumentsAll` | `GET /v1/fiscal/documents` | Lista os documentos do tenant com paginação por cursor e filtros opcionais. |
| `listEvents` | `GET /v1/fiscal/documents/{id}/events` | Lista os eventos (cancelamento/CC-e) de um documento. |
| `listXmlPackages`, `listXmlPackagesAll` | `GET /v1/fiscal/xml-packages` | Lista os pedidos de pacote de XMLs do tenant. |
| `reconcile` | `POST /v1/fiscal/documents/{id}/reconcile` | Pergunta à SEFAZ a situação REAL do documento e acerta o estado local. |
| `reissue` | `POST /v1/fiscal/documents/{id}/reissue` | Emite de novo uma nota rejeitada, corrigida ou não. |

## fz.fiscal.emitentes

| Método | Rota | O que faz |
|---|---|---|
| `list`, `listAll` | `GET /v1/fiscal/emitters` | Lista os emitentes do tenant com paginação por cursor. |
| `syncFromOrganization` | `POST /v1/fiscal/emitters/sync` | Deriva o emitente da organização ativa: CNPJ do cadastro + IE/CRT do Plano Fiscal. Cria na primeira chamada e atualiza depois. |
| `upsert` | `POST /v1/fiscal/emitters` | Cria ou atualiza um emitente fiscal (upsert por CNPJ). |

## fz.fiscal.inutilizacao

| Método | Rota | O que faz |
|---|---|---|
| `inutilize` | `POST /v1/fiscal/inutilizations` | Inutiliza uma faixa de numeração (números sem uso). |
| `list`, `listAll` | `GET /v1/fiscal/inutilizations` | Lista as faixas inutilizadas do tenant com paginação por cursor. |

## fz.fiscal.nfsE

| Método | Rota | O que faz |
|---|---|---|
| `getOne` | `GET /v1/fiscal/service-invoices/{id}` | Retorna uma NFS-e pelo id. |
| `getXml` | `GET /v1/fiscal/service-invoices/{id}/xml` | Baixa o XML de uma NFS-e autorizada. |
| `issue` | `POST /v1/fiscal/service-invoices` | Emite uma NFS-e Nacional (aceita e enfileira; acompanhe por `GET`). |
| `list`, `listAll` | `GET /v1/fiscal/service-invoices` | Lista as NFS-e do tenant com paginação por cursor. |

## fz.fiscal.perfisDeProduto

| Método | Rota | O que faz |
|---|---|---|
| `getOne` | `GET /v1/fiscal/product-profiles/{profile_id}` | Retorna a versão corrente de um perfil pela identidade estável. |
| `list`, `listAll` | `GET /v1/fiscal/product-profiles` | Lista as versões correntes (não arquivadas) dos perfis do tenant (keyset). |
| `upsert` | `POST /v1/fiscal/product-profiles` | Cria um perfil novo (sem `profile_id`) ou uma nova versão (com `profile_id`). |

## fz.fiscal.reformaTributaria

| Método | Rota | O que faz |
|---|---|---|
| `getLedger` | `GET /v1/fiscal/tax/ledger` | Livro de CBS e IBS de um mês, para conferir a apuração assistida. |
| `listDocuments`, `listDocumentsAll` | `GET /v1/fiscal/tax/ledger/documents` | As notas por trás de um lado do livro de CBS e IBS. |
| `searchClassifications`, `searchClassificationsAll` | `GET /v1/fiscal/tax/classifications` | Busca na tabela oficial de `cClassTrib` do IBS e da CBS. |

## fz.fiscal.tabelaDoIbpt

| Método | Rota | O que faz |
|---|---|---|
| `importTable` | `POST /v1/fiscal/tax/ibpt/imports` | Importa o CSV do IBPT de uma UF. |
| `listTables`, `listTablesAll` | `GET /v1/fiscal/tax/ibpt/tables` | Lista as tabelas do IBPT carregadas na plataforma. |

## fz.fiscal.tax

| Método | Rota | O que faz |
|---|---|---|
| `documentSnapshot` | `GET /v1/fiscal/documents/{id}/tax-snapshot` | O cálculo que produziu os grupos IBS/CBS/IS de uma nota emitida em modo cálculo - com a **proveniência** e o que divergiu do informado. |
| `getSettings` | `GET /v1/fiscal/tax/settings` | Lê o opt-in Beta do Tax Engine para o tenant/organização da sessão. |
| `preview` | `POST /v1/fiscal/tax/preview` | Calcula os tributos da Reforma de uma operação (**preview, Beta**). |
| `putSettings` | `PUT /v1/fiscal/tax/settings` | Liga ou desliga o Tax Engine (Beta) para o escopo pedido. |

## fz.fleet

| Método | Rota | O que faz |
|---|---|---|
| `call` | `POST /v1/fleet/agent/call` (pública) | Repasse de um método da fila do domínio. |
| `handshake` | `POST /v1/fleet/agent/handshake` (pública) | O agente abre a sessão cifrada. |
| `join` | `POST /v1/fleet/join` (pública) | Um servidor entra na frota com um convite de uso único. |
| `listFleetRunners`, `listFleetRunnersAll` | `GET /v1/fleet/runners` | Lista os servidores da empresa da organização. |
| `pending` | `POST /v1/fleet/agent/pending` (pública) | O semáforo: "tem trabalho aí?". |
| `revokeFleetRunner` | `POST /v1/fleet/runners/{id}/revoke` | Revoga um servidor da empresa. |
| `revokeFleetRunnerAgent` | `POST /v1/fleet/runners/agents/{id}/revoke` | Revoga um agente de servidor da empresa. |

## fz.flow

| Método | Rota | O que faz |
|---|---|---|
| `archiveEtlPipeline` | `POST /v1/flow/etl/pipelines/{id}/archive` | Arquiva uma transformação. |
| `cancelEtlRun` | `POST /v1/flow/etl/runs/{id}/cancel` | Cancela uma execução. |
| `createEtlPipeline` | `POST /v1/flow/etl/pipelines` | Cria uma transformação. |
| `createEtlSchedule` | `POST /v1/flow/etl/schedules` | Cria uma agenda para uma transformação. |
| `createFlow` | `POST /v1/flow/flows` | Cria um fluxo. |
| `deleteEtlSchedule` | `DELETE /v1/flow/etl/schedules/{id}` | Apaga uma agenda. |
| `deleteFlow` | `DELETE /v1/flow/flows/{id}` | Remove um fluxo. |
| `getEtlLocalityPolicy` | `GET /v1/flow/etl/locality-policy` | Lê onde as execuções da organização podem rodar. |
| `getEtlPipeline` | `GET /v1/flow/etl/pipelines/{id}` | Lê uma transformação, com a conferência do desenho. |
| `getEtlRun` | `GET /v1/flow/etl/runs/{id}` | Lê uma execução. |
| `getEtlSchedule` | `GET /v1/flow/etl/schedules/{id}` | Lê uma agenda. |
| `getFlow` | `GET /v1/flow/flows/{id}` | Um fluxo pelo id. |
| `getFlowRun` | `GET /v1/flow/runs/{id}` | Uma volta, com o corpo do fato em `event_payload`. |
| `getFlowVersion` | `GET /v1/flow/flows/{id}/versions/{version}` | O desenho de então, pelo número da versão. |
| `getInboundEndpoint` | `GET /v1/flow/flows/{id}/inbound` | O endereço do gatilho "Webhook recebido" do fluxo. |
| `getManualRun` | `GET /v1/flow/manual-runs/{id}` | Lê onde está um disparo à mão. |
| `getPreset` | `GET /v1/flow/presets/{key}` | Lê um modelo pronto. |
| `installPreset` | `POST /v1/flow/presets/{key}/install` | Instala um modelo pronto na organização da sessão. |
| `listEtlConnections` | `GET /v1/flow/etl/connections` | Lista as conexões de banco de dados dos servidores da empresa. |
| `listEtlDatasets` | `GET /v1/flow/etl/datasets` | Lista os dados do sistema que a fonte "Dados do sistema" pode ler. |
| `listEtlPipelines`, `listEtlPipelinesAll` | `GET /v1/flow/etl/pipelines` | Lista as transformações da organização. |
| `listEtlRuns`, `listEtlRunsAll` | `GET /v1/flow/etl/runs` | Lista as execuções da organização, ou de uma transformação. |
| `listEtlSchedules`, `listEtlSchedulesAll` | `GET /v1/flow/etl/schedules` | Lista as agendas da organização, ou de uma transformação. |
| `listFlowRuns`, `listFlowRunsAll` | `GET /v1/flow/flows/{id}/runs` | A trilha de execução de um fluxo. |
| `listFlows`, `listFlowsAll` | `GET /v1/flow/flows` | Lista os fluxos do tenant. |
| `listFlowVersions`, `listFlowVersionsAll` | `GET /v1/flow/flows/{id}/versions` | Histórico de desenhos de um fluxo. |
| `listRuns`, `listRunsAll` | `GET /v1/flow/runs` | As execuções de todos os fluxos que a sessão enxerga. |
| `previewEtlPlan` | `POST /v1/flow/etl/plans/preview` | Prévia de um desenho, salvo ou não. |
| `receiveInbound` | `POST /v1/flow/inbound/{token}` (pública) | Alguém de fora chama o fluxo. **Sem sessão.** |
| `rotateInboundEndpoint` | `POST /v1/flow/flows/{id}/inbound/rotate` | Troca o token do endereço do gatilho "Webhook recebido". |
| `runFlowNow` | `POST /v1/flow/flows/{id}/run` | Executa o fluxo agora sobre um registro escolhido. |
| `runStats` | `GET /v1/flow/runs/stats` | Quantas vezes cada fluxo rodou nos últimos dias, por desfecho. |
| `setEtlLocalityPolicy` | `PUT /v1/flow/etl/locality-policy` | Grava onde as execuções da organização podem rodar. |
| `startEtlLocalRun` | `POST /v1/flow/etl/pipelines/{id}/runs/local` | Pede uma execução local da transformação. |
| `startEtlRun` | `POST /v1/flow/etl/pipelines/{id}/runs` | Pede uma execução da transformação sobre arquivos do Files ou relatórios. |
| `testFlow` | `POST /v1/flow/flows/{id}/test` | Testa o fluxo no motor de verdade, sem nada sair. |
| `updateEtlPipeline` | `PUT /v1/flow/etl/pipelines/{id}` | Edita uma transformação ativa, conferindo a versão lida. |
| `updateEtlSchedule` | `PUT /v1/flow/etl/schedules/{id}` | Edita uma agenda, conferindo a versão lida. |
| `updateFlow` | `PATCH /v1/flow/flows/{id}` | Edita parcialmente um fluxo (nome, desenho, ativação). |
| `validateEtlPlan` | `POST /v1/flow/etl/plans/validate` | Confere um desenho sem gravar. |

## fz.health

| Método | Rota | O que faz |
|---|---|---|
| `healthzAll` | `GET /v1/healthz/all` (pública) | Agrega saúde de todos os subsistemas em uma chamada. |
| `healthzArchive` | `GET /v1/healthz/archive` (pública) | Saúde do backend `archive`. |
| `healthzAudit` | `GET /v1/healthz/audit` (pública) | Saúde do backend `audit`. |
| `healthzBilling` | `GET /v1/healthz/billing` (pública) | Saúde do backend `billing` (catálogo comercial e loja de módulos). |
| `healthzCatalog` | `GET /v1/healthz/catalog` (pública) | Saúde do backend `catalog`. |
| `healthzCheckout` | `GET /v1/healthz/checkout` (pública) | Saúde do backend `checkout`. |
| `healthzFiscal` | `GET /v1/healthz/fiscal` (pública) | Saúde do backend `fiscal` (Fiscal Engine). |
| `healthzFlow` | `GET /v1/healthz/flow` (pública) | Saúde do backend `flow` (automação). |
| `healthzGateway` | `GET /v1/healthz/gateway` (pública) | Saúde do gateway. |
| `healthzHooks` | `GET /v1/healthz/hooks` (pública) | Saúde do backend `hooks` (`ferrazio.hooks.v1.Hooks`). |
| `healthzIam` | `GET /v1/healthz/iam` (pública) | Saúde do backend `auth`. |
| `healthzMailer` | `GET /v1/healthz/mailer` (pública) | Saúde do backend `mailer` (api). |
| `healthzMarketplace` | `GET /v1/healthz/marketplace` (pública) | Saúde do backend `marketplace`. |
| `healthzNotify` | `GET /v1/healthz/notify` (pública) | Saúde do backend `notify` (central in-app). |
| `healthzPay` | `GET /v1/healthz/pay` (pública) | Saúde do backend `pay`. |
| `healthzReports` | `GET /v1/healthz/reports` (pública) | Saúde do backend `reports` (api). |
| `healthzScheduler` | `GET /v1/healthz/scheduler` (pública) | Saúde do backend `scheduler`. |
| `healthzShipping` | `GET /v1/healthz/shipping` (pública) | Saúde do backend `shipping`. |
| `healthzSocial` | `GET /v1/healthz/social` (pública) | Saúde do backend `social_media`. |
| `healthzStock` | `GET /v1/healthz/stock` (pública) | Saúde do backend `stock`. |

## fz.hooks

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/hooks/subscriptions` | Cadastra um destino de webhook do tenant. |
| `delete` | `DELETE /v1/hooks/subscriptions/{id}` | Remove um destino (soft-delete). |
| `getOne` | `GET /v1/hooks/subscriptions/{id}` | Detalha uma subscription do tenant. |
| `listAttempts` | `GET /v1/hooks/deliveries/{id}/attempts` | Histórico de tentativas de uma entrega. |
| `listDeliveries`, `listDeliveriesAll` | `GET /v1/hooks/deliveries` | Lista as entregas de webhook do tenant (filtros opcionais). |
| `listEventTypes` | `GET /v1/hooks/event-types` | Descoberta de eventos assináveis (canal webhook). |
| `listSigningKeys` | `GET /v1/hooks/signing-keys` | JWKS das chaves públicas de assinatura. |
| `listSubscriptions`, `listSubscriptionsAll` | `GET /v1/hooks/subscriptions` | Lista os destinos do tenant (keyset/cursor). |
| `replay` | `POST /v1/hooks/deliveries/{id}/replay` | Re-dispara uma entrega (idempotente). |
| `update` | `PATCH /v1/hooks/subscriptions/{id}` | Atualização parcial do destino. |

## fz.hr.admissions

| Método | Rota | O que faz |
|---|---|---|
| `cancelAdmission` | `DELETE /v1/hr/admissions/{id}` | Cancela a admissão. |
| `confirmAdmission` | `POST /v1/hr/admissions/{id}/confirm` | Confirma a admissão. |
| `createAdmission` | `POST /v1/hr/admissions` | Abre uma admissão (rascunho). |
| `grantAccess` | `POST /v1/hr/admissions/{id}/grant-access` | Concede acesso ao sistema. |
| `updateAdmission` | `PATCH /v1/hr/admissions/{id}` | Edita o rascunho de admissão. |

## fz.hr.benefits

| Método | Rota | O que faz |
|---|---|---|
| `archiveBenefitPlan` | `DELETE /v1/hr/benefit-plans/{id}` | Arquiva o plano. |
| `cancelBenefitEnrollment` | `POST /v1/hr/benefit-enrollments/{id}/cancel` | Cancela a adesão que ainda não começou. |
| `createBenefitPlan` | `POST /v1/hr/benefit-plans` | Cria um plano de benefício. |
| `endBenefitEnrollment` | `POST /v1/hr/benefit-enrollments/{id}/end` | Termina a adesão num dia. |
| `enrollBenefit` | `POST /v1/hr/benefit-enrollments` | Adere o vínculo a um plano. |
| `getBenefitMonth` | `GET /v1/hr/benefits/month` | A conta dos benefícios no mês. |
| `listBenefitEnrollments`, `listBenefitEnrollmentsAll` | `GET /v1/hr/benefit-enrollments` | As adesões dos vínculos do escopo. |
| `listBenefitPlans` | `GET /v1/hr/benefit-plans` | O catálogo de benefícios da organização. |
| `updateBenefitPlan` | `PUT /v1/hr/benefit-plans/{id}` | Altera o plano. |

## fz.hr.climate

| Método | Rota | O que faz |
|---|---|---|
| `closeSurvey` | `POST /v1/hr/surveys/{id}/close` | Fecha a pesquisa antes do prazo. |
| `createSurvey` | `POST /v1/hr/surveys` | Cria uma pesquisa em rascunho. |
| `discardSurvey` | `DELETE /v1/hr/surveys/{id}` | Descarta o rascunho. |
| `getSurvey` | `GET /v1/hr/surveys/{id}` | Uma pesquisa com as perguntas. |
| `getSurveyResults` | `GET /v1/hr/surveys/{id}/results` | O resultado da pesquisa fechada. |
| `listSurveys`, `listSurveysAll` | `GET /v1/hr/surveys` | As pesquisas de clima da organização. |
| `openSurvey` | `POST /v1/hr/surveys/{id}/open` | Abre a pesquisa até `close_date`. |
| `updateSurvey` | `PUT /v1/hr/surveys/{id}` | Edita o rascunho. |

## fz.hr.competencies

| Método | Rota | O que faz |
|---|---|---|
| `createCompetency` | `POST /v1/hr/competencies` | Cria uma competência. |
| `getCareerMatrix` | `GET /v1/hr/job-families/{id}/career-matrix` | A matriz de carreira da família. |
| `getCompetency` | `GET /v1/hr/competencies/{id}` | Uma competência. |
| `getJobCompetencies` | `GET /v1/hr/jobs/{id}/competencies` | O que se espera de quem ocupa o cargo. |
| `listCompetencies`, `listCompetenciesAll` | `GET /v1/hr/competencies` | O catálogo de competências da organização. |
| `setCompetencyStatus` | `POST /v1/hr/competencies/{id}/status` | Arquiva ou reativa. |
| `setJobCompetencies` | `PUT /v1/hr/jobs/{id}/competencies` | Troca a lista inteira do cargo. |
| `updateCompetency` | `PATCH /v1/hr/competencies/{id}` | Altera nome, descrição e tipo. |

## fz.hr.dashboard

| Método | Rota | O que faz |
|---|---|---|
| `getDashboard` | `GET /v1/hr/dashboard` | O painel do RH (tela 26.1). |

## fz.hr.documents

| Método | Rota | O que faz |
|---|---|---|
| `addDocument` | `POST /v1/hr/employments/{id}/documents` | Anexa um documento ao vínculo. |
| `downloadDocumentFile` | `GET /v1/hr/documents/{id}/file` | O arquivo de um documento. |
| `listDocuments`, `listDocumentsAll` | `GET /v1/hr/documents` | Os documentos dos colaboradores. |

## fz.hr.employments

| Método | Rota | O que faz |
|---|---|---|
| `createDependent` | `POST /v1/hr/employments/{id}/dependents` | Inclui um dependente. |
| `getBankAccount` | `GET /v1/hr/employments/{id}/bank-account` | A conta bancária do vínculo. |
| `getChecklist` | `GET /v1/hr/employments/{id}/checklist` | O checklist do vínculo. |
| `getCompensation` | `GET /v1/hr/employments/{id}/compensation` | A remuneração do vínculo. |
| `getDiversity` | `GET /v1/hr/employments/{id}/diversity` | Os dados de diversidade. |
| `getEmployment` | `GET /v1/hr/employments/{id}` | Um vínculo. |
| `getLaborData` | `GET /v1/hr/employments/{id}/labor-data` | Os dados trabalhistas. |
| `getTimeline`, `getTimelineAll` | `GET /v1/hr/employments/{id}/timeline` | A linha do tempo do vínculo. |
| `listDependents` | `GET /v1/hr/employments/{id}/dependents` | Os dependentes. |
| `listEmployments`, `listEmploymentsAll` | `GET /v1/hr/employments` | Os vínculos. |
| `listEmploymentsByPerson` | `GET /v1/hr/persons/{person_id}/employments` | Os vínculos de uma pessoa. |
| `setBankAccount` | `PUT /v1/hr/employments/{id}/bank-account` | Grava a conta bancária. |
| `setDiversity` | `PUT /v1/hr/employments/{id}/diversity` | Grava os dados de diversidade. |
| `updateDependent` | `PATCH /v1/hr/employments/{id}/dependents/{dependent_id}` | Edita um dependente. |
| `updateLaborData` | `PATCH /v1/hr/employments/{id}/labor-data` | Grava os dados trabalhistas. |

## fz.hr.esocial

| Método | Rota | O que faz |
|---|---|---|
| `cancelEsocialEvent` | `POST /v1/hr/esocial/events/{id}/cancel` | Descarta o evento. |
| `dispatchEsocialSettlement` | `POST /v1/hr/esocial/settlements/{period}/dispatch` | Lança as diferenças. |
| `excludeEsocialEvent` | `POST /v1/hr/esocial/events/{id}/exclude` | Pede a exclusão do evento. |
| `generateEsocialEvents` | `POST /v1/hr/esocial/generate` | Gera os eventos que faltam. |
| `getEsocialEvent` | `GET /v1/hr/esocial/events/{id}` | O evento com o XML. |
| `getEsocialOverview` | `GET /v1/hr/esocial/overview` | O resumo do eSocial. |
| `getEsocialSettings` | `GET /v1/hr/esocial/settings` | A configuração do eSocial. |
| `getEsocialSettlement` | `GET /v1/hr/esocial/settlements/{period}` | A conferência das guias. |
| `listEsocialBatches`, `listEsocialBatchesAll` | `GET /v1/hr/esocial/batches` | Os lotes, do mais novo. |
| `listEsocialEvents`, `listEsocialEventsAll` | `GET /v1/hr/esocial/events` | Os eventos, do mais novo. |
| `putEsocialSettings` | `PUT /v1/hr/esocial/settings` | Grava a configuração do eSocial. |
| `regenerateEsocialEvent` | `POST /v1/hr/esocial/events/{id}/regenerate` | Gera de novo. |

## fz.hr.indicators

| Método | Rota | O que faz |
|---|---|---|
| `getIndicators` | `GET /v1/hr/indicators` | Os indicadores do RH (tela 26.19). |

## fz.hr.jobs

| Método | Rota | O que faz |
|---|---|---|
| `createJob` | `POST /v1/hr/jobs` | Cria um cargo. |
| `createJobFamily` | `POST /v1/hr/job-families` | Cria uma família de cargos. |
| `createSalaryGrade` | `POST /v1/hr/salary-grades` | Cria um grau salarial. |
| `createSalaryRange` | `POST /v1/hr/salary-grades/{id}/ranges` | Abre uma faixa nova no grau. |
| `deleteJob` | `DELETE /v1/hr/jobs/{id}` | Remove um cargo. |
| `deleteJobFamily` | `DELETE /v1/hr/job-families/{id}` | Remove uma família de cargos. |
| `getJob` | `GET /v1/hr/jobs/{id}` | Um cargo. |
| `listJobFamilies`, `listJobFamiliesAll` | `GET /v1/hr/job-families` | As famílias de cargos. |
| `listJobs`, `listJobsAll` | `GET /v1/hr/jobs` | Os cargos. |
| `listSalaryGrades`, `listSalaryGradesAll` | `GET /v1/hr/salary-grades` | Os graus salariais. |
| `listSalaryRanges` | `GET /v1/hr/salary-grades/{id}/ranges` | As faixas de um grau. |
| `updateJob` | `PATCH /v1/hr/jobs/{id}` | Edita um cargo. |
| `updateJobFamily` | `PATCH /v1/hr/job-families/{id}` | Edita uma família de cargos. |
| `updateSalaryGrade` | `PATCH /v1/hr/salary-grades/{id}` | Edita um grau salarial. |

## fz.hr.leave

| Método | Rota | O que faz |
|---|---|---|
| `cancelVacationRequest` | `POST /v1/hr/vacation-requests/{id}/cancel` | Cancela uma solicitação. |
| `createAbsence` | `POST /v1/hr/absences` | Registra uma ausência para um vínculo. |
| `createHoliday` | `POST /v1/hr/holidays` | Cadastra um feriado. |
| `createVacationRequest` | `POST /v1/hr/vacation-requests` | Solicita férias para um vínculo. |
| `decideAbsence` | `POST /v1/hr/absences/{id}/decide` | Aprova ou recusa uma ausência. |
| `decideVacationRequest` | `POST /v1/hr/vacation-requests/{id}/decide` | Aprova ou recusa férias. |
| `deleteHoliday` | `DELETE /v1/hr/holidays/{id}` | Remove um feriado. |
| `getAbsenceHealth` | `GET /v1/hr/absences/{id}/health` | O dado de saúde de uma ausência. |
| `listAbsences`, `listAbsencesAll` | `GET /v1/hr/absences` | As ausências. |
| `listHolidays` | `GET /v1/hr/holidays` | Os feriados da organização e das unidades. |
| `listVacationPeriods`, `listVacationPeriodsAll` | `GET /v1/hr/vacation-periods` | Os períodos aquisitivos. |
| `listVacationRequests`, `listVacationRequestsAll` | `GET /v1/hr/vacation-requests` | As solicitações de férias. |

## fz.hr.movements

| Método | Rota | O que faz |
|---|---|---|
| `cancelMovementBatch` | `POST /v1/hr/movement-batches/{id}/cancel` | Descarta o lote ainda não decidido. |
| `createMovement` | `POST /v1/hr/movements` | Registra uma movimentação. |
| `createMovementBatch` | `POST /v1/hr/movement-batches` | Cria o rascunho de um lote. |
| `decideMovement` | `POST /v1/hr/movements/{id}/decide` | Aprova ou recusa uma movimentação. |
| `decideMovementBatch` | `POST /v1/hr/movement-batches/{id}/decide` | Aprova ou recusa o lote de uma vez. |
| `getMovementBatch` | `GET /v1/hr/movement-batches/{id}` | O lote com os totais. |
| `listMovementBatches`, `listMovementBatchesAll` | `GET /v1/hr/movement-batches` | Os lotes de reajuste da organização. |
| `listMovementBatchItems`, `listMovementBatchItemsAll` | `GET /v1/hr/movement-batches/{id}/items` | As pessoas do lote. |
| `listMovements`, `listMovementsAll` | `GET /v1/hr/movements` | As movimentações. |
| `submitMovementBatch` | `POST /v1/hr/movement-batches/{id}/submit` | Envia o lote para aprovação. |
| `updateMovementBatch` | `PUT /v1/hr/movement-batches/{id}` | Troca o rascunho inteiro. |

## fz.hr.occupationalExams

| Método | Rota | O que faz |
|---|---|---|
| `cancelOccupationalExam` | `POST /v1/hr/occupational-exams/{id}/cancel` | Cancela um ASO lançado errado. |
| `getOccupationalExamRestrictions` | `GET /v1/hr/occupational-exams/{id}/restrictions` | Abre a restrição do apto com restrição. |
| `listOccupationalExams` | `GET /v1/hr/employments/{id}/occupational-exams` | Os ASOs do vínculo. |
| `listOccupationalExamsDue` | `GET /v1/hr/occupational-exams/upcoming` | Quem está sem ASO, com ele vencido ou vencendo. |
| `recordOccupationalExam` | `POST /v1/hr/occupational-exams` | Registra um ASO. |

## fz.hr.payroll

| Método | Rota | O que faz |
|---|---|---|
| `addPayrollEntry` | `POST /v1/hr/payroll-entries` | Lança uma rubrica para um vínculo. |
| `archivePayrollItem` | `POST /v1/hr/payroll-items/{id}/archive` | Arquiva uma rubrica. |
| `calculatePayrollRun` | `POST /v1/hr/payroll-calculations` | Calcula a folha da competência. |
| `closePayrollRun` | `POST /v1/hr/payroll-runs/{id}/close` | Fecha a folha. |
| `createPayrollItem` | `POST /v1/hr/payroll-items` | Cria uma rubrica da organização. |
| `deletePayrollEntry` | `DELETE /v1/hr/payroll-entries/{id}` | Apaga um lançamento. |
| `discardPayrollRun` | `POST /v1/hr/payroll-runs/{id}/discard` | Descarta o rascunho. |
| `dispatchPayrollRun` | `POST /v1/hr/payroll-runs/{id}/dispatch` | Reenvia ao financeiro. |
| `downloadPayslip` | `GET /v1/hr/payslips/{id}/file` | O PDF do holerite de qualquer vínculo. |
| `getPayrollRun` | `GET /v1/hr/payroll-runs/{id}` | A conferência da folha. |
| `getPayrollSettings` | `GET /v1/hr/payroll-settings` | O envio ao financeiro e o cabeçalho do holerite. |
| `importPayrollRun` | `POST /v1/hr/payroll-runs` | Importa a folha de uma competência. |
| `listPayrollEntries` | `GET /v1/hr/payroll-entries` | Os lançamentos de uma competência. |
| `listPayrollItems` | `GET /v1/hr/payroll-items` | O catálogo de rubricas da organização. |
| `listPayrollLines` | `GET /v1/hr/payroll-runs/{id}/lines` | As rubricas da folha, de um vínculo ou de todos. |
| `listPayrollRuns`, `listPayrollRunsAll` | `GET /v1/hr/payroll-runs` | As folhas, da importação mais nova. |
| `listPayrollTables` | `GET /v1/hr/payroll-tables` | As tabelas que o cálculo usa. |
| `putPayrollSettings` | `PUT /v1/hr/payroll-settings` | Grava a configuração da folha. |
| `restorePayrollItem` | `POST /v1/hr/payroll-items/{id}/restore` | Reativa uma rubrica. |
| `updatePayrollItem` | `PUT /v1/hr/payroll-items/{id}` | Muda uma rubrica na versão lida. |

## fz.hr.performance

| Método | Rota | O que faz |
|---|---|---|
| `addDevelopmentAction` | `POST /v1/hr/development-plans/{id}/actions` | Acrescenta uma ação. |
| `checkInGoal` | `POST /v1/hr/goals/{id}/check-ins` | Registra um acompanhamento. |
| `closeDevelopmentPlan` | `POST /v1/hr/development-plans/{id}/close` | Encerra um PDI. |
| `closeGoal` | `POST /v1/hr/goals/{id}/close` | Encerra uma meta. |
| `createDevelopmentPlan` | `POST /v1/hr/development-plans` | Abre o PDI de um colaborador. |
| `createGoal` | `POST /v1/hr/goals` | Dá uma meta a um colaborador. |
| `deleteFeedback` | `DELETE /v1/hr/feedbacks/{id}` | Modera (retira) um feedback. |
| `getDevelopmentPlan` | `GET /v1/hr/development-plans/{id}` | Um PDI com as ações. |
| `getGoal` | `GET /v1/hr/goals/{id}` | Uma meta. |
| `getReportingLine` | `GET /v1/hr/employments/{id}/reporting-line` | A linha de reporte. |
| `listDevelopmentPlans`, `listDevelopmentPlansAll` | `GET /v1/hr/development-plans` | Os PDIs da equipe ou da organização. |
| `listFeedbacks`, `listFeedbacksAll` | `GET /v1/hr/feedbacks` | Os feedbacks da equipe ou da organização. |
| `listGoalCheckIns`, `listGoalCheckInsAll` | `GET /v1/hr/goals/{id}/check-ins` | O histórico de acompanhamentos. |
| `listGoals`, `listGoalsAll` | `GET /v1/hr/goals` | As metas da equipe ou da organização. |
| `setDevelopmentActionStatus` | `POST /v1/hr/development-plans/{id}/actions/{action_id}/status` | Muda a situação de uma ação. |
| `setManager` | `PUT /v1/hr/employments/{id}/manager` | Troca o gestor direto. |
| `updateDevelopmentAction` | `PATCH /v1/hr/development-plans/{id}/actions/{action_id}` | Edita uma ação. |
| `updateDevelopmentPlan` | `PATCH /v1/hr/development-plans/{id}` | Edita um PDI ativo. |
| `updateGoal` | `PATCH /v1/hr/goals/{id}` | Edita uma meta ativa. |

## fz.hr.portal

| Método | Rota | O que faz |
|---|---|---|
| `acknowledgeMyPpeDelivery` | `POST /v1/me/hr/ppe-deliveries/{id}/acknowledge` | Confirmo que recebi o EPI. |
| `addMyDevelopmentAction` | `POST /v1/me/hr/development-plans/{id}/actions` | Acrescento uma ação ao meu PDI. |
| `cancelMyVacationRequest` | `POST /v1/me/hr/vacation-requests/{id}/cancel` | Cancelo o meu pedido de férias. |
| `checkInMyGoal` | `POST /v1/me/hr/goals/{id}/check-ins` | Informo como está a minha meta. |
| `closeMyDevelopmentPlan` | `POST /v1/me/hr/development-plans/{id}/close` | Encerro um PDI que abri. |
| `closeMyGoal` | `POST /v1/me/hr/goals/{id}/close` | Encerro uma meta que criei para mim. |
| `createMyAbsence` | `POST /v1/me/hr/absences` | Registro uma ausência. |
| `createMyDevelopmentPlan` | `POST /v1/me/hr/development-plans` | Abro um PDI para mim. |
| `createMyGoal` | `POST /v1/me/hr/goals` | Crio uma meta para mim. |
| `createMyVacationRequest` | `POST /v1/me/hr/vacation-requests` | Peço férias. |
| `deleteMyFeedback` | `DELETE /v1/me/hr/feedbacks/{id}` | Retiro um feedback que dei. |
| `downloadMyPayslip` | `GET /v1/me/hr/payslips/{id}/file` | Baixa o meu holerite. |
| `downloadMyTrainingCertificate` | `GET /v1/me/hr/training-enrollments/{id}/certificate` | Baixa o meu certificado. |
| `getMyBenefits` | `GET /v1/me/hr/benefits` | Os meus benefícios. |
| `getMyCompetencies` | `GET /v1/me/hr/competencies` | O que se espera do próprio cargo. |
| `getMyDevelopmentPlan` | `GET /v1/me/hr/development-plans/{id}` | Um dos meus PDIs. |
| `getMyGoal` | `GET /v1/me/hr/goals/{id}` | Uma das minhas metas. |
| `getMyHourBank` | `GET /v1/me/hr/hour-bank` | O banco de horas de quem está logado. |
| `getMyOccupationalExams` | `GET /v1/me/hr/occupational-exams` | Os meus ASOs. |
| `getMyPayslips` | `GET /v1/me/hr/payslips` | Os meus holerites, do mais novo. |
| `getMyPpeDeliveries` | `GET /v1/me/hr/ppe-deliveries` | Os EPIs que recebi. |
| `getMyReportingLine` | `GET /v1/me/hr/reporting-line` | O meu gestor, os meus pares e a minha equipe. |
| `getMyReview` | `GET /v1/me/hr/reviews/{id}` | Uma avaliação que eu faço. |
| `getMyReviewResult` | `GET /v1/me/hr/review-results/{id}` | Um resultado meu. |
| `getMySchedule` | `GET /v1/me/hr/schedule` | A minha escala. |
| `getMySurvey` | `GET /v1/me/hr/surveys/{id}` | Uma pesquisa para responder. |
| `getMyTimeSheet` | `GET /v1/me/hr/time-sheet` | O meu espelho de ponto. |
| `getMyTrainings` | `GET /v1/me/hr/trainings` | Os meus treinamentos. |
| `giveFeedback` | `POST /v1/me/hr/feedbacks` | Dou um feedback a um colega. |
| `listColleagues`, `listColleaguesAll` | `GET /v1/me/hr/colleagues` | O diretório da organização. |
| `listMyAbsences`, `listMyAbsencesAll` | `GET /v1/me/hr/absences` | As minhas ausências. |
| `listMyAbsenceTypes` | `GET /v1/me/hr/absence-types` | Os tipos de ausência que posso registrar. |
| `listMyDevelopmentPlans`, `listMyDevelopmentPlansAll` | `GET /v1/me/hr/development-plans` | Os meus PDIs. |
| `listMyDocuments`, `listMyDocumentsAll` | `GET /v1/me/hr/documents` | Os meus documentos. |
| `listMyEmployments`, `listMyEmploymentsAll` | `GET /v1/me/hr/employments` | Os meus vínculos. |
| `listMyFeedbacks`, `listMyFeedbacksAll` | `GET /v1/me/hr/feedbacks` | Os que recebi, os que dei ou o mural. |
| `listMyGoalCheckIns`, `listMyGoalCheckInsAll` | `GET /v1/me/hr/goals/{id}/check-ins` | O histórico de uma das minhas metas. |
| `listMyGoals`, `listMyGoalsAll` | `GET /v1/me/hr/goals` | As minhas metas, as que criei e as que recebi. |
| `listMyReviewResults`, `listMyReviewResultsAll` | `GET /v1/me/hr/review-results` | Os meus resultados. |
| `listMyReviews`, `listMyReviewsAll` | `GET /v1/me/hr/reviews` | As avaliações que tenho a fazer. |
| `listMySurveys`, `listMySurveysAll` | `GET /v1/me/hr/surveys` | As pesquisas de clima abertas para mim. |
| `listMyTeam`, `listMyTeamAll` | `GET /v1/me/hr/team` | O meu time. |
| `listMyVacationPeriods`, `listMyVacationPeriodsAll` | `GET /v1/me/hr/vacation-periods` | Os meus períodos aquisitivos. |
| `listMyVacationRequests`, `listMyVacationRequestsAll` | `GET /v1/me/hr/vacation-requests` | As minhas solicitações de férias. |
| `respondSurvey` | `POST /v1/me/hr/surveys/{id}/responses` | Responde a pesquisa. |
| `saveMyReview` | `PUT /v1/me/hr/reviews/{id}` | Grava o rascunho ou envia. |
| `setMyDevelopmentActionStatus` | `POST /v1/me/hr/development-plans/{id}/actions/{action_id}/status` | Mudo a situação de uma ação do meu PDI. |
| `updateMyDevelopmentAction` | `PATCH /v1/me/hr/development-plans/{id}/actions/{action_id}` | Edito uma ação que pus no meu PDI. |
| `updateMyDevelopmentPlan` | `PATCH /v1/me/hr/development-plans/{id}` | Edito um PDI que abri. |
| `updateMyGoal` | `PATCH /v1/me/hr/goals/{id}` | Edito uma meta que criei para mim. |

## fz.hr.positions

| Método | Rota | O que faz |
|---|---|---|
| `closePosition` | `POST /v1/hr/positions/{id}/close` | Extingue uma posição. |
| `createPosition` | `POST /v1/hr/positions` | Cria uma posição. |
| `freezePosition` | `POST /v1/hr/positions/{id}/freeze` | Congela uma posição. |
| `getOrgChart` | `GET /v1/hr/org-chart` | O organograma. |
| `getPosition` | `GET /v1/hr/positions/{id}` | Uma posição. |
| `listPositions`, `listPositionsAll` | `GET /v1/hr/positions` | As posições. |
| `unfreezePosition` | `POST /v1/hr/positions/{id}/unfreeze` | Descongela uma posição. |
| `updatePosition` | `PATCH /v1/hr/positions/{id}` | Edita uma posição. |

## fz.hr.recruitment

| Método | Rota | O que faz |
|---|---|---|
| `createApplication` | `POST /v1/hr/openings/{id}/applications` | Cadastra um candidato na vaga. |
| `createJobOpening` | `POST /v1/hr/openings` | Abre uma vaga para uma posição do quadro. |
| `getApplication` | `GET /v1/hr/applications/{id}` | Uma candidatura. |
| `getJobOpening` | `GET /v1/hr/openings/{id}` | Uma vaga. |
| `getRecruitmentFunnel` | `GET /v1/hr/recruitment/funnel` | As etapas e os motivos do recrutamento. |
| `hireApplication` | `POST /v1/hr/applications/{id}/hire` | Contrata o candidato. |
| `listApplicationMoves` | `GET /v1/hr/applications/{id}/moves` | O histórico de uma candidatura. |
| `listApplications`, `listApplicationsAll` | `GET /v1/hr/openings/{id}/applications` | As candidaturas de uma vaga. |
| `listJobOpenings`, `listJobOpeningsAll` | `GET /v1/hr/openings` | As vagas da organização. |
| `moveApplication` | `POST /v1/hr/applications/{id}/move` | Move a candidatura de etapa. |
| `setJobOpeningStatus` | `POST /v1/hr/openings/{id}/status` | Pausa, retoma ou cancela uma vaga. |
| `updateApplication` | `PATCH /v1/hr/applications/{id}` | Altera origem, link e anotação. |
| `updateJobOpening` | `PATCH /v1/hr/openings/{id}` | Altera título, descrição, cadeiras e data. |
| `updateRecruitmentFunnel` | `PUT /v1/hr/recruitment/funnel` | Redesenha as etapas e os motivos. |

## fz.hr.reviews

| Método | Rota | O que faz |
|---|---|---|
| `calibrateReview` | `POST /v1/hr/review-subjects/{id}/calibration` | O RH grava a nota final. |
| `closeReviewCycle` | `POST /v1/hr/review-cycles/{id}/close` | Fecha e libera o resultado. |
| `createReviewCycle` | `POST /v1/hr/review-cycles` | Cria um ciclo em rascunho. |
| `discardReviewCycle` | `DELETE /v1/hr/review-cycles/{id}` | Descarta o rascunho. |
| `getReviewCycle` | `GET /v1/hr/review-cycles/{id}` | Um ciclo com as contagens. |
| `getReviewSubject` | `GET /v1/hr/review-subjects/{id}` | O resultado até aqui de uma pessoa. |
| `listReviewCycles`, `listReviewCyclesAll` | `GET /v1/hr/review-cycles` | Os ciclos de avaliação da organização. |
| `listReviewSubjects`, `listReviewSubjectsAll` | `GET /v1/hr/review-cycles/{id}/subjects` | As pessoas avaliadas. |
| `nominateReviewPeer` | `POST /v1/hr/review-subjects/{id}/peers` | Indica um par (ciclo 360). |
| `openReviewCycle` | `POST /v1/hr/review-cycles/{id}/open` | Abre o ciclo até `due_date`. |
| `proposeReviewRating` | `POST /v1/hr/review-subjects/{id}/proposal` | O gestor propõe a nota final. |
| `removeReviewPeer` | `DELETE /v1/hr/review-subjects/{id}/peers/{review_id}` | Tira um par. |
| `startReviewCalibration` | `POST /v1/hr/review-cycles/{id}/calibration` | Manda para calibração antes do prazo. |
| `updateReviewCycle` | `PATCH /v1/hr/review-cycles/{id}` | Edita o rascunho. |

## fz.hr.schedules

| Método | Rota | O que faz |
|---|---|---|
| `assignWorkSchedule` | `PUT /v1/hr/employments/{id}/schedule` | Atribui uma escala ao vínculo. |
| `createWorkSchedule` | `POST /v1/hr/work-schedules` | Cria uma escala. |
| `deleteWorkSchedule` | `DELETE /v1/hr/work-schedules/{id}` | Arquiva uma escala. |
| `getEmploymentSchedule` | `GET /v1/hr/employments/{id}/schedule` | A escala do vínculo. |
| `listWorkScheduleOptions` | `GET /v1/hr/work-schedule-options` | As escalas que podem ser atribuídas. |
| `listWorkSchedules` | `GET /v1/hr/work-schedules` | O catálogo de escalas da organização. |
| `updateWorkSchedule` | `PUT /v1/hr/work-schedules/{id}` | Altera uma escala. |

## fz.hr.settings

| Método | Rota | O que faz |
|---|---|---|
| `createAbsenceType` | `POST /v1/hr/absence-types` | Cadastra um tipo de ausência. |
| `createApprovalRule` | `POST /v1/hr/approval-rules` | Cadastra uma regra de aprovação. |
| `createDocumentType` | `POST /v1/hr/document-types` | Cadastra um tipo de documento. |
| `createMovementReason` | `POST /v1/hr/movement-reasons` | Cadastra um motivo de movimentação. |
| `deleteApprovalRule` | `DELETE /v1/hr/approval-rules/{id}` | Remove uma regra de aprovação. |
| `deleteMovementReason` | `DELETE /v1/hr/movement-reasons/{id}` | Exclui um motivo de movimentação. |
| `getSettings` | `GET /v1/hr/settings` | A configuração do RH. |
| `listAbsenceTypes` | `GET /v1/hr/absence-types` | Os tipos de ausência. |
| `listApprovalRules` | `GET /v1/hr/approval-rules` | As regras de aprovação. |
| `listDocumentTypes` | `GET /v1/hr/document-types` | Os tipos de documento. |
| `listMovementReasons` | `GET /v1/hr/movement-reasons` | Os motivos de movimentação. |
| `updateAbsenceType` | `PATCH /v1/hr/absence-types/{id}` | Edita um tipo de ausência. |
| `updateApprovalRule` | `PATCH /v1/hr/approval-rules/{id}` | Edita uma regra de aprovação. |
| `updateDocumentType` | `PATCH /v1/hr/document-types/{id}` | Edita um tipo de documento. |
| `updateMovementReason` | `PUT /v1/hr/movement-reasons/{id}` | Altera nome e código do eSocial. |
| `updateSettings` | `PUT /v1/hr/settings` | Grava a configuração do RH. |

## fz.hr.signatures

| Método | Rota | O que faz |
|---|---|---|
| `cancelSignatureRequest` | `POST /v1/hr/signature-requests/{id}/cancel` | Cancela o envelope no Assinador. |
| `createSignatureRequest` | `POST /v1/hr/signature-requests` | Manda um documento do RH assinar. |
| `getSignatureRequest` | `GET /v1/hr/signature-requests/{id}` | Um pedido de assinatura. |
| `listSignatureFields` | `GET /v1/hr/signature-fields` | As lacunas que o RH preenche. |
| `listSignatureRequests`, `listSignatureRequestsAll` | `GET /v1/hr/signature-requests` | Os pedidos de assinatura. |

## fz.hr.sst

| Método | Rota | O que faz |
|---|---|---|
| `cancelPpeDelivery` | `POST /v1/hr/ppe-deliveries/{id}/cancel` | Cancela uma entrega lançada errado. |
| `cancelWorkAccident` | `POST /v1/hr/work-accidents/{id}/cancel` | Cancela um acidente lançado errado. |
| `endPositionRisk` | `POST /v1/hr/position-risks/{id}/end` | Encerra o risco no último dia de exposição. |
| `getWorkAccidentDetails` | `GET /v1/hr/work-accidents/{id}/details` | Abre o relato, a lesão e o CID. |
| `issueWorkAccidentCat` | `POST /v1/hr/work-accidents/{id}/issue` | Guarda o número do recibo da CAT emitida no INSS. |
| `listPositionRisks` | `GET /v1/hr/position-risks` | O inventário de riscos (PGR) das posições. |
| `listPpeDeliveries` | `GET /v1/hr/ppe-deliveries` | As entregas de EPI do alcance. |
| `listWorkAccidents` | `GET /v1/hr/work-accidents` | Os acidentes de trabalho do alcance. |
| `recordPositionRisk` | `POST /v1/hr/position-risks` | Grava um risco na posição. |
| `recordPpeDelivery` | `POST /v1/hr/ppe-deliveries` | Registra uma entrega de EPI. |
| `recordWorkAccident` | `POST /v1/hr/work-accidents` | Registra o acidente e calcula o prazo da CAT. |
| `returnPpeDelivery` | `POST /v1/hr/ppe-deliveries/{id}/return` | Marca a devolução do EPI. |
| `setWorkAccidentEsocial` | `PUT /v1/hr/work-accidents/{id}/esocial` | Grava o que o S-2210 pede além do registro. |
| `updatePositionRisk` | `PUT /v1/hr/position-risks/{id}` | Corrige o risco em vigor. |

## fz.hr.terminations

| Método | Rota | O que faz |
|---|---|---|
| `cancelTermination` | `POST /v1/hr/terminations/{id}/cancel` | Cancela o desligamento. |
| `confirmTermination` | `POST /v1/hr/terminations/{id}/confirm` | Efetiva o desligamento. |
| `createTermination` | `POST /v1/hr/terminations` | Abre um desligamento (rascunho). |
| `listTerminations`, `listTerminationsAll` | `GET /v1/hr/terminations` | Os desligamentos. |

## fz.hr.time

| Método | Rota | O que faz |
|---|---|---|
| `addHourBankAgreement` | `POST /v1/hr/employments/{id}/hour-bank/agreements` | Registra o acordo. |
| `addHourBankEntry` | `POST /v1/hr/employments/{id}/hour-bank/entries` | Lança à mão. |
| `addTimePunch` | `POST /v1/hr/employments/{id}/punches` | Inclui uma marcação à mão. |
| `closeTimeSheets` | `POST /v1/hr/time-closings` | Fecha o mês do espelho. |
| `disregardTimePunch` | `POST /v1/hr/punches/{id}/disregard` | Desconsidera uma marcação. |
| `endHourBankAgreement` | `POST /v1/hr/hour-bank/agreements/{id}/end` | Encerra o acordo. |
| `getHourBank` | `GET /v1/hr/employments/{id}/hour-bank` | O banco de horas do vínculo. |
| `getTimeSheet` | `GET /v1/hr/employments/{id}/time-sheet` | O espelho de ponto. |
| `importTimeFile` | `POST /v1/hr/time-imports` | Importa o AFD do relógio. |
| `listTimeClosings` | `GET /v1/hr/time-closings` | O painel de fechamentos do mês. |
| `listTimeImports`, `listTimeImportsAll` | `GET /v1/hr/time-imports` | As importações, da mais nova para a mais velha. |
| `reopenTimeClosing` | `POST /v1/hr/time-closings/{id}/reopen` | Reabre o mês. |

## fz.hr.trainings

| Método | Rota | O que faz |
|---|---|---|
| `cancelTrainingClass` | `POST /v1/hr/training-classes/{id}/cancel` | Cancela uma turma agendada. |
| `cancelTrainingEnrollment` | `POST /v1/hr/training-enrollments/{id}/cancel` | Cancela uma inscrição. |
| `completeTrainingClass` | `POST /v1/hr/training-classes/{id}/complete` | Conclui a turma. |
| `createTraining` | `POST /v1/hr/trainings` | Cria um treinamento no catálogo. |
| `createTrainingClass` | `POST /v1/hr/training-classes` | Abre uma turma de um treinamento ativo. |
| `downloadTrainingCertificate` | `GET /v1/hr/training-enrollments/{id}/certificate` | Baixa o certificado. |
| `enrollInTraining` | `POST /v1/hr/training-classes/{id}/enrollments` | Inscreve uma pessoa. |
| `getEmploymentTrainings` | `GET /v1/hr/employments/{id}/trainings` | Os treinamentos de um vínculo. |
| `getJobTrainings` | `GET /v1/hr/jobs/{id}/trainings` | Os treinamentos obrigatórios de um cargo. |
| `getTraining` | `GET /v1/hr/trainings/{id}` | Um treinamento. |
| `getTrainingClass` | `GET /v1/hr/training-classes/{id}` | Uma turma. |
| `listTrainingClasses`, `listTrainingClassesAll` | `GET /v1/hr/training-classes` | As turmas da organização. |
| `listTrainingEnrollments`, `listTrainingEnrollmentsAll` | `GET /v1/hr/training-classes/{id}/enrollments` | As pessoas da turma. |
| `listTrainingPending`, `listTrainingPendingAll` | `GET /v1/hr/training-pending` | Os obrigatórios que não estão em dia. |
| `listTrainings`, `listTrainingsAll` | `GET /v1/hr/trainings` | O catálogo de treinamentos da organização. |
| `setJobTrainings` | `PUT /v1/hr/jobs/{id}/trainings` | Troca a lista de obrigatórios do cargo. |
| `setTrainingAttendance` | `POST /v1/hr/training-enrollments/{id}/attendance` | Lança a presença. |
| `setTrainingCertificate` | `PUT /v1/hr/training-enrollments/{id}/certificate` | Anexa o certificado. |
| `setTrainingStatus` | `POST /v1/hr/trainings/{id}/status` | Arquiva ou reativa um treinamento. |
| `updateTraining` | `PATCH /v1/hr/trainings/{id}` | Altera o treinamento. |
| `updateTrainingClass` | `PATCH /v1/hr/training-classes/{id}` | Altera uma turma agendada. |

## fz.iam.apiKeys

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/iam/api-keys` | Emite uma nova API key. |
| `issueSession` | `POST /v1/auth/api-key/token` (pública) | Troca uma API key por um token de sessão temporário. |
| `list` | `GET /v1/iam/api-keys` | Lista as chaves do usuário (sem segredos). |
| `revoke` | `DELETE /v1/iam/api-keys/{key_id}` | Revoga uma chave do usuário. |

## fz.iam.appDevices

| Método | Rota | O que faz |
|---|---|---|
| `getCachePolicy` | `GET /v1/iam/cache-policy` | A política do cache offline da organização. |
| `issueCacheGrant` | `POST /v1/iam/cache-grants` | Emite o grant do cache offline do aparelho. |
| `listAppDevices` | `GET /v1/iam/app-devices` | Os aparelhos vivos da própria pessoa. |
| `listMemberAppDevices` | `GET /v1/iam/members/{member_id}/app-devices` | Os aparelhos de um membro. |
| `putCachePolicy` | `PUT /v1/iam/cache-policy` | Grava a política. Desligar faz a próxima emissão de todo aparelho da organização responder `policy_off`. |
| `registerAppDevice` | `POST /v1/iam/app-devices` | Registra o aparelho do app da sessão. |
| `removeAppDevice` | `DELETE /v1/iam/app-devices/{device_id}` | Remove um aparelho próprio (o celular perdido sai de outro aparelho). |
| `removeMemberAppDevice` | `DELETE /v1/iam/members/{member_id}/app-devices/{device_id}` | O administrador tira o aparelho de quem o perdeu. |

## fz.iam.appearance

| Método | Rota | O que faz |
|---|---|---|
| `activateTheme` | `POST /v1/iam/themes/{id}/activate` | Ativa o tema. |
| `clearOrganizationAppearance` | `DELETE /v1/iam/themes/organization` | Apaga a camada da organização ativa. |
| `createTheme` | `POST /v1/iam/themes` | Cria um tema. |
| `deactivateTheme` | `POST /v1/iam/themes/deactivate` | Volta ao tema do site. |
| `deleteTheme` | `DELETE /v1/iam/themes/{id}` | Apaga um tema que não é o ativo. |
| `duplicateTheme` | `POST /v1/iam/themes/{id}/duplicate` | Copia o tema. |
| `getActiveTheme` | `GET /v1/iam/themes/active` | O que a tela de quem está logado precisa para se pintar. |
| `getThemes` | `GET /v1/iam/themes` | O documento de temas do tenant. |
| `setOrganizationAppearance` | `PUT /v1/iam/themes/organization` | Grava a camada da organização ativa. |
| `updateTheme` | `PUT /v1/iam/themes/{id}` | Grava o tema por cima. |

## fz.iam.cadastro

| Método | Rota | O que faz |
|---|---|---|
| `addAddress` | `POST /v1/persons/{person_id}/addresses` | Adiciona um endereço a uma pessoa. |
| `addBankAccount` | `POST /v1/persons/{person_id}/bank-accounts` | Cadastra uma conta. |
| `addEmail` | `POST /v1/persons/{person_id}/emails` | Adiciona um email a uma pessoa. |
| `addLink` | `POST /v1/persons/links` | Liga uma pessoa a uma empresa. |
| `addMyBankAccount` | `POST /v1/me/bank-accounts` | A própria pessoa cadastra uma conta. |
| `addPhone` | `POST /v1/persons/{person_id}/phones` | Adiciona um telefone a uma pessoa. |
| `addPixKey` | `POST /v1/persons/{person_id}/pix-keys` | Adiciona uma chave Pix à pessoa. |
| `create` | `POST /v1/persons` | Cria uma nova pessoa no domínio de cadastro. |
| `createRole` | `POST /v1/persons/link-roles` | Cria um papel próprio. |
| `delete` | `DELETE /v1/persons/{person_id}` | Remove (soft-delete) a pessoa. |
| `deleteRole` | `DELETE /v1/persons/link-roles/{role_id}` | Apaga um papel próprio sem uso. |
| `findByDocument` | `GET /v1/persons/by-document` | A pessoa da conta com aquele CPF ou CNPJ. |
| `getAdditionalData` | `GET /v1/persons/{person_id}/additional-data` | Lê os dados adicionais. |
| `getDetails` | `GET /v1/persons/{person_id}/details` | Cadastro completo numa só resposta. |
| `getIndividual` | `GET /v1/persons/{person_id}/individual-details` | Lê os detalhes PF. |
| `getLegal` | `GET /v1/persons/{person_id}/legal-details` | Lê os detalhes PJ. |
| `getOne` | `GET /v1/persons/{person_id}` | Obtém uma única pessoa pelo ID. |
| `getSettings` | `GET /v1/persons/settings` | Lê a configuração efetiva do escopo (default = documento único exigido). |
| `import` | `POST /v1/persons/import` | Importa clientes e fornecedores de uma planilha. |
| `listAddresses` | `GET /v1/persons/{person_id}/addresses` | Lista todos os endereços da pessoa. |
| `listBankAccounts` | `GET /v1/persons/{person_id}/bank-accounts` | As contas da pessoa. |
| `listDuplicates`, `listDuplicatesAll` | `GET /v1/persons/duplicates` | Pessoas que **parecem** ser a mesma. |
| `listEmails` | `GET /v1/persons/{person_id}/emails` | Lista todos os emails da pessoa. |
| `listLinks` | `GET /v1/persons/{person_id}/links` | As pessoas da empresa, ou as empresas da pessoa. |
| `listMerges` | `GET /v1/persons/{person_id}/merges` | Os apelidos desta pessoa. |
| `listMyBankAccounts` | `GET /v1/me/bank-accounts` | As contas da própria pessoa. |
| `listPersons`, `listPersonsAll` | `GET /v1/persons` | Lista pessoas do tenant com paginação por cursor. |
| `listPhones` | `GET /v1/persons/{person_id}/phones` | Lista todos os telefones da pessoa. |
| `listPixKeys` | `GET /v1/persons/{person_id}/pix-keys` | Lista as chaves Pix da pessoa. |
| `listRoles` | `GET /v1/persons/link-roles` | Os papéis próprios do tenant. |
| `lookupByDocument` | `POST /v1/persons/lookup` | A pessoa da conta com o CPF ou CNPJ do corpo. |
| `lookupCompany` | `GET /v1/persons/company-lookup/{cnpj}` | Dados públicos de um CNPJ. |
| `merge` | `POST /v1/persons/{person_id}/merges` | Junta uma duplicata nesta pessoa. |
| `removeAddress` | `DELETE /v1/addresses/{address_id}` | Remove um endereço pelo ID direto. |
| `removeBankAccount` | `DELETE /v1/persons/{person_id}/bank-accounts/{bank_account_id}` | Apaga uma conta. |
| `removeEmail` | `DELETE /v1/emails/{email_id}` | Remove um email pelo ID direto. |
| `removeLink` | `DELETE /v1/persons/links/{link_id}` | Desfaz o vínculo. As pessoas ficam. |
| `removeMyBankAccount` | `DELETE /v1/me/bank-accounts/{bank_account_id}` | Apaga uma conta própria. |
| `removePhone` | `DELETE /v1/phones/{phone_id}` | Remove um telefone pelo ID direto. |
| `removePixKey` | `DELETE /v1/pix-keys/{pix_key_id}` | Remove uma chave Pix pelo ID direto. |
| `renameRole` | `PATCH /v1/persons/link-roles/{role_id}` | Renomeia um papel próprio. |
| `search` | `GET /v1/persons/emails` | Os e-mails das pessoas do cadastro (clientes, fornecedores, colaboradores) que começam pelo prefixo. |
| `setAdditionalData` | `PUT /v1/persons/{person_id}/additional-data` | Substitui os dados adicionais. |
| `setDefaultBankAccount` | `PUT /v1/persons/{person_id}/bank-accounts/{bank_account_id}/default` | Escolhe a conta de liquidação. |
| `setMain` | `PUT /v1/pix-keys/{pix_key_id}/main` | Define a chave como principal da pessoa. |
| `setMyDefaultBankAccount` | `PUT /v1/me/bank-accounts/{bank_account_id}/default` | Escolhe a conta de liquidação. |
| `setSettings` | `PUT /v1/persons/settings` | Define (upsert) a configuração no escopo exato. Requer a permissão RBAC `iam.configuracoes.cadastro.manage` (aplicada no `iam` → 403). |
| `unmerge` | `DELETE /v1/persons/{person_id}/merges/{duplicate_person_id}` | Desfaz. |
| `updateAddress` | `PATCH /v1/addresses/{address_id}` | Substitui os campos de um endereço. |
| `updateEmail` | `PATCH /v1/emails/{email_id}` | Atualiza o flag `is_main` de um email. |
| `updateLink` | `PATCH /v1/persons/links/{link_id}` | Troca papel, participação, período e nota. |
| `updatePerson` | `PATCH /v1/persons/{person_id}` | Atualiza o nome de exibição e o documento da pessoa. |
| `updatePhone` | `PATCH /v1/phones/{phone_id}` | Substitui os campos de um telefone. |
| `upsertIndividual` | `PUT /v1/persons/{person_id}/individual-details` | Upsert dos detalhes PF. |
| `upsertLegal` | `PUT /v1/persons/{person_id}/legal-details` | Upsert dos detalhes PJ. |

## fz.iam.domains

| Método | Rota | O que faz |
|---|---|---|
| `list` | `GET /v1/iam/domains` | Lista os domínios próprios de login do tenant. |
| `register` | `POST /v1/iam/domains` | Cadastra um domínio próprio de login. |
| `revoke` | `DELETE /v1/iam/domains/{id}` | Revoga o domínio. |
| `setLoginDomainOnly` | `PUT /v1/iam/domains/login-domain-only` | Entrada só pelo domínio próprio. |
| `setPrimary` | `POST /v1/iam/domains/{id}/primary` | Marca o domínio como primário. |
| `verify` | `POST /v1/iam/domains/{id}/verify` | Consulta o TXT do desafio agora. |

## fz.iam.fiscal

| Método | Rota | O que faz |
|---|---|---|
| `getPolicy` | `GET /v1/fiscal-period-policy` | Lê a política do escopo (default = sem janela). |
| `setPolicy` | `PUT /v1/fiscal-period-policy` | Define (upsert) a política. Requer a permissão RBAC `pay.periodos-fiscais.politica.manage` (aplicada no `iam` → 403). |

## fz.iam.groups

| Método | Rota | O que faz |
|---|---|---|
| `groupAddMember` | `POST /v1/groups/{group_id}/members` | (`group.update`). |
| `groupCreate` | `POST /v1/groups` | Cria um grupo (`group.create`). |
| `groupDelete` | `DELETE /v1/groups/{group_id}` | (`group.delete`). |
| `groupGet` | `GET /v1/groups/{group_id}` | (`group.read`). |
| `groupList`, `groupListAll` | `GET /v1/groups` | Grupos da organização, por id (`group.read`). |
| `groupMembers`, `groupMembersAll` | `GET /v1/groups/{group_id}/members` | (`group.read`). |
| `groupRemoveMember` | `DELETE /v1/groups/{group_id}/members/{member_id}` | (`group.update`). |
| `groupUpdate` | `PATCH /v1/groups/{group_id}` | (`group.update`). |
| `memberAccess` | `GET /v1/members/{member_id}/access` | O acesso efetivo de uma pessoa (`member.read`). |

## fz.iam.idps

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/iam/idps` | Cadastra um IdP OIDC. |
| `getPolicy` | `GET /v1/iam/sso-policy` | Regra "só SSO" e cargo da criação na hora. |
| `list` | `GET /v1/iam/idps` | Lista os IdPs OIDC do tenant. |
| `remove` | `DELETE /v1/iam/idps/{id}` | Remove o IdP e desfaz o vínculo no cofre. |
| `setPolicy` | `PUT /v1/iam/sso-policy` | Grava a regra de entrada pelo IdP do tenant. |
| `update` | `PUT /v1/iam/idps/{id}` | Altera um IdP. |

## fz.iam.locations

| Método | Rota | O que faz |
|---|---|---|
| `listCities` | `GET /v1/locations/states/{state}/cities` | Municípios da UF, por nome. |
| `listStates` | `GET /v1/locations/states` | Estados/UFs, ordenados por sigla. |
| `lookupPostalCode` | `GET /v1/locations/postal-code/{code}` | Endereço de um código postal. |

## fz.iam.members

| Método | Rota | O que faz |
|---|---|---|
| `assignRole` | `POST /v1/members/{member_id}/roles` | Atribui um role ao membro. |
| `assignUnit` | `POST /v1/members/{member_id}/units` | Associa o membro a uma unidade. |
| `create` | `POST /v1/members` | Cria um membership (Person ↔ Organization). |
| `delete` | `DELETE /v1/members/{member_id}` | Remove o vínculo de membership. |
| `deletePreference` | `DELETE /v1/me/preferences/{key}` | Apaga uma preferência da conta. |
| `getOne` | `GET /v1/members/{member_id}` | Obtém um membro por ID. |
| `getPreferences` | `GET /v1/me/preferences` | Lê preferências da conta. |
| `invite` | `POST /v1/persons/{person_id}/login-invite` | Convida a pessoa a criar o próprio acesso. |
| `inviteAccountant` | `POST /v1/persons/{person_id}/accountant-invite` | Convida a pessoa como contador da empresa. |
| `list`, `listAll` | `GET /v1/members` | Lista membros de uma organização. |
| `listAccountants`, `listAccountantsAll` | `GET /v1/accountants` | Lista os contadores da empresa. |
| `listDetailed`, `listDetailedAll` | `GET /v1/members/detailed` | Lista membros enriquecidos (pessoa + papel atual). |
| `listRoles` | `GET /v1/members/{member_id}/roles` | Lista roles atribuídos ao membro. |
| `listUnits` | `GET /v1/members/{member_id}/units` | Lista unidades associadas ao membro. |
| `myMembership` | `GET /v1/members/me` | Membership do caller na org + ações de permissão. |
| `passwordReset` | `POST /v1/persons/{person_id}/password-reset` | Manda para a pessoa o link de redefinir a senha. |
| `permissions` | `GET /v1/members/{member_id}/permissions` | Resolve permissões efetivas do membro. |
| `putPreference` | `PUT /v1/me/preferences/{key}` | Grava uma preferência da conta. |
| `resolveUsers` | `POST /v1/users/resolve` | Resolve `user_ids` → `{ user_id, person_id, display_name }`, escopado ao tenant. Para exibir autores por nome. |
| `revokeAccountant` | `DELETE /v1/accountants/{link_id}` | Encerra o acesso de um contador. |
| `revokeRole` | `DELETE /v1/members/{member_id}/roles/{role_id}` | Revoga um role do membro. |
| `revokeUnit` | `DELETE /v1/members/{member_id}/units/{unit_id}` | Desassocia da unidade. |
| `setRole` | `PUT /v1/members/{member_id}/role` | Troca atômica de papel. |
| `updateStatus` | `PATCH /v1/members/{member_id}/status` | Atualiza o status do membro. |

## fz.iam.organizations

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/organizations` | Cria uma organização dentro do tenant da sessão. |
| `delete` | `DELETE /v1/organizations/{organization_id}` | Remove uma organização. |
| `getOne` | `GET /v1/organizations/{organization_id}` | Obtém uma organização por ID. |
| `list` | `GET /v1/organizations` | Lista as organizações onde o caller é membro ativo. |
| `listAllOrganizations` | `GET /v1/organizations/all` | Lista TODAS as organizações do tenant. |
| `subtree` | `GET /v1/organizations/{organization_id}/subtree` | Resolve IDs da sub-árvore. |
| `update` | `PATCH /v1/organizations/{organization_id}` | Atualiza uma organização. |

## fz.iam.roles

| Método | Rota | O que faz |
|---|---|---|
| `catalog` | `GET /v1/permissions` | Catálogo global de ações concedíveis. |
| `create` | `POST /v1/roles` | Cria um role dentro de uma organização. |
| `delete` | `DELETE /v1/roles/{role_id}` | Remove um role. |
| `getOne` | `GET /v1/roles/{role_id}` | Obtém um role por ID. |
| `grant` | `POST /v1/roles/{role_id}/permissions` | Concede uma permissão ao role. |
| `list`, `listAll` | `GET /v1/roles` | Lista roles de uma organização. |
| `listDetailed`, `listDetailedAll` | `GET /v1/roles/detailed` | Papéis enriquecidos (contagem de membros + permissões). |
| `listPermissions` | `GET /v1/roles/{role_id}/permissions` | Lista permissões do role. |
| `revoke` | `DELETE /v1/roles/{role_id}/permissions/{action}` | Revoga uma permissão. |
| `update` | `PATCH /v1/roles/{role_id}` | Atualiza nome e/ou descrição de um role. |

## fz.iam.teams

| Método | Rota | O que faz |
|---|---|---|
| `teamAddMember` | `POST /v1/teams/{team_id}/members` | (`team.update`). |
| `teamCreate` | `POST /v1/teams` | Cria um time (`team.create`). |
| `teamDelete` | `DELETE /v1/teams/{team_id}` | (`team.delete`). |
| `teamGet` | `GET /v1/teams/{team_id}` | (`team.read`). |
| `teamList`, `teamListAll` | `GET /v1/teams` | (`team.read`). |
| `teamMembers`, `teamMembersAll` | `GET /v1/teams/{team_id}/members` | (`team.read`). |
| `teamRemoveMember` | `DELETE /v1/teams/{team_id}/members/{member_id}` | (`team.update`). |
| `teamUpdate` | `PATCH /v1/teams/{team_id}` | (`team.update`). |

## fz.iam.units

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/organization-units` | Cria uma unidade dentro de uma organização. |
| `delete` | `DELETE /v1/organization-units/{unit_id}` | Remove uma unidade. |
| `getOne` | `GET /v1/organization-units/{unit_id}` | Obtém uma unidade por ID. |
| `list` | `GET /v1/organization-units` | Lista unidades de uma organização. |
| `subtree` | `GET /v1/organization-units/{unit_id}/subtree` | Resolve IDs da sub-árvore. |
| `update` | `PATCH /v1/organization-units/{unit_id}` | Atualiza nome/descrição da unidade. |

## fz.integrations.ai

| Método | Rota | O que faz |
|---|---|---|
| `chooseAiModel` | `PUT /v1/integrations/ai/models/{purpose}` | Escolhe o modelo de um uso. |
| `listAiModelOptions` | `GET /v1/integrations/ai/models` | Os modelos de I.A. de cada uso. |

## fz.mailer.deliveries

| Método | Rota | O que faz |
|---|---|---|
| `list`, `listAll` | `GET /v1/mailer/deliveries` | Lista o Histórico de envios do tenant com paginação por cursor. |

## fz.mailer.emails

| Método | Rota | O que faz |
|---|---|---|
| `readiness` | `GET /v1/mailer/emails/readiness` | Diz, sem enviar nada, se o envio direto funciona para quem chama. |
| `send` | `POST /v1/mailer/emails` | Envia um e-mail pronto, em nome do tenant ou da organização. |

## fz.mailer.senderConfig

| Método | Rota | O que faz |
|---|---|---|
| `deleteByKey` | `DELETE /v1/mailer/senders/{sender_key}` | Remove o remetente desta chave. |
| `deleteOne` | `DELETE /v1/mailer/sender-config` | Remove o remetente `contact` da sessão. |
| `getByKey` | `GET /v1/mailer/senders/{sender_key}` | Consulta um remetente pela chave. |
| `getOne` | `GET /v1/mailer/sender-config` | Consulta o remetente `contact` da sessão. |
| `list` | `GET /v1/mailer/senders` | Lista os remetentes da sessão, um por chave. |
| `set` | `PUT /v1/mailer/sender-config` | Grava o remetente `contact` da sessão. |
| `setByKey` | `PUT /v1/mailer/senders/{sender_key}` | Grava (upsert) o remetente desta chave. |

## fz.mailer.suppressions

| Método | Rota | O que faz |
|---|---|---|
| `add` | `POST /v1/mailer/suppressions` | Inclui um endereço na lista de supressão do escopo da sessão. |
| `list`, `listAll` | `GET /v1/mailer/suppressions` | Lista os endereços suprimidos do escopo da sessão. |
| `remove` | `DELETE /v1/mailer/suppressions/{email}` | Tira um endereço da lista de supressão do escopo da sessão. |

## fz.mailer.templates

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/mailer/templates` | Cria um Template de email. |
| `deleteOne` | `DELETE /v1/mailer/templates/{id}` | Remove um Template (soft-delete). |
| `getOne` | `GET /v1/mailer/templates/{id}` | Busca um Template por ID. |
| `list`, `listAll` | `GET /v1/mailer/templates` | Lista Templates do tenant com paginação por cursor. |
| `listAccount` | `GET /v1/mailer/account-templates` | Lista os templates embutidos dos e-mails de acesso. |
| `preview` | `POST /v1/mailer/templates/preview` | Pré-visualiza um rascunho de template (não persiste). |
| `sendTest` | `POST /v1/mailer/templates/{key}/test` | Enfileira um disparo de **teste** de um template salvo. |
| `update` | `PUT /v1/mailer/templates/{id}` | Atualiza um Template (PUT - campos completos). |

## fz.marketing.blocklist

| Método | Rota | O que faz |
|---|---|---|
| `addToBlocklist` | `POST /v1/marketing/blocklist` | Bloqueia identificadores. |
| `listBlocklist`, `listBlocklistAll` | `GET /v1/marketing/blocklist` | Lista o bloqueio (keyset). |
| `removeFromBlocklist` | `DELETE /v1/marketing/blocklist/{id}` | Tira da lista. |

## fz.marketing.campaigns

| Método | Rota | O que faz |
|---|---|---|
| `cancelClassificationRun` | `POST /v1/marketing/campaigns/{id}/classification-runs/{run_id}/cancel` | Cancela. |
| `createCampaign` | `POST /v1/marketing/campaigns` | Cria em `draft`. |
| `decideCandidates` | `POST /v1/marketing/campaigns/{id}/candidates/decide` | A decisão à mão. |
| `deleteCampaign` | `DELETE /v1/marketing/campaigns/{id}` | Apaga uma campanha que nunca rodou. |
| `deleteCampaignClassifier` | `DELETE /v1/marketing/campaigns/{id}/classifier` | Tira o classificador. |
| `enrollLeads` | `POST /v1/marketing/campaigns/{id}/enroll` | Inscreve o público do filtro. |
| `estimateClassification` | `POST /v1/marketing/campaigns/{id}/classification-runs/estimate` | A conta. |
| `finishCampaign` | `POST /v1/marketing/campaigns/{id}/finish` | Encerra. |
| `getCampaign` | `GET /v1/marketing/campaigns/{id}` | Uma campanha. |
| `getCampaignClassifier` | `GET /v1/marketing/campaigns/{id}/classifier` | O classificador. |
| `getClassificationRun` | `GET /v1/marketing/campaigns/{id}/classification-runs/{run_id}` | Uma rodada. |
| `listCampaigns`, `listCampaignsAll` | `GET /v1/marketing/campaigns` | Lista as campanhas (keyset). |
| `listCandidates`, `listCandidatesAll` | `GET /v1/marketing/campaigns/{id}/candidates` | Os candidatos da triagem. |
| `listClassificationRuns`, `listClassificationRunsAll` | `GET /v1/marketing/campaigns/{id}/classification-runs` | O histórico. |
| `listEnrollments`, `listEnrollmentsAll` | `GET /v1/marketing/campaigns/{id}/enrollments` | Os leads da campanha. |
| `listTouches`, `listTouchesAll` | `GET /v1/marketing/campaigns/{id}/touches` | Os envios da campanha. |
| `pauseCampaign` | `POST /v1/marketing/campaigns/{id}/pause` | `running` → `paused`. |
| `previewMessage` | `POST /v1/marketing/preview` | Renderiza um texto para um lead, sem enviar. |
| `putCampaignClassifier` | `PUT /v1/marketing/campaigns/{id}/classifier` | Cria ou troca. |
| `resumeClassificationRun` | `POST /v1/marketing/campaigns/{id}/classification-runs/{run_id}/resume` | Retoma. |
| `startCampaign` | `POST /v1/marketing/campaigns/{id}/start` | `draft`/`paused` → `running`. |
| `startClassificationRun` | `POST /v1/marketing/campaigns/{id}/classification-runs` | Pede a rodada. |
| `stopEnrollment` | `POST /v1/marketing/campaigns/{id}/enrollments/{enrollment_id}/stop` | Para um lead. |
| `updateCampaign` | `PUT /v1/marketing/campaigns/{id}` | Substitui a configuração. |

## fz.marketing.instagram

| Método | Rota | O que faz |
|---|---|---|
| `addInstagramCaptureSeeds` | `POST /v1/marketing/instagram/captures/{id}/seeds` | Mais raízes. |
| `addInstagramSeeds` | `POST /v1/marketing/instagram/seeds` | Começa a captação por perfis. |
| `cancelInstagramCapture` | `POST /v1/marketing/instagram/captures/{id}/cancel` | Encerra de vez. |
| `createInstagramCapture` | `POST /v1/marketing/instagram/captures` | Compra o pacote (ou o personalizado, pelo orçamento) e começa. |
| `getInstagramActivity` | `GET /v1/marketing/instagram/activity` | A captação andando. |
| `getInstagramCapture` | `GET /v1/marketing/instagram/captures/{id}` | A captação com os números. |
| `getInstagramCaptureTerms` | `GET /v1/marketing/instagram/captures/terms` | Os termos de agora para criar uma captação. |
| `getInstagramLineage` | `GET /v1/marketing/instagram/profiles/{username}` | De onde veio um perfil. |
| `getInstagramPurchase` | `GET /v1/marketing/instagram/purchases/{purchase_id}` | Estado da compra. |
| `getInstagramStats` | `GET /v1/marketing/instagram/stats` | Os números da captação. |
| `grantInstagramProfiles` | `POST /v1/marketing/instagram/grants` | Pede perfis como leads. |
| `listInstagramAreas` | `GET /v1/marketing/instagram/areas` | Os tipos de perfil da busca nova. |
| `listInstagramCaptures`, `listInstagramCapturesAll` | `GET /v1/marketing/instagram/captures` | As captações da organização. |
| `listInstagramGrants`, `listInstagramGrantsAll` | `GET /v1/marketing/instagram/grants` | Os pedidos de leads da organização. |
| `listInstagramSearches`, `listInstagramSearchesAll` | `GET /v1/marketing/instagram/searches` | As buscas salvas da organização. |
| `purchaseInstagramBlocks` | `POST /v1/marketing/instagram/purchases` | Compra blocos de 200 perfis numa busca nova ou numa existente. |
| `stopInstagramGrant` | `POST /v1/marketing/instagram/grants/{id}/stop` | Para a entrega. |

## fz.marketing.intel

| Método | Rota | O que faz |
|---|---|---|
| `createIntelTerm` | `POST /v1/marketing/intel/terms` | Acompanha um termo ou uma Página. |
| `deleteIntelTerm` | `DELETE /v1/marketing/intel/terms/{id}` | Deixa de acompanhar. |
| `getAdMedia` | `GET /v1/marketing/intel/media/{id}` | Os bytes de uma mídia de anúncio. |
| `getAdvertiser` | `GET /v1/marketing/intel/advertisers/{id}` | Um anunciante com os anúncios. |
| `getIntelProfile` | `GET /v1/marketing/intel/profile` | O que a organização vende, as palavras do produto e os ângulos de venda. |
| `getLandingScreenshot` | `GET /v1/marketing/intel/landing-pages/{id}/screenshot` | A captura da página. |
| `intelInsights` | `GET /v1/marketing/intel/insights` | A visão geral dos anúncios lidos. |
| `listAds`, `listAdsAll` | `GET /v1/marketing/intel/ads` | Os anúncios vistos (keyset). |
| `listAdvertisers`, `listAdvertisersAll` | `GET /v1/marketing/intel/advertisers` | Os anunciantes vistos (keyset). |
| `listIntelTerms` | `GET /v1/marketing/intel/terms` | Os termos e Páginas acompanhados. |
| `listLandingPages`, `listLandingPagesAll` | `GET /v1/marketing/intel/landing-pages` | As páginas de destino dos anúncios. |
| `markAd` | `POST /v1/marketing/intel/ads/{id}/mark` | Favorito e anotação. |
| `markAdvertiser` | `POST /v1/marketing/intel/advertisers/{id}/mark` | Classe manual e anotação. |
| `retryLandingPage` | `POST /v1/marketing/intel/landing-pages/{id}/retry` | Lê a página de novo. |
| `runIntelTerm` | `POST /v1/marketing/intel/terms/{id}/run` | Enfileira uma rodada agora. |
| `updateIntelProfile` | `PUT /v1/marketing/intel/profile` | Substitui o perfil. |
| `updateIntelTerm` | `PATCH /v1/marketing/intel/terms/{id}` | Troca o grupo do termo. |

## fz.marketing.leadPacks

| Método | Rota | O que faz |
|---|---|---|
| `forgetNiche` | `DELETE /v1/marketing/niches/{slug}` | Tira a tag de busca da lista da organização. |
| `getLeadPack` | `GET /v1/marketing/lead-packs/{id}` | Um pacote, com o andamento. |
| `leadPackCoverage` | `GET /v1/marketing/lead-packs/coverage` | A cobertura de cada par. |
| `leadPackQueue` | `GET /v1/marketing/lead-packs/queue` | Os nichos com pacotes da organização esperando coleta. |
| `listLeadPacks`, `listLeadPacksAll` | `GET /v1/marketing/lead-packs` | Os pacotes da organização (keyset). |
| `listNiches` | `GET /v1/marketing/niches` | O catálogo de nichos (dado de referência) e as tags de busca da organização. |
| `packCredits` | `GET /v1/marketing/lead-packs/credits` | Quantos pares a organização ainda pode pedir sem pagar. |
| `prioritizeNiche` | `PUT /v1/marketing/lead-packs/queue/{slug}` | Põe os pacotes do nicho que esperam coleta na frente da fila, ou os devolve à ordem de chegada. |
| `redeemPackCredits` | `POST /v1/marketing/lead-packs/redeem` | Paga pares com o crédito que os pacotes pagos e não entregues deixaram. |
| `resolveNiche` | `POST /v1/marketing/niches/resolve` | O nicho que o catálogo não mostra. |

## fz.marketing.leads

| Método | Rota | O que faz |
|---|---|---|
| `addLeadInteraction` | `POST /v1/marketing/leads/{id}/interactions` | Ligação, reunião, visita ou e-mail que aconteceu fora do sistema, com o canal e a data. |
| `addLeadNote` | `POST /v1/marketing/leads/{id}/notes` | Anotação livre na linha do tempo. |
| `blockLeads` | `POST /v1/marketing/leads/block` | Bloqueia o telefone, o @ e o e-mail dos leads (o "Bloquear" da linha e do lote). |
| `bulkUpdateLeads` | `POST /v1/marketing/leads/bulk` | Muda etapa, status, etiquetas, responsável, próxima ação e prioridade de muitos leads de uma vez. |
| `countLeads` | `GET /v1/marketing/leads/count` | Quantos leads casam o filtro. |
| `createCampaignCost` | `POST /v1/marketing/costs` | Grava um gasto digitado. |
| `createFunnel` | `POST /v1/marketing/funnels` | Cria um funil. |
| `createLead` | `POST /v1/marketing/leads` | Cadastra um lead. |
| `createLeadForm` | `POST /v1/marketing/forms` | Cria um formulário. |
| `createStage` | `POST /v1/marketing/stages` | Cria uma etapa no fim do funil. |
| `deleteCampaignCost` | `DELETE /v1/marketing/costs/{id}` | Apaga um gasto. |
| `deleteFunnel` | `DELETE /v1/marketing/funnels/{id}` | Remove um funil que não é o padrão. |
| `deleteLead` | `DELETE /v1/marketing/leads/{id}` | Remove da base (soft delete). |
| `deleteLeadForm` | `DELETE /v1/marketing/forms/{id}` | Apaga (a origem dos leads fica). |
| `deleteStage` | `DELETE /v1/marketing/stages/{id}` | Remove a etapa. |
| `dismissDuplicateLeads` | `POST /v1/marketing/leads/duplicates/dismiss` | "não são o mesmo". |
| `eraseDataSubject` | `POST /v1/marketing/data-subjects/erase` | Elimina os dados do titular. |
| `exportDataSubject` | `POST /v1/marketing/data-subjects/export` | O documento de acesso do titular. |
| `exportLeads` | `GET /v1/marketing/leads/export` | Exporta a base (com o filtro da lista) ou os inscritos de uma campanha, em CSV no formato do modelo. |
| `getCostMetrics` | `GET /v1/marketing/metrics/costs` | A medição do custo. |
| `getFunnelMetrics` | `GET /v1/marketing/metrics/funnel` | O painel de métricas do funil. |
| `getLead` | `GET /v1/marketing/leads/{id}` | Um lead. |
| `getLeadDistribution` | `GET /v1/marketing/distribution` | A roda de distribuição da organização. |
| `getLeadForm` | `GET /v1/marketing/forms/{id}` | Um formulário. |
| `getPrivacySettings` | `GET /v1/marketing/privacy` | A privacidade da organização. |
| `getPublicLeadForm` | `GET /v1/marketing/public/forms/{token}` (pública) | O formulário. **Sem sessão.** |
| `getScoringModel` | `GET /v1/marketing/scoring` | A régua da nota do lead da organização. |
| `importCampaignCosts` | `POST /v1/marketing/costs/import` | Importa a exportação do Gerenciador de Anúncios da Meta. |
| `importLeads` | `POST /v1/marketing/leads/import` | Importa uma planilha CSV ou uma lista JSON de leads, opcionalmente direto para uma campanha. |
| `leadFacets` | `GET /v1/marketing/leads/facets` | Os valores distintos da base. |
| `listCampaignCosts`, `listCampaignCostsAll` | `GET /v1/marketing/costs` | Os gastos de marketing (keyset). |
| `listDuplicateLeads` | `GET /v1/marketing/leads/duplicates` | Os pares que parecem o mesmo lead. |
| `listFunnels` | `GET /v1/marketing/funnels` | Os funis da organização. |
| `listLeadActivities`, `listLeadActivitiesAll` | `GET /v1/marketing/leads/{id}/activities` | A linha do tempo do lead. |
| `listLeadCards` | `GET /v1/marketing/leads/{id}/cards` | Em que funis o lead está e em que etapa de cada um. |
| `listLeadForms`, `listLeadFormsAll` | `GET /v1/marketing/forms` | Os formulários da organização (keyset). |
| `listLeadFormSubmissions` | `GET /v1/marketing/leads/{id}/form-answers` | O que o lead respondeu. |
| `listLeads`, `listLeadsAll` | `GET /v1/marketing/leads` | Lista a base com o filtro de público (keyset). |
| `listLegitimateInterest`, `listLegitimateInterestAll` | `GET /v1/marketing/privacy/legitimate-interest` | As versões do teste (keyset), da mais nova para a mais antiga. |
| `listLossReasons` | `GET /v1/marketing/loss-reasons` | Os motivos de perda da organização. |
| `listStages` | `GET /v1/marketing/stages` | As etapas de um funil (sem `funnel_id`, o padrão). |
| `lookupDataSubject` | `POST /v1/marketing/data-subjects/lookup` | Quem o pedido do titular alcança. |
| `mergeLeads` | `POST /v1/marketing/leads/merge` | Mescla dois leads. |
| `openLeadQuote` | `POST /v1/marketing/leads/{id}/quote` | Abre no módulo de vendas o orçamento do último ganho do lead: vazio, com a pessoa do cadastro como cliente e o responsável do lead como vendedor. |
| `recordLegitimateInterest` | `POST /v1/marketing/privacy/legitimate-interest` | Registra uma versão nova do teste de legítimo interesse. |
| `renameFunnel` | `PUT /v1/marketing/funnels/{id}` | Renomeia um funil. |
| `reorderStages` | `PUT /v1/marketing/stages/order` | Reordena o funil inteiro. |
| `retryLeadHandoff` | `POST /v1/marketing/leads/{id}/handoff/retry` | Põe de volta na fila a passagem do lead ganho ao cadastro que desistiu, com as tentativas zeradas. |
| `rotateLeadFormToken` | `POST /v1/marketing/forms/{id}/rotate` | Troca o endereço público. |
| `saveLeadDistribution` | `PUT /v1/marketing/distribution` | Grava a roda inteira, na ordem. |
| `saveLossReasons` | `PUT /v1/marketing/loss-reasons` | Grava a lista inteira, na ordem. |
| `savePrivacySettings` | `PUT /v1/marketing/privacy` | Grava o prazo de retenção e o aviso. |
| `saveScoringModel` | `PUT /v1/marketing/scoring` | Grava a régua inteira, na ordem. |
| `submitPublicLeadForm` | `POST /v1/marketing/public/forms/{token}/submit` (pública) | O envio. **Sem sessão.** |
| `updateLead` | `PUT /v1/marketing/leads/{id}` | Substitui os campos editáveis. |
| `updateLeadForm` | `PUT /v1/marketing/forms/{id}` | Troca a configuração inteira. |
| `updateStage` | `PUT /v1/marketing/stages/{id}` | Edita nome, tipo, cor e gatilho. |

## fz.marketplace

| Método | Rota | O que faz |
|---|---|---|
| `answerFoodDispute` | `POST /v1/marketplace/orders/{id}/food/disputes/{dispute_id}/answer` | Responde a disputa do cliente: aceitar, recusar com motivo ou oferecer uma das alternativas. |
| `attachOrderInvoice` | `POST /v1/marketplace/orders/{id}/invoices/attach` | Tenta anexar ao provider as notas autorizadas do pedido, agora. |
| `authorizationCallback` | `GET /v1/marketplace/authorize/callback` (pública) | Callback público do provider. **Sem sessão.** |
| `cancelOrderAtProvider` | `POST /v1/marketplace/orders/{id}/cancel` | Pede ao canal o cancelamento do pedido de varejo pelo vendedor. |
| `cancelOrderProjection` | `POST /v1/marketplace/orders/{id}/project/cancel` | Desfaz a projeção e marca o pedido como `skipped`. |
| `completeAuthorization` | `POST /v1/marketplace/accounts/{id}/authorize/complete` | Termina a autorização com o `code` que o provider devolveu. |
| `confirmFoodCash` | `POST /v1/marketplace/orders/{id}/food/cash-received` | Confirma o dinheiro recebido do entregador do provider. |
| `confirmOrderShipment` | `POST /v1/marketplace/orders/{id}/shipment/confirm` | Confirma ao canal que o pedido de varejo saiu, com transportadora e rastreio. |
| `copyListingPhotos` | `POST /v1/marketplace/listings/{id}/photos/copy` | Copia as fotos do anúncio para o produto do catálogo. |
| `createAccount` | `POST /v1/marketplace/accounts` | Cadastra uma conta. |
| `createAndLinkVariant` | `POST /v1/marketplace/listings/{id}/variants/{variant_id}/create-and-link` | Cadastra no catálogo o produto simples da variação e vincula, numa operação só. |
| `createDraft` | `POST /v1/marketplace/accounts/{id}/drafts` | Cria um rascunho de anúncio a partir de uma variante do catálogo. |
| `deleteVariantPolicy` | `DELETE /v1/marketplace/accounts/{id}/variant-policies/{catalog_variant_id}` | Apaga a folga própria de uma variante. |
| `disconnectAccount` | `DELETE /v1/marketplace/accounts/{id}` | Desconecta a conta e apaga a credencial. |
| `endFoodStorePause` | `POST /v1/marketplace/accounts/{id}/store/pauses/{pause_id}/end` | Encerra a pausa antes do fim. |
| `getAccount` | `GET /v1/marketplace/accounts/{id}` | Uma conta pelo id. |
| `getDraft` | `GET /v1/marketplace/drafts/{id}` | Um rascunho de anúncio. |
| `getFoodPayoutOperations` | `GET /v1/marketplace/accounts/{id}/payouts/{payout_id}/operations` | As operações de baixa dos pedidos que uma transferência paga. |
| `getFoodStore` | `GET /v1/marketplace/accounts/{id}/store` | A loja de delivery da conta. |
| `getListing` | `GET /v1/marketplace/listings/{id}` | Um anúncio pelo id. |
| `getOrder` | `GET /v1/marketplace/orders/{id}` | Um pedido com as linhas, o comprador e o estado da projeção. |
| `getOrderFinancials` | `GET /v1/marketplace/orders/{id}/financials` | O dinheiro do pedido: bruto, tarifas, líquido e devoluções. |
| `getPolicy` | `GET /v1/marketplace/accounts/{id}/policy` | A política da conta: o que compõe o vendável e o que é automático. |
| `getSellable` | `GET /v1/marketplace/sellable/{variant_id}` | A linha do vendável de uma variação do anúncio. |
| `getSettlement` | `GET /v1/marketplace/settlements/{id}` | Um repasse com as linhas (venda, tarifa, frete, estorno). |
| `getUsage` | `GET /v1/marketplace/usage` | O uso do módulo no mês: contas por provider e status, pedidos por conta. |
| `importLinks` | `POST /v1/marketplace/accounts/{id}/links/import` | Importa o DE/PARA da conta de uma planilha. |
| `importListings` | `POST /v1/marketplace/accounts/{id}/listings/import` | Enfileira a importação dos anúncios da conta. |
| `issueOrderInvoice` | `POST /v1/marketplace/orders/{id}/invoices` | Emite a nota da venda projetada, fora da automação (`auto_invoice`). |
| `linkFoodStore` | `POST /v1/marketplace/accounts/{id}/store/link` | Liga a conta de delivery à loja pelo id dela. |
| `linkVariant` | `POST /v1/marketplace/listings/{id}/variants/{variant_id}/link` | Vincula uma variação do anúncio a uma variante do catálogo. |
| `listAccountEvents`, `listAccountEventsAll` | `GET /v1/marketplace/accounts/{id}/events` | O histórico de status da conta. |
| `listAccounts`, `listAccountsAll` | `GET /v1/marketplace/accounts` | Lista as contas do tenant. |
| `listCategoryAttributes` | `GET /v1/marketplace/accounts/{id}/categories/{category_id}/attributes` | Os atributos que a categoria do provider exige (marca, modelo, voltagem). |
| `listDeadLetters`, `listDeadLettersAll` | `GET /v1/marketplace/accounts/{id}/dead-letters` | A fila morta da conta: o que o worker desistiu de tentar. |
| `listDrafts`, `listDraftsAll` | `GET /v1/marketplace/accounts/{id}/drafts` | Os rascunhos de anúncio da conta. |
| `listExternalStock`, `listExternalStockAll` | `GET /v1/marketplace/accounts/{id}/external-stock` | O espelho do estoque que o provider guarda (Full/FBA). |
| `listFoodCancellationReasons` | `GET /v1/marketplace/orders/{id}/food/cancellation-reasons` | Os motivos de cancelamento que o provider aceita para o pedido agora. |
| `listFoodDisputes` | `GET /v1/marketplace/orders/{id}/food/disputes` | As disputas do pedido de delivery. |
| `listFoodPayouts`, `listFoodPayoutsAll` | `GET /v1/marketplace/accounts/{id}/payouts` | As transferências da semana da loja de delivery (o repasse do iFood). |
| `listLinkSuggestions`, `listLinkSuggestionsAll` | `GET /v1/marketplace/accounts/{id}/link-suggestions` | Sugere o vínculo de cada variação de anúncio sem par da conta. |
| `listListings`, `listListingsAll` | `GET /v1/marketplace/accounts/{id}/listings` | Lista os anúncios de uma conta. |
| `listOrderEvents`, `listOrderEventsAll` | `GET /v1/marketplace/orders/{id}/events` | O histórico do pedido: recebido, projetado, nota, envio, devolução. |
| `listOrderInvoices` | `GET /v1/marketplace/orders/{id}/invoices` | As notas do pedido e se o provider já as recebeu. |
| `listOrders`, `listOrdersAll` | `GET /v1/marketplace/accounts/{id}/orders` | Os pedidos da conta. |
| `listProviders` | `GET /v1/marketplace/providers` | Lista as ferramentas que o módulo serve. |
| `listSellable`, `listSellableAll` | `GET /v1/marketplace/accounts/{id}/sellable` | O vendável da conta, uma linha por vínculo. |
| `listSellablePushes`, `listSellablePushesAll` | `GET /v1/marketplace/sellable/{variant_id}/pushes` | Histórico de envios de quantidade e preço de uma variação. |
| `listSettlements`, `listSettlementsAll` | `GET /v1/marketplace/accounts/{id}/settlements` | Os repasses da conta. |
| `listShipments` | `GET /v1/marketplace/orders/{id}/shipments` | Os envios do pedido. |
| `listSyncOperations`, `listSyncOperationsAll` | `GET /v1/marketplace/accounts/{id}/sync-operations` | As operações de sincronização da conta. |
| `listVariantPolicies`, `listVariantPoliciesAll` | `GET /v1/marketplace/accounts/{id}/variant-policies` | As variantes com folga própria nesta conta. |
| `pauseFoodStore` | `POST /v1/marketplace/accounts/{id}/store/pauses` | Pausa a loja agora, por alguns minutos. |
| `predictCategory` | `POST /v1/marketplace/accounts/{id}/categories/predict` | Pergunta ao provider em que categoria um título cai. |
| `pushSellableNow` | `POST /v1/marketplace/sellable/{variant_id}/push` | Reenvia o vendável de uma variação agora. |
| `queueDraft` | `POST /v1/marketplace/drafts/{id}/queue` | Põe o rascunho na fila. |
| `receiveWebhook` | `POST /v1/marketplace/webhooks/{provider}` (pública) | Recebe uma notificação do provider. **Sem sessão.** |
| `refetchOrder` | `POST /v1/marketplace/orders/{id}/refetch` | Enfileira a releitura do pedido no provider. |
| `refreshFoodStore` | `POST /v1/marketplace/accounts/{id}/store/refresh` | Relê agora o status e as pausas da loja no provider. |
| `reprocessSyncOperation` | `POST /v1/marketplace/sync-operations/{id}/reprocess` | Devolve uma operação `permanent_failed` para a fila. |
| `reprojectOrder` | `POST /v1/marketplace/orders/{id}/project` | Projeta o pedido em venda agora: reserva o estoque, cria e confirma a venda, gera os títulos contra o provider. |
| `resolveOrderLine` | `POST /v1/marketplace/orders/{id}/lines/{line_id}/resolve` | Aponta a variante do catálogo de uma linha sem vínculo. |
| `sendFoodCommand` | `POST /v1/marketplace/orders/{id}/food/commands` | Manda um comando da cozinha sobre o pedido de delivery. |
| `setFoodStoreConfirmMethod` | `PUT /v1/marketplace/accounts/{id}/store/confirm-method` | Troca como a loja aceita o pedido: no app da loja e pelo sistema, ou só pelo sistema. |
| `setFoodStoreHours` | `PUT /v1/marketplace/accounts/{id}/store/hours` | Troca a semana de horário da loja, inteira. |
| `setFoodStorePresence` | `PUT /v1/marketplace/accounts/{id}/store/presence` | Liga ou desliga a presença da loja. |
| `setVariantPolicy` | `PUT /v1/marketplace/accounts/{id}/variant-policies/{catalog_variant_id}` | Grava a folga própria de uma variante nesta conta. |
| `startAuthorization` | `POST /v1/marketplace/accounts/{id}/authorize` | Começa a autorização: devolve a URL do provider e o `state`. |
| `syncFoodFinance` | `POST /v1/marketplace/accounts/{id}/payouts/sync` | Lê agora o financeiro da loja no provider. |
| `unlinkVariant` | `DELETE /v1/marketplace/listings/{id}/variants/{variant_id}/link` | Desfaz o vínculo de uma variação. |
| `updateDraft` | `PUT /v1/marketplace/drafts/{id}` | Substitui um rascunho ainda não publicado. |
| `updateListing` | `PATCH /v1/marketplace/listings/{id}` | Altera um anúncio no provider: título, descrição, preço, status. |
| `updatePolicy` | `PUT /v1/marketplace/accounts/{id}/policy` | Substitui a política da conta. |
| `writeOffOrderResidue` | `POST /v1/marketplace/orders/{id}/residue/write-off` | Baixa como tarifa o resíduo aberto do repasse do pedido. |

## fz.marketplace.foodMenu

| Método | Rota | O que faz |
|---|---|---|
| `createFoodMenuSection` | `POST /v1/marketplace/accounts/{id}/menu/sections` | Cria uma seção. |
| `deleteFoodMenuSection` | `DELETE /v1/marketplace/accounts/{id}/menu/sections/{section_id}` | Apaga a seção. |
| `getFoodMenu` | `GET /v1/marketplace/accounts/{id}/menu` | O cardápio da loja. |
| `pushFoodMenu` | `POST /v1/marketplace/accounts/{id}/menu/push` | Pede o envio agora. |
| `setFoodMenuSectionItems` | `PUT /v1/marketplace/accounts/{id}/menu/sections/{section_id}/items` | Troca os pratos da seção. |
| `updateFoodMenuSection` | `PUT /v1/marketplace/accounts/{id}/menu/sections/{section_id}` | Troca nome, ordem e status. |

## fz.mfa

| Método | Rota | O que faz |
|---|---|---|
| `activateTotp` | `POST /v1/auth/mfa/activate-totp` | Authenticated route (Bearer token required). |
| `beginMfaPasskey` | `POST /v1/auth/mfa/passkey/begin` (pública) | Rota pública, passkey como segundo fator. |
| `confirmTotp` | `POST /v1/auth/mfa/confirm-totp` | Authenticated route (Bearer token required). |
| `confirmWhatsappMfa` | `POST /v1/auth/mfa/confirm-whatsapp` | Confere o código do cadastro e ativa o WhatsApp como fator. Código errado gasta o desafio: a tela pede outro código. |
| `deletePasskey` | `DELETE /v1/auth/passkeys/{passkey_id}` | Authenticated route; removes a passkey. |
| `disableMfaMethod` | `DELETE /v1/auth/mfa/{mfa_id}` | Rota autenticada; remove (soft) um método MFA. |
| `enrollTotp` | `POST /v1/auth/mfa/enroll-totp` | Authenticated route (Bearer token required). |
| `enrollWhatsappMfa` | `POST /v1/auth/mfa/enroll-whatsapp` | Começa o cadastro do WhatsApp como fator. |
| `finishMfaPasskey` | `POST /v1/auth/mfa/passkey/finish` (pública) | Rota pública, conclui a passkey do 2FA. |
| `generateRecoveryCodes` | `POST /v1/auth/mfa/recovery-codes` | Rota autenticada; gera um lote novo. |
| `getSecurityOverview` | `GET /v1/auth/mfa` | Rota autenticada; visão geral de segurança da conta. |
| `issueMfaChallenge` | `POST /v1/auth/mfa/challenge` (pública) | Rota pública, troca o canal do desafio. |
| `listMfaMethods` | `POST /v1/auth/mfa/methods` (pública) | Rota pública, "Tentar de outra forma" no 2FA. |
| `verifyMfa` | `POST /v1/auth/mfa/verify` (pública) | Public route; verifies the TOTP code and issues a full session. |

## fz.notify

| Método | Rota | O que faz |
|---|---|---|
| `archiveItem` | `POST /v1/notify/items/{id}/archive` | Arquiva (soft-delete) um item do inbox. |
| `getBadge` | `GET /v1/notify/badge` | Contador do usuário corrente - **fallback** de quem não tem requisição em que pegar carona (o caminho normal é o header `X-Fz-Notify-*`). |
| `getPreferences` | `GET /v1/notify/preferences` | O tique de fallback T3. |
| `getPushPreferences` | `GET /v1/notify/push-preferences` | Preferências de push por tipo do usuário corrente. Mesmo formato e mesmo opt-out das do sininho; silenciar o tipo no sininho já silencia o push. |
| `listInbox`, `listInboxAll` | `GET /v1/notify/inbox` | Lista o inbox do usuário corrente (keyset + janela visível de 7 dias). |
| `markAllRead` | `POST /v1/notify/read-all` | Marca como **lidos** todos os itens do usuário. |
| `markAllSeen` | `POST /v1/notify/seen` | Marca tudo como **visto** (zera o badge). |
| `markRead` | `POST /v1/notify/items/{id}/read` | Marca um item como lido. |
| `ping` | `GET /v1/notify/ping` | Tique de fallback do sininho. |
| `registerPushDevice` | `PUT /v1/notify/push-devices` | Registra ou renova o aparelho da sessão para o push. |
| `removePushDevice` | `DELETE /v1/notify/push-devices/{token}` | Tira o aparelho do usuário corrente. Idempotente, para o "Sair" nunca falhar por causa do push. |
| `setPreference` | `PUT /v1/notify/preferences/{event_type}` | Silencia (ou reativa) um tipo de evento para o usuário corrente. |
| `setPushPreference` | `PUT /v1/notify/push-preferences/{event_type}` | Silencia (ou reativa) o push de um tipo sem mexer no sininho. |

## fz.oauth

| Método | Rota | O que faz |
|---|---|---|
| `callback` | `POST /v1/auth/oauth/callback` (pública) | Public route; processes the OAuth 2.0 callback. |
| `handoff` | `POST /v1/auth/oauth/handoff` (pública) | Rota pública; troca, no domínio próprio, o código de uso único do login social pela sessão. |
| `initiate` | `POST /v1/auth/oauth/initiate` (pública) | Public route; starts the OAuth 2.0 authorization flow. |
| `linkCallback` | `POST /v1/auth/oauth/link/callback` | Authenticated route; completes OAuth account linking. |
| `linkInitiate` | `POST /v1/auth/oauth/link/initiate` | Authenticated route; starts OAuth account linking. |
| `unlinkOauthIdentity` | `DELETE /v1/auth/oauth/identities/{identity_id}` | Rota autenticada; desvincula uma conta de terceiro (Google, GitHub, Microsoft) do próprio usuário. |

## fz.passkeys

| Método | Rota | O que faz |
|---|---|---|
| `beginPasskeyAuthentication` | `POST /v1/auth/passkeys/login/begin` (pública) | Public route (no session required). |
| `beginPasskeyRegistration` | `POST /v1/auth/passkeys/register/begin` | Authenticated route (Bearer token required). |
| `finishPasskeyAuthentication` | `POST /v1/auth/passkeys/login/finish` (pública) | Public route (no session required). |
| `finishPasskeyRegistration` | `POST /v1/auth/passkeys/register/finish` | Authenticated route (Bearer token required). |

## fz.pay.accounting

| Método | Rota | O que faz |
|---|---|---|
| `balanceSheet` | `GET /v1/pay/accounting/balance-sheet` | Balanço patrimonial numa data. |
| `incomeStatement` | `GET /v1/pay/accounting/income-statement` | DRE gerencial com EBITDA de até 12 meses. |
| `listDreClasses` | `GET /v1/pay/accounting/dre-classes` | Plano de contas com a classe da DRE gravada e a efetiva de cada conta. |
| `setDreClass` | `PUT /v1/pay/accounting/dre-classes/{account_id}` | Grava ou limpa a classe da DRE de uma conta; devolve o plano como ficou. |
| `workingCapital` | `GET /v1/pay/accounting/working-capital` | Capital de giro com a NCG por finalidade, estoque e operação. |

## fz.pay.acquiring

| Método | Rota | O que faz |
|---|---|---|
| `accountSession` | `POST /v1/pay/recipients/{id}/account-session` | Abre a sessão de **componentes embarcados** da sub-conta. |
| `acquirerReceivables` | `GET /v1/pay/acquirer-receivables` | Mostra onde está o dinheiro do lojista, por adquirente. |
| `amounts` | `GET /v1/pay/sandbox/amounts` | Tabela `centavos → desfecho` dos métodos assíncronos. |
| `anticipateReceivable` | `POST /v1/pay/card-receivables/{id}/anticipate` | Antecipa uma parcela do cronograma de recebíveis de cartão: recebe o dinheiro no próximo dia útil em vez de esperar o prazo do adquirente. |
| `bump` | `POST /v1/pay/split-profiles/{id}/versions` | Versiona um perfil: cria uma nova versão imutável (vN+1) e a torna ativa. |
| `cancelCardIntentPublic` | `POST /v1/pay/public/card-intents/{token}/cancel` (pública) | O pagador desistiu na página. **Sem sessão.** |
| `capture` | `POST /v1/pay/charges/{id}/capture` | Captura (total ou parcial) uma cobrança de cartão **pré-autorizada**. |
| `cardIntentCardKeyPublic` | `GET /v1/pay/public/card-intents/{token}/card-key` (pública) | A chave com que a página tokeniza o cartão. **Sem sessão.** |
| `cardKeyPublic` | `GET /v1/pay/public/links/{token}/card-key` (pública) | A chave com que o navegador tokeniza o cartão. **Sem sessão**. |
| `cardPublicKey` | `GET /v1/pay/acquiring/card-public-key` | Chave PÚBLICA do PSP roteado - o navegador tokeniza o cartão direto no PSP com ela; o PAN nunca passa pelo Ferrazio (PCI). |
| `cards` | `GET /v1/pay/sandbox/cards` | Catálogo de cartões de teste e a tabela de cenários. |
| `completeCardIntentPublic` | `POST /v1/pay/public/card-intents/{token}/complete` (pública) | Conclui o intent com o token do adquirente. **Sem sessão.** |
| `confirm` | `POST /v1/pay/saved-cards/{id}/confirm` | Confirma o desfecho do desafio 3-D Secure. |
| `confirmCardIntentPublic` | `POST /v1/pay/public/card-intents/{token}/confirm` (pública) | Confirma o intent depois do desafio 3-D Secure. **Sem sessão.** |
| `createCardIntent` | `POST /v1/pay/card-intents` | Cria o intent de cartão. |
| `createCharge` | `POST /v1/pay/charges` | Cria uma cobrança (cash-in) num PSP e devolve o instrumento de pagamento. |
| `createPaymentLink` | `POST /v1/pay/payment-links` | Publica o link de pagamento de um título a receber. |
| `createRecipient` | `POST /v1/pay/recipients` | Cadastra o recipient/sub-conta do beneficiário num adquirente. |
| `createSplitProfile` | `POST /v1/pay/split-profiles` | Cria um perfil de split (versão 1, ativa). |
| `getCardIntent` | `GET /v1/pay/card-intents/{id}` | Estado do intent, relido pelo app ao voltar do navegador. |
| `getCharge` | `GET /v1/pay/charges/{id}` | Consulta uma cobrança por id - polling de status do checkout síncrono. |
| `getPayout` | `GET /v1/pay/payouts/{id}` | Lê um saque, com o andamento de cada perna. |
| `getRecipient` | `GET /v1/pay/recipients/{id}` | Consulta um recipient por id (tenant-scoped, anti-enumeração). |
| `getSplitProfile` | `GET /v1/pay/split-profiles/{id}` | Recupera a versão ativa corrente de um perfil (tenant-scoped). |
| `getVersion` | `GET /v1/pay/split-profiles/{id}/versions/{version}` | Recupera uma versão exata de um perfil (a mesma fixada numa cobrança). |
| `ingest` | `POST /v1/psp/webhooks/{provider}` (pública) | Recebe um webhook **inbound** de PSP (`POST /v1/psp/webhooks/{provider}`) e o repassa cru ao `pay`, que verifica a assinatura HMAC e liquida a cobrança. |
| `installmentsPublic` | `GET /v1/pay/public/links/{token}/installments` (pública) | Parcelas do cartão para o que falta pagar. **Sem sessão**. |
| `issueToken` | `POST /v1/pay/sandbox/card-tokens` | Tokeniza um cartão de teste canônico. |
| `kycLink` | `POST /v1/pay/recipients/{id}/kyc-link` | Pede ao adquirente o link em que o recebedor faz a **prova de vida**. |
| `listCharges`, `listChargesAll` | `GET /v1/pay/charges` | Lista as cobranças por adquirente. |
| `listPayouts`, `listPayoutsAll` | `GET /v1/pay/payouts` | Lista os saques do escopo, mais novos primeiro. |
| `listReceivables`, `listReceivablesAll` | `GET /v1/pay/charges/{id}/receivables` | Lista o cronograma de recebíveis de uma cobrança de cartão: parcela, valores, data prevista de liberação e status. |
| `listRecipients`, `listRecipientsAll` | `GET /v1/pay/recipients` | Lista recipients do tenant (pipeline de onboarding) com paginação por cursor. |
| `listSavedCards`, `listSavedCardsAll` | `GET /v1/pay/saved-cards` | Lista os cartões salvos de um pagador. |
| `listSplitProfiles`, `listSplitProfilesAll` | `GET /v1/pay/split-profiles` | Lista perfis do tenant (versão ativa de cada um) com paginação por cursor. |
| `listVersions` | `GET /v1/pay/split-profiles/{id}/versions` | Lista o histórico de versões de um perfil (ordem decrescente de versão). |
| `migrate` | `POST /v1/pay/recipients/{id}/migrate` | Migra a sub-conta do lojista neste adquirente: aposenta a atual e instala uma nova. |
| `payPublic` | `POST /v1/pay/public/links/{token}/pay` (pública) | Emite o instrumento do método escolhido. **Sem sessão.** |
| `quote` | `GET /v1/pay/payouts/quote` | Cota o saque: o que cada adquirente pode sacar e de onde sai o valor. |
| `refresh` | `POST /v1/pay/recipients/{id}/refresh` | Re-consulta o status do recipient no PSP (polling do funil de KYC) e atualiza o registro - `active` destrava a emissão no provedor. |
| `refund` | `POST /v1/pay/charges/{id}/refund` | Estorna (total ou parcial) ou cancela (void de pré-autorização) uma cobrança de cartão. |
| `request` | `POST /v1/pay/payouts` | Pede o saque do saldo para a conta bancária. |
| `resolveCardIntentPublic` | `GET /v1/pay/public/card-intents/{token}` (pública) | Resolve o token do intent. **Sem sessão.** |
| `resolvePublic` | `GET /v1/pay/public/links/{token}` (pública) | Resolve o token do link e devolve o que há para pagar. **Sem sessão.** |
| `revokePaymentLink` | `POST /v1/pay/payment-links/{id}/revoke` | Tira o link do ar sem tocar no título. |
| `revokeSavedCard` | `POST /v1/pay/saved-cards/{id}/revoke` | Revoga um cartão salvo. |
| `save` | `POST /v1/pay/saved-cards` | Guarda um cartão no cofre do adquirente. |
| `setActive` | `POST /v1/pay/split-profiles/{id}/active` | Ativa/desativa uma versão específica de um perfil. |
| `simulateChargeback` | `POST /v1/pay/charges/{id}/simulate-chargeback` | `[DEV-ONLY]` Simula um chargeback (disputa perdida) - mesmo efeito do webhook real: recebíveis consumidos, perda na perna liable da plataforma. |
| `simulateOutcome` | `POST /v1/pay/charges/{id}/simulate-outcome` | `[DEV-ONLY]` Simula um desfecho NÃO-pago: `failed` (recusada pelo adquirente) ou `expired` (venceu sem pagamento). |
| `simulatePaid` | `POST /v1/pay/charges/{id}/simulate-paid` | `[DEV-ONLY]` Simula o pagamento de uma cobrança - fecha o loop do checkout PIX sem um PSP/banco real, reusando a MESMA liquidação do webhook de produção. |
| `simulateReceivablesRelease` | `POST /v1/pay/charges/{id}/simulate-receivables-release` | `[DEV-ONLY]` Libera TODOS os recebíveis pendentes da cobrança sem esperar o D+30 - fecha o loop de teste do cronograma (mesma rotina do job real). |

## fz.pay.approvalFlows

| Método | Rota | O que faz |
|---|---|---|
| `approvers` | `GET /v1/pay/approval-flows/{id}/approvers` | Resolve os aprovadores de um Fluxo de Aprovação (cargo → pessoas). |
| `create` | `POST /v1/pay/approval-flows` | Cria um Fluxo de Aprovação. |
| `deleteOne` | `DELETE /v1/pay/approval-flows/{id}` | Remove um Fluxo de Aprovação. |
| `list`, `listAll` | `GET /v1/pay/approval-flows` | Lista Fluxos de Aprovação do tenant com paginação por cursor. |
| `resolve` | `POST /v1/pay/approval-flows/resolve` | Resolve o Fluxo de Aprovação aplicável a um título. |
| `update` | `PATCH /v1/pay/approval-flows/{id}` | Edita um Fluxo de Aprovação **preservando o id** (MA16). Permissão `pay.aprovacoes.fluxo.update` aplicada na borda. |

## fz.pay.approvalInstances

| Método | Rota | O que faz |
|---|---|---|
| `decide` | `POST /v1/pay/approval-steps/{step_instance_id}/decide` | Registra uma decisão (approve/reject) numa etapa e avança a instância. |
| `getOne` | `GET /v1/pay/approval-instances/{id}` | Consulta uma instância de aprovação por id (com etapas e decisões). |
| `list`, `listAll` | `GET /v1/pay/approval-instances` | Lista instâncias de aprovação do tenant (mais recentes primeiro) com paginação por cursor e filtro opcional de status. |
| `submit` | `POST /v1/pay/approval-instances` | Submete um título a um Fluxo de Aprovação (cria a instância de execução). |

## fz.pay.bankAccounts

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/bank-accounts` | Cadastra uma Conta bancária. |
| `deleteOne` | `DELETE /v1/pay/bank-accounts/{id}` | Arquiva uma Conta bancária (soft-delete). |
| `list`, `listAll` | `GET /v1/pay/bank-accounts` | Lista Contas bancárias do tenant com paginação por cursor. |
| `update` | `PATCH /v1/pay/bank-accounts/{id}` | Atualiza uma Conta bancária (PATCH). |

## fz.pay.budgets

| Método | Rota | O que faz |
|---|---|---|
| `approve` | `POST /v1/pay/budgets/{id}/approve` | Aprova um rascunho com linhas. O aprovado anterior da mesma organização, ano e moeda vira arquivado na mesma transação. |
| `archive` | `POST /v1/pay/budgets/{id}/archive` | Arquiva um aprovado sem pôr outro no lugar. |
| `comparison` | `GET /v1/pay/budgets/{id}/comparison` | Orçado x realizado por mês de qualquer versão do orçamento. |
| `create` | `POST /v1/pay/budgets` | Cria um rascunho em branco, copiado de outro orçamento ou semeado pelo realizado de um ano com reajuste. |
| `deleteOne` | `DELETE /v1/pay/budgets/{id}` | Apaga um rascunho com as linhas. |
| `getOne` | `GET /v1/pay/budgets/{id}` | Um orçamento com todas as linhas. |
| `list`, `listAll` | `GET /v1/pay/budgets` | Orçamentos das organizações do escopo, do mais novo para o mais antigo. |
| `putLines` | `PUT /v1/pay/budgets/{id}/lines` | Troca todas as linhas de um rascunho. |
| `updateOne` | `PATCH /v1/pay/budgets/{id}` | Renomeia ou troca a observação de um rascunho. |

## fz.pay.businessUnits

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/business-units` | Cria uma Unidade de Negócio. |
| `deleteOne` | `DELETE /v1/pay/business-units/{id}` | Remove uma Unidade de Negócio. |
| `list`, `listAll` | `GET /v1/pay/business-units` | Lista Unidades de Negócio do tenant com paginação por cursor. |
| `update` | `PATCH /v1/pay/business-units/{id}` | Atualiza uma Unidade de Negócio (PATCH). |

## fz.pay.categories

| Método | Rota | O que faz |
|---|---|---|
| `category` | `GET /v1/pay/categories/suggestions` | Categoria (e centro de custo) pelo histórico da pessoa. |
| `create` | `POST /v1/pay/categories` | Cria uma Categoria de lançamento. |
| `deleteOne` | `DELETE /v1/pay/categories/{id}` | Remove uma Categoria. |
| `list`, `listAll` | `GET /v1/pay/categories` | Lista Categorias do tenant com paginação por cursor. |
| `update` | `PATCH /v1/pay/categories/{id}` | Atualiza uma Categoria (PATCH). |

## fz.pay.chargeInstructions

| Método | Rota | O que faz |
|---|---|---|
| `deleteOne` | `DELETE /v1/pay/charge-instructions/{id}` | Remove a Instrução de cobrança de uma forma de pagamento. O `{id}` da URL é a string da forma de cobrança (chave natural do upsert - não há Snowflake). Permissão `pay.configuracoes.instrucao-cobranca.manage` aplicada na borda. |
| `list`, `listAll` | `GET /v1/pay/charge-instructions` | Lista as Instruções de cobrança do escopo (uma por forma de pagamento). Permissão `pay.configuracoes.instrucao-cobranca.read` aplicada na borda. |
| `set` | `PUT /v1/pay/charge-instructions` | Grava (upsert) a Instrução de cobrança de uma forma de pagamento. Permissão `pay.configuracoes.instrucao-cobranca.manage` aplicada na borda. tenant_id injetado pelo gateway. |

## fz.pay.chargeTermsTemplates

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/charge-terms-templates` | Cria uma Condição de cobrança. Permissão `pay.configuracoes.condicoes-cobranca.manage` aplicada na borda. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/charge-terms-templates/{id}` | Remove uma Condição de cobrança. Cobrança já emitida **não** é afetada - as condições foram copiadas na emissão. Permissão `pay.configuracoes.condicoes-cobranca.manage`. |
| `getOne` | `GET /v1/pay/charge-terms-templates/{id}` | Lê uma Condição de cobrança por id (inclui as desativadas, para permitir reativar). Permissão `pay.configuracoes.condicoes-cobranca.read`. |
| `list`, `listAll` | `GET /v1/pay/charge-terms-templates` | Lista as Condições de cobrança do escopo (organização + tenant), ativas primeiro. Permissão `pay.configuracoes.condicoes-cobranca.read`. |
| `update` | `PATCH /v1/pay/charge-terms-templates/{id}` | Altera parcialmente uma Condição de cobrança. **Não** reescreve cobrança já emitida: os valores foram copiados na emissão. Permissão `pay.configuracoes.condicoes-cobranca.manage` aplicada na borda. |

## fz.pay.chartOfAccounts

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/chart-of-accounts` | Cria uma conta contábil no Plano de Contas. |
| `deleteOne` | `DELETE /v1/pay/chart-of-accounts/{id}` | Remove uma conta contábil via soft-delete. |
| `list`, `listAll` | `GET /v1/pay/chart-of-accounts` | Lista contas contábeis do Plano de Contas com paginação por cursor. |
| `seedDefault` | `POST /v1/pay/chart-of-accounts/seed-default` | Provisiona o Plano de Contas padrão do Ferrazio no escopo indicado. |
| `tree` | `GET /v1/pay/chart-of-accounts/tree` | Retorna a árvore completa do Plano de Contas em formato plano ordenado por `code`. |
| `update` | `PATCH /v1/pay/chart-of-accounts/{id}` | Atualiza parcialmente uma conta contábil (PATCH). |

## fz.pay.comments

| Método | Rota | O que faz |
|---|---|---|
| `createOnPayable` | `POST /v1/pay/payables/{id}/comments` | Cria um comentário num título a pagar. |
| `createOnReceivable` | `POST /v1/pay/receivables/{id}/comments` | Cria um comentário num título a receber. |
| `listOnPayable`, `listOnPayableAll` | `GET /v1/pay/payables/{id}/comments` | Lista comentários de um título a pagar (keyset-paginado). |
| `listOnReceivable`, `listOnReceivableAll` | `GET /v1/pay/receivables/{id}/comments` | Lista comentários de um título a receber (keyset-paginado). |
| `updateComment` | `PATCH /v1/pay/comments/{id}` | Edita o conteúdo de um comentário num título financeiro. |

## fz.pay.contracts

| Método | Rota | O que faz |
|---|---|---|
| `addItem` | `POST /v1/pay/contracts/{id}/items` | Inclui um item medível no contrato. |
| `applyReadjust` | `POST /v1/pay/contracts/{id}/readjust` | Aplica o reajuste de um aniversário que já chegou. |
| `approveMeasurement` | `POST /v1/pay/contracts/{id}/measurements/{measurement_id}/approve` | Aprova o boletim: congela o preço de cada linha e o total. |
| `create` | `POST /v1/pay/contracts` | Cria o contrato de uma assinatura. |
| `createMeasurement` | `POST /v1/pay/contracts/{id}/measurements` | Abre o boletim de um mês (um por mês), em rascunho. |
| `getMeasurement` | `GET /v1/pay/contracts/{id}/measurements/{measurement_id}` | Um boletim com as linhas e o total. |
| `getOne` | `GET /v1/pay/contracts/{id}` | Um contrato com itens e os últimos eventos. |
| `list`, `listAll` | `GET /v1/pay/contracts` | Contratos das organizações do escopo, do mais novo para o mais antigo. |
| `listMeasurements` | `GET /v1/pay/contracts/{id}/measurements` | Boletins de medição do contrato, sem as linhas. |
| `listRates` | `GET /v1/pay/index-rates` | Meses gravados de um índice (IPCA, IGP-M ou INPC) num intervalo. |
| `nonRenewal` | `POST /v1/pay/contracts/{id}/non-renewal` | Registra a não renovação do contrato. |
| `previewReadjust` | `POST /v1/pay/contracts/{id}/readjust/preview` | Calcula o reajuste do próximo aniversário sem gravar nada. |
| `putRates` | `PUT /v1/pay/index-rates` | Grava meses de um índice de reajuste (IPCA, IGP-M ou INPC). |
| `updateItem` | `PATCH /v1/pay/contracts/{id}/items/{item_id}` | Altera ou inativa um item do contrato. |
| `updateMeasurement` | `PUT /v1/pay/contracts/{id}/measurements/{measurement_id}` | Troca a observação e as linhas de um boletim em rascunho. |
| `updateOne` | `PUT /v1/pay/contracts/{id}` | Troca os termos do contrato (aditivo). |

## fz.pay.costCenters

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/cost-centers` | Cria um Centro de Custo. |
| `deleteOne` | `DELETE /v1/pay/cost-centers/{id}` | Remove um Centro de Custo via soft-delete. |
| `list`, `listAll` | `GET /v1/pay/cost-centers` | Lista Centros de Custo do tenant com paginação por cursor. |
| `tree` | `GET /v1/pay/cost-centers/tree` | Retorna a árvore completa de Centros de Custo em formato plano ordenado por `code`. |
| `update` | `PATCH /v1/pay/cost-centers/{id}` | Atualiza o nome de um Centro de Custo (PATCH). |

## fz.pay.creditPolicy

| Método | Rota | O que faz |
|---|---|---|
| `get` | `GET /v1/pay/credit-policy` | Consulta a Política de crédito do escopo. `found=false` = sem política (sem trava). Requer `pay.configuracoes.politica-credito.read`. |
| `set` | `PUT /v1/pay/credit-policy` | Define (upsert) a Política de crédito do escopo. Requer `pay.configuracoes.politica-credito.manage`. tenant_id injetado pelo gateway. |

## fz.pay.dashboards

| Método | Rota | O que faz |
|---|---|---|
| `cashCycle` | `GET /v1/pay/dashboards/cash-cycle` | Ciclo financeiro - PMR, PMP e a diferenca entre eles. |
| `cashFlowForecast` | `GET /v1/pay/dashboards/cash-flow-forecast` | Fluxo de Caixa Previsto (AR/AP em aberto, próximos N dias). |
| `cashFlowRealized` | `GET /v1/pay/dashboards/cash-flow-realized` | Fluxo de Caixa Realizado (janela ≤ 31 dias). |
| `dreCurrent` | `GET /v1/pay/dashboards/dre-current` | DRE simples do mês corrente (revenue − expense = result). |
| `payablesAging` | `GET /v1/pay/dashboards/payables-aging` | Aging Report de Contas a Pagar (envelhecimento do AP em aberto). |
| `position` | `GET /v1/pay/dashboards/position` | Snapshot de posição financeira (caixa + AR aberto + AP aberto = líquido). |
| `receivablesAging` | `GET /v1/pay/dashboards/receivables-aging` | Aging Report de Contas a Receber (envelhecimento do AR em aberto). |

## fz.pay.debts

| Método | Rota | O que faz |
|---|---|---|
| `cancel` | `POST /v1/pay/debts/{id}/cancel` | Cancela um contrato sem título vivo (nenhum gerado, ou todos cancelados). |
| `create` | `POST /v1/pay/debts` | Cadastra um contrato e grava o cronograma (nenhum título nasce aqui). |
| `generatePayables` | `POST /v1/pay/debts/{id}/payables` | Gera os títulos a pagar (amortização e juros) das parcelas que vencem até `through`; parcela com título vivo fica como está, título cancelado é substituído. |
| `getOne` | `GET /v1/pay/debts/{id}` | Lê um contrato com as parcelas e a posição de hoje. |
| `list`, `listAll` | `GET /v1/pay/debts` | Lista os contratos da sessão (mais novos primeiro). |
| `portfolio` | `GET /v1/pay/debts/portfolio` | Posição consolidada de uma moeda: saldo devedor, custo médio ponderado da dívida e, com o capital próprio informado, o WACC. |
| `simulate` | `POST /v1/pay/debts/simulate` | Cronograma de um contrato sem gravar nada. |
| `updateTerm` | `PUT /v1/pay/debts/{id}/term` | Troca o prazo (parcelas e primeiro vencimento) e refaz o cronograma com o mesmo principal, taxa e sistema. |

## fz.pay.financialAccounts

| Método | Rota | O que faz |
|---|---|---|
| `close` | `DELETE /v1/pay/financial-accounts/{id}` | Fecha uma conta gráfica (transição para status `closed`). |
| `create` | `POST /v1/pay/financial-accounts` | Cria uma nova conta gráfica financeira. |
| `getOne` | `GET /v1/pay/financial-accounts/{id}` | Recupera uma conta gráfica pelo Snowflake. |
| `list`, `listAll` | `GET /v1/pay/financial-accounts` | Lista contas gráficas do tenant com paginação por cursor (keyset). |
| `update` | `PATCH /v1/pay/financial-accounts/{id}` | Atualiza parcialmente uma conta gráfica (PATCH). |

## fz.pay.financialSettings

| Método | Rota | O que faz |
|---|---|---|
| `deleteDiscount` | `DELETE /v1/pay/financial-settings/method-discounts` | Remove o desconto de um meio de pagamento. |
| `deletePin` | `DELETE /v1/pay/financial-settings/acquirer-pins` | Remove a fixação de um adquirente. |
| `get` | `GET /v1/pay/financial-settings` | Consulta a Configuração financeira de atraso resolvida para o escopo (org→tenant). `found = false` quando nenhum escopo tem configuração. Permissão `pay.configuracoes.config-financeira.read` aplicada na borda. |
| `getPolicy` | `GET /v1/pay/financial-settings/installments` | Lê a política de parcelamento do escopo e a que vale nas vendas. |
| `listAcquiringOptions` | `GET /v1/pay/financial-settings/acquiring-options` | Lista os adquirentes que o lojista pode escolher para o método, com a tarifa de cada um - escolher adquirente é escolher custo, então o preço vem junto. Permissão `pay.configuracoes.config-financeira.read`. |
| `listDiscounts` | `GET /v1/pay/financial-settings/method-discounts` | Lê o desconto por meio de pagamento do escopo e o que vale nas vendas. |
| `listPins` | `GET /v1/pay/financial-settings/acquirer-pins` | Lista os adquirentes fixados no escopo. |
| `quote` | `GET /v1/pay/financial-settings/installments/quote` | Cota as opções de parcelamento de uma venda no cartão. |
| `set` | `PUT /v1/pay/financial-settings` | Grava (upsert) a Configuração financeira de atraso do escopo - override da organização sobre o tenant. Permissão `pay.configuracoes.config-financeira.manage` aplicada na borda. tenant_id injetado pelo gateway. |
| `setDiscount` | `PUT /v1/pay/financial-settings/method-discounts` | Grava o desconto de um meio de pagamento. |
| `setPin` | `PUT /v1/pay/financial-settings/acquirer-pins` | Fixa um adquirente para um método e modalidade. |
| `setPolicy` | `PUT /v1/pay/financial-settings/installments` | Grava a política de parcelamento do escopo. |

## fz.pay.fiscalDispatch

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/fiscal-dispatch-schedules` | Cria uma Agenda de envio ao contador. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/fiscal-dispatch-schedules/{id}` | Remove uma Agenda de envio ao contador. |
| `list`, `listAll` | `GET /v1/pay/fiscal-dispatch-schedules` | Lista Agendas de envio do tenant com paginação por cursor. |

## fz.pay.fiscalPeriods

| Método | Rota | O que faz |
|---|---|---|
| `close` | `POST /v1/pay/fiscal-periods/close` | Fecha a competência de um mês para a organização (upsert idempotente). |
| `closeRange` | `POST /v1/pay/fiscal-periods/range` | Fecha a competência de um intervalo de datas arbitrário (período flexível). |
| `list`, `listAll` | `GET /v1/pay/fiscal-periods` | Lista períodos fiscais do escopo com paginação por cursor (mais recentes primeiro). |
| `reopen` | `POST /v1/pay/fiscal-periods/reopen` | Reabre um período fechado, mensal ou por intervalo (permissão restrita, RBAC). |

## fz.pay.fiscalPlans

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/fiscal-plans` | Cria um Plano fiscal. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/fiscal-plans/{id}` | Remove um Plano fiscal. |
| `list`, `listAll` | `GET /v1/pay/fiscal-plans` | Lista Planos fiscais do tenant com paginação por cursor. |

## fz.pay.fixedAssets

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/fixed-assets` | Cadastra um bem. Não lança a aquisição. |
| `deleteOne` | `DELETE /v1/pay/fixed-assets/{id}` | Apaga um bem que ainda não tem mês lançado. |
| `dispose` | `POST /v1/pay/fixed-assets/{id}/dispose` | Baixa um bem: lança os meses que faltam e leva o valor contábil restante para a conta de despesa informada. |
| `getOne` | `GET /v1/pay/fixed-assets/{id}` | Um bem com os meses lançados. |
| `list`, `listAll` | `GET /v1/pay/fixed-assets` | Lista os bens, mais novos primeiro. |
| `runDepreciation` | `POST /v1/pay/fixed-assets/depreciation-runs` | Lança a depreciação pendente de todos os bens ativos até o mês pedido. Repetir não duplica; período fechado vira `skipped`. |
| `update` | `PATCH /v1/pay/fixed-assets/{id}` | Edita um bem. Cronograma só antes do primeiro mês lançado. |

## fz.pay.holding

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/socio-payments` | Cria um Pagamento a sócio. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/socio-payments/{id}` | Remove um Pagamento a sócio. |
| `list`, `listAll` | `GET /v1/pay/socio-payments` | Lista Pagamentos a sócio do tenant com paginação por cursor. |

## fz.pay.ledger

| Método | Rota | O que faz |
|---|---|---|
| `getOperation` | `GET /v1/pay/operations/{id}` | Detalhe completo de uma operação - todas as pernas (inclui wallets externas). |
| `listOperations`, `listOperationsAll` | `GET /v1/pay/operations` | Lista as operações financeiras do tenant com paginação por cursor e filtros. |
| `postOperation` | `POST /v1/pay/operations` | Lança uma operação financeira no ledger de dupla entrada. |
| `reverseOperation` | `POST /v1/pay/operations/{id}/reverse` | Estorna uma operação financeira existente. |
| `systemTotals` | `GET /v1/pay/system-totals` | Retorna o total de entradas, saídas e saldo líquido por moeda no tenant. |
| `walletStatement`, `walletStatementAll` | `GET /v1/pay/wallets/{wallet_id}/statement` | Retorna o extrato (lançamentos com saldo corrente) de uma wallet, paginado por cursor. |

## fz.pay.partyTerms

| Método | Rota | O que faz |
|---|---|---|
| `deleteOne` | `DELETE /v1/pay/party-terms/{person_id}` | Apaga a ficha do escopo; a da empresa volta a valer, se houver. |
| `getOne` | `GET /v1/pay/party-terms/{person_id}` | A ficha que vale para a pessoa e a posição de crédito dela. |
| `list`, `listAll` | `GET /v1/pay/party-terms` | Fichas que valem no escopo, uma por pessoa, em ordem de pessoa. |
| `putOne` | `PUT /v1/pay/party-terms/{person_id}` | Grava a ficha da pessoa no escopo, trocando a anterior inteira. |

## fz.pay.payables

| Método | Rota | O que faz |
|---|---|---|
| `applyCharges` | `POST /v1/pay/payables/{id}/apply-charges` | Aplica encargos (multa/juros/desconto) a um título a pagar. |
| `attach` | `POST /v1/pay/payables/{id}/attachments` | Linka (idempotente) um arquivo do cofre a um título a pagar. |
| `cancel` | `POST /v1/pay/payables/{id}/cancel` | Cancela um título a pagar (transição para status `canceled`). |
| `create` | `POST /v1/pay/payables` | Cria um novo título a pagar com status inicial `open`. |
| `createSeries` | `POST /v1/pay/payables/series` | Cria uma série de pagamentos recorrente: N títulos a pagar de valor fixo. |
| `detach` | `DELETE /v1/pay/attachments/{id}` | Desvincula (hard-delete do link) um anexo - não toca o blob no cofre. |
| `getAllocations`, `getAllocationsAll` | `GET /v1/pay/payables/{id}/allocations` | Lê o plano de rateio de um título a pagar (keyset-paginado). |
| `getOne` | `GET /v1/pay/payables/{id}` | Recupera um título a pagar pelo Snowflake (tenant-scoped). |
| `importOpen` | `POST /v1/pay/payables/import` | Títulos a pagar em aberto de uma planilha. |
| `installmentPlan` | `POST /v1/pay/payables/installment-plan` | Cria N parcelas de um título a pagar numa única transação. |
| `list`, `listAll` | `GET /v1/pay/payables` | Lista títulos a pagar do tenant com paginação por cursor. |
| `listAttachments`, `listAttachmentsAll` | `GET /v1/pay/payables/{id}/attachments` | Lista os anexos de um título a pagar (keyset-paginado). |
| `previewInstallment` | `POST /v1/pay/installments/preview` | Pré-visualiza o plano de parcelas (não persiste). Permite à UI editar antes de salvar. |
| `setAllocations` | `PUT /v1/pay/payables/{id}/allocations` | Define/substitui (replace-whole-set) o rateio de um título a pagar. |
| `settle` | `POST /v1/pay/payables/{id}/settle` | Realiza a baixa (pagamento) de um título a pagar. |
| `summary` | `GET /v1/pay/payables/summary` | Resumo da lista de títulos a pagar: contagem por status (base das abas) e saldo em aberto por moeda, contados no servidor. |
| `update` | `PATCH /v1/pay/payables/{id}` | Atualiza parcialmente um título a pagar (PATCH). |
| `updateSeries` | `POST /v1/pay/payables/{id}/series` | Atualiza em lote parcelas `open`/`overdue` da mesma série. |

## fz.pay.paymentConditions

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/payment-conditions` | Cria uma Condição de pagamento. Permissão `pay.configuracoes.condicao-pagamento.create` aplicada na borda. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/payment-conditions/{id}` | Remove uma Condição de pagamento. Permissão `pay.configuracoes.condicao-pagamento.delete` aplicada na borda. |
| `list`, `listAll` | `GET /v1/pay/payment-conditions` | Lista Condições de pagamento do tenant com paginação por cursor. Permissão `pay.configuracoes.condicao-pagamento.read` aplicada na borda. |
| `update` | `PATCH /v1/pay/payment-conditions/{id}` | Edita uma Condição de pagamento **preservando o id** (MA02). Permissão `pay.configuracoes.condicao-pagamento.update` aplicada na borda. |

## fz.pay.portal

| Método | Rota | O que faz |
|---|---|---|
| `addPortalSubscriptionCard` | `POST /v1/pay/public/portal/subscriptions/{id}/cards` (pública) | Um cartão **novo** passa a pagar os próximos ciclos. |
| `closePortalSession` | `POST /v1/pay/public/portal/logout` (pública) | Fecha a sessão do portal. **Sem sessão de operador**: o portão é o token. |
| `confirmPortalAccess` | `POST /v1/pay/public/portal/access/verify` (pública) | Passo 2: o código confere e a sessão nasce, com escopo `manage`. |
| `confirmPortalContactChange` | `PUT /v1/pay/public/portal/contact` (pública) | Passo 2: o código confere, o canal troca e o endereço **antigo** é avisado. |
| `exchangePortalTicket` | `POST /v1/pay/portal/handoff/{ticket}` | Troca o bilhete pela sessão do portal. **Servidor-a-servidor**. |
| `getPortalAccount` | `GET /v1/pay/public/portal/account` (pública) | A conta que a sessão do portal abre. |
| `getPortalSettings` | `GET /v1/pay/portal/settings` | Lê o opt-in do portal deste tenant. |
| `issuePortalPowChallenge` | `POST /v1/pay/public/portal/challenge` (pública) | Emite o desafio de prova de trabalho da entrada do portal. **Sem sessão.** |
| `issuePortalTicket` | `POST /v1/pay/portal/tickets` | Emite o bilhete que abre o portal de **uma** pessoa. |
| `portalSubscriptionCardKey` | `GET /v1/pay/public/portal/subscriptions/{id}/card-key` (pública) | Publica a chave com que o navegador tokeniza um cartão **novo**. |
| `requestPortalAccess` | `POST /v1/pay/public/portal/access` (pública) | Passo 1 da entrada por posse: manda o código ao e-mail do **cadastro**. |
| `requestPortalCancellation` | `POST /v1/pay/public/portal/subscriptions/{id}/cancellation` (pública) | O assinante pede para sair. |
| `requestPortalContactChange` | `POST /v1/pay/public/portal/contact/step-up` (pública) | Passo 1 da troca de e-mail ou telefone: manda o código ao canal **antigo**. |
| `revokePortalCancellation` | `DELETE /v1/pay/public/portal/subscriptions/{id}/cancellation` (pública) | Ele mudou de ideia antes da data. |
| `setPortalSettings` | `PUT /v1/pay/portal/settings` | Liga ou desliga o portal deste tenant. |
| `setPortalSubscriptionPaymentMethod` | `PUT /v1/pay/public/portal/subscriptions/{id}/payment-method` (pública) | Outro meio, ou outro cartão salvo dele, passa a pagar os próximos ciclos. |
| `setPortalSubscriptionReminders` | `PUT /v1/pay/public/portal/subscriptions/{id}/reminders` (pública) | Liga ou desliga o lembrete de pagamento da assinatura, por canal. |
| `updatePortalProfile` | `PUT /v1/pay/public/portal/profile` (pública) | Corrige **nome e endereço** do cadastro. |

## fz.pay.profitCenters

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/profit-centers` | Cria um centro. |
| `deleteOne` | `DELETE /v1/pay/profit-centers/{id}` | Apaga (soft-delete); o passado continua atribuído ao centro. |
| `getCostCenterOrigin` | `GET /v1/pay/cost-centers/{id}/profit-center` | Centro de lucro de origem de um centro de custo. |
| `getOne` | `GET /v1/pay/profit-centers/{id}` | Lê um centro. |
| `getReceivableCenter` | `GET /v1/pay/receivables/{id}/profit-center` | Centro de lucro de um título a receber. |
| `links` | `GET /v1/pay/profit-centers/{id}/links` | O que o centro junta: centros de custo de origem e títulos ligados. |
| `list`, `listAll` | `GET /v1/pay/profit-centers` | Lista os centros do escopo (os da organização e os compartilhados). |
| `result` | `GET /v1/pay/profit-centers/result` | DRE aberta por centro de lucro, numa janela de competência de até 366 dias. |
| `setCostCenterOrigin` | `PUT /v1/pay/cost-centers/{id}/profit-center` | Troca o centro de lucro de origem de um centro de custo. Vale para o passado: os lançamentos já feitos com o centro de custo passam a contar para o centro de lucro novo. |
| `setReceivableCenter` | `PUT /v1/pay/receivables/{id}/profit-center` | Liga um título a receber a um centro de lucro; vence o vínculo do centro de custo e vale para a baixa já feita. |
| `tree` | `GET /v1/pay/profit-centers/tree` | A árvore inteira do escopo, em ordem de código. |
| `updateOne` | `PATCH /v1/pay/profit-centers/{id}` | Renomeia ou troca o ID personalizado (o código é imutável). |

## fz.pay.providers

| Método | Rota | O que faz |
|---|---|---|
| `list`, `listAll` | `GET /v1/pay/providers` | Lista os adquirentes do catálogo global com paginação por cursor. |
| `listCurrencies`, `listCurrenciesAll` | `GET /v1/pay/providers/{provider_id}/currencies` | Lista as moedas habilitadas para um adquirente com paginação por cursor. |

## fz.pay.receivables

| Método | Rota | O que faz |
|---|---|---|
| `applyInterestFine` | `POST /v1/pay/receivables/{id}/interest-fine` | Aplica encargos (juros, multa, desconto) a um título a receber. |
| `attach` | `POST /v1/pay/receivables/{id}/attachments` | Linka (idempotente) um arquivo do cofre a um título a receber. |
| `cancel` | `POST /v1/pay/receivables/{id}/cancel` | Cancela um título a receber (transição para status `canceled`). |
| `create` | `POST /v1/pay/receivables` | Cria um novo título a receber com status inicial `open`. |
| `createSeries` | `POST /v1/pay/receivables/series` | Cria uma série de cobranças recorrente: N títulos a receber de valor fixo. |
| `getAllocations`, `getAllocationsAll` | `GET /v1/pay/receivables/{id}/allocations` | Lê o plano de rateio de um título a receber (keyset-paginado). |
| `getOne` | `GET /v1/pay/receivables/{id}` | Recupera um título a receber pelo Snowflake (tenant-scoped). |
| `importOpen` | `POST /v1/pay/receivables/import` | Títulos a receber em aberto de uma planilha. |
| `installmentPlan` | `POST /v1/pay/receivables/installment-plan` | Cria N parcelas de um título a receber numa única transação. |
| `list`, `listAll` | `GET /v1/pay/receivables` | Lista títulos a receber do tenant com paginação por cursor. |
| `listAttachments`, `listAttachmentsAll` | `GET /v1/pay/receivables/{id}/attachments` | Lista os anexos de um título a receber (keyset-paginado). |
| `refund` | `POST /v1/pay/receivables/{id}/refund` | Estorna (devolve) um título a receber já pago. |
| `setAllocations` | `PUT /v1/pay/receivables/{id}/allocations` | Define/substitui (replace-whole-set) o rateio de um título a receber. |
| `settle` | `POST /v1/pay/receivables/{id}/settle` | Realiza a baixa (pagamento) de um título a receber. |
| `summary` | `GET /v1/pay/receivables/summary` | Resumo da lista de títulos a receber: contagem por status e saldo em aberto por moeda, contados no servidor. |
| `update` | `PATCH /v1/pay/receivables/{id}` | Atualiza parcialmente um título a receber (PATCH). |
| `updateSeries` | `POST /v1/pay/receivables/{id}/series` | Atualiza em lote parcelas `open`/`overdue` da mesma série. |

## fz.pay.reconciliation

| Método | Rota | O que faz |
|---|---|---|
| `dashboard` | `GET /v1/pay/reconciliations/dashboard` | Retorna o sumário do estado de conciliação bancária por período. |
| `import` | `POST /v1/pay/bank-statement-lines` | Importa linhas de extrato bancário para conciliação. |
| `importFile` | `POST /v1/pay/bank-statement-files` | Importa o arquivo de extrato do banco. |
| `list`, `listAll` | `GET /v1/pay/reconciliations` | Lista conciliações bancárias do tenant com paginação por cursor. |
| `listLines`, `listLinesAll` | `GET /v1/pay/bank-statement-lines` | Lista linhas de extrato bancário importadas com paginação por cursor. |
| `matchReconciliation` | `POST /v1/pay/reconciliations` | Cria uma conciliação vinculando linha de extrato a lançamento interno. |
| `reconciliation` | `GET /v1/pay/bank-statement-lines/{id}/suggestions` | Lançamentos do razão que podem ser o par de uma linha do extrato. |
| `unmatch` | `DELETE /v1/pay/reconciliations/{id}` | Remove uma conciliação bancária (desvincular linha de extrato e lançamento). |

## fz.pay.recorrencia

| Método | Rota | O que faz |
|---|---|---|
| `changeSubscriptionPlan` | `PATCH /v1/pay/recurrence/subscriptions/{id}/plan` | Move a assinatura para outro plano. |
| `createPlan` | `POST /v1/pay/recurrence/plans` | Cria um plano de recorrência. |
| `listPlans`, `listPlansAll` | `GET /v1/pay/recurrence/plans` | Lista planos de recorrência. |
| `listSubscriptions`, `listSubscriptionsAll` | `GET /v1/pay/recurrence/subscriptions` | Lista assinaturas. |
| `requestSubscriptionCancellation` | `POST /v1/pay/recurrence/subscriptions/{id}/cancellation` | Registra o pedido de cancelamento do assinante. |
| `revokeSubscriptionCancellation` | `DELETE /v1/pay/recurrence/subscriptions/{id}/cancellation` | Desfaz o pedido de cancelamento - o cliente reativou a tempo. |
| `setPlanReminders` | `PATCH /v1/pay/recurrence/plans/{id}/reminders` | Troca a régua de aviso de um plano vivo. |
| `setSubscriptionPaymentMethod` | `PATCH /v1/pay/recurrence/subscriptions/{id}/payment-method` | Troca o método que paga os ciclos de uma assinatura. |
| `setSubscriptionReminders` | `PATCH /v1/pay/recurrence/subscriptions/{id}/reminders` | Grava em quais canais o assinante aceita lembrete de pagamento, a pedido dele. |
| `setSubscriptionStatus` | `PATCH /v1/pay/recurrence/subscriptions/{id}/status` | Pausa, retoma ou cancela uma assinatura. |
| `simulatePlanSchedule` | `POST /v1/pay/recurrence/plans/simulate` | Simula a agenda de cobrança de uma adesão. |
| `subscribe` | `POST /v1/pay/recurrence/subscriptions` | Adere um pagador a um plano de recorrência (cria a assinatura). |

## fz.pay.rolePaymentLimits

| Método | Rota | O que faz |
|---|---|---|
| `deleteOne` | `DELETE /v1/pay/role-payment-limits/{role_id}` | Remove a alçada de pagamento de um cargo no escopo. Requer `pay.configuracoes.alcada.manage`. |
| `list`, `listAll` | `GET /v1/pay/role-payment-limits` | Lista as alçadas de pagamento configuradas no escopo, com paginação por cursor. Requer `pay.configuracoes.alcada.read`. |
| `set` | `PUT /v1/pay/role-payment-limits` | Define (upsert por `role_id`) a alçada de pagamento de um cargo. Requer `pay.configuracoes.alcada.manage`. tenant_id injetado pelo gateway. |

## fz.pay.taxCalendar

| Método | Rota | O que faz |
|---|---|---|
| `createRule` | `POST /v1/pay/tax-obligation-rules` | Cria uma regra própria da organização (até 50). |
| `deleteRule` | `DELETE /v1/pay/tax-obligation-rules/{id}` | Apaga uma regra própria e as ocorrências em aberto dela. Regra do catálogo não sai: desligue com `active = false`. |
| `getOne` | `GET /v1/pay/tax-obligations/{id}` | Uma ocorrência do calendário. |
| `list`, `listAll` | `GET /v1/pay/tax-obligations` | Calendário de obrigações da organização numa janela de até dois anos, em ordem de vencimento. Gera na hora as ocorrências que faltam. |
| `listRules` | `GET /v1/pay/tax-obligation-rules` | Regras de vencimento da organização: as do catálogo do regime e as próprias, com o próximo vencimento de cada. |
| `updateOne` | `PATCH /v1/pay/tax-obligations/{id}` | Marca a ocorrência como paga, dispensada ou de volta em aberto, e grava valor e observação. |
| `updateRule` | `PUT /v1/pay/tax-obligation-rules/{id}` | Edita uma regra, do catálogo ou própria. Editar a do catálogo a dá por conferida; as ocorrências em aberto passam a seguir o vencimento novo. |

## fz.pay.taxRates

| Método | Rota | O que faz |
|---|---|---|
| `create` | `POST /v1/pay/tax-rates` | Cria uma Alíquota fiscal. tenant_id injetado pelo gateway. |
| `deleteOne` | `DELETE /v1/pay/tax-rates/{id}` | Remove uma Alíquota. |
| `list`, `listAll` | `GET /v1/pay/tax-rates` | Lista Alíquotas do tenant com paginação por cursor. |
| `lookupCnpj` | `GET /v1/pay/cnpj-lookup/{cnpj}` | Consulta um CNPJ na Receita (CNAEs + dados cadastrais) para pré-preencher cadastro. |
| `simplesRate` | `GET /v1/pay/simples-rate` | Calcula a faixa + alíquota efetiva do Simples Nacional a partir do RBT12. |
| `simplesWatch` | `GET /v1/pay/simples-watch` | Vigia do limite do Simples Nacional da organização. |
| `simulateSimplesHybrid` | `POST /v1/pay/simples-watch/simulate` | Simula o mês no Simples puro e no Simples com CBS pelo regime regular. |
| `update` | `PATCH /v1/pay/tax-rates/{id}` | Atualiza uma Alíquota (PATCH). |

## fz.pay.wallets

| Método | Rota | O que faz |
|---|---|---|
| `balance` | `GET /v1/pay/wallets/{wallet_id}/balance` | Retorna o saldo atual derivado de uma wallet. |
| `create` | `POST /v1/pay/financial-accounts/{account_id}/wallets` | Cria uma wallet subordinada a uma conta gráfica. |
| `list`, `listAll` | `GET /v1/pay/financial-accounts/{account_id}/wallets` | Lista as wallets de uma conta gráfica com paginação por cursor. |
| `listAllWallets` | `GET /v1/pay/wallets/all` | Como `list_internal`, mas devolve **todas** as wallets do tenant (não só as internas): inclui as de recebedor/beneficiário e cliente. Usado pelo Extrato (para o usuário escolher a carteira do lojista) e pelo resolvedor de nomes (para o split exibir o nome da conta, não o id cru). Ordenado por papel (recebedores primeiro, tubulação - taxa/externo - por último). |
| `listChargeBeneficiaries` | `GET /v1/pay/wallets/charge-beneficiaries` | Wallets ELEGÍVEIS a receber uma cobrança PIX - só **recebedores** (role `beneficiary`/`customer`). Exclui de propósito as carteiras internas de RECEITA da plataforma: `platform` (comissão/lucro) e `fee` (taxa do gateway/PSP), além das de sistema (`external`/`escrow`/`reserve`). O cliente **nunca** pode cobrar direto numa carteira de taxa ou de lucro - ela só recebe por **rateio do settlement**. Usado pelos checkouts de cobrança; as demais telas usam `list_internal`. |
| `listInternal` | `GET /v1/pay/wallets/internal` | Lista consolidada de TODAS as wallets internas do tenant numa só resposta. |

## fz.reports

| Método | Rota | O que faz |
|---|---|---|
| `cancelJob` | `POST /v1/reports/jobs/{id}/cancel` | Cancela um job que ainda não terminou. |
| `createRule` | `POST /v1/reports/alerts` | Cria uma regra de alerta sobre um relatório salvo. |
| `createSaved` | `POST /v1/reports/saved` | Salva um relatório montado. |
| `createSavedTemplate` | `POST /v1/reports/saved-templates` | Salva um modelo com filtros e período relativo. |
| `deleteRule` | `DELETE /v1/reports/alerts/{id}` | Apaga uma regra de alerta. |
| `deleteSaved` | `DELETE /v1/reports/saved/{id}` | Apaga um relatório salvo e as regras de alerta dele. |
| `deleteSavedTemplate` | `DELETE /v1/reports/saved-templates/{id}` | Apaga um modelo salvo. |
| `enqueueReport` | `POST /v1/reports/jobs` | Pede um relatório: enfileira o job e devolve na hora, sem esperar a render. |
| `getJob` | `GET /v1/reports/jobs/{id}` | Lê um job (a tela consulta até ele terminar). |
| `getResult` | `GET /v1/reports/jobs/{id}/result` | Baixa o resultado de um job que terminou com sucesso. |
| `getRule` | `GET /v1/reports/alerts/{id}` | Lê uma regra de alerta. |
| `getSaved` | `GET /v1/reports/saved/{id}` | Lê um relatório salvo. |
| `getSavedTemplate` | `GET /v1/reports/saved-templates/{id}` | Lê um modelo salvo. |
| `listDatasets` | `GET /v1/reports/datasets` | Lista os datasets que o montador pode usar. |
| `listJobs`, `listJobsAll` | `GET /v1/reports/jobs` | Lista os jobs de relatório do tenant, do mais recente para o mais antigo. |
| `listRules` | `GET /v1/reports/alerts` | Lista as regras de alerta do tenant. |
| `listSaved` | `GET /v1/reports/saved` | Lista os relatórios salvos do tenant. |
| `listSavedTemplates` | `GET /v1/reports/saved-templates` | Lista os modelos salvos do tenant. |
| `listTemplates` | `GET /v1/reports/templates` | Lista os modelos de relatório que podem ser pedidos. |
| `previewReport` | `POST /v1/reports/preview` | Prévia na hora: roda o pedido com teto de 20 linhas e devolve as linhas na mesma resposta. |
| `updateRule` | `PUT /v1/reports/alerts/{id}` | Substitui uma regra de alerta (o relatório medido não muda). |
| `updateSaved` | `PUT /v1/reports/saved/{id}` | Substitui nome, descrição e especificação de um relatório salvo. |
| `updateSavedTemplate` | `PUT /v1/reports/saved-templates/{id}` | Substitui nome, descrição e pedido de um modelo salvo. |

## fz.sales.commission

| Método | Rota | O que faz |
|---|---|---|
| `deleteCommissionRule` | `DELETE /v1/sales/commission-rules/{id}` | Apaga uma regra de comissão. |
| `getCommissionStatement` | `GET /v1/sales/commission-statement` | O extrato do período. |
| `listCommissionRules` | `GET /v1/sales/commission-rules` | As regras de cada papel: a do tenant, as dos cargos e as das pessoas. |
| `listOrderCommissions` | `GET /v1/sales/orders/{id}/commissions` | A comissão da venda. |
| `myCommissionStatement` | `GET /v1/sales/commission/me` | A comissão de quem chama. |
| `recalculateOrderCommissions` | `POST /v1/sales/orders/{id}/commissions/recalculate` | Refaz a comissão. |
| `requestMyCommissionPayout` | `POST /v1/sales/commission/me/payouts` | Saque da carteira de comissão. |
| `setCommissionRule` | `PUT /v1/sales/commission-rules` | Grava a regra de um papel num nível. Repetir o par papel e nível sobrescreve. |

## fz.sales.counter

| Método | Rota | O que faz |
|---|---|---|
| `counterSummary` | `GET /v1/sales/counter-sales/summary` | O caixa do período. |
| `getCounterSale` | `GET /v1/sales/counter-sales/{id}` | A venda de balcão. |
| `registerCounterSale` | `POST /v1/sales/counter-sales` | Registra a venda de balcão. |
| `retryCounterSale` | `POST /v1/sales/counter-sales/{id}/retry` | Retoma o que ficou pendente. |

## fz.sales.coupons

| Método | Rota | O que faz |
|---|---|---|
| `applyCoupon` | `POST /v1/sales/orders/{id}/coupon` | Aplica o cupom. |
| `createCoupon` | `POST /v1/sales/coupons` | Cria a campanha. |
| `getCoupon` | `GET /v1/sales/coupons/{id}` | A campanha por id **ou por código**. |
| `listCoupons`, `listCouponsAll` | `GET /v1/sales/coupons` | Lista as campanhas do tenant. |
| `listRedemptions`, `listRedemptionsAll` | `GET /v1/sales/coupons/{id}/redemptions` | Quem usou a campanha. |
| `previewCoupon` | `POST /v1/sales/orders/{id}/coupon/preview` | Calcula **sem consumir**. |
| `removeCoupon` | `DELETE /v1/sales/orders/{id}/coupon` | Tira o cupom do documento. |
| `setCouponStatus` | `POST /v1/sales/coupons/{id}/status` | Ativa, pausa ou arquiva. |
| `updateCoupon` | `PATCH /v1/sales/coupons/{id}` | Ajusta vigência, tetos e alvos. |

## fz.sales.goals

| Método | Rota | O que faz |
|---|---|---|
| `createGoal` | `POST /v1/sales/goals` | Cria uma meta. |
| `deleteGoal` | `DELETE /v1/sales/goals/{id}` | Apaga a meta. |
| `goalProgress` | `GET /v1/sales/goals/progress` | O painel de metas da equipe. |
| `listGoals`, `listGoalsAll` | `GET /v1/sales/goals` | O cadastro de metas. |
| `myGoalProgress` | `GET /v1/sales/goals/me` | As metas de quem chama. |
| `updateGoal` | `PUT /v1/sales/goals/{id}` | Troca a meta. |

## fz.sales.indicators

| Método | Rota | O que faz |
|---|---|---|
| `orderMargin` | `GET /v1/sales/orders/{id}/margin` | A margem de uma venda. |
| `salesIndicators` | `GET /v1/sales/indicators` | Ticket médio e venda por período, vendedor e canal. |

## fz.sales.money

| Método | Rota | O que faz |
|---|---|---|
| `generateReceivables` | `POST /v1/sales/orders/{id}/receivables` | A venda vira dívida do cliente. |
| `getFinancialConfig` | `GET /v1/sales/financial-config` | Em que carteira o dinheiro da venda entra. |
| `getFiscalConfig` | `GET /v1/sales/fiscal-config` | Em que ambiente e série a venda emite. |
| `getOrderCheckout` | `GET /v1/sales/orders/{id}/checkout` | O endereço corrente desta venda. |
| `issueFiscalDocument` | `POST /v1/sales/orders/{id}/fiscal-documents` | Emite a nota da venda. |
| `listFiscalDocuments` | `GET /v1/sales/orders/{id}/fiscal-documents` | A nota desta venda. |
| `listOrderCheckouts` | `GET /v1/sales/orders/{id}/checkouts` | O histórico de endereços. |
| `listReceivables` | `GET /v1/sales/orders/{id}/receivables` | As parcelas desta venda. |
| `listReservations` | `GET /v1/sales/orders/{id}/reservations` | O que esta venda tem separado. |
| `markPaidExternally` | `POST /v1/sales/orders/{id}/receivables/mark-paid-externally` | O cliente pagou fora e nós anotamos. |
| `publishOrderCheckout` | `POST /v1/sales/orders/{id}/checkout` | Publica o endereço de pagamento. |
| `reserveStock` | `POST /v1/sales/orders/{id}/reservations` | Segura a mercadoria da venda. |
| `revokeOrderCheckout` | `DELETE /v1/sales/orders/{id}/checkout` | Mata o endereço corrente. |
| `setFinancialConfig` | `PUT /v1/sales/financial-config` | Liga ou desliga o faturamento. |
| `setFiscalConfig` | `PUT /v1/sales/fiscal-config` | Liga ou desliga a emissão da venda. |

## fz.sales.orders

| Método | Rota | O que faz |
|---|---|---|
| `addItem` | `POST /v1/sales/orders/{id}/items` | Acrescenta uma linha. |
| `cancelOrder` | `POST /v1/sales/orders/{id}/cancel` | Encerra o documento. |
| `confirmOrder` | `POST /v1/sales/orders/{id}/confirm` | O orçamento vira venda. |
| `createOrder` | `POST /v1/sales/orders` | Cria o documento como **orçamento**. |
| `getOrder` | `GET /v1/sales/orders/{id}` | O documento com as linhas. |
| `listOrders`, `listOrdersAll` | `GET /v1/sales/orders` | Lista com keyset. |
| `removeItem` | `DELETE /v1/sales/orders/{id}/items/{item_id}` | Remove uma linha. |
| `updateItem` | `PATCH /v1/sales/orders/{id}/items/{item_id}` | Altera uma linha. |
| `updateOrder` | `PATCH /v1/sales/orders/{id}` | Altera o **cabeçalho**. |

## fz.sales.priceLists

| Método | Rota | O que faz |
|---|---|---|
| `createPriceList` | `POST /v1/sales/price-lists` | Cria uma tabela de preço. |
| `listPriceLists`, `listPriceListsAll` | `GET /v1/sales/price-lists` | Lista com keyset. |
| `listPrices`, `listPricesAll` | `GET /v1/sales/price-lists/{id}/prices` | Lista com keyset. |
| `removePrice` | `DELETE /v1/sales/price-lists/{id}/prices/{variant_id}` | `DELETE /v1/sales/price-lists/{id}/prices/{variant_id}`. |
| `setPrice` | `PUT /v1/sales/price-lists/{id}/prices/{variant_id}` | Define o preço. |
| `updatePriceList` | `PATCH /v1/sales/price-lists/{id}` | `PATCH /v1/sales/price-lists/{id}`. |

## fz.sales.returns

| Método | Rota | O que faz |
|---|---|---|
| `getReturn` | `GET /v1/sales/returns/{id}` | Uma devolução. |
| `issueReturnDocument` | `POST /v1/sales/returns/{id}/fiscal-documents` | Emite a NF-e de devolução. |
| `listReturnDocuments` | `GET /v1/sales/returns/{id}/fiscal-documents` | A nota da devolução. |
| `listReturns` | `GET /v1/sales/orders/{id}/returns` | As devoluções da venda, em ordem. |
| `registerReturn` | `POST /v1/sales/orders/{id}/returns` | Registra uma devolução. |

## fz.sales.team

| Método | Rota | O que faz |
|---|---|---|
| `addSalesperson` | `POST /v1/sales/salespeople` | Põe uma pessoa na equipe. |
| `createRole` | `POST /v1/sales/roles` | Cria um cargo comercial. |
| `deleteRole` | `DELETE /v1/sales/roles/{id}` | Apaga o cargo sem vendedor ativo. |
| `getParticipants` | `GET /v1/sales/orders/{id}/participants` | Quem vendeu e quem executa. |
| `listRoles`, `listRolesAll` | `GET /v1/sales/roles` | Os cargos comerciais. |
| `listSalespeople`, `listSalespeopleAll` | `GET /v1/sales/salespeople` | A equipe comercial. |
| `setParticipants` | `PUT /v1/sales/orders/{id}/participants/{role}` | Troca os participantes de um papel. |
| `updateRole` | `PATCH /v1/sales/roles/{id}` | Renomeia o cargo. |
| `updateSalesperson` | `PATCH /v1/sales/salespeople/{member_id}` | Troca o cargo ou desliga. |

## fz.sessions

| Método | Rota | O que faz |
|---|---|---|
| `changePassword` | `POST /v1/auth/password` | Rota autenticada; troca a senha do próprio usuário. |
| `listSessions` | `GET /v1/auth/sessions` | Requer sessão autenticada. |
| `rememberSession` | `POST /v1/auth/session/remember` | Authenticated route. |
| `revokeAllSessions` | `DELETE /v1/auth/sessions` | Requer sessão autenticada. |
| `revokeSession` | `DELETE /v1/auth/sessions/{session_id}` | Requer sessão autenticada. |
| `switchOrganization` | `POST /v1/auth/session/organization` | Authenticated route. |

## fz.shipping.carriers

| Método | Rota | O que faz |
|---|---|---|
| `completeCarrierAuthorization` | `POST /v1/shipping/carriers/{code}/authorize/complete` | Conclui com o `code` do retorno. |
| `disconnectCarrier` | `DELETE /v1/shipping/carriers/{code}` | Desliga a transportadora. |
| `listCarriers` | `GET /v1/shipping/carriers` | As transportadoras de terceiro e a conexão do tenant com cada uma. |
| `startCarrierAuthorization` | `POST /v1/shipping/carriers/{code}/authorize` | Começa a autorização. |

## fz.shipping.quotes

| Método | Rota | O que faz |
|---|---|---|
| `chooseQuoteOption` | `POST /v1/shipping/quotes/{id}/options/{option_id}/choose` | Escolhe o frete que será cobrado. |
| `getQuote` | `GET /v1/shipping/quotes/{id}` | `GET /v1/shipping/quotes/{id}`. |
| `quoteShipment` | `POST /v1/shipping/quotes` | Pergunta a todas as transportadoras e **congela** o resultado. |

## fz.shipping.rateTables

| Método | Rota | O que faz |
|---|---|---|
| `createRateTable` | `POST /v1/shipping/rate-tables` | Cria a tabela de frete do lojista. |
| `deleteRateTable` | `DELETE /v1/shipping/rate-tables/{id}` | `DELETE /v1/shipping/rate-tables/{id}`. |
| `getRateTable` | `GET /v1/shipping/rate-tables/{id}` | `GET /v1/shipping/rate-tables/{id}`. |
| `listRateTables`, `listRateTablesAll` | `GET /v1/shipping/rate-tables` | Lista as tabelas, por keyset. |
| `replaceRateBands` | `PUT /v1/shipping/rate-tables/{id}/bands` | Substitui **todas** as faixas. |
| `updateRateTable` | `PATCH /v1/shipping/rate-tables/{id}` | Renomeia, muda a cubagem e ativa ou desativa. |

## fz.sign.batches

| Método | Rota | O que faz |
|---|---|---|
| `cancelSignBatch` | `POST /v1/sign/batches/{id}/cancel` | Cancela um lote. |
| `createSignBatch` | `POST /v1/sign/batches` | Cria um lote de envelopes a partir de um modelo, um por linha. |
| `getSignBatch` | `GET /v1/sign/batches/{id}` | Abre um lote com o estado de cada linha. |
| `listSignBatches`, `listSignBatchesAll` | `GET /v1/sign/batches` | Lista os lotes de envelopes, por cursor. |

## fz.sign.envelopes

| Método | Rota | O que faz |
|---|---|---|
| `cancelSignEnvelope` | `POST /v1/sign/envelopes/{id}/cancel` | Cancela um rascunho ou um envelope enviado. |
| `createSignEnvelope` | `POST /v1/sign/envelopes` | Cria um envelope com o PDF (multipart: `meta` e `file`), em fluxo até o `sign`. |
| `createSignEnvelopeFromTemplate` | `POST /v1/sign/envelopes/from-template` | Cria um envelope com o documento gerado por um modelo. |
| `discardSignEnvelope` | `POST /v1/sign/envelopes/{id}/discard` | Descarta um envelope fechado. |
| `downloadSignDocument` | `GET /v1/sign/envelopes/{id}/document` | Baixa o PDF original do envelope, ou o assinado. |
| `downloadSignPackage` | `GET /v1/sign/envelopes/{id}/package` | Baixa o pacote de evidências (zip) de um envelope concluído. |
| `extendSignEnvelope` | `POST /v1/sign/envelopes/{id}/extend` | Prorroga o prazo e reenvia o convite a quem falta. |
| `getSignEnvelope` | `GET /v1/sign/envelopes/{id}` | Abre um envelope. |
| `listSignEnvelopes`, `listSignEnvelopesAll` | `GET /v1/sign/envelopes` | Lista os envelopes da organização, por cursor. |
| `moveSignEnvelope` | `POST /v1/sign/envelopes/{id}/move` | Leva o envelope para outro cofre. |
| `reissueSignCopy` | `POST /v1/sign/envelopes/{id}/signers/{signer_id}/copy` | Reemite a cópia de um envelope concluído. |
| `remindSignSigner` | `POST /v1/sign/envelopes/{id}/signers/{signer_id}/remind` | Reenvia o convite a quem ainda não assinou. |
| `renderSignPages` | `POST /v1/sign/pages` | As páginas do documento como imagem, sem gravar nada. |
| `sendSignEnvelope` | `POST /v1/sign/envelopes/{id}/send` | Envia um rascunho para assinatura. |

## fz.sign.forms

| Método | Rota | O que faz |
|---|---|---|
| `archiveSignField` | `POST /v1/sign/fields/{id}/archive` | Arquiva um campo. |
| `archiveSignForm` | `POST /v1/sign/forms/{id}/archive` | Arquiva um formulário. |
| `createSignEnvelopeFromForm` | `POST /v1/sign/forms/{id}/envelopes` | Cria um envelope com o formulário preenchido. |
| `createSignField` | `POST /v1/sign/fields` | Cadastra um campo de formulário. |
| `createSignForm` | `POST /v1/sign/forms` | Cria um formulário sobre um PDF pronto (multipart: `meta` e `file`). |
| `downloadSignForm` | `GET /v1/sign/forms/{id}/document` | Baixa o PDF em branco de um formulário. |
| `getSignForm` | `GET /v1/sign/forms/{id}` | Abre um formulário, arquivado ou não. |
| `listSignFields`, `listSignFieldsAll` | `GET /v1/sign/fields` | Lista os campos de formulário da organização, por cursor. |
| `listSignForms`, `listSignFormsAll` | `GET /v1/sign/forms` | Lista os formulários da organização, por cursor. |
| `updateSignField` | `PUT /v1/sign/fields/{id}` | Grava a versão nova de um campo. |
| `updateSignForm` | `PUT /v1/sign/forms/{id}` | Grava a versão nova de um formulário. |

## fz.sign.public

| Método | Rota | O que faz |
|---|---|---|
| `acceptSignMarks` | `POST /v1/sign/public/invite/marks` (pública) | Aceita as rubricas de quem assina. |
| `beginSignIcpAgent` | `POST /v1/sign/public/invite/icp/agent` (pública) | Abre o pareamento com o agente local (A3). |
| `beginSignPasskey` | `POST /v1/sign/public/invite/passkey` (pública) | Abre a cerimônia de passkey de quem assina. |
| `declineSignInvite` | `POST /v1/sign/public/invite/decline` (pública) | Recusa o documento do convite. |
| `downloadSignInviteDocument` | `GET /v1/sign/public/invite/document` (pública) | Baixa o PDF do convite, para o signatário ler antes de assinar. |
| `downloadSignInvitePackage` | `GET /v1/sign/public/invite/package` (pública) | Baixa o pacote de evidências (zip) pelo link do signatário. |
| `getSignIcpAgent` | `POST /v1/sign/public/invite/icp/agent/status` (pública) | O pareamento com o agente, como a página acompanha. |
| `listSignDays`, `listSignDaysAll` | `GET /v1/sign/public/days` (pública) | Lista os registros do dia do Assinador. |
| `listSignSealKeys` | `GET /v1/sign/public/keys` (pública) | Lista as chaves públicas de selo, em forma de JWKS. |
| `nextSignAgentJob` | `POST /v1/sign/public/agent/next` (pública) | O que o agente tem a assinar agora. |
| `offerSignAgentCertificates` | `POST /v1/sign/public/agent/certificates` (pública) | O agente oferece os certificados que achou. |
| `openSignInvite` | `POST /v1/sign/public/invite/open` (pública) | Abre o convite do signatário pelo token do cabeçalho. |
| `pairSignAgent` | `POST /v1/sign/public/agent/pair` (pública) | O agente local entra com o código da página. |
| `prepareSignIcp` | `POST /v1/sign/public/invite/icp/prepare` (pública) | Prepara a assinatura com certificado ICP-Brasil. |
| `recordSignMailOpen` | `POST /v1/sign/public/mail/opened` (pública) | A imagem de 1 pixel de um e-mail do Assinador carregou. Quem chama é a rota da imagem no front, que devolve o pixel sem esperar a resposta. |
| `renderSignInvitePages` | `GET /v1/sign/public/invite/pages` (pública) | As páginas do documento do convite como imagem. |
| `requestSignCode` | `POST /v1/sign/public/invite/code` (pública) | Manda o código de confirmação ao e-mail do signatário. |
| `requestSignCopy` | `POST /v1/sign/public/verify` (pública) | Pede a cópia de um envelope pelo código do relatório e pelo e-mail de um signatário. |
| `requestSignIcpAgentSignature` | `POST /v1/sign/public/invite/icp/agent/request` (pública) | Pede ao agente a assinatura de uma preparação. |
| `submitSignAgentSignature` | `POST /v1/sign/public/agent/signature` (pública) | O agente devolve a assinatura do pedido. |
| `submitSignSignature` | `POST /v1/sign/public/invite/sign` (pública) | Assina o documento do convite. |

## fz.sign.received

| Método | Rota | O que faz |
|---|---|---|
| `downloadSignReceivedDocument` | `GET /v1/sign/received/{id}/document` | Baixa o documento recebido, original ou assinado. |
| `downloadSignReceivedPackage` | `GET /v1/sign/received/{id}/package` | Baixa o pacote de evidências do documento recebido. |
| `getSignReceived` | `GET /v1/sign/received/{id}` | Abre um documento recebido. |
| `keepSignReceived` | `POST /v1/sign/received` | Guarda na organização da sessão o documento que a pessoa assinou para outra organização. |
| `listSignReceived`, `listSignReceivedAll` | `GET /v1/sign/received` | Lista os documentos que a organização recebeu de outras para assinar. |

## fz.sign.settings

| Método | Rota | O que faz |
|---|---|---|
| `getSignSettings` | `GET /v1/sign/settings` | Lê os ajustes do Assinador da organização. |
| `updateSignSettings` | `PUT /v1/sign/settings` | Grava os ajustes do Assinador da organização. |

## fz.sign.templates

| Método | Rota | O que faz |
|---|---|---|
| `archiveSignTemplate` | `POST /v1/sign/templates/{id}/archive` | Arquiva um modelo. |
| `createSignTemplate` | `POST /v1/sign/templates` | Cria um modelo de documento. |
| `getSignTemplate` | `GET /v1/sign/templates/{id}` | Abre um modelo, arquivado ou não. |
| `listSignTemplates`, `listSignTemplatesAll` | `GET /v1/sign/templates` | Lista os modelos de documento da organização, por cursor. |
| `previewSignTemplate` | `POST /v1/sign/templates/{id}/preview` | O PDF que um modelo gera, sem gravar nada. |
| `previewSignTemplateDraft` | `POST /v1/sign/templates/preview` | O PDF do modelo que está no editor, sem gravar. |
| `updateSignTemplate` | `PUT /v1/sign/templates/{id}` | Grava a versão nova de um modelo. |

## fz.sign.vaults

| Método | Rota | O que faz |
|---|---|---|
| `createSignVault` | `POST /v1/sign/vaults` | Cria um cofre de envelopes. |
| `deleteSignImport` | `DELETE /v1/sign/imports/{id}` | Apaga um documento importado. |
| `deleteSignVault` | `DELETE /v1/sign/vaults/{id}` | Apaga um cofre vazio. |
| `downloadSignImport` | `GET /v1/sign/imports/{id}/document` | Baixa o PDF de um documento importado. |
| `getSignImport` | `GET /v1/sign/imports/{id}` | Abre um documento importado. |
| `getSignVault` | `GET /v1/sign/vaults/{id}` | Abre o cadastro de um cofre. |
| `importSignDocument` | `POST /v1/sign/imports` | Guarda num cofre um contrato já assinado fora da plataforma (multipart: `meta` e `file`). |
| `listSignImports`, `listSignImportsAll` | `GET /v1/sign/imports` | Lista os documentos importados dos cofres que a pessoa vê, por cursor. |
| `listSignVaults` | `GET /v1/sign/vaults` | Os cofres de envelopes que a pessoa vê. |
| `lockSignVault` | `POST /v1/sign/vaults/{id}/lock` | Tranca de novo um cofre aberto. |
| `moveSignImport` | `POST /v1/sign/imports/{id}/move` | Leva o documento importado para outro cofre. |
| `putSignVaultMember` | `PUT /v1/sign/vaults/{id}/members` | Inclui uma pessoa, grupo, time ou unidade, ou troca o papel. |
| `removeSignVaultMember` | `DELETE /v1/sign/vaults/{id}/members/{kind}/{subject_id}` | Retira um sujeito da lista. |
| `searchSignVaultAudiences` | `GET /v1/sign/vaults/audiences` | Unidades, grupos e times para a lista de um cofre. |
| `unlockSignVault` | `POST /v1/sign/vaults/{id}/unlock` | Abre um cofre com o código do autenticador. |
| `updateSignVault` | `PUT /v1/sign/vaults/{id}` | Ajusta nome, descrição, público e segundo fator. |

## fz.social

| Método | Rota | O que faz |
|---|---|---|
| `addNote` | `POST /v1/social/conversations/{id}/notes` | Anota algo na conversa, para a equipe. |
| `archiveConversation` | `PUT /v1/social/conversations/{id}/archive` | Arquiva a conversa **para quem pede**. |
| `assignConversation` | `POST /v1/social/conversations/{id}/assign` | Diz quem está atendendo. |
| `beginMetaLogin` | `POST /v1/social/connections/{id}/meta-login` | Abre o "Entrar com Facebook" da conexão. |
| `cancelInstagramLogin` | `DELETE /v1/social/instagram-session/login/{id}` | Fecha o navegador sem guardar nada. |
| `cancelPost` | `POST /v1/social/posts/{id}/cancel` | Tira da fila os destinos que ainda não começaram a sair. |
| `completeWhatsappSignup` | `POST /v1/social/connections/{id}/whatsapp-signup` | O fim do cadastro do WhatsApp pela Meta. |
| `createConnection` | `POST /v1/social/connections` | Cria uma conexão. |
| `createLabel` | `POST /v1/social/labels` | Cria uma etiqueta. |
| `createPost` | `POST /v1/social/posts` | Monta um post para uma ou mais conexões (Instagram, Página do Facebook), rascunho ou já agendado. |
| `createTemplate` | `POST /v1/social/connections/{id}/templates` | Cadastra um template e o submete à análise do provider. |
| `deleteConnection` | `DELETE /v1/social/connections/{id}` | Apaga o cadastro de uma conexão que nunca operou. |
| `deleteInstagramSession` | `DELETE /v1/social/instagram-session/{account_id}` | Desconecta uma conta do Instagram da organização. |
| `deleteLabel` | `DELETE /v1/social/labels/{id}` | Apaga uma etiqueta. |
| `deleteNote` | `DELETE /v1/social/notes/{id}` | Apaga uma nota interna. |
| `deleteQuickReply` | `DELETE /v1/social/quick-replies/{id}` | Apaga uma resposta pronta. |
| `editNote` | `PATCH /v1/social/notes/{id}` | Edita uma nota interna. |
| `enrollWarmup` | `POST /v1/social/connections/{id}/warmup` | Coloca o número para aquecer. |
| `finishMetaLogin` | `POST /v1/social/meta-logins/{id}/finish` | Termina o "Entrar com Facebook" com o bilhete da volta. |
| `getConnection` | `GET /v1/social/connections/{id}` | Uma conexão pelo id. |
| `getConversation` | `GET /v1/social/conversations/{id}` | Uma conversa pelo id. |
| `getInstagramLogin` | `GET /v1/social/instagram-session/login/{id}` | O estado do login e a tela do navegador. |
| `getLinkChallenge` | `GET /v1/social/connections/{id}/link` | O desafio corrente do vínculo. |
| `getMessageMedia` | `GET /v1/social/messages/{id}/media` | Descreve o anexo de uma mensagem, sem buscar nada no provider. |
| `getMessageMediaContent` | `GET /v1/social/messages/{id}/media/content` | Repassa os bytes do anexo de uma mensagem. |
| `getMetaLogin` | `GET /v1/social/meta-logins/{id}` | O login em curso, para a tela mostrar as Páginas. |
| `getOptOutSettings` | `GET /v1/social/opt-out` | O descadastro automático da organização. |
| `getPost` | `GET /v1/social/posts/{id}` | Um post pelo id. |
| `getTemplate` | `GET /v1/social/templates/{id}` | Um template pelo id. |
| `getWarmup` | `GET /v1/social/connections/{id}/warmup` | Em que pé está o aquecimento deste número. |
| `getWhatsappSignupConfig` | `GET /v1/social/whatsapp-signup` | A configuração do cadastro do WhatsApp pela Meta. |
| `ignoreConversation` | `PUT /v1/social/conversations/{id}/ignore` | Ignora a conversa **para a equipe toda**: o arquivo de todos. |
| `inboxSla` | `GET /v1/social/inbox/sla` | O retrato de SLA da caixa de entrada. |
| `leaveWarmup` | `DELETE /v1/social/connections/{id}/warmup` | Desliga o aquecimento e limpa a fila pendente dos dois lados. |
| `linkContactPerson` | `POST /v1/social/conversations/{id}/person` | Liga o contato da conversa a uma pessoa do cadastro, ou cria a pessoa com o nome e o telefone do contato. |
| `listConnectionEvents`, `listConnectionEventsAll` | `GET /v1/social/connections/{id}/events` | O histórico de status da conexão. |
| `listConnectionHealth`, `listConnectionHealthAll` | `GET /v1/social/connections/{id}/health` | A saúde gravada dia a dia: decisão do aquecimento, degrau e motivo. |
| `listConnections`, `listConnectionsAll` | `GET /v1/social/connections` | Lista as conexões do escopo. |
| `listConversations`, `listConversationsAll` | `GET /v1/social/conversations` | O inbox. |
| `listInstagramSessions` | `GET /v1/social/instagram-session` | As contas do Instagram da organização: status e conta, nunca o cookie. |
| `listInteractions`, `listInteractionsAll` | `GET /v1/social/interactions` | A fila de comentários. |
| `listLabels` | `GET /v1/social/labels` | As etiquetas do tenant. |
| `listMessages`, `listMessagesAll` | `GET /v1/social/conversations/{id}/messages` | O fio de uma conversa. |
| `listNotes`, `listNotesAll` | `GET /v1/social/conversations/{id}/notes` | As notas internas de uma conversa. |
| `listPostFormats` | `GET /v1/social/connections/{id}/post-formats` | O que a conexão publica e o que cada formato aceita. |
| `listPosts`, `listPostsAll` | `GET /v1/social/posts` | O calendário de posts. |
| `listQuickReplies` | `GET /v1/social/quick-replies` | As respostas prontas do escopo. |
| `listSendRoutes` | `GET /v1/social/send-routes` | Por onde falar com um número quando o tenant tem mais de uma conexão. |
| `listSuppressions`, `listSuppressionsAll` | `GET /v1/social/suppressions` | A lista de bloqueio do tenant. |
| `listTemplates`, `listTemplatesAll` | `GET /v1/social/connections/{id}/templates` | Os templates de uma conexão. |
| `markRead` | `POST /v1/social/conversations/{id}/read` | Marca a conversa como lida. |
| `metaDataDeletion` | `POST /v1/social/meta/data-deletion` (pública) | Pedido de exclusão de dados. **Sem sessão.** |
| `metaDeauthorize` | `POST /v1/social/meta/deauthorize` (pública) | Desautorização do app na Meta. **Sem sessão.** |
| `metaLoginCallback` | `GET /v1/social/meta-login/callback` (pública) | A volta da janela da Meta. **Sem sessão.** |
| `moderateComment` | `POST /v1/social/interactions/{id}/moderate` | Esconde, revela, apaga ou dá o comentário por tratado. |
| `muteConversation` | `PUT /v1/social/conversations/{id}/mute` | Silencia a conversa **para quem pede**, até `until` ou para sempre. |
| `openConversation` | `POST /v1/social/conversations` | Abre a conversa com um número antes de ele escrever. |
| `pauseConnection` | `POST /v1/social/connections/{id}/pause` | Tira a conexão de circulação por decisão de gente. |
| `privacyRequestStatus` | `GET /v1/social/meta/data-deletion/{code}` (pública) | Andamento de um pedido de privacidade. **Sem sessão.** |
| `reactToMessage` | `PUT /v1/social/messages/{id}/reaction` | Põe ou troca a reação da conexão a uma mensagem recebida. |
| `receiveWebhook` | `POST /v1/social/webhooks/{provider}` (pública) | Recebe uma entrega do provider. **Sem sessão.** |
| `refreshTemplate` | `POST /v1/social/templates/{id}/refresh` | Consulta no provider o estado de um template submetido. |
| `removeReaction` | `DELETE /v1/social/messages/{id}/reaction` | Tira a reação da conexão a uma mensagem. |
| `renameConnection` | `PATCH /v1/social/connections/{id}` | Troca o nome da conexão, em qualquer status (vinculada inclusive). |
| `replyToComment` | `POST /v1/social/interactions/{id}/reply` | Responde ao comentário, em público ou em privado. |
| `resumeConnection` | `POST /v1/social/connections/{id}/resume` | Devolve a conexão à circulação. |
| `revokeMessage` | `DELETE /v1/social/messages/{id}` | Apaga para todos uma mensagem que a conexão mandou. |
| `saveInstagramSession` | `PUT /v1/social/instagram-session` | Conecta uma conta do Instagram da organização colando a sessão, ou troca a sessão de uma (`account_id`). |
| `saveOptOutSettings` | `PUT /v1/social/opt-out` | Substitui o descadastro automático da organização. |
| `saveQuickReply` | `POST /v1/social/quick-replies` | Cria ou substitui uma resposta pronta, pela chave do atalho. |
| `schedulePost` | `POST /v1/social/posts/{id}/schedule` | Agenda ou reagenda os destinos em rascunho, na fila ou que falharam. |
| `selectMetaLoginPage` | `POST /v1/social/meta-logins/{id}/select` | A pessoa escolheu a Página: a conexão é vinculada com o token dela. |
| `sendInstagramLoginInput` | `POST /v1/social/instagram-session/login/{id}/input` | Cliques e teclas da pessoa, repassados ao navegador. |
| `sendMessage` | `POST /v1/social/conversations/{id}/messages` | Envia uma mensagem na conversa. |
| `setConnectionCaps` | `PUT /v1/social/connections/{id}/caps` | Grava o teto do cliente e liga ou desliga a escala automática. |
| `setConnectionService` | `PUT /v1/social/connections/{id}/service` | Grava o modo de atendimento da conexão. |
| `setConnectionUsages` | `PUT /v1/social/connections/{id}/usages` | Troca os usos da conexão. |
| `setConversationLabels` | `PUT /v1/social/conversations/{id}/labels` | Substitui as etiquetas da conversa. |
| `setConversationStatus` | `POST /v1/social/conversations/{id}/status` | Encerra ou reabre a conversa. |
| `setWarmupPaused` | `PUT /v1/social/connections/{id}/warmup/paused` | Suspende ou retoma a emissão sem sair do aquecimento. |
| `setWarmupTarget` | `PUT /v1/social/connections/{id}/warmup/target` | Troca a meta diária do aquecimento ("Mensagens por dia (meta)"). |
| `setWarmupWindow` | `PUT /v1/social/connections/{id}/warmup/window` | Escolhe a janela de horário do número no aquecimento, ou volta à padrão (corpo sem as duas pontas). |
| `startInstagramLogin` | `POST /v1/social/instagram-session/login` | Abre o navegador da casa na tela de login do Instagram da organização, para uma conta nova ou para reconectar a conta `account_id`. |
| `startLink` | `POST /v1/social/connections/{id}/link` | Começa o vínculo da conexão. |
| `submitTemplate` | `POST /v1/social/templates/{id}/submit` | Submete de novo um rascunho que não chegou ao provider. |
| `suppressRecipient` | `POST /v1/social/suppressions` | Bloqueia um identificador. |
| `unarchiveConversation` | `DELETE /v1/social/conversations/{id}/archive` | Devolve a conversa à caixa de quem pede. |
| `unignoreConversation` | `DELETE /v1/social/conversations/{id}/ignore` | Devolve a conversa ignorada à caixa da equipe. |
| `unlinkConnection` | `POST /v1/social/connections/{id}/unlink` | Desfaz o vínculo e apaga a credencial. |
| `unlinkContactPerson` | `DELETE /v1/social/conversations/{id}/person` | Desfaz a ligação do contato com a pessoa. |
| `unmuteConversation` | `DELETE /v1/social/conversations/{id}/mute` | Tira o silêncio da conversa para quem pede. |
| `verifyWebhook` | `GET /v1/social/webhooks/{provider}` (pública) | Handshake de assinatura do webhook. **Sem sessão.** |

## fz.social.ai.agents

| Método | Rota | O que faz |
|---|---|---|
| `activateAgent` | `POST /v1/social/ai/agents/{id}/activate` | Liga o agente. |
| `createAgent` | `POST /v1/social/ai/agents` | Cria um agente, pausado. |
| `deleteAgent` | `DELETE /v1/social/ai/agents/{id}` | Apaga o agente e a base dele. |
| `getAgent` | `GET /v1/social/ai/agents/{id}` | Um agente. |
| `getAiUsage` | `GET /v1/social/ai/usage` | O consumo de token da organização. |
| `getProfile` | `GET /v1/social/ai/profile` | O perfil da empresa da organização. |
| `getSettings` | `GET /v1/social/ai/settings` | Os ajustes do Chat I.A. da organização. |
| `listAgents`, `listAgentsAll` | `GET /v1/social/ai/agents` | Lista os agentes da organização (keyset). |
| `putProfile` | `PUT /v1/social/ai/profile` | Substitui o perfil da empresa. |
| `putSettings` | `PUT /v1/social/ai/settings` | Grava os ajustes do Chat I.A. |
| `setAgentStatus` | `POST /v1/social/ai/agents/{id}/status` | Pausa (`paused`) ou arquiva (`archived`). |
| `updateAgent` | `PUT /v1/social/ai/agents/{id}` | Substitui os campos editáveis. |

## fz.social.ai.conversations

| Método | Rota | O que faz |
|---|---|---|
| `listTurns`, `listTurnsAll` | `GET /v1/social/ai/agents/{id}/turns` | A trilha do atendimento real (keyset). |
| `simulate` | `POST /v1/social/ai/agents/{id}/simulate` | Conversa com o agente sem canal. |

## fz.social.ai.knowledge

| Método | Rota | O que faz |
|---|---|---|
| `addDocument` | `POST /v1/social/ai/agents/{id}/documents` | Sobe um arquivo para a base. |
| `deleteDocument` | `DELETE /v1/social/ai/documents/{id}` | Tira um documento da base. |
| `getDocumentMarkdown` | `GET /v1/social/ai/agents/{id}/documents/{doc_id}/markdown` | O Markdown do documento. |
| `getDocumentOriginal` | `GET /v1/social/ai/agents/{id}/documents/{doc_id}/original` | Baixa o arquivo original. |
| `listDocuments`, `listDocumentsAll` | `GET /v1/social/ai/agents/{id}/documents` | Os documentos da base (keyset). |
| `putDocumentMarkdown` | `PUT /v1/social/ai/agents/{id}/documents/{doc_id}/markdown` | Corrige o que o agente sabe de um documento. |
| `releaseDocument` | `POST /v1/social/ai/agents/{id}/documents/{doc_id}/release` | Libera um documento em revisão. |
| `searchKnowledge` | `POST /v1/social/ai/agents/{id}/search` | O que a base encontra para um texto. |

## fz.social.bot.rules

| Método | Rota | O que faz |
|---|---|---|
| `createBotRule` | `POST /v1/social/bot/rules` | Cria uma regra. |
| `deleteBotRule` | `DELETE /v1/social/bot/rules/{id}` | Apaga a regra. |
| `getBotRule` | `GET /v1/social/bot/rules/{id}` | Uma regra. |
| `listBotRuleFirings`, `listBotRuleFiringsAll` | `GET /v1/social/bot/rules/{id}/firings` | O histórico de disparos da regra. |
| `listBotRules`, `listBotRulesAll` | `GET /v1/social/bot/rules` | As regras do Chat Bot da organização (keyset). |
| `testBotRules` | `POST /v1/social/bot/test` | Prova um texto de exemplo contra as regras. |
| `updateBotRule` | `PUT /v1/social/bot/rules/{id}` | Substitui os campos editáveis. |

## fz.social.helpdesk

| Método | Rota | O que faz |
|---|---|---|
| `addEntry` | `POST /v1/social/helpdesk/tickets/{id}/entries` | Nota interna ou resposta registrada. |
| `createArticle` | `POST /v1/social/helpdesk/articles` | Cria um artigo. |
| `createCategory` | `POST /v1/social/helpdesk/categories` | Cria uma categoria. |
| `deleteArticle` | `DELETE /v1/social/helpdesk/articles/{id}` | Apaga o artigo. |
| `getArticle` | `GET /v1/social/helpdesk/articles/{id}` | Um artigo. |
| `getTicket` | `GET /v1/social/helpdesk/tickets/{id}` | Um chamado. |
| `getTicketByProtocol` | `GET /v1/social/helpdesk/tickets/by-protocol/{protocol}` | O chamado pelo protocolo que o cliente cita. |
| `listArticles`, `listArticlesAll` | `GET /v1/social/helpdesk/articles` | A base de conhecimento. |
| `listCategories` | `GET /v1/social/helpdesk/categories` | As categorias do tenant. |
| `listEntries`, `listEntriesAll` | `GET /v1/social/helpdesk/tickets/{id}/entries` | A linha do tempo. |
| `listTickets`, `listTicketsAll` | `GET /v1/social/helpdesk/tickets` | A fila de chamados. |
| `openTicket` | `POST /v1/social/helpdesk/tickets` | Abre um chamado com protocolo. |
| `rateTicket` | `POST /v1/social/helpdesk/tickets/{id}/rating` | Registra a nota que o cliente deu. Só com o chamado resolvido ou encerrado; repetir substitui. |
| `updateArticle` | `PUT /v1/social/helpdesk/articles/{id}` | Substitui o artigo. A primeira publicação fica gravada mesmo que volte a rascunho. |
| `updateCategory` | `PUT /v1/social/helpdesk/categories/{id}` | Substitui a categoria. O novo prazo vale para os chamados abertos depois: o de quem já abriu fica congelado. |
| `updateTicket` | `PATCH /v1/social/helpdesk/tickets/{id}` | Estado, prioridade, categoria e atendente. Cada mudança vira um registro da linha do tempo. |

## fz.stock.accounting

| Método | Rota | O que faz |
|---|---|---|
| `getAccounting` | `GET /v1/stock/accounting` | A configuração vigente. |
| `getAcquisition` | `GET /v1/stock/acquisition` | A política de custo de aquisição vigente. |
| `listPendingAccounting`, `listPendingAccountingAll` | `GET /v1/stock/accounting/pending` | **a fila da E8**. |
| `setAccounting` | `PUT /v1/stock/accounting` | Liga ou desliga a contabilização. |
| `setAcquisition` | `PUT /v1/stock/acquisition` | Muda o regime de crédito e o rateio padrão. |

## fz.stock.addressing

| Método | Rota | O que faz |
|---|---|---|
| `checkBinConsistency` | `GET /v1/stock/consistency/bins` | A conferência da **E13**. |
| `createBin` | `POST /v1/stock/bins` | Cria uma posição. |
| `disableAddressing` | `DELETE /v1/stock/warehouses/{id}/addressing` | **desliga** o endereçamento. |
| `enableAddressing` | `POST /v1/stock/warehouses/{id}/addressing` | **liga** o endereçamento. |
| `getBin` | `GET /v1/stock/bins/{id}` | Uma posição. |
| `listBinBalances` | `GET /v1/stock/bin-balances` | O mapa: quanto há de cada item em cada posição. |
| `listBinLevels` | `GET /v1/stock/warehouses/{id}/bin-levels` | O vocabulário de níveis. |
| `listBinMovements` | `GET /v1/stock/bin-movements` | O razão de posição. |
| `listBins` | `GET /v1/stock/bins` | A árvore de posições de um depósito. |
| `relocateStock` | `POST /v1/stock/relocations` | Muda mercadoria de posição. |
| `setBinLevels` | `PUT /v1/stock/warehouses/{id}/bin-levels` | O vocabulário de níveis. |
| `updateBin` | `PATCH /v1/stock/bins/{id}` | Altera uma posição. Manda o registro inteiro: campo ausente é gravado vazio. |

## fz.stock.audit

| Método | Rota | O que faz |
|---|---|---|
| `checkConsistency` | `GET /v1/stock/consistency` | **a conferência da E2**. |

## fz.stock.balances

| Método | Rota | O que faz |
|---|---|---|
| `getBalance` | `GET /v1/stock/balances/{variant_id}` | Saldo de um SKU. |
| `listBalances`, `listBalancesAll` | `GET /v1/stock/balances` | Uma linha por `(variante, depósito)`. |

## fz.stock.costing

| Método | Rota | O que faz |
|---|---|---|
| `getCosting` | `GET /v1/stock/costing` | Método vigente, resolvido em cascata **produto → tenant → default `average`**. |
| `setCosting` | `PUT /v1/stock/costing` | **E6**: recusado com saldo em aberto. |

## fz.stock.inventories

| Método | Rota | O que faz |
|---|---|---|
| `cancelInventory` | `POST /v1/stock/inventories/{id}/cancel` | Encerra sem ajustar nada. |
| `getInventory` | `GET /v1/stock/inventories/{id}` | A folha de contagem. |
| `listInventories`, `listInventoriesAll` | `GET /v1/stock/inventories` | Os inventários do escopo. |
| `openInventory` | `POST /v1/stock/inventories` | Abre a contagem. |
| `postInventory` | `POST /v1/stock/inventories/{id}/post` | As divergências viram **ajuste**. |
| `submitCount` | `POST /v1/stock/inventories/{id}/count` | Grava a contagem. |

## fz.stock.lots

| Método | Rota | O que faz |
|---|---|---|
| `getSerialVehicle` | `GET /v1/stock/serials/{id}/vehicle` | O veículo da peça. |
| `listExpiringLots`, `listExpiringLotsAll` | `GET /v1/stock/lots/expiring` | O que vence na janela pedida. |
| `listLots`, `listLotsAll` | `GET /v1/stock/lots` | Os lotes **com o saldo de cada um**. |
| `listSerials`, `listSerialsAll` | `GET /v1/stock/serials` | As peças serializadas. |
| `putSerialVehicle` | `PUT /v1/stock/serials/{id}/vehicle` | Grava o veículo da peça, conferindo cada tag contra o leiaute da NF-e. |
| `setLotCustomValues` | `PUT /v1/stock/lots/{id}/custom-values` | O formulário personalizado do lote. |
| `setSerialCustomValues` | `PUT /v1/stock/serials/{id}/custom-values` | O formulário personalizado da peça serializada. |
| `traceLot` | `GET /v1/stock/lots/{id}/trace` | **para onde este lote foi**. |

## fz.stock.movements

| Método | Rota | O que faz |
|---|---|---|
| `getMovement` | `GET /v1/stock/movements/{id}` | Com as alocações (procedência do CMV). |
| `importOpeningBalance` | `POST /v1/stock/opening-balance/import` | Saldo inicial de uma planilha. |
| `listMovements`, `listMovementsAll` | `GET /v1/stock/movements` | Histórico com keyset. |
| `postMovement` | `POST /v1/stock/movements` | Entrada abre camada, saída consome sob trava. |
| `reverseMovement` | `POST /v1/stock/movements/{id}/reverse` | **E3**. |

## fz.stock.pdv

| Método | Rota | O que faz |
|---|---|---|
| `getPosBatch` | `GET /v1/stock/pos/batches/{id}` | O lote e o que ele gerou. |
| `postPosReturn` | `POST /v1/stock/pos/returns` | A mercadoria volta pelo custo que a saída tirou. |
| `postPosSale` | `POST /v1/stock/pos/sales` | Baixa o cupom inteiro, numa transação só. |

## fz.stock.production

| Método | Rota | O que faz |
|---|---|---|
| `cancelOrder` | `POST /v1/stock/production/orders/{id}/cancel` | Cancela, com motivo. |
| `completeOrder` | `POST /v1/stock/production/orders/{id}/complete` | Encerra a ordem. |
| `createMrpRequest` | `POST /v1/stock/production/mrp/requests` | Vira a sugestão escolhida numa requisição de compra. |
| `createOrder` | `POST /v1/stock/production/orders` | Cria a ordem a partir da ficha. |
| `createRouting` | `POST /v1/stock/production/routings` | Cria um roteiro. |
| `createWorkCenter` | `POST /v1/stock/production/work-centers` | Cria um centro de trabalho. |
| `getOrder` | `GET /v1/stock/production/orders/{id}` | A ordem inteira. |
| `getRouting` | `GET /v1/stock/production/routings/{id}` | Um roteiro. |
| `listOrders`, `listOrdersAll` | `GET /v1/stock/production/orders` | Lista as ordens de produção. |
| `listRoutings`, `listRoutingsAll` | `GET /v1/stock/production/routings` | Lista os roteiros. |
| `listWorkCenters`, `listWorkCentersAll` | `GET /v1/stock/production/work-centers` | Lista os centros de trabalho. |
| `planMaterials` | `GET /v1/stock/production/mrp` | Calcula o MRP de um depósito. |
| `releaseOrder` | `POST /v1/stock/production/orders/{id}/release` | Libera a ordem. |
| `reportOperation` | `POST /v1/stock/production/orders/{id}/reports` | Aponta uma operação. |
| `updateOrder` | `PUT /v1/stock/production/orders/{id}` | Edita uma ordem planejada. |
| `updateRouting` | `PUT /v1/stock/production/routings/{id}` | Reescreve o roteiro inteiro. |
| `updateWorkCenter` | `PUT /v1/stock/production/work-centers/{id}` | Reescreve um centro. |

## fz.stock.purchasing

| Método | Rota | O que faz |
|---|---|---|
| `acceptReceiptDivergence` | `POST /v1/stock/receipts/{id}/accept-divergence` | Aceita a divergência contra o pedido, com motivo, para liberar a efetivação. |
| `awardQuotation` | `POST /v1/stock/quotations/{id}/award` | Adjudica a cotação e gera um pedido em rascunho por fornecedor vencedor. |
| `cancelPurchaseOrder` | `POST /v1/stock/purchase-orders/{id}/cancel` | Cancela o pedido sem nada recebido. Com recebimento, encerre. |
| `cancelPurchaseRequest` | `POST /v1/stock/purchase-requests/{id}/cancel` | Desiste da requisição aberta. |
| `cancelQuotation` | `POST /v1/stock/quotations/{id}/cancel` | Desiste da cotação; as requisições dela voltam a abertas. |
| `closePurchaseOrder` | `POST /v1/stock/purchase-orders/{id}/close` | Encerra o pedido; o que faltou chegar deixa de contar como "a caminho" na reposição. |
| `createPurchaseOrder` | `POST /v1/stock/purchase-orders` | O pedido, em rascunho. |
| `createPurchaseRequest` | `POST /v1/stock/purchase-requests` | A requisição, aberta. |
| `createQuotation` | `POST /v1/stock/quotations` | A cotação, aberta, a partir de requisições e de linhas avulsas. |
| `deleteQuotationProposal` | `DELETE /v1/stock/quotations/{id}/proposals/{proposal_id}` | Retira a proposta da cotação aberta. |
| `deleteSupplierItem` | `DELETE /v1/stock/supplier-items/{id}` | Remove a condição. |
| `emailPurchaseOrder` | `POST /v1/stock/purchase-orders/{id}/email` | Manda o pedido ao fornecedor por e-mail, com o PDF por link. O aprovado passa a enviado; reenviar não muda o estado. |
| `getPurchaseAutomation` | `GET /v1/stock/purchase-automation` | A compra automática da organização. |
| `getPurchaseMatchConfig` | `GET /v1/stock/purchase-match-config` | As tolerâncias da conferência de 3 vias. Sem configuração, 0% e 0%. |
| `getPurchaseOrder` | `GET /v1/stock/purchase-orders/{id}` | O pedido com as linhas. |
| `getPurchaseRequest` | `GET /v1/stock/purchase-requests/{id}` | A requisição com as linhas. |
| `getQuotation` | `GET /v1/stock/quotations/{id}` | A cotação com linhas, propostas e o mapa de preços. |
| `getReceiptMatch` | `GET /v1/stock/receipts/{id}/match` | A conferência de 3 vias do recebimento: nota, pedido e o que chegou. |
| `linkReceiptPurchaseOrder` | `PUT /v1/stock/receipts/{id}/purchase-order` | Vincula o recebimento aberto ao pedido e casa as linhas pela variante. `null` desfaz. |
| `listPurchaseOrders`, `listPurchaseOrdersAll` | `GET /v1/stock/purchase-orders` | Os pedidos da organização, os mais novos primeiro. |
| `listPurchaseRequests`, `listPurchaseRequestsAll` | `GET /v1/stock/purchase-requests` | As requisições da organização, as mais novas primeiro. |
| `listQuotations`, `listQuotationsAll` | `GET /v1/stock/quotations` | As cotações da organização, as mais novas primeiro. |
| `listReceiptPurchaseOrders` | `GET /v1/stock/receipts/{id}/purchase-orders` | Os pedidos vivos do fornecedor da nota no depósito dela, para vincular. |
| `listSupplierItems`, `listSupplierItemsAll` | `GET /v1/stock/supplier-items` | As condições combinadas com fornecedores. |
| `listSupplierScorecards`, `listSupplierScorecardsAll` | `GET /v1/stock/supplier-scorecards` | A avaliação dos fornecedores no período. |
| `orderPurchaseRequest` | `POST /v1/stock/purchase-requests/{id}/order` | Pedido direto, sem cotação. |
| `purchaseOrderPdf` | `GET /v1/stock/purchase-orders/{id}/pdf` | A folha do pedido em PDF. |
| `putPurchaseAutomation` | `PUT /v1/stock/purchase-automation` | Liga, desliga e configura a compra automática do estoque baixo. |
| `putPurchaseMatchConfig` | `PUT /v1/stock/purchase-match-config` | Grava as tolerâncias do tenant. |
| `putQuotationProposal` | `PUT /v1/stock/quotations/{id}/proposals` | Grava a proposta de um fornecedor; repetir para o mesmo fornecedor substitui. |
| `putSupplierItem` | `PUT /v1/stock/supplier-items` | Grava a condição de um fornecedor para uma variante; repetir para o mesmo par substitui. |
| `sendPurchaseOrder` | `POST /v1/stock/purchase-orders/{id}/send` | Marca o pedido aprovado como enviado ao fornecedor. |
| `submitPurchaseOrder` | `POST /v1/stock/purchase-orders/{id}/submit` | Manda o rascunho para a alçada do financeiro. |

## fz.stock.receipts

| Método | Rota | O que faz |
|---|---|---|
| `cancelReceipt` | `POST /v1/stock/receipts/{id}/cancel` | Encerra sem virar saldo. |
| `checkReceipt` | `POST /v1/stock/receipts/{id}/check` | Declara a conferência encerrada. |
| `createReceipt` | `POST /v1/stock/receipts` | Abre o recebimento (**sem** virar saldo). |
| `getReceipt` | `GET /v1/stock/receipts/{id}` | O recebimento com as linhas. |
| `listCostAdjustments` | `GET /v1/stock/receipts/{id}/cost-adjustments` | Os documentos de custo posterior do recebimento. |
| `listReceipts`, `listReceiptsAll` | `GET /v1/stock/receipts` | A fila de conferência. |
| `postReceipt` | `POST /v1/stock/receipts/{id}/post` | **aqui a nota vira saldo** (E10). |
| `recordCostAdjustment` | `POST /v1/stock/receipts/{id}/cost-adjustments` | O custo que chegou depois. |
| `setReceiptExpenses` | `PUT /v1/stock/receipts/{id}/expenses` | A despesa no **total da nota**. |
| `suggestCostAdjustmentPayable` | `POST /v1/stock/receipts/{id}/cost-adjustments/{adjustment_id}/payable` | Pede ao `pay` o título a pagar do documento posterior. |
| `updateReceiptItem` | `PATCH /v1/stock/receipts/{id}/items/{item_id}` | A conferência de uma linha. |

## fz.stock.receiving

| Método | Rota | O que faz |
|---|---|---|
| `getDfeIngestion` | `GET /v1/stock/dfe-ingestion` | A adesão vigente da organização. |
| `listPendingInboundDocuments`, `listPendingInboundDocumentsAll` | `GET /v1/stock/dfe-ingestion/pending` | As notas que ainda não viraram recebimento, e por quê. |
| `setDfeIngestion` | `PUT /v1/stock/dfe-ingestion` | Liga ou desliga a entrada automática. |

## fz.stock.remittances

| Método | Rota | O que faz |
|---|---|---|
| `attachRemittanceDocument` | `POST /v1/stock/remittances/{id}/document` | Vincula a NF-e da remessa. |
| `listPendingRemittances`, `listPendingRemittancesAll` | `GET /v1/stock/remittances/pending` | Remessas interempresa sem documento. |
| `waiveRemittanceDocument` | `POST /v1/stock/remittances/{id}/waive` | Dispensa o documento, com motivo. |

## fz.stock.replenishment

| Método | Rota | O que faz |
|---|---|---|
| `computeAbcCurve` | `POST /v1/stock/replenishment/abc` | Tira uma nova fotografia da curva. |
| `getAbcCurve` | `GET /v1/stock/replenishment/abc` | A última fotografia. |
| `listReplenishmentPolicies`, `listReplenishmentPoliciesAll` | `GET /v1/stock/replenishment/policies` | As políticas da organização. |
| `listReplenishmentSuggestions`, `listReplenishmentSuggestionsAll` | `GET /v1/stock/replenishment/suggestions` | A fila de reposição. |
| `setReplenishmentPolicy` | `PUT /v1/stock/replenishment/policies` | Cria ou atualiza a política. |

## fz.stock.reservations

| Método | Rota | O que faz |
|---|---|---|
| `cancelReservation` | `DELETE /v1/stock/reservations/{id}` | Devolve o disponível. |
| `confirmReservation` | `POST /v1/stock/reservations/{id}/confirm` | A reserva vira **baixa**. |
| `listReservations`, `listReservationsAll` | `GET /v1/stock/reservations` | Quem está prendendo a mercadoria. |
| `reserve` | `POST /v1/stock/reservations` | Segura o disponível por um prazo. |

## fz.stock.supplierReturns

| Método | Rota | O que faz |
|---|---|---|
| `attachSupplierReturnDocument` | `POST /v1/stock/supplier-returns/{id}/document` | Vincula a NF-e emitida. |
| `cancelSupplierReturn` | `POST /v1/stock/supplier-returns/{id}/cancel` | Cancela um rascunho. |
| `createSupplierReturn` | `POST /v1/stock/supplier-returns` | Abre a devolução, em rascunho. |
| `getSupplierReturn` | `GET /v1/stock/supplier-returns/{id}` | O documento com as linhas. |
| `issueSupplierReturnDocument` | `POST /v1/stock/supplier-returns/{id}/issue-document` | Pede a NF-e de devolução ao módulo fiscal. |
| `listPendingSupplierReturns`, `listPendingSupplierReturnsAll` | `GET /v1/stock/supplier-returns/pending` | A fila do que ainda deve NF-e. |
| `listSupplierReturns`, `listSupplierReturnsAll` | `GET /v1/stock/supplier-returns` | As devoluções da organização. |
| `postSupplierReturn` | `POST /v1/stock/supplier-returns/{id}/post` | Efetiva: a mercadoria sai. |
| `refreshSupplierReturnDocument` | `POST /v1/stock/supplier-returns/{id}/refresh-document` | Consulta de novo a tentativa aberta. |
| `waiveSupplierReturnDocument` | `POST /v1/stock/supplier-returns/{id}/waive` | Dispensa o documento. |

## fz.stock.transferOrders

| Método | Rota | O que faz |
|---|---|---|
| `attachTransferOrderDocument` | `POST /v1/stock/transfer-orders/{id}/document` | Vincula a NF-e de remessa à ordem inteira. |
| `cancelTransferOrder` | `POST /v1/stock/transfer-orders/{id}/cancel` | Cancela o rascunho. |
| `createCrossOrgTransferOrder` | `POST /v1/stock/transfer-orders/cross-organization` | A ordem **entre empresas do grupo**. |
| `createTransferOrder` | `POST /v1/stock/transfer-orders` | Monta a ordem, em rascunho, entre depósitos da mesma organização. |
| `dispatchTransferOrder` | `POST /v1/stock/transfer-orders/{id}/dispatch` | Despacha: tudo sai da origem para o trânsito da organização que recebe, ou nada. |
| `getRemittanceConfig` | `GET /v1/stock/remittance-config` | Série e ambiente da nota de remessa da organização. |
| `getTransferOrder` | `GET /v1/stock/transfer-orders/{id}` | A ordem com as linhas e os recebimentos. |
| `issueTransferOrderDocument` | `POST /v1/stock/transfer-orders/{id}/issue-document` | Pede ao fiscal a NF-e de transferência da ordem. |
| `listTransferOrders`, `listTransferOrdersAll` | `GET /v1/stock/transfer-orders` | As ordens que a organização remete e as que ela recebe, as mais novas primeiro. |
| `putRemittanceConfig` | `PUT /v1/stock/remittance-config` | Grava a série e o ambiente. |
| `receiveTransferOrder` | `POST /v1/stock/transfer-orders/{id}/receive` | Recebe o que chegou, do trânsito para o destino. Sem linhas, recebe tudo o que falta. |
| `refreshTransferOrderDocument` | `POST /v1/stock/transfer-orders/{id}/refresh-document` | Consulta a tentativa aberta no fiscal. |
| `waiveTransferOrderDocument` | `POST /v1/stock/transfer-orders/{id}/waive` | Dispensa a nota da ordem inteira, com motivo. |

## fz.stock.transfers

| Método | Rota | O que faz |
|---|---|---|
| `transfer` | `POST /v1/stock/transfers` | As **duas pernas** num commit só (**E7**), **dentro da mesma organização**. |
| `transferCrossOrganization` | `POST /v1/stock/transfers/cross-organization` | Remessa **entre empresas do grupo**. |

## fz.stock.transformations

| Método | Rota | O que faz |
|---|---|---|
| `cancelTransformation` | `POST /v1/stock/transformations/{id}/cancel` | Cancela um rascunho. |
| `createTransformation` | `POST /v1/stock/transformations` | Abre a ordem, em rascunho. |
| `createTransformationFromBom` | `POST /v1/stock/transformations/from-bom` | Monta a ordem pela ficha técnica. |
| `getTransformation` | `GET /v1/stock/transformations/{id}` | A ordem com as linhas. |
| `listTransformations`, `listTransformationsAll` | `GET /v1/stock/transformations` | As ordens da organização. |
| `postTransformation` | `POST /v1/stock/transformations/{id}/post` | Efetiva. |
| `reverseTransformation` | `POST /v1/stock/transformations/{id}/reverse` | Estorna uma efetivada. |

## fz.stock.warehouses

| Método | Rota | O que faz |
|---|---|---|
| `createWarehouse` | `POST /v1/stock/warehouses` | `POST /v1/stock/warehouses`. |
| `listWarehouses`, `listWarehousesAll` | `GET /v1/stock/warehouses` | Cria o Principal se o tenant ainda não tem um. |
| `updateWarehouse` | `PATCH /v1/stock/warehouses/{id}` | Renomeia, aposenta e aponta o centro de custo. |

## fz.support

| Método | Rota | O que faz |
|---|---|---|
| `getByIncident` | `GET /v1/support/incidents/{code}` | Acha o chamado pelo código do incidente que a tela de erro mostrou. |
| `getTicket` | `GET /v1/support/tickets/{id}` | Lê um chamado da pessoa, com a conversa inteira. |
| `listTickets`, `listTicketsAll` | `GET /v1/support/tickets` | Lista os chamados da pessoa, do mais recente para o mais antigo. |
| `reply` | `POST /v1/support/tickets/{id}/messages` | Responde no chamado. |

## fz.vault.files

| Método | Rota | O que faz |
|---|---|---|
| `checkFile` | `POST /v1/vault/vaults/{id}/files/check` | Confere um arquivo antes de guardar. |
| `deleteFile` | `DELETE /v1/vault/files/{id}` | Apaga um arquivo seguro. |
| `listFiles`, `listFilesAll` | `GET /v1/vault/files` | A pasta "Cofre" do Files (keyset). |
| `replaceFile` | `PUT /v1/vault/files/{id}` | Troca o arquivo por uma versão nova. |
| `uploadFile` | `POST /v1/vault/vaults/{id}/files` | Guarda um arquivo seguro. |

## fz.vault.members

| Método | Rota | O que faz |
|---|---|---|
| `authorize` | `POST /v1/vault/vaults/{id}/authorizations` | Autoriza um consumidor (ou `*`, todos) de uma ferramenta a usar o cofre. |
| `removeMember` | `DELETE /v1/vault/vaults/{id}/members/{user_id}` | Tira uma pessoa do cofre. |
| `revoke` | `DELETE /v1/vault/vaults/{id}/authorizations/{tool}/{consumer_id}` | Retira a autorização de um consumidor. |
| `setMember` | `PUT /v1/vault/vaults/{id}/members/{user_id}` | Põe ou troca o papel de uma pessoa no cofre. |

## fz.vault.values

| Método | Rota | O que faz |
|---|---|---|
| `createValue` | `POST /v1/vault/vaults/{id}/values` | Guarda uma variável ou um segredo. |
| `deleteValue` | `DELETE /v1/vault/values/{id}` | Apaga um valor. |
| `rotateSecret` | `POST /v1/vault/values/{id}/rotate` | Troca o valor de um segredo (só fechado). |
| `sealValue` | `POST /v1/vault/values/{id}/seal` | Fecha uma variável. Irreversível. |
| `updateVariable` | `PATCH /v1/vault/values/{id}` | Troca o valor de uma variável (só aberto). |

## fz.vault.vaults

| Método | Rota | O que faz |
|---|---|---|
| `createVault` | `POST /v1/vault/vaults` | Cria um cofre. |
| `deleteVault` | `DELETE /v1/vault/vaults/{id}` | Apaga um cofre sem consumidor ligado. |
| `getVault` | `GET /v1/vault/vaults/{id}` | Abre um cofre. |
| `listVaults`, `listVaultsAll` | `GET /v1/vault/vaults` | Os cofres que quem pede enxerga (keyset). |
| `updateVault` | `PATCH /v1/vault/vaults/{id}` | Troca nome, descrição e público. |

## fz.vision

| Método | Rota | O que faz |
|---|---|---|
| `clearVisionDefaultTheme` | `DELETE /v1/vision/themes/{id}/default` | Deixa a organização sem tema padrão. |
| `createVisionAnnotation` | `POST /v1/vision/panels/{id}/annotations` | Anota um ponto de um gráfico ("promoção de Natal"). Editor ou dono. |
| `createVisionDevice` | `POST /v1/vision/devices` | Cria uma TV com os painéis em rodízio e devolve o código para digitar nela. |
| `createVisionLink` | `POST /v1/vision/panels/{id}/links` | Cria um link público do painel, com prazo, senha opcional, recorte travado e as origens que podem incorporá-lo; com `audience`, um link de cliente, que mostra só as linhas daquele cliente final. |
| `createVisionPanel` | `POST /v1/vision/panels` | Cria um painel vazio. |
| `createVisionPanelFromTemplate` | `POST /v1/vision/templates/{id}/panels` | Cria um painel a partir de um modelo. |
| `createVisionTemplate` | `POST /v1/vision/templates` | Salva um painel como modelo. |
| `createVisionTheme` | `POST /v1/vision/themes` | Cria um tema. |
| `deleteVisionAnnotation` | `DELETE /v1/vision/panels/{id}/annotations/{annotation_id}` | Apaga uma anotação. |
| `deleteVisionDataset` | `DELETE /v1/vision/datasets/{id}` | Apaga um conjunto. Só o dono. |
| `deleteVisionPanel` | `DELETE /v1/vision/panels/{id}` | Apaga o painel. Só o dono; os links e as TVs dele param na hora. |
| `deleteVisionTemplate` | `DELETE /v1/vision/templates/{id}` | Apaga um modelo. |
| `deleteVisionTheme` | `DELETE /v1/vision/themes/{id}` | Apaga um tema. |
| `drillVisionWidget` | `POST /v1/vision/panels/{id}/widgets/{widget_id}/drill` | O detalhe de um ponto: as linhas que somam a barra, a fatia ou o mês. |
| `duplicateVisionPanel` | `POST /v1/vision/panels/{id}/duplicate` | Duplica um painel que quem pede vê. A cópia é de quem pediu; widget com fonte que essa pessoa não lê fica de fora. |
| `getVisionDataset` | `GET /v1/vision/datasets/{id}` | Um conjunto. |
| `getVisionPanel` | `GET /v1/vision/panels/{id}` | Abre um painel (a grade, sem os dados). |
| `getVisionPanelData` | `POST /v1/vision/panels/{id}/data` | Os dados do painel com os filtros escolhidos. |
| `getVisionTemplate` | `GET /v1/vision/templates/{id}` | Um modelo de painel. |
| `getVisionTheme` | `GET /v1/vision/themes/{id}` | Um tema. |
| `listVisionAnnotations` | `GET /v1/vision/panels/{id}/annotations` | As anotações dos gráficos do painel. |
| `listVisionAudiencePanels` | `GET /v1/vision/audiences/{kind}/{audience_id}/panels` | Os painéis da organização compartilhados com uma área, um grupo, um time ou um cargo (a ficha do cargo ou da área no IAM Center). |
| `listVisionAudiences` | `GET /v1/vision/panels/{id}/audiences` | Com quem o painel está compartilhado além das pessoas: áreas, grupos, times e cargos do IAM. |
| `listVisionDatasetMembers` | `GET /v1/vision/datasets/{id}/members` | Quem pode usar o conjunto. |
| `listVisionDatasets` | `GET /v1/vision/datasets` | Os conjuntos publicados pelo ETL que quem pede pode usar em widget. |
| `listVisionDevices` | `GET /v1/vision/devices` | As TVs de quem pede. |
| `listVisionHistory`, `listVisionHistoryAll` | `GET /v1/vision/panels/{id}/history` | Quem mudou o quê no painel, do mais recente para o mais antigo. |
| `listVisionLinks` | `GET /v1/vision/panels/{id}/links` | Os links públicos do painel. |
| `listVisionMembers` | `GET /v1/vision/panels/{id}/members` | As pessoas do painel. |
| `listVisionPanels`, `listVisionPanelsAll` | `GET /v1/vision/panels` | Lista os painéis que quem pede vê. |
| `listVisionSources` | `GET /v1/vision/sources` | As fontes que o construtor de widget oferece. |
| `listVisionTemplates` | `GET /v1/vision/templates` | Os modelos de painel que quem pede vê. |
| `listVisionThemes` | `GET /v1/vision/themes` | Os temas da organização. |
| `listVisionVersions`, `listVisionVersionsAll` | `GET /v1/vision/panels/{id}/versions` | As versões do painel, da mais recente: cada gravação guarda nome, agenda, filtros e a grade inteira (até 100 por painel). |
| `previewVisionSource` | `POST /v1/vision/sources/preview` | A prévia do construtor: o widget como ficaria, antes de gravar. |
| `refreshVisionPanel` | `POST /v1/vision/panels/{id}/refresh` | Pede todos os widgets de novo, com os filtros em uso. Uma vez por minuto por painel. |
| `removeVisionAudience` | `DELETE /v1/vision/panels/{id}/audiences/{kind}/{audience_id}` | Tira um público do painel. Quem só via o painel por ele perde o acesso na hora. |
| `removeVisionDatasetMember` | `DELETE /v1/vision/datasets/{id}/members/{user_id}` | Tira o acesso de alguém ao conjunto. |
| `removeVisionMember` | `DELETE /v1/vision/panels/{id}/members/{user_id}` | Tira alguém do painel. Qualquer um sai sozinho; tirar outra pessoa é do dono. |
| `restoreVisionVersion` | `POST /v1/vision/panels/{id}/versions/{version}/restore` | Volta o painel a uma versão guardada. Editor ou dono. |
| `revokeVisionDevice` | `DELETE /v1/vision/devices/{id}` | Desliga uma TV. |
| `revokeVisionLink` | `DELETE /v1/vision/panels/{id}/links/{link_id}` | Revoga um link público. |
| `saveVisionLayout` | `PUT /v1/vision/panels/{id}/layout` | Grava a grade inteira. Widget fora da lista é removido; fonte nova ou alterada passa a rodar com o acesso de quem gravou. |
| `searchVisionAudiences` | `GET /v1/vision/audiences` | Busca áreas, grupos, times e cargos da organização para compartilhar um painel. |
| `setVisionAudience` | `PUT /v1/vision/panels/{id}/audiences` | Compartilha o painel com uma área, um grupo, um time ou um cargo, ou troca o papel dele. |
| `setVisionDatasetMember` | `PUT /v1/vision/datasets/{id}/members` | Deixa alguém da organização usar o conjunto em widget. |
| `setVisionDefaultTheme` | `PUT /v1/vision/themes/{id}/default` | Faz do tema o padrão da organização. |
| `setVisionMember` | `PUT /v1/vision/panels/{id}/members` | Dá ou troca o papel de alguém da organização no painel. |
| `setVisionPreferences` | `PUT /v1/vision/panels/{id}/preferences` | Marca o painel como favorito ou página inicial de quem pede. |
| `shareVisionTemplate` | `PUT /v1/vision/templates/{id}/shared` | Publica um modelo para a organização. |
| `transferVisionPanel` | `POST /v1/vision/panels/{id}/transfer` | Passa o painel para outra pessoa que já tem papel nele. |
| `unshareVisionTemplate` | `DELETE /v1/vision/templates/{id}/shared` | Recolhe um modelo publicado: volta a ser só de quem salvou. |
| `updateVisionDevice` | `PUT /v1/vision/devices/{id}` | Troca o nome, os painéis e o tempo de rodízio de uma TV. |
| `updateVisionPanel` | `PUT /v1/vision/panels/{id}` | Edita nome, descrição, agenda e filtros. Pede papel de editor ou dono. |
| `updateVisionTemplate` | `PUT /v1/vision/templates/{id}` | Troca nome e descrição de um modelo. |
| `updateVisionTheme` | `PUT /v1/vision/themes/{id}` | Edita um tema. |

## fz.vision.public

| Método | Rota | O que faz |
|---|---|---|
| `getVisionDeviceFeed` | `GET /v1/vision/public/feed` (pública) | O que a TV mostra agora. |
| `openVisionLink` | `POST /v1/vision/public/link` (pública) | Abre um painel pelo link público. |
| `pairVisionDevice` | `POST /v1/vision/public/pair` (pública) | Pareia a TV com o código mostrado na tela de TVs. |

## fz.work.projects

| Método | Rota | O que faz |
|---|---|---|
| `createProject` | `POST /v1/work/projects` | Cria um projeto em `planned`. |
| `getProject` | `GET /v1/work/projects/{id}` | Um projeto. |
| `listProjects`, `listProjectsAll` | `GET /v1/work/projects` | Lista os projetos da organização (keyset). |
| `setProjectStatus` | `POST /v1/work/projects/{id}/status` | Muda a situação. |
| `summarizeProject` | `GET /v1/work/projects/{id}/summary` | O projeto com as horas somadas. |
| `updateProject` | `PUT /v1/work/projects/{id}` | Troca os campos editáveis. |

## fz.work.serviceOrders

| Método | Rota | O que faz |
|---|---|---|
| `createServiceOrder` | `POST /v1/work/service-orders` | Abre uma ordem de serviço. |
| `createServiceOrderFromSale` | `POST /v1/sales/orders/{id}/service-order` | "Gerar O.S." do orçamento ou do pedido. |
| `getServiceOrder` | `GET /v1/work/service-orders/{id}` | Uma ordem. |
| `listServiceOrders`, `listServiceOrdersAll` | `GET /v1/work/service-orders` | Lista as ordens da organização (keyset). |
| `quoteServiceOrder` | `POST /v1/work/service-orders/{id}/quote` | "Orçar". |
| `setServiceOrderStatus` | `POST /v1/work/service-orders/{id}/status` | Muda a situação. |
| `updateServiceOrder` | `PUT /v1/work/service-orders/{id}` | Troca os campos de uma ordem viva. |

## fz.work.tasks

| Método | Rota | O que faz |
|---|---|---|
| `createTask` | `POST /v1/work/tasks` | Cria uma tarefa. |
| `createTasks` | `POST /v1/work/tasks/batch` | Uma tarefa por registro, numa transação. |
| `getTask` | `GET /v1/work/tasks/{id}` | Uma tarefa (o link do lembrete abre aqui). |
| `listTasks`, `listTasksAll` | `GET /v1/work/tasks` | Lista pelo filtro (keyset). |
| `setTaskStatus` | `POST /v1/work/tasks/{id}/status` | Conclui, reabre ou cancela. |
| `summarizeTasks` | `GET /v1/work/tasks/summary` | As contagens de "Minhas tarefas". |
| `updateTask` | `PUT /v1/work/tasks/{id}` | Substitui os campos editáveis. |

## fz.work.timesheet

| Método | Rota | O que faz |
|---|---|---|
| `createTimeEntry` | `POST /v1/work/time-entries` | Lança horas. |
| `decideTimeEntries` | `POST /v1/work/time-entries/decisions` | Aprova, recusa ou reabre um lote. |
| `deleteTimeEntry` | `DELETE /v1/work/time-entries/{id}` | Apaga um apontamento não aprovado. |
| `listTimeEntries`, `listTimeEntriesAll` | `GET /v1/work/time-entries` | Lista os apontamentos (keyset). |
| `updateTimeEntry` | `PUT /v1/work/time-entries/{id}` | Edita um apontamento. |

## fz.work.views

| Método | Rota | O que faz |
|---|---|---|
| `createView` | `POST /v1/work/views` | Guarda o filtro de uma lista. |
| `deleteView` | `DELETE /v1/work/views/{id}` | Apaga uma visão salva. |
| `listViews`, `listViewsAll` | `GET /v1/work/views` | As visões de uma lista. |
| `updateView` | `PUT /v1/work/views/{id}` | Troca query, nome e alcance. |
