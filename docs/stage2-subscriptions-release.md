# Etapa 2 — vínculos confirmados e ciclo Kiwify

Estado: desenvolvimento e pacote preparados no PR #4, rascunho. Nenhuma migration/função publicada em produção. A Etapa 1 do commit `d2608f8` é preservada integralmente; não executar a migration ampla de produtos/RLS/administração.

## Correções incluídas e reutilizadas

- `verified_claims_only`: novos vínculos exigem o e-mail confirmado em `auth.users`, normalizado e correspondente ao e-mail da compra. Não usa e-mail do JWT, metadados editáveis ou coincidência de perfil como autorização final. O webhook confirma a conta no Auth e o trigger do banco cobre inclusive escritores legados/service role.
- O cadastro não vincula antes da confirmação já existente. A transição de `email_confirmed_at` associa somente compras sem proprietário; a RPC e `useSubscription` recuperam pendências. Uma recuperação efetiva atualiza somente o cache de benefícios desse usuário, evitando módulos bloqueados por consulta paralela anterior ao vínculo, sem alterar o cálculo da Etapa 1. O gerador legado usa a RPC e o ID proprietário. Não cria uma nova confirmação.
- IDs proprietários existentes não podem ser transferidos nem zerados. Um proprietário histórico com e-mail alterado conserva acesso; renovação não atribui proprietário. Nenhuma migration faz backfill ou altera linhas comerciais.
- `webhook_event_type` prevalece sobre o `order_status` da última cobrança. Contrato (`subscription_id`/`Subscription.id`) e pedido (`order_id`) têm funções separadas. Discordância entre IDs é uma pendência durável, não pagamento aprovado.
- Aprovação inicial recorrente sem registro local exige uma única cobrança concluída paga, correspondente ao pedido corrente. Uma aprovação atrasada de cobrança posterior não recria uma assinatura ausente. Registro local único existente continua usando seu ID histórico, sem renomeá-lo.
- Renovação exige contrato/pedido, cobrança paga única e consistente no histórico, status recorrente ativo, acesso/ período autorizados e instantes explícitos com fuso. Só estende validade finita até `customer_access.access_until`, nunca reduz. Validade histórica nula permanece nula. Não deriva prazo de frequência, valor, `next_payment` ou data local.
- Cobranças conflitantes, registro inexistente/ambíguo, estado encerrado, identidade divergente e datas ambíguas são encaminhados para conciliação. Não reativa cancelados/reembolsados. Renovação não cria compra nem envia novas boas-vindas.
- Compras usam unicidade de `kiwify_subscription_id` e `ON CONFLICT DO NOTHING`; renovações usam comparação do estado/prazo anterior e reconhecimento por pedido. Se uma duplicata concorrente já estendeu o mesmo registro ativo, uma releitura confirma o prazo sem criar pendência indevida. Repetição não cria outro acesso ou outro e-mail. Logs diagnósticos por tentativa não são um ledger financeiro completo nem são apagados.
- `review_required` só recebe HTTP 200 após confirmar o recibo persistido. SDK/transportes/escritas vazias falham com 5xx; chave determinística + índice único deduplicam a mesma observação. Recebimento não tem `success` de aprovação e informa `access_changed=false`.
- Novo `kiwify_event_context` impede que outra versão do payload ou outro tipo de aprovação/renovação contorne uma pendência do mesmo contrato/pedido. A identidade inclui cobranças concluídas, e não e-mail. Uma pendência exige resolução humana explícita futura, não é apagada ou aprovada por retries.
- Cancelamento/atraso e reembolso/chargeback recorrentes são identificados e preservados como pendências, sem encurtar o período já pago. Conhecimento histórico de recorrência impede tratar um pedido recorrente sem campos Subscription como compra avulsa.
- Reembolso avulso exige compra local única e e-mail original. Só afeta seu status; preserva proprietário, identificadores, plano, valor e validade. A fonte `clientes_autorizados` só é inativada se apontar para essa compra e não houver outro produto com acesso ativo. Fontes de outros produtos/promoções não são revogadas por e-mail globalmente.
- Autorização da fonte legada e reembolso avulso usam lock da mesma compra. Aprovação repetida não reativa fonte de registro reembolsado/encerrado ou vencido nem substitui IDs do cliente/produto. Uma nova compra também não reativa uma fonte legada revogada de outro produto/promoção. Reembolso sem compra identificada fica pendente e bloqueia posterior recriação por aprovação.

Não foi alterada a matriz comercial, nenhuma função/RLS de benefícios da Etapa 1, regras de administradores, fornecedores ou precificação. O comportamento preexistente de criação de perfil/role em `handle_new_user` permanece igual; somente a associação de compra foi protegida.

## Conciliação do contrato com três linhas — leitura de 11/11/2026

A consulta [stage2-contract-lineage.sql](stage2-contract-lineage.sql) cruza IDs de contrato/pedido e o histórico `Subscription.charges.completed`. Retorna rótulos locais, relações e metadados temporais, sem e-mail/nome/documento/IDs individuais. Não usar e-mail para decidir um sobrevivente.

| Registro local (ordem de criação) | Evidência | Classificação possível |
| --- | --- | --- |
| A — agosto/2026 | chave é `order_id`, presente no histórico concluído pago; aprovação registrada imediatamente após inserção; é a primeira cobrança observada nesse histórico | compra/cobrança inicial observada, não chave do contrato |
| B — setembro/2026 | outra chave de pedido concluído pago; aprovação imediatamente após inserção, seguida de `subscription_renewed` da mesma cobrança em menos de um segundo | cobrança posterior registrada como outra assinatura local |
| C — outubro/2026 | terceira chave de pedido concluído pago; aprovação imediatamente após inserção, seguida de `subscription_renewed` da mesma cobrança em menos de um segundo | outra cobrança posterior registrada como assinatura local |

Há três pedidos distintos pagos no histórico observado, um proprietário local comum, três registros ativos e validade nula nos três. Nenhuma das três chaves locais é o ID do contrato. Portanto, não são três cópias do mesmo `order_id`: são três representações locais de cobranças de um mesmo contrato. A sequência de logs é compatível com o caminho antigo que privilegiava `paid` e identificava compras por pedido; o log não comprova a versão exata que executou cada inserção.

Não há evidência que autorize apagar B/C, renomear A para o contrato, consolidar benefícios, transferir ou escolher automaticamente uma linha. O código trata as três correspondências como ambiguidade, confirma um recibo durável e mantém os três registros intactos. A escolha do registro canônico e eventual política de associação precisam de conciliação expressa na Kiwify/negócio, em tarefa autorizada separada.

Contagens agregadas atuais: 35 ativas, 5 sem vínculo, 0 ativas vinculadas a Auth não confirmado, 0 órfãs e 1 com e-mail divergente do proprietário. As cinco poderão ser vinculadas quando a identidade correspondente confirmar o e-mail; o vínculo divergente existente permanece com seu ID original. Estas contagens não foram modificadas para passar nos testes.

## Fontes oficiais e limites contratuais

- [Webhooks: central Kiwify](https://ajuda.kiwify.com.br/pt-br/article/como-funcionam-os-webhooks-2ydtgl/): Apps → Webhooks → Ver logs permite conferir requisição e resposta. Não reenviar webhooks de produção como teste.
- [Especificação técnica Kiwify](https://kiwify.notion.site/Webhooks-pt-br-c77eb84be10c42e6bb97cd391bca9dce): 2xx confirma recebimento; falhas podem ser repetidas até cinco vezes. Reconsultada pelo índice da página oficial (o link direto Notion retorna 404). Documenta IDs e os objetos `Subscription.charges`/`customer_access`; exemplos não fornecem uma ordem global confiável entre eventos.
- [Produtos de assinatura](https://ajuda.kiwify.com.br/pt-br/article/como-criar-um-produto-de-assinatura-9crmrj/): fim das cobranças pode manter o último período pago; atraso não desloca automaticamente a data de renovação.
- [Cancelar assinatura](https://ajuda.kiwify.com.br/pt-br/article/como-cancelar-uma-assinatura-como-produtor-1wnont9/): cancelar impede cobranças futuras e não reembolsa; reembolsar venda associada também cancela a assinatura. Isso não determina sozinho como revogar um período externo quando há outras cobranças pagas.
- [Supabase Auth](https://supabase.com/docs/guides/auth/managing-user-data): identidade autoritativa em Auth; nenhuma configuração ou template de confirmação alterado.

Pendências realmente dependentes da Kiwify:
1. Registro canônico do contrato histórico e correspondência comercial das três cobranças. O endpoint continuará em conciliação para esse contrato até decisão explícita.
2. Nos exemplos reais de cancelamento, reembolso de cobrança inicial/antiga/atual e eventual retomada: `webhook_event_type`, `order_status`, `subscription_id`/`Subscription.id`, `order_id`, `Subscription.status`, `charges.completed[].order_id/status/created_at`, `customer_access.has_access/active_period/access_until`, `refunded_at` e eventual ID/versão de evento monotônico.
3. Fuso e semântica de `approved_date`, `created_at`, `updated_at`; política de reembolso parcial/antigo sobre períodos posteriores; evento e condições de retomada após encerramento. Não se presume que uma aprovação tardia reative um reembolso/cancelamento.

Não há conector Kiwify autenticado disponível para conferir a configuração da conta ou obter um estado atual assinado do contrato. A evidência vem da documentação oficial e dos logs já armazenados no Supabase, somente em leitura. Essas pendências não impedem testar/entregar o código conservador; impedem automatizar decisões comerciais ambíguas.

## Brevo: dependência mínima preservada

Produção ainda tem `kiwify-webhook` v78, com reserva direta na tabela existente `comunicacoes_transacionais`. A branch já usa `reserve_access_email`, `begin_access_email_dispatch` e `finish_access_email`, ausentes em produção. Publicar a função sem essas três RPCs faria o envio de boas-vindas falhar.

Por isso o pacote reutiliza **somente** `20261111133107_transactional_email_recovery.sql`: colunas de reserva/lease/recibo e três RPCs service-only usadas pelo handler. Não recria a tabela, integração, template, página ou secrets. Não adiciona cron, remetente paralelo ou ferramenta de reenvio em lote. `sent` não é reenviado; entrega incerta exige conciliação com recibo Brevo. Primeiro envio preserva endpoint, template 5, destinatário original, parâmetros e finalidade. Renovação/review não disparam boas-vindas.

## Migrations exatas e dependências

Aplicar futuramente, transacionalmente e individualmente, nesta ordem:

1. `20261110110000_verified_claims_only.sql` — RPC/trigger de confirmação e guarda de proprietário. Independe dos benefícios/outbox. Deve preceder novo gerador, webhook e retry do frontend.
2. `20261111133107_transactional_email_recovery.sql` — pressupõe a outbox já existente, não sua criação. Deve preceder o webhook preparado.
3. `20261111141651_durable_webhook_reviews.sql` — `webhook_logs.event_key`, unicidade e constraint de pendência. Deve preceder o webhook preparado.
4. `20261111160309_stage2_kiwify_event_guards.sql` — extração de IDs, índice GIN, contexto de conciliação e RPCs atômicas de autorização/reembolso. Deve preceder o webhook preparado. Não modifica tabelas de fornecedores/precificação/administração/benefícios.

A migration de benefícios `20261111152724_stage1_plan_benefits.sql` permanece separada e inalterada. Etapa 2 funciona sem ela e foi testada também com ela aplicada. Não executar `20261111132917_approved_product_access.sql` nem a criação antiga de comunicacoes_transacionais. Não usar `supabase db push` genérico: o histórico remoto tem divergências antigas já documentadas.

## Pacote revisável

`release/stage2-subscriptions.json` lista quatro migrations, dois endpoints e o retry de `useSubscription` já implementado. `npm run prepare:stage2 -- /diretorio/novo`:

- reutiliza o gerador da Etapa 1 sem modificá-lo;
- compara todos os arquivos protegidos da Etapa 1 com `d2608f8` e interrompe se houver alteração;
- monta uma base `origin/main` + Etapa 1 preservada + somente os arquivos da Etapa 2;
- exclui a migration ampla, outras funções e hooks que dependam de RLS adiada;
- registra commits base/fonte e SHA-256 dos arquivos do pacote em `stage2-manifest.json`;
- recusa sobrescrever um diretório existente e não executa nenhuma implantação.

O pacote inclui a Etapa 1 para build/testes coerentes; o manifesto distingue a migration/função Soph da etapa anterior das quatro migrations/dois endpoints desta etapa. O ERP é fixture da base para validação, não um novo deploy. O PR inteiro contém mudanças adiadas e não deve ser integrado indiscriminadamente.

## Testes reproduzíveis e limites

`npm run test:stage2`: testes de vínculos, outbox, handlers, renovações, recibos e integração SQL real. A integração nova roda em duas variantes: baseline estrutural atual e baseline com Etapa 1 aplicada. Dados exclusivamente fictícios. `npm run test:subscriptions` mantém também as regressões amplas anteriores do PR. `npm run test:stage1` confirma a etapa preservada. `npm test`, build, TypeScript, lint e Deno check completam a verificação.

Os novos testes executam o handler real sobre PostgreSQL/PGlite, incluindo SQL das RPCs, ACLs, triggers e índice. O adaptador simula apenas HTTP/Auth/Brevo e serialização REST; não há tráfego externo nos testes. A disputa autorização/reembolso usa chamadas concorrentes no motor isolado; isto não substitui teste de carga multi-conexão nem prova ordenação global de eventos Kiwify. O teste do frontend conserva o acesso existente mesmo quando a recuperação falha e não consulta dados sem login.

## Publicação futura e reversão

Nenhuma autorização desta tarefa permite produção. Antes de publicar: Supabase Pro, backup recuperável comprovado (sem presumir PITR), retenção/restore e artefatos das versões anteriores. Capturar definições SQL/ACLs/triggers e código implantado de webhook/gerador em armazenamento restrito. Repetir somente preflight estrutural/agregados; não corrigir dados de clientes para adequá-los ao pacote.

1. Gerar pacote do commit aprovado, revisar manifesto/checksums e ensaiar em ambiente isolado.
2. Confirmar pré-requisitos e aplicar somente as quatro migrations acima. Se Etapa 1 ainda não implantada, usar seu roteiro separado; não trocar pela migration ampla. Parar no primeiro erro.
3. Implantar somente `kiwify-webhook` e `generate-soph-token`, preservando secrets/configuração de gateway existentes. Soph/frontend de benefícios seguem o roteiro da Etapa 1; o retry `useSubscription` só é integrado depois da RPC verificada. Não publicar o restante do PR por conveniência.
4. Validar com contas fictícias autorizadas em ambiente separado e conferir agregados de produção sem compras/webhooks experimentais, sem alterar assinantes. Confirmar sincronização GitHub/Netlify/Lovable sem mudar suas configurações.

Reversão normal: interromper etapas seguintes, restaurar os artefatos anteriores de função/frontend e a definição SQL específica necessária, sob decisão de incidente. Manter recibos e colunas de outbox; não apagar eventos nem sobrescrever tabelas de assinaturas com backup. Uma reversão de guarda de identidade reabre a vulnerabilidade: preferir correção para frente; não automatizar downgrade de segurança. Falha antes do commit SQL deve dar rollback da transação específica. Restaurar backup primeiro em ambiente separado para recuperação comprovada se houver dano real, sem perder pagamentos posteriores.

Não excluir/consolidar/reatribuir as três linhas, não zerar proprietários e não recalcular prazos existentes. Não reprocessar eventos reais para validar o pacote.

## Resultados executados nesta entrega

- Branch completa: 181 verificações de segurança (125 anteriores + 28 integrações novas em cada uma das duas variantes de schema), 25 testes SQL da Etapa 1 preservada e 31 testes de interface/hook. Os 21 testes de endpoints também passaram no comando da Etapa 1, sem contá-los novamente no total anterior.
- Pacote isolado com instalação limpa: 188 verificações de segurança/benefícios e 27 testes de interface; build e TypeScript aprovados. O pacote exclui os testes/dependências da RLS ampla adiada.
- Build/TypeScript da branch, ESLint dos quatro arquivos TS afetados/implantáveis, Deno check dos dois endpoints e `git diff --check` aprovados.
- Testes de erro produzem logs de falhas fictícias esperadas; nenhuma chamada foi enviada à Kiwify, Brevo, Auth ou ERP reais.

Os hashes do pacote final são gerados a partir do commit limpo desta entrega. O preview Netlify é da branch inteira; não comprova implantação das migrations nem validação de pagamentos em produção.
