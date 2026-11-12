# Integração dos PRs #4 e #6 — preparação, sem produção

Base conferida: main `4fdd39f`. Fontes preservadas: PR4 `8ce43ee`, PR6 `cf16ef5`. Branch `codex/integracao-seguranca`. As branches originais não são modificadas. Este documento substitui a orientação de integrar o PR4 completo: **não incluir benefícios/Stage1, fornecedores, precificação, administração ou migração ampla de produtos**.

## Estado comprovado por leitura em 12/11/2026

- Publicado: CORS do domínio oficial em Soph v39, ERP v44 e consulta v16; remoção do prefixo do segredo ERP; cinco cabeçalhos HTTPS originais; confirmação de e-mail do cadastro e Brevo existentes.
- As cinco fontes publicadas foram obtidas novamente e conferem com os snapshots anteriores. Webhook continua v80 e gerador v14. Não confundir preview ou merge GitHub com deploy Supabase.
- `claim_subscriptions_for_current_user` ainda usa `auth.email()` sem consultar confirmação. `handle_new_user` ainda vincula no cadastro sem exigir `email_confirmed_at`. Definições foram lidas, não apenas o histórico de migrations.
- Ausentes: funções pós-confirmação/guarda de proprietário, três RPCs de recuperação Brevo, quatro funções de contexto/autorização/reembolso Kiwify, dois índices novos, coluna `webhook_logs.event_key` e quatro colunas novas da outbox. A tabela de comunicações já existe e não deve ser recriada.
- Agregados: 35 ativas, 5 ativas sem vínculo, 0 ativas vinculadas a Auth não confirmado, 0 vínculos órfãos, 1 divergência de e-mail preservada. Não foram consultados dados pessoais de assinantes.
- Os dois cabeçalhos adicionais não foram observados no domínio oficial. Frontend de produção não é declarado idêntico a um commit apenas pelo estado do PR.
- Evidência resumida: `INTEGRACAO_EVIDENCIAS.json`. Reconfirmar drift e agregados imediatamente antes de futura execução autorizada.

## Pacotes revisáveis

`release/integration/packages.json` é a allowlist. `npm run prepare:integration -- /diretorio/novo` exige checkout commitado/limpo e gera A/B com SHA-256 de todos os arquivos. Não instala nem publica nada. Remove todas as migrations históricas dos artefatos; B recebe somente as quatro aprovadas. Os manifests apontam os commits efetivos.

### A — geral, sem banco

Fonte fixa `cf16ef5`: frontend/logs, dependências/locks, `_headers`, cinco funções e seus imports `_shared`. Funções: **soph-chat, erp-entry, lookup-subscription, kiwify-webhook, generate-soph-token**. Nenhuma migration.

A é implantável sem B e conserva o processamento legado de assinaturas. Seus testes de webhook/gerador são regressões do runtime de A; não demonstram as proteções de B. Por isso `tests/security/edge.mjs` carrega os dois handlers de A explicitamente a partir do commit fixo. Demais handlers são testados da integração.

Sequência futura: guardar runtime/artefato atual, publicar funções A com imports e configuração JWT vigente, publicar frontend A por fluxo GitHub/Netlify autorizado, validar. Não presumir que o merge publica funções. Não alterar projeto/configuração Lovable. Confirmar sincronização por versão/commit efetivos.

### B — assinaturas/Kiwify

Código integrado mantém o runtime de autorização/processamento do PR4, com redações de log do PR6. `tests/integration/scope.mjs` compara o JavaScript compilado para impedir perda de guardas, além dos testes funcionais reais de SQL/handlers. Não altera regras comerciais ou o cálculo de benefícios.

Migrations, exatamente nesta ordem:

1. `20261110110000_verified_claims_only.sql`: RPC de reivindicação por Auth confirmado, cadastro condicionado, trigger pós-confirmação e guarda de novos proprietários. Não atualiza assinaturas existentes durante aplicação; não permite transferir/desvincular proprietário.
2. `20261111133107_transactional_email_recovery.sql`: quatro colunas e RPCs reserve/begin/finish na outbox existente, para o webhook preparado; mantém Brevo/template 5/secrets. Não recria tabela/integração.
3. `20261111141651_durable_webhook_reviews.sql`: chave/índice/restrição para recibos pendentes duráveis. Histórico fica com chave nula, sem backfill.
4. `20261111160309_stage2_kiwify_event_guards.sql`: contexto por contrato/pedido/cobrança, índice de evidências, autorização e reembolso por compra com bloqueio transacional. Não modifica dados comerciais na aplicação da migration.

O artefato B contém `apply-approved.sql` com BEGIN/COMMIT reunindo somente essas quatro migrations. Não usar `db push` genérico, não aplicar Stage1 nem `approved_product_access`. Se qualquer objeto aparecer desde a leitura, interromper e comparar definição antes de aplicar, em vez de adicionar IF NOT EXISTS e mascarar divergência.

Depois que o SQL inteiro concluir: publicar **kiwify-webhook e generate-soph-token**, com `_shared/diagnostics.ts`; depois frontend integrado (`useSubscription` recupera vínculo e invalida somente cache do usuário). A antes de B é suportado. **Nunca publicar A webhook/gerador depois de B**, pois restauraria comportamento legado. B frontend inclui A. Para publicar tudo junto, aplicar SQL B antes dos handlers B e publicar também as outras três funções A; respeitar a mesma sequência.

Os IDs/estados/datas necessários ao contexto SQL são preservados nos novos payloads técnicos. A chave de deduplicação é calculada sobre a observação original antes da redação. Uma pendência exige recibo confirmado antes do HTTP200; erro de escrita/leitura dá 5xx. Não equivale a pagamento aprovado. Renovação só estende validade finita com `access_until` explícito e evidência coerente; não inventa duração, não recria compra nem reenvia boas-vindas. Cancelamentos/reembolsos recorrentes e identidade ambígua permanecem para conciliação, preservando prazo pago. Retomada incerta não reativa automaticamente.

Contrato com três registros: a evidência anterior identificou cobranças/pedidos distintos do mesmo contrato, não três cópias do mesmo pedido. Nenhum registro é consolidado automaticamente nesta integração. Conciliação humana continua necessária; não é autorização para alterar registros reais.

## Recuperação e impedimentos

**Backup recuperável do banco não foi comprovado. Isso bloqueia recomendar a implantação B**, mesmo com testes aprovados. Não se presume PITR, plano Pro ou backup automático. Aceitável: backup oficial recuperável com retenção e restauração demonstrada, ou exportação lógica protegida incluindo schemas/dados/grants/Auth necessários, ensaiada em ambiente isolado e acessível ao responsável. Não guardar dados ou secrets no Git/conversa. Snapshot de código e agregados não substituem backup de dados. Nenhum dump de clientes foi executado nesta tarefa.

A: guardar deploy Netlify anterior e as fontes/configurações atuais das cinco funções; restaurar somente o componente alterado que falhar. Fontes efetivamente publicadas foram preservadas fora do repositório em `/workspace/work/integration-recovery`; transferir para armazenamento operacional protegido antes de publicação, pois o workspace não é retenção durável. Não basta git revert para reverter Supabase.

B: preservar também definições/grants/triggers originais e evidência do backup. Por padrão, corrigir para frente e manter recibos/outbox/guardas. Se falhar, interromper os próximos componentes. Não apagar tabelas/colunas/índices, não restaurar backup integral sobre pagamentos novos sem plano de conciliação, não mover/desvincular assinaturas. Reversão de frontend não remove vínculos legítimos criados após confirmação.

`release/integration/rollback-claims.sql` conserva o DDL original lido e remove apenas os dois triggers novos. É último recurso, **restaura comportamento legado menos seguro** e exige autorização de recuperação específica, controle de novos eventos e restauração coordenada de handlers; não executá-lo automaticamente. Mantém novas colunas, índices, recibos e comunicações. Não é necessário remover RPCs aditivas para recuperar runtime. Aplicação desse roteiro não foi feita em produção.

Qualquer incompatibilidade em vínculos ou risco de bloquear assinante interrompe B. Revalidar as 35 ativas/5 sem vínculo/1 divergência (ou explicar alteração legítima desde o snapshot), inclusive preservação de IDs/produtos/status/validade. Mudanças de negócio ocorridas naturalmente não devem ser sobrescritas. Na validação real, usar conta fictícia autorizada e acesso observado pela proprietária, sem compra real/webhook experimental. As tentativas Kiwify são finitas; acompanhar falhas e conciliar entregas não confirmadas, não presumir reenvio infinito.

## Validação e limites

Testes isolados usam PGlite e Auth/HTTP fictícios. Suites de confirmação, outbox, webhook, renovação, recibos, SQL integrado, privacidade e escopo; UI, navegador desktop/mobile, build, TypeScript, Deno e lint dos arquivos afetados. Testes de navegador usam APIs simuladas, não certificam pagamentos ou provedores reais. Preview Netlify publica apenas frontend de revisão, não Edge Functions.

A integração não inclui benefícios Stage1; teste SQL usa fixture estrutural de produção sem aplicar essa migration. Código Stage1 e PR4 originais permanecem intactos. Audit: 21 ocorrências (18 moderadas, 1 alta, 2 críticas), produção 2 moderadas e zero altas/críticas. Ferramentas com alta/críticas, CSP, rate limiting global e alertas externos continuam fora desta tarefa. Lint mantém aviso preexistente de dependência do hook Soph, sem erros.

Somente após evidência de recuperação, drift reconferido e aprovação explícita do pacote pode haver produção. Este PR em rascunho não autoriza merge/deploy e não encerra as pendências acima.
