# Pendências de segurança geral — execução sem produção

Base: PR #7, commit `25d3c68`, sobre main `4fdd39f`. Branch `codex/pendencias-seguranca-geral`. PR complementar deve apontar para `codex/integracao-seguranca`, para não reapresentar as quatro migrations de assinaturas. Não integrar PRs completos indiscriminadamente na main.

## Sincronização concluída anteriormente

As cinco fontes foram obtidas novamente do Supabase e comparadas byte a byte com as fontes lidas na preparação do PR7: nenhuma diferença. Soph39, ERP44, consulta16, webhook80, gerador14. main e PR7 também foram conferidos. O domínio oficial consta no publicado das três funções de navegador e no código do PR7; webhook/gerador conservam seu CORS legado. Não foi alterada/republicada nenhuma função.

CORS, correções de logs, tratamento de erros, limites da Soph, dependências compatíveis e sete cabeçalhos preparados são herdados dos PRs6/7. Sem repetição de código ou deploy de frontend. Os cinco cabeçalhos originais e o CORS oficial já estavam em produção; as melhorias de código ainda não são declaradas publicadas.

## Alertas e riscos comprovados

Foram lidas as definições e ACLs das seis funções, políticas que as utilizam e referências no frontend/Edge Functions, sem consultar dados de clientes. Snapshot estrutural em `tests/security/fixtures/privileged-live.json`.

| Função | Resultado e ação |
|---|---|
| has_active_subscription(uuid) | Anônimo podia informar UUID de terceiro e conhecer sua situação de assinatura. Autenticado também podia consultar terceiros. Script passa a responder false fora do próprio usuário, administrador reconhecido por is_admin() ou backend service_role. A permissão anônima é preservada porque a política pública de fornecedores chama a função; remover EXECUTE poderia causar erro em vez de consulta vazia. |
| get_is_admin(uuid) | Autenticado podia consultar o indicador administrativo de outro perfil. Restrição de alvo preparada. Preservada consulta ao próprio indicador, usada no WITH CHECK que impede autopromoção. Não se demonstrou obtenção de privilégios administrativos por essa consulta. |
| has_erp_access(uuid) | Autenticado podia consultar o estado de ERP de outro usuário. Adicionada apenas guarda de alvo. Ramos originais de admin, código, autorização legada e planos ficam intactos. Backend e administradores legítimos mantêm consulta a outros usuários. |
| is_admin() | Sem parâmetro de terceiro, usa identidade do chamador e responde false a anônimo. É chamada por múltiplas políticas públicas. Nenhuma alteração de ACL/lógica: retirar EXECUTE só para apagar aviso arriscaria quebrar RLS. |
| has_role(user_role) | Já usa auth.uid(), objeto qualificado e acesso autenticado/backend. Mantida, pois EXECUTE legítimo por si não demonstra vulnerabilidade. |
| claim_subscriptions_for_current_user() | ACL já exclui anon. O problema de confirmação existente é o escopo do pacote B/PR7; não foi implementada outra correção nem alterado vínculo nesta tarefa. |

Os alertas [0028](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) e [0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) descrevem superfície exposta, não provam exploração. A exposição de estado de terceiros foi reproduzida em fixtures e corrigida no SQL preparado. Não havia evidência de exploração real. Os avisos podem continuar mesmo após aplicar a guarda, pois EXECUTE legítimo é preservado.

RLS da outbox sem política é informativo: acesso ordinário fica negado e backend usa service_role. Não criar política permissiva para apagar aviso. Avisos de proteção contra senhas vazadas e versão PostgreSQL foram registrados, mas estão explicitamente fora do escopo; nada foi ativado/atualizado.

## Arquivos SQL preparados, sem aplicação

- `release/security-definer/restrict-targets.sql`: transação com três CREATE OR REPLACE e preflight de assinatura, tipo, SECURITY DEFINER, configuração e hash do corpo publicado. Aborta em drift; não sobrescreve função comercial mais nova. Não altera grants, RLS, dados, planos, proprietários ou funções de vínculo. Não é migration automática nem integra as quatro migrations B.
- `release/security-definer/rollback-targets.sql`: restaura só as três definições originais. Testado isoladamente, preservando dados e ACL. Restaura também a exposição anterior; usar apenas em recuperação expressamente autorizada.
- `release/integration/rollback-claims.sql`: correção de dois pontos e vírgulas ausentes nos delimitadores finais das funções. A lógica anterior não mudou. O teste isolado passa a executar esse roteiro e confirma ausência de alteração dos registros fictícios. O original do PR7/branch original não foi reescrito.

A aplicação futura do SQL exige autorização própria, definição original preservada e checagem de drift. Não exige republicar Soph/ERP. Se houver consumidor externo legítimo consultando terceiros como usuário comum, precisa ser identificado antes da aplicação; chamadas encontradas no código consultam o próprio usuário ou usam backend autorizado. Testes não provam ausência de clientes externos desconhecidos.

## Proteção contra abuso e cabeçalhos

Mantidos sem alteração: 60 mensagens, 8.000 caracteres por mensagem, 60.000 totais, corpo JSON real limitado a 512 KiB e validações de formato/método. Sem contador em memória, bloqueio de compra/webhook, CSP nova ou quota arbitrária de assinante. Rate limiting global exige estado compartilhado e permanece manutenção futura; não é implementado ficticiamente. Cabeçalhos não foram reescritos nem frontend republicado.

## Monitoramento preparado, não ativado

`.github/workflow-templates/security-monitor.yml` usa o comando security:audit já existente, agenda semanal/manual, Actions oficiais fixadas por SHA, token somente leitura e checkout sem persistir credencial. Falha por nova alta/crítica ou erro de registro; mostra achados conhecidos no resumo. Não cria issues, envia e-mails/webhooks nem acessa produção/secrets.

O arquivo fica fora de `.github/workflows`: **não está ativo e não gera execução/custo**. Antes de mover/ativar, responsável deve confirmar Actions habilitado, franquia gratuita/orçamento e notificações nativas de falha em sua conta. Não se presume entrega de alerta sem essa configuração. O passo de instalação também falha visivelmente se não concluir; o resultado nunca equivale a audit limpo. Alarmes operacionais de Soph/ERP ainda precisam de mecanismo externo de notificações; não foi contratado/ativado serviço.

## Dependências

Relatório completo reproduzido: 21 ocorrências, 18 moderadas/1 alta/2 críticas; dependências de produção têm duas moderadas e zero altas/críticas. Um ensaio sem force fez atualizações transitivas, mas a checagem completa subsequente não demonstrou redução reproduzível do conjunto; descartadas mudanças de lockfile sem ganho de segurança comprovado. Manifestos e locks de dependências aprovados foram preservados (somente scripts de teste adicionados ao package.json).

As altas/críticas de Vite/Vitest/Tinypool e os avisos restantes não são declarados resolvidos. A correção que exige migração principal, override incompatível ou regressão fica para manutenção separada, conforme restrição desta tarefa. Não foi usado audit fix --force.

## Verificação e limites

- 25 verificações de funções privilegiadas com PGlite: reproduz falha antes, protege depois, anônimo/autenticado/admin/backend, identidade vazia, ERP de código/legado/plano, fornecedor via RLS, autopromoção negada, estado comercial/ACL/políticas intactos, drift e dois roteiros de recuperação.
- Quatro verificações de escopo: runtime/SQL de assinaturas intocados em relação ao PR7, CORS/limites/cabeçalhos preservados, monitor desativado e SQL restrito a três funções.
- Suites existentes de handlers/configuração, aplicação, build e TypeScript executadas; resultados finais no PR. Serviços externos simulados; nenhuma compra, webhook, e-mail ou dado real usado nos testes.

## O que continua pendente

O pacote B de assinaturas e suas quatro migrations continuam bloqueados até comprovar backup recuperável e aprovar publicação. Esta tarefa não executa essas migrations e não concede autorização de produção.

O SQL das três funções também permanece apenas preparado, aguardando revisão/aprovação de aplicação e recuperação de definições. Melhorias gerais dos PRs6/7 continuam sujeitas à publicação aprovada; desenvolvimento concluído não é sinônimo de produção atualizada.

Ativação de monitor, notificações, rate limiting compartilhado, CSP ensaiada e migração de ferramentas são manutenção futura/configuração, sem contratação automática do Pro. Não afirmar encerramento de todas as vulnerabilidades enquanto esses achados persistirem.
