# Matriz comercial e recuperação transacional — preparada, não implantada

> Contrato HTTP atual de conciliação, deduplicação e migration adicional: `docs/durable-webhook-reviews.md`.

> Atualização sobre renovações e campos Kiwify: `docs/kiwify-renewals.md`. O reconhecimento de eventos/IDs e a extensão de período explícito em contratos ativos únicos foram corrigidos; cancelamento/reembolso recorrente e correspondências legadas ambíguas permanecem para conciliação.

## Estado e compatibilidade

A branch incorpora origin/main a4f5809 e o commit Lovable 20d399761f10e07803f944b30971d853a4661f42 via merge b2d01c5. O commit d7ba659 e a proteção de identidade confirmada foram preservados. A modificação de tipos da Lovable foi incorporada e refinada para SupabaseClient (sem any explícito); Deno check valida a compatibilidade.

Não foi feito merge em main, alteração na Lovable, migration/Edge deploy/secret change de produção, compra ou teste funcional com clientes reais. O PR #4 continua rascunho. O preview Netlify pode ser gerado pelo PR; não demonstra que o novo backend esteja instalado.

## Matriz efetiva, no servidor e na interface

| Grupo | Soph | ERP | Bolsas e comuns | Exclusivos e precificação |
|---|---|---|---|---|
| Ecossistema | Sim | Sim | Sim | Sim |
| Anual | Sim | Sim | Sim | Sim |
| Mensal | Sim | Sim | Sim | Sim |
| Bolsas | Sim | Somente concessão individual explícita | Sim | Não |
| Sem assinatura / expirada / cancelada | Não | Somente concessão individual vigente de ERP | Não | Não |
| Administrador já autorizado | Sim | Sim | Sim | Sim |

`current_product_access()` alimenta o frontend; `has_product_access()` verifica assinatura própria ativa, expiração e concessões. Soph consulta essa autorização antes de chamar IA, ignorando alegações comerciais do cliente. ERP valida a própria identidade via `has_erp_access`, sem permitir consultar UUID alheio. As RLS restritivas se compõem com a propriedade das linhas existentes para precificação e com a separação de fornecedores; esconder menu não é a proteção de segurança.

A rota /erp permite bônus individual sem abrir /gestao ou precificação. Meus Acessos, Home, Sidebar, rotas e nicho refletem os direitos do servidor. A recuperação verificada de vínculos ocorre antes de consultar os direitos e não muda a confirmação de e-mail existente.

## Administradores, legado e promoções

A fonte confiável é a união dos privilégios persistidos `profiles.is_admin` e `user_roles.admin`, consultada no servidor. Ambas as origens legítimas são preservadas. O bootstrap de administrador por e-mail no cadastro foi removido; nenhum flag/role existente é apagado. O cadastro do ERP externo recebe a identidade autenticada; não foi alterado o projeto externo nem confirmada sua gestão interna de roles, pois não há acesso a esse backend.

Concessões individuais ficam em `product_access_grants`, com produto, motivo, origem, autorizador, vencimento e revogação. Só administrador pode gravar pela API, identificando-se como autorizador. Bolsa não cria concessão de ERP nem usa clientes_autorizados como atalho. A migration preserva códigos legados válidos que já davam ERP, com sua validade e origem marcada para revisão; novos códigos não dão ERP automaticamente. Não se chama um código histórico de promoção comprovada sem evidência.

Starter surgiu no commit 625517e967dbb1c2cda4a47992f13a7b937523cf (28/04/2026), como keyword no novo usePlanAccess; não há evidência de um produto correspondente. Só IDs de assinaturas Starter pré-existentes são congelados em legacy_subscription_access para preservar os benefícios anteriores. Novas assinaturas chamadas Starter não recebem Ecossistema. ERP de Starter só é preservado se o servidor anterior já o concedia; não é um benefício inventado.

A migration aborta antes de substituir has_erp_access se encontrar direito ERP histórico sem correspondência explicada (produto, admin ou concessão preservada). Deve-se esclarecer e autorizar individualmente esses casos; nunca preencher dados ou apagar benefícios para fazer a migration passar.

Agregados lidos nesta tarefa: 35 assinaturas ativas (14 Ecossistema, 15 Anual, 6 Mensal), sem registros Starter/Bolsas; 2 administradores em cada origem, sem divergência, incluindo o antigo e-mail fixo do frontend; 3 códigos históricos, nenhum válido; 0 usuários com ERP anterior fora das assinaturas Ecossistema/Anual/Mensal ou administração. Nenhum nome, e-mail ou UUID de cliente foi consultado como resultado.

## Conteúdo comum

O nicho existente é identificado pela categoria exata BOLSAS, MOCHILAS E MALAS. A tabela supplier_shared_access permite marcar outros fornecedores comuns com motivo e autorizador; o nicho também os apresenta. Não foram classificados fornecedores exclusivos como comuns por suposição e nenhum fornecedor real foi editado. Se houver outros conteúdos comuns acordados fora do código, sua classificação precisa ser confirmada antes de publicar para esses públicos.

## Kiwify e Brevo

Template 5, destinatário associado à compra, parâmetros, finalidade, página /obrigado, secrets e confirmação Auth permanecem preservados.

- Compra e cliente utilizam restrições únicas e inserção sem sobrescrever identificadores/validade de registros já existentes em corrida de duplicatas.
- Duplicata de aprovação retoma vínculo confirmado, registro do cliente e tentativa de comunicação; não abandona e-mail falho.
- RPCs de reserva e finalização são exclusivas de service_role. FOR UPDATE serializa a reserva por compra/tipo, lease de 2 minutos e token UUID impedem duas chamadas concorrentes e finalização por executor antigo.
- Comunicação sent não pode ser reservada de novo. Rejeição confirmada, ausência de secret e reserva expirada antes do despacho permitem nova tentativa. Destinatário e assinatura são obtidos da compra armazenada, não substituídos por payload duplicado.
- Timeout, HTTP 5xx, crash após início de despacho, erro ao persistir sucesso e reservas antigas sending sem recibo podem representar entrega já aceita. Ficam requires_reconciliation: não se faz reenvio cego. É necessário conferir recibo na Brevo e então registrar sent ou liberar uma nova tentativa após confirmar ausência de entrega. Não há promessa falsa de exatamente uma entrega entre dois sistemas sem idempotência comprovada do provedor.
- Não foi criado worker/cron de reenvio automático em produção. A nova tentativa acontece na entrega repetida do webhook. Pendências incertas são explícitas, não descartadas como sucesso.
- Payload sem identificador estável recebe 422 antes de gravar compra: um timestamp local não é chave idempotente.
- Aprovação após estado não ativo é gravada para conciliação e recebe HTTP 200 somente após persistência durável (5xx se falhar); não reativa automaticamente uma assinatura cancelada/reembolsada. A regra para renovação legítima usando o mesmo Subscription.id e a ordem/identificador de cada transação Kiwify ainda depende de confirmação. Não foi inventada uma regra de renovação/precedência temporal. Cancelamentos/reembolsos mantêm o mapeamento de status existente e passam a propagar falhas de gravação. Um evento negativo antigo que reutilize Subscription.id ainda precisa dessa política de ordenação; não se afirma que o problema geral de ordem de eventos está resolvido.

## Migrations e sequência futura, após Pro e backup recuperável

Não executar db push genérico. Reconciliar histórico somente pelos objetos específicos e versões aprovadas:
1. 20261110110000_verified_claims_only.sql — primeira correção, ainda não aplicada.
2. 20261111132917_approved_product_access.sql — matriz, concessões, RLS e admin.
3. 20261111133107_transactional_email_recovery.sql — amplia a outbox existente e cria RPCs de reserva/finalização.
4. 20261111141651_durable_webhook_reviews.sql — recibos únicos de pendências, sem alterar registros comerciais.

A tabela comunicacoes_transacionais já existe em produção: NÃO executar novamente 20260918163000_create_comunicacoes_transacionais.sql, apesar de ausente no histórico. As novas migrations são criadas pela CLI, têm versões distintas e foram aplicadas somente em banco fictício de testes. As migrations dependem da estrutura auditada, não reconstroem sozinhas todo o histórico anterior.

Depois de confirmar Pro, backup recuperável e revisão das pendências comerciais acima: capturar definições/ACLs/policies/functions atuais, aplicar apenas o conjunto aprovado em transações e implantar soph-chat, erp-entry, kiwify-webhook e generate-soph-token preservando configurações de gateway. Só então integrar frontend. Não alterar validate-soph-code sem recuperar e revisar seu código. A publicação continua exigindo autorização final específica.

Antes e depois: comparar contagens e integridade de IDs, proprietários, planos, validade, status e concessões em armazenamento restrito, expondo só agregados. As cinco assinaturas sem vínculo continuam reivindicáveis pela confirmação existente; o vínculo com e-mail divergente não é transferido nem apagado.

Reversão: capturar versões anteriores e restaurar código/definições/ACLs/políticas, sem restaurar tabelas sobre novos pagamentos. Não apagar grants/outbox nem reatribuir assinaturas. Preservar recibos e tokens; interromper próximos passos em qualquer falha. Reversão de autorização pode reabrir falhas antigas e precisa ser uma decisão deliberada. Backup/PITR não foi presumido nem validado nesta tarefa.

## Verificação reproduzível

npm ci --ignore-scripts; npm run test:subscriptions; npm test; npm run build; npx tsc --noEmit -p tsconfig.app.json.
ESLint em todos os TS/TSX alterados; Deno check nos quatro endpoints afetados.
Testes de PostgreSQL/PGlite com RLS executada sob authenticated/anon, grants e usuários fictícios; handlers reais com Auth/API/IA/ERP/Brevo simulados; interface Meus Acessos renderizada com a matriz. Não há login real, envio de e-mail real ou compra real nessa validação.

### Resultado desta execução

- 79 testes de segurança passaram: 12 vínculo/identidade, 18 autorização/RLS, 10 reserva/recuperação de comunicação, 18 webhook/legado/recuperação e 21 endpoints diretos.
- 17 testes Vitest passaram (5 existentes, 8 de Meus Acessos/entrada Soph e 4 de isolamento de cache de fornecedores por usuário).
- Build Vite passou; mantém os avisos anteriores de tamanho de bundle e Browserslist.
- TypeScript da aplicação passou; Deno check passou para as quatro Edge Functions alteradas.
- Lint dos TS/TSX alterados e git diff --check passaram.
- Sem compras, e-mails reais, escrita em produção ou uso de contas reais nos testes.

Os caches de fornecedores e contagens são separados pela identidade autenticada e desabilitados sem login, para impedir reapresentação de conteúdo de outro usuário após troca de conta. A entrada flutuante Soph também respeita o direito retornado pelo servidor.
