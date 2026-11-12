# Finalização de segurança — código pronto para revisão, sem produção

Data: 12/11/2026 (São Paulo). Branch `codex/finalizacao-seguranca`, criada da main `4fdd39fd0c536b4ecb14907c0e7a5e4a5da72979`. O trabalho jurídico incorporado pela proprietária e as correções recentes da Lovable foram preservados. O PR #4 não foi alterado/incorporado.

## Evidência inicial e correções já feitas pela Lovable

A main trouxe as mudanças f779d38 (manifest/Bun), 57a7fdd (npm lock) e 4316fa3 (logs/CORS/cabeçalhos), reunidas em 4fdd39f. Foram lidas as funções efetivamente publicadas, sem executar seus caminhos de negócio:

| Função | Versão lida | Diferença em relação à main inicial |
| --- | --- | --- |
| soph-chat | 39 | domínio oficial presente só no publicado |
| erp-entry | 44 | domínio oficial presente só no publicado; prefixo do segredo já removido em ambos |
| lookup-subscription | 16 | domínio oficial presente só no publicado |
| kiwify-webhook | 80 | código equivalente, salvo whitespace |
| generate-soph-token | 14 | não existia na main; continha logs do código de acesso completo |

`deployed-baseline.json` registra hashes e versões, não dados de clientes. O gerador foi trazido da versão publicada com mudanças somente de console. O hash do runtime compilado sem consoles confere com o snapshot, protegendo a exigência de não alterar autorização/vínculo. Sua lógica legada fica fora da correção de vínculos do PR #4; não se declara saneada por esta entrega.

## Código implementado

### CORS e cabeçalhos de resposta

`_shared/http.ts` centraliza as três funções de navegador, incluindo `https://app.empreendajacomsoph.com.br`, os hosts existentes, prévias Lovable, previews dos sites Netlify conhecidos e desenvolvimento local. Não permite qualquer site netlify.app nem reflete domínios com sufixos maliciosos. A lista Lovable pré-existente foi preservada; CORS não substitui Auth/autorização.

Preflight permite POST/OPTIONS e os cabeçalhos do SDK Supabase, inclusive x-supabase-client-*. As respostas sensíveis usam no-store, Vary: Origin e request ID. Origens não permitidas não recebem Access-Control-Allow-Origin. Requisições sem origem continuam passando pela autenticação normal; nenhuma rejeição por origem foi adicionada ao webhook servidor-a-servidor.

A variável CORS global de lookup-subscription foi substituída por estado local da requisição. Um teste concorrente confirma que uma resposta não herda a origem de outra.

### Logs e dados

`_shared/diagnostics.ts` aceita somente eventos/códigos/IDs técnicos e medidas numéricas. Não serializa erros, cabeçalhos de autorização, nomes, endereços de e-mail, corpos da IA ou respostas de provedores. Soph/ERP/consulta retornam X-Request-Id para correlação sem credenciais.

Novas gravações de `webhook_logs.payload` passam por uma lista de metadados: IDs de contrato/pedido/cliente/produto, tipo/status, datas e referências de cobranças/períodos. Nome, e-mail, CPF, telefone, detalhes de cartão, URLs de login e campos desconhecidos são excluídos. A identificação pessoal necessária à compra continua nos registros comerciais autorizados; ela não precisa ser repetida no console/auditoria geral. Nenhum registro histórico foi lido/modificado para limpeza e nenhuma coluna/política foi criada/alterada. O payload técnico não substitui um ledger financeiro nem autoriza decisões comerciais.

Erros Brevo deixam de armazenar o corpo bruto do provedor em mensagens de diagnóstico. Reserva, envio, template 5, destinatário, status e comportamento de reenvio permanecem iguais ao código da main. Erros não conhecidos do ERP recebem resposta genérica; códigos conhecidos continuam compatíveis com as mensagens amigáveis existentes.

No navegador, foram removidos logs de URL de SSO do ERP, hash/query de recuperação, e-mail de reset e objetos crus de erro. A URL de SSO continua sendo utilizada no redirecionamento autorizado, apenas não é impressa. Chamadas, redirects, callbacks, senha, sessão e interfaces não mudaram. O teste de escopo compara o JavaScript compilado dos seis arquivos, removendo somente consoles e tipos apagados na compilação, com a main inicial.

### Abuso sem banco/serviço pago

A Soph mantém os limites da Lovable: 60 mensagens, 8.000 caracteres individuais e 60.000 totais. Agora lê no máximo **512 KiB reais** de JSON, mesmo sem Content-Length ou com tamanho mentiroso; rejeita entradas inválidas antes da chamada paga. Campos opcionais de nome/módulo são truncados para 200 caracteres, em vez de negar o atendimento de um assinante com perfil longo. Mensagens legítimas no limite continuam aceitas.

Não há rate limit global por memória, quota inventada por usuário, cobrança ou bloqueio adicional do webhook. Um limite global exige estado atômico compartilhado e política operacional; não foi adicionado sob a restrição de não mudar banco/serviços. Não foi alterado modelo, prompt, histórico, autorização ou matriz de benefícios.

### Dependências e instalação

`npm audit` inicial: 49 ocorrências (4 baixas, 22 moderadas, 21 altas, 2 críticas). Após atualizações compatíveis e remoção das dependências sem referências `zod`/`@hookform/resolvers`: **21 ocorrências (18 moderadas, 1 alta, 2 críticas)**. `npm audit --omit=dev`: **2 moderadas, 0 altas, 0 críticas**.

Não foi executado audit fix --force, não há override para forçar dependências incompatíveis e não houve upgrade principal de React Router/Vite/Vitest. As famílias de componentes/Lovable continuam com versões dentro dos intervalos existentes.

O package-lock foi atualizado e validado por npm ci. `bun.lock` foi importado do package-lock com Bun 1.4.4 e validado em modo frozen. O `bun.lockb` binário antigo foi removido para não permitir resolução de dependências por um lock obsoleto; a main já tinha o formato textual moderno. Use npm ci ou Bun moderno com o lock textual; não restaure o binário antigo como solução de instalação.

Pendências de dependências:

- **Vite 5.x — alta**, ferramentas de desenvolvimento/build. Os avisos remanescentes não têm correção nesta família; a correção requer migração principal com ensaio das integrações Lovable/SWC/PWA. Não é código de servidor Vite executado pela hospedagem estática em produção.
- **Vitest 3.x / Tinypool 1.x — críticas**, exclusivamente ferramentas de teste. Vitest 4 corrigido requer Vite 6/7/8; forçar Tinypool 2 ou peers incompatíveis não foi considerado atualização compatível. Não expor servidor de testes a redes não confiáveis.
- **React Router 6.x — moderadas**, dois pacotes no audit de produção (react-router e react-router-dom). O projeto é SPA, sem hidratação SSR; as migrações principais para a versão corrigida permanecem separadas. Isso limita contexto de exploração, mas não elimina o aviso do audit.
- Todos os 21 nomes, severidades e advisories restantes estão registrados em npm-audit-baseline.json (remainingFindings); as moderadas não são declaradas corrigidas.

`npm run security:audit` sempre exibe os achados conhecidos e falha se aparecer alta/crítica fora da revisão em npm-audit-baseline.json. Baseline não é aceite jurídico de risco, não suprime npm audit e não significa auditoria limpa. `npm audit --audit-level=high` continua retornando falha enquanto houver esses achados. Os metadados/advisories podem mudar; repetir na integração.

### Cabeçalhos Netlify

Os cinco cabeçalhos da Lovable foram realmente observados na resposta HTTPS do domínio oficial nesta data: nosniff, strict-origin-when-cross-origin, Permissions-Policy, SAMEORIGIN e HSTS. Isso é uma observação da resposta servida, não acesso às configurações internas da hospedagem.

`public/_headers` preserva os cinco e adiciona X-DNS-Prefetch-Control: off e X-Permitted-Cross-Domain-Policies: none. O build copia o arquivo para dist, conforme a convenção Netlify. Os dois adicionais estão preparados para a próxima publicação; **não estão declarados ativos em produção**. A validação do preview é registrada no PR.

Não há CSP restritiva nova, COEP ou bloqueio novo de popups. Uma CSP abrangente exige ensaio de OAuth, Google Fonts, Supabase, PWA, editor/preview e ERP; não foi aplicada por tentativa. Os cabeçalhos do frontend Netlify não se aplicam às Edge Functions hospedadas no Supabase.

## Monitoramento e configurações externas reais

Os eventos estruturados podem ser filtrados no painel de logs já existente do Supabase. Exemplos de categorias: soph.upstream_failed, erp.upstream_failed, kiwify.email_receipt_write_failed e lookup.query_failed. IDs técnicos/request IDs permitem correlação; não se deve voltar a imprimir erros brutos para investigar uma falha.

O comando security:audit é uma verificação automatizável local, **não um alerta externo já ativado**. Nenhum e-mail, webhook de alerta, cron ou integração paga foi configurado. Para notificações automáticas, a responsável precisa confirmar permissões/configuração dos alertas nativos do GitHub/Dependabot e qualquer coletor/limite de custo do ambiente antes de integrar um runner. Não foi presumida gratuidade de minutos de CI ou créditos de preview.

A organização Supabase foi consultada em leitura e está no plano **Free**. Backup recuperável, plano adequado e comprovação de restauração continuam necessários antes de mudanças de produção que exijam recuperação. Não se presume PITR com a contratação de Pro. Não houve upgrade de Postgres, ativação de proteção contra senhas vazadas, rotação de secrets ou mudança de região/provedor.

## Verificação reproduzível

1. npm ci --ignore-scripts
2. npm run build
3. npm run test:security — 102 casos: 79 de handlers/negócio/CORS/privacidade e 23 de escopo/cabeçalhos/configuração.
4. npm test — 15 testes existentes da aplicação.
5. npx tsc --noEmit -p tsconfig.app.json
6. npx eslint nos arquivos TS afetados. Zero erros; há um aviso preexistente de dependência de hook em Soph, mantido para não reexecutar mensagens por uma alteração fora do escopo.
7. Deno check --no-config das cinco funções, com suas importações _shared.
8. npx playwright test -c tests/security/playwright.config.ts — 12 casos desktop/mobile de login, streaming Soph, SSO ERP, recuperação, consulta e fronteiras públicas/privadas.
9. npm audit --json; npm audit --omit=dev --json; npm run security:audit. O audit nativo não é limpo; registrar os avisos, não mascarar o exit code.

Os handlers reais são executados com Auth/banco/provedores fictícios; nenhum SQL é enviado ao Supabase. Os cenários Kiwify comparam as mesmas operações comerciais ao baseline da main, incluindo reembolso, cancelamento, duplicata, conta não confirmada e erro de comunicação. Essa comparação preserva comportamento existente, não certifica que o fluxo completo de pagamentos esteja corrigido: a evolução de vínculos/renovações continua exclusivamente no PR #4.

Os testes de navegador interceptam APIs externas e utilizam apenas dados fictícios. Para preview, SECURITY_BASE_URL usa o cliente HTTPS do Playwright com a CA já fornecida pelo ambiente; TLS permanece verificado e não se altera a confiança persistente do navegador. Os arquivos publicados são renderizados em um contexto descartável. Isso não é uma compra, login de assinante ou teste real dos provedores.

## Preparação de publicação e reversão

Nenhuma autorização desta tarefa permite merge ou deploy de produção. Para uma publicação futura autorizada:

- revisar o commit e o checklist; atualizar se main ou funções publicadas tiverem mudado;
- preservar artefatos/versionamento das cinco funções e frontend anteriores, além de flags de gateway e secrets;
- publicar somente as funções alteradas, incluindo arquivos _shared na montagem, mantendo a configuração existente de JWT/gateway. generate-soph-token é a mesma implementação publicada com logs corrigidos, não a variante do PR #4. Se o PR #4 ou outra versão mais nova já tiver sido implantada na ocasião, não sobrescrever suas guardas com v14: reconciliar somente as redações de log sobre a versão mais nova antes da publicação;
- publicar frontend/dependências/_headers pelo fluxo existente, sem mudanças Lovable Cloud, banco ou matriz;
- verificar os cabeçalhos servidos e os preflights, sem compras/webhooks experimentais em produção.

Não executar migrations, db push, SQL, RLS ou mudanças de assinatura para esta entrega. Reversão: restaurar os artefatos de função/frontend e os manifests/locks anteriores, mantendo os dados e logs já existentes. Não restaurar tabelas sobre pagamentos posteriores e não alterar proprietários. Reverter logs reabre exposição; preferir corrigir para frente quando possível.

[Checklist das 20 verificações](CHECKLIST_20_VERIFICACOES.md).
