# Checklist das 20 verificações de segurança

Revisão: 12/11/2026 (America/Sao_Paulo). Base `4fdd39f`, branch `codex/finalizacao-seguranca`. **Classificações se referem ao código e às evidências indicadas, não a uma implantação de todas as correções em produção.**

Não foi localizado no repositório ou nas issues consultadas um checklist anterior numerado com 20 itens. Este quadro consolida exatamente 20 verificações desta entrega, com escopo/evidência explícitos; não inventa correspondência com itens históricos indisponíveis. O PR #4 permanece separado.

| Nº | Verificação | Classificação | Evidência e limite |
| --- | --- | --- | --- |
| 1 | Preservar main/Lovable e comparar funções publicadas | CONCLUÍDO E VALIDADO | Base atual 4fdd39f, commits f779d38/57a7fdd/4316fa3 preservados. Snapshots e versões em deployed-baseline.json. Gerador v14 ausente da main foi versionado com alterações só em logs |
| 2 | CORS do domínio oficial | CONCLUÍDO E VALIDADO | soph-chat/erp-entry/lookup-subscription já tinham o domínio em produção; fonte sincronizada e preflight testado |
| 3 | Preservar CORS de desenvolvimento/prévias | CONCLUÍDO E VALIDADO | Lovable, previews dos sites Netlify conhecidos e localhost/IPs locais testados; origens não relacionadas não são refletidas |
| 4 | Isolar cabeçalhos por requisição | CONCLUÍDO E VALIDADO | lookup-subscription deixou de usar variável CORS global; teste concorrente confirma resposta para cada origem |
| 5 | Remover prefixos/valores do segredo ERP | CONCLUÍDO E VALIDADO | Correção da Lovable preservada na fonte e confirmada no código publicado v44; teste protege contra regressão; nenhuma rotação |
| 6 | Remover credenciais/e-mails do console do navegador | CONCLUÍDO E VALIDADO | SSO do ERP, hash/query de recuperação, e-mail de reset e erros crus removidos; comportamento compilado é igual fora dos consoles |
| 7 | Logs técnicos das funções | CONCLUÍDO E VALIDADO | Eventos estruturados, códigos técnicos permitidos e IDs mínimos; request IDs em Soph/ERP/consulta; sem mensagens brutas de Auth/provedores |
| 8 | Reduzir dados em novas gravações de auditoria | CONCLUÍDO E VALIDADO | Payload técnico de webhook mantém contrato/pedido/cobranças/datas; exclui nome, e-mail, CPF, telefone, dados de cartão e URLs de acesso. Nenhum histórico/schema alterado |
| 9 | Preservar limites de crédito da Soph | CONCLUÍDO E VALIDADO | 60 mensagens / 8.000 caracteres por mensagem / 60.000 totais preservados, inclusive aceitação do limite legítimo |
| 10 | Proteger entrada e consumo da Soph sem contador fictício | CONCLUÍDO E VALIDADO | Leitura limitada a 512 KiB reais, JSON/método/forma validados e contexto opcional limitado sem bloquear assinante por nome longo |
| 11 | Preservar Auth, autorização ERP e consulta própria | CONCLUÍDO E VALIDADO | getUser/RPC has_erp_access e guardas da consulta mantidos. Gerador conserva exatamente o runtime publicado fora dos logs; não incorpora correção de vínculo do PR4 |
| 12 | Preservar processamento Kiwify/Brevo | CONCLUÍDO E VALIDADO | Efeitos de compra/duplicata/reembolso/cancelamento comparados ao baseline Lovable; template 5 e wildcard CORS do webhook mantidos; sem webhooks reais |
| 13 | Atualizações compatíveis e locks consistentes | CONCLUÍDO E VALIDADO | npm audit fix sem force, remoção de zod/resolvers sem uso, npm ci e Bun frozen; bun.lock importado do npm, binário obsoleto removido |
| 14 | Eliminar todos os avisos de dependências | PARCIALMENTE CONCLUÍDO | 49 → 21 ocorrências: 18 moderadas, 1 alta, 2 críticas. Produção: 2 moderadas, 0 altas/críticas. Vite/Vitest exigem migração principal não forçada |
| 15 | Cabeçalhos Netlify | CONCLUÍDO E VALIDADO | Cinco cabeçalhos originais observados na resposta HTTPS oficial. Dois adicionais preparados/testados no arquivo e build; não declarados ativos em produção antes da publicação |
| 16 | CSP abrangente sem quebrar integrações | PARCIALMENTE CONCLUÍDO | Não foi aplicada CSP restritiva. Requer inventário/ensaio completo de OAuth, fontes, PWA, editor e ERP antes de enforcement |
| 17 | Rate limiting global por usuário/intervalo | NÃO EXECUTADO POR LIMITAÇÃO TÉCNICA | Não há contador compartilhado configurado e alterações de banco/novos serviços estão fora do escopo. Memória de um isolate não fornece limite global. Proteções sem estado estão no item 10 |
| 18 | Alertas automáticos operacionais | PARCIALMENTE CONCLUÍDO | Logs correlacionáveis e comando security:audit detectam avisos altos/críticos novos. Nenhum alerta externo/schedule ativado; configuração/permissões e eventual custo da infraestrutura precisam ser confirmados |
| 19 | Regressões, isolamento e entrega revisável | CONCLUÍDO E VALIDADO | 102 verificações técnicas, 15 testes da aplicação e 12 testes Chromium locais; build/TypeScript/Deno/lint executados. Nenhuma mutation em produção; fontes jurídicas/comerciais e PR4 preservados |
| 20 | Proteção de recuperação antes de futura produção | DEPENDENTE DO SUPABASE PRO | Organização verificada como Free em leitura. Backup gerenciado recuperável exige plano/recuperação adequados e prova de restore; não se presume PITR. Pro sozinho não é prova de recuperação. Upgrade, migrações e proteção de senhas vazadas não foram executados |

Totais: **15 CONCLUÍDO E VALIDADO; 3 PARCIALMENTE CONCLUÍDO; 1 NÃO EXECUTADO POR LIMITAÇÃO TÉCNICA; 1 DEPENDENTE DO SUPABASE PRO.**

Os defeitos de renovação/vínculo/ledger e as migrations do PR #4 não são declarados corrigidos por esta branch. O gerador legado continua com o comportamento de autorização publicado; sua inclusão aqui remove logs de códigos, não amplia/retira direitos nem resolve o vínculo por e-mail.
