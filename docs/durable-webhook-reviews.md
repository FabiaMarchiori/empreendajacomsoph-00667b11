# Recebimento durável de eventos Kiwify pendentes

Correção sobre o commit 25ed7c7, preparada no PR #4. Não aplicada em produção.

## Contrato HTTP

A Kiwify pode repetir entregas que não recebam 2xx, conforme a documentação técnica já referenciada em kiwify-renewals.md. Uma necessidade de análise humana não é, por si só, falha de transporte.

Todos os caminhos review_required agora usam receiveForReview:
1. Gravar o payload completo e o motivo, confirmando o ID retornado pelo Supabase.
2. Se o evento já estiver gravado, confirmar a existência da mesma pendência durável.
3. Só então responder HTTP 200 com received=true, status=review_required, access_changed=false e o event_id. O campo success de aprovação não é emitido.
4. Se insert/upsert/select falhar, ou não houver recibo confirmado, responder HTTP 500. Mesmo que o registro diagnóstico também falhe, o handler termina com uma resposta 5xx controlada.

logWebhook deixou de engolir exceções e verifica também o campo error retornado pelo SDK. Erros transitórios na leitura ou atualização de uma renovação não são classificados indevidamente como decisões de análise manual: propagam 5xx para repetição segura.

Os erros de validação de payload/autenticação continuam distintos; esta alteração não transforma dados inválidos em pagamento aprovado.

## Duplicatas e concorrência

Migration preparada: 20261111141651_durable_webhook_reviews.sql.

- Adiciona event_key nullable a webhook_logs e um índice único completo. Valores null preservam os registros históricos de auditoria, sem preenchimento retroativo, exclusão ou consolidação.
- A chave SHA-256 v1 incorpora o tipo de evento, contrato (subscription_id/Subscription.id), pedido (order_id), revisão do provedor (updated_at/refunded_at) e a evidência completa do payload em JSON canônico. Não acrescenta horário local, contador local de tentativa, motivo local da falha ou um ID aleatório à identidade. E-mail não é identidade do evento.
- Reordenação das propriedades JSON não produz outra chave. Arrays mantêm sua ordem. Payload/revisão do provedor diferente constitui outra observação e é preservado: não se inventa um identificador universal de evento que não foi comprovado no payload Kiwify.
- ON CONFLICT(event_key) DO NOTHING evita duplicatas mesmo quando duas requisições leram inicialmente que o evento não existia. No conflito, o recibo já gravado é consultado e confirmado antes de responder 200.
- Uma leitura inicial identifica retries de eventos já pendentes, antes de qualquer fluxo de concessão, revogação, Brevo ou vínculo. Mudar o estado local da assinatura entre tentativas não converte o mesmo evento pendente em aprovação automática.
- A constraint webhook_review_event_status exige status=review_required para chaves não nulas. Um recibo pendente não pode ser renomeado para success ou renewal_recognized. A resolução manual precisa de ação explícita e separada, fora desta correção; HTTP 200 somente confirma recebimento.

A deduplicação é de novas pendências. Logs diagnósticos gerais permanecem por tentativa, e pendências históricas sem chave não são apagadas nem deduplicadas retroativamente. Nenhuma nova política RLS, role, secret ou permissão de cliente foi introduzida.

## Preservação

Nenhum evento de conciliação chama código de compra, modifica assinatura, proprietário, plano, validade, pagamento ou clientes_autorizados. Também não dispara a Brevo. O fluxo aprovado e a renovação inequívoca continuam separados. Cancelamento/reembolso recorrente pendente mantém o período pago intacto.

O log após estado terminal agora preserva o payload completo em vez de um objeto vazio, para que a evidência e a identidade possam ser conciliadas.

## Implantação futura

Esta migration precisa ser aplicada, transacionalmente, antes da nova versão de kiwify-webhook, junto às dependências anteriores revisadas. Não usar db push genérico. Sem a coluna/índice, a função falha fechada com 5xx; não há fallback em memória que confirme recebimento sem persistência.

Não executar DDL em produção nesta etapa. Supabase Pro, backup recuperável e autorização final específica continuam pendentes. A migration não tem DML, backfill nem alteração de assinaturas. Testes locais preservam registros históricos fictícios com event_key null.

Reversão: restaurar a versão anterior da função se necessário, mantendo as pendências já gravadas e a coluna/índice. Não apagar recibos ou assinaturas. O código anterior não aproveita a nova garantia de confirmação/deduplicação; qualquer reversão deve considerar isso. Nenhuma resolução automática ou aprovação de pagamento faz parte do rollback.

## Validação

18 testes novos executam o handler real contra armazenamento PostgreSQL/PGlite isolado, com adaptador de Supabase e dados fictícios:
- Nenhum HTTP 200 antes de a gravação completar.
- Erro retornado pelo SDK, exceção de transporte, leitura falha e diagnóstico também indisponível: 5xx controlado.
- Insert sem erro mas sem recibo durável: 5xx.
- Reenvio idêntico e JSON com propriedades reordenadas: mesmo recibo, uma pendência.
- Requisições simultâneas com leitura inicial obsoleta: unicidade no banco.
- Cancelamento, atraso, reembolso e chargeback: pendência, sem alteração comercial ou envio de e-mail.
- Contrato/pedido/tipo/revisão diferentes não são confundidos.
- Pendência anterior permanece pendente mesmo se o estado local mudou.
- O banco rejeita reclassificar recibo pendente como renovação reconhecida.
- Após recuperar o armazenamento, a nova tentativa recebe o recibo persistido.

As regressões de renovação e webhook foram ajustadas para verificar o corpo review_required no 200, preservando suas verificações de assinatura e período. A suíte completa tem 125 testes de segurança e 17 testes Vitest; build, TypeScript, lint dos TS alterados e Deno check são executados antes do commit. Não há testes funcionais em produção, envio de webhook ou e-mail real.
