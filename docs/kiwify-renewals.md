# Kiwify: renovação, identidade de contrato e cobrança

Estado: correção preparada no PR #4, sem publicar em produção. Nenhuma migration nova é necessária para esta correção. Nenhum webhook real foi enviado/reprocessado.

## Fontes oficiais consultadas

- Central Kiwify, [Como funcionam os webhooks?](https://ajuda.kiwify.com.br/pt-br/article/como-funcionam-os-webhooks-2ydtgl/), que aponta para a documentação técnica abaixo e descreve consulta de requisição/resposta em Apps → Webhooks → Ver logs.
- [Webhooks (pt-br), documentação técnica Kiwify](https://kiwify.notion.site/Webhooks-pt-br-c77eb84be10c42e6bb97cd391bca9dce). A abertura direta do Notion retornou 404; o conteúdo técnico foi consultado pelo índice de busca da página oficial, inclusive o exemplo JSON. Não foi usada especificação de terceiros como contrato normativo.
- [Como criar um produto de assinatura](https://ajuda.kiwify.com.br/pt-br/article/como-criar-um-produto-de-assinatura-9crmrj/), atualizado em 03/11/2026: cancelamento impede cobranças futuras e não equivale a reembolso; a data de renovação não deve ser derivada da data em que o pagamento atrasado ocorreu. O último período pago pode continuar valendo.

Campos documentados: webhook_event_type distingue o evento do order_status do pedido; subscription_id e Subscription.id identificam a recorrência; order_id identifica o pedido/cobrança; Subscription.charges.completed contém pedidos concluídos, status e created_at; Subscription.customer_access informa has_access, active_period e access_until. Subscription.next_payment é agendamento, não uma substituição automática do prazo de acesso. O produto oficial também pode vir em Product.product_name.

## Evidência real, somente leitura e sem dados pessoais

O código implantado foi recuperado em leitura: kiwify-webhook versão 78. Continua usando order_status antes do evento e Subscription.id antes de order_id, sem ler subscription_id de primeiro nível.

Nos logs consultados:
- 6 payloads contêm webhook_event_type=subscription_renewed, sempre order_status=paid. Quatro foram registrados como processed por versões históricas; dois foram registrados como paid/success pelo caminho de aprovação. Isso não comprova renovação correta pela versão atual.
- Os seis têm subscription_id preenchido, sem Subscription.id, com order_id diferente do contrato. Os pedidos correntes aparecem como paid no histórico de cobranças, que possui de 2 a 9 elementos. Há dois contratos com order_id distintos entre renovações (até quatro pedidos em um contrato).
- Todos os seis possuem approved_date, updated_at e acesso até uma data explícita. As datas de pedido são strings sem fuso garantido; não foram usadas para inventar ordem global de eventos. Não apareceu outro identificador de cobrança no histórico concluído além de order_id; payment_merchant_id não foi tratado como identificador de cada cobrança.
- 3 cancelamentos com order_status=paid foram classificados paid/duplicate. Outros 9 cancelamentos constam como processed historicamente; um aparece como refund_requested/ignored. O nome registrado no log, sozinho, não determina o evento real.
- Cruzando apenas chaves de contrato/pedido e histórico concluído, um contrato corresponde a 3 linhas locais. O outro grupo de renovação não tem associação local comprovada nesse histórico. Não foi escolhida uma linha pelo e-mail nem foram consolidados registros.
- 35 assinaturas estão ativas, sendo 14 sem validade finita e 21 com validade preenchida. Nenhum desses registros foi alterado.

Os resultados exportados foram contagens, tipos de eventos, presença/relação de campos e metadados temporais, sem nomes, endereços, documentos, contatos, tokens ou IDs individuais.

## Correção implementada

1. Priorizar webhook_event_type; usar event/order_status somente como compatibilidade quando não houver tipo explícito. Um tipo desconhecido explícito nunca vira aprovação só porque o último pedido está paid.
2. Separar contrato de cobrança: aceitar subscription_id e Subscription.id; rejeitar discordância. Primeira compra recorrente usa a chave de contrato. Pedido avulso continua usando order_id. Objeto de recorrência sem chave não gera compra por fallback.
3. Resolver aliases legados por chaves documentadas, inclusive pedidos do histórico concluído do próprio contrato. Só uma correspondência é aceitável; zero ou várias numa renovação exigem conciliação. Nunca resolver apenas pelo e-mail, renomear IDs, unir linhas ou criar compra na renovação.
4. Renovação exige comprovação coerente: pedido paid, assinatura active, permissões de período verdadeiras, cobrança corrente paga no histórico e access_until/created_at com instantes inequívocos. E-mail deve corresponder ao registro original; o proprietário, plano, valor, data inicial e identificadores permanecem intactos.
5. Registro encerrado (inclusive reembolsado/cancelado) não é reativado automaticamente. Registro ativo com validade finita só pode ter o prazo estendido até o access_until explícito da Kiwify; nunca encurtar. Validade histórica null é preservada, não convertida em um mês/ano presumido. Renovação histórica já vencida exige consultar o estado atual.
6. Atualização usa comparação do estado/validade originais (compare-and-set). Reembolso ou renovação concorrente não pode ser sobrescrito. Não modifica status nem user_id.
7. Cobrança de renovação já reconhecida é identificada pelo order_id no histórico próprio do webhook. O processamento permanece idempotente mesmo se o registro de log falhar: compare-and-set e máximo de prazo, sem inserção de compra ou envio de e-mail. O log não é um ledger financeiro completo nem oferece ordenação global.
8. Renovação não dispara novo e-mail inicial Brevo. Primeira compra e repetição de aprovação continuam usando template 5 e a outbox do PR, com a chave persistida da assinatura, inclusive quando esta ainda for um order_id legado. Produto, cliente e identidade confirmada são preservados.
9. Cancelamento/atraso recorrente e reembolso/chargeback de recorrência são reconhecidos e encaminhados para conciliação (409), sem se disfarçarem de compra paga. Não se inventa revogação imediata de período já pago nem se revoga um contrato inteiro por uma cobrança antiga. Reembolso de compra avulsa mantém o caminho existente. Falhas não são mascaradas como sucesso.

## O que ainda precisa ser confirmado na Kiwify

Antes de publicar o conjunto para TODOS os registros legados:
- Conferir em Apps → Webhooks → Ver logs os eventos habilitados e os exemplos reais completos de primeira compra, renovação, cancelamento, atraso, reembolso de primeira cobrança e reembolso de uma renovação. Não enviar esses eventos ao endpoint de produção como teste.
- Para cada exemplo, confirmar webhook_event_type, order_status, subscription_id/Subscription.id, order_id e Subscription.charges.completed[].order_id/status/created_at. Confirmar qual linha local deve representar o contrato que hoje tem três correspondências. Nenhuma transferência ou consolidação está autorizada por esta correção.
- Confirmar que Subscription.customer_access.has_access/active_period/access_until são a fonte contratual de acesso no aplicativo externo e como se apresentam em atraso e cancelamento. Não inferir prazo de next_payment, frequência, valor ou data local.
- Confirmar o fuso/semântica de approved_date, created_at e updated_at, e se há versão/ID monotônico do evento para ordenar cancelamento, reembolso parcial/antigo e pagamento posterior do mesmo contrato. Os exemplos públicos não estabelecem uma ordem global confiável.
- Confirmar a política de renovação após cancelamento/inativação e o alcance do reembolso de uma cobrança sobre os demais períodos pagos. Até lá, manter conciliação e não reativar ou revogar automaticamente nesses casos.

O caminho inequívoco de renovação ativa/única está corrigido e testado; associação histórica ambígua, contrato ausente e ciclo de cancelamento/reembolso não estão declarados resolvidos. Essas restrições são intencionais para preservar os clientes.

## Testes e implantação

28 regressões novas executam o handler real com banco/Auth/Brevo fictícios e relógio fixo. Cobrem prioridade de evento, ambas as chaves, colisão de IDs, registro ausente/ambíguo, cobranças distintas/duplicadas, validade finita/null, datas inválidas/sem fuso, payload incompleto, corrida com reembolso, primeira compra e preservação de vínculo/benefícios/e-mail.

O comando npm run test:subscriptions inclui essas regressões e as 79 anteriores. Manter a sequência de implantação documentada em approved-matrix-release.md; Supabase Pro, recuperação comprovada e aprovação final continuam obrigatórios. Esta tarefa não aplicou migrations, publicou funções, alterou assinaturas ou enviou e-mails/webhooks reais.
