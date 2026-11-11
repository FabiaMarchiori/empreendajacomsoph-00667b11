# Revisão e publicação das políticas jurídicas

**Entrega de desenvolvimento; publicação definitiva bloqueada pelas pendências abaixo.** Base: `origin/main` (`a4f5809`), branch exclusiva `codex/politica-juridica`. Não incorpora os commits de `codex/seguranca-assinaturas` nem altera o PR #4. Data da revisão técnica: 11/11/2026 (São Paulo).

## Pendências bloqueantes de validação

- [ ] Receber e conferir o **endereço comercial** e inseri-lo na identificação exigida para a oferta eletrônica. Não foi inventado nem mostrado campo fictício ao público.
- [ ] Conferir o **nome empresarial** e a identificação da responsável no cadastro oficial do CNPJ 21.121.633/0001-28. O nome pretendido fornecido foi mantido sem afirmar formalização. Dados vieram da responsável, não de comprovante cadastral consultado.
- [ ] Conferir todas as **ofertas e configurações reais dos checkouts Kiwify**: recorrência, preço, parcelamento, período, cancelamento, garantia e condições de renovação. Não foram acessados checkouts autenticados, alteradas configurações ou feitas compras.
- [ ] Disponibilizar os cinco **links jurídicos no checkout e nas páginas públicas de venda**, após aprovação do conteúdo e dos destinos definitivos. Esta tarefa só altera o aplicativo e seu preview.
- [ ] Formalizar os **prazos de retenção por categoria**, inclusive logs de webhook, comunicações, dados de módulos, backups e IA, em conformidade com as obrigações efetivamente aplicáveis. Os textos usam critérios; não inventam dias/anos.
- [ ] Verificar **transferências internacionais**, localização/fluxos, papéis e mecanismos legais de cada fornecedor. Não se afirma hospedagem exclusivamente no Brasil ou cláusula contratual já celebrada sem prova.
- [ ] Conferir **contratos e políticas do Lovable AI Gateway e Google Gemini**, especialmente retenção, subprocessadores, uso para treinamento, confidencialidade e exclusão. Ausência de gravação no componente não prova retenção zero externa.
- [ ] Concluir **inventário no ambiente publicado**, incluindo headers/cookies da hospedagem, injeções pelo painel, scripts de prévia, páginas de venda, checkout e destinos externos. Busca no repositório não comprova ausência nesses ambientes.
- [ ] Avaliar necessidade e base legal do **cookie funcional sidebar:state**. Existe escrita no componente, acionada ao mudar o menu, mas não foi encontrado leitor correspondente no código examinado. Não presumir persistência efetiva nem indispensabilidade técnica. Não modificar o componente fora deste escopo. Se uma finalidade adicional depender de consentimento, bloquear antes da escolha e implementar aceitar/rejeitar/personalizar/revisar com registro de versão em tarefa própria.
- [ ] Documentar avaliação de necessidade, base legal e salvaguardas dos demais tratamentos, incluindo preferências e carregamento de fontes externas; confirmar papéis de controlador/operador e procedimentos para titulares/incidentes.
- [ ] Coordenar a publicação dos textos com a matriz comercial aprovada e a entrega técnica das Etapas 1/2, em revisão separada. Esta branch parte da main atual, cuja guarda de Soph ainda usa EcosystemProtected e cuja entrada ERP está na Gestão; não incorpora as correções de benefícios do PR #4 nem afirma implantá-las. Não alterar essas permissões nesta tarefa.
- [ ] **Revisão jurídica profissional** de todos os documentos e do fluxo de contratação antes de publicação definitiva. A implementação não é parecer jurídico nem certificação de conformidade.
- [ ] Aprovar a versão final e a estratégia de comunicação de mudanças. Não há checkbox, tabela nem novo registro de aceite implementado nesta tarefa; não declarar coleta/versionamento de aceite que não existe.

## Fontes públicas consultadas

- [CDC, texto atualizado da Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html), especialmente arts. 6º, 14, 25, 49 e 51.
- [Decreto 7.962/2013 — comércio eletrônico](https://www2.camara.leg.br/legin/fed/decret/2013/decreto-7962-15-marco-2013-775557-publicacaooriginal-139266-pe.html): identificação/endereço e informação na contratação. Conferir a identificação completa antes da publicação.
- [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), especialmente arts. 7º, 11, 16, 18, 20, 33 e 46. O acesso direto ao Planalto foi bloqueado nesta consulta; foram usadas também orientações oficiais da ANPD.
- [ANPD: perguntas frequentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes) e [direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).
- [ANPD: guia de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
- [Kiwify: cancelamento pelo comprador](https://ajuda.kiwify.com.br/pt-br/article/como-cancelar-a-assinatura-do-produto-que-comprei-19d0my1/) e [pedido de reembolso](https://ajuda.kiwify.com.br/pt-br/article/como-faco-para-pedir-o-reembolso-de-um-produto-que-comprei-1kfom3h/). Reconsultados nesta entrega. Não copiar como contrato do EmpreendaJá condições não confirmadas na oferta.
- [Portal oficial de reembolso](https://reembolso.kiwify.com.br): link disponibilizado, sem solicitar/reprocessar compra.

## Inventário técnico do repositório

Busca realizada em src, public, index.html, configurações e código das funções, excluindo dependências e binários. A leitura de código de integração não alterou esses arquivos nem consultou dados do Supabase.

| Mecanismo | Evidência no código | Uso e duração identificados |
| --- | --- | --- |
| Cookie próprio `sidebar:state` | `src/components/ui/sidebar.tsx` | booleano do menu, gravado na ação de abrir/fechar; Max-Age 604800 segundos (7 dias). Sem leitor identificado; avaliar necessidade antes da publicação |
| localStorage de sessão | `src/integrations/supabase/client.ts` | persistSession/autoRefreshToken e storage do Supabase; validade de token e permanência local são diferentes |
| Broker de prévia Lovable | `src/integrations/supabase/previewAuthStorage.ts` | sincronização de sessão com origem de editor validada, em hosts de prévia; não é cookie de analytics |
| localStorage `importadoras25_favorites` | `src/hooks/useFavorites.ts` | favoritos; sem TTL definido no trecho |
| localStorage `empreendaja_last_page` | `src/pages/Home.tsx` | continuidade da navegação; sem TTL definido no trecho |
| localStorage dos checklists | `AbrirMei.tsx`, `LogoMarca.tsx`, `RegistrarMarca.tsx` | `abrir-mei-checklist`, `logo-marca-checklist`, `registrar-marca-checklist`; sem TTL definido |
| Service Worker / Cache API | `public/sw.js`, `src/lib/pwa.ts` | cache `empreendaja-shell-v1`, estrutura/ícones de mesma origem, navegação com fallback; não é cache arbitrário de todos os dados |
| Google Fonts | `src/index.css` | CSS/fontes externas; conexão técnica, sem demonstração de tracker publicitário |
| Script da aplicação | `index.html` | entrada Vite local; metatags de redes sociais não equivalem a Meta Pixel |
| sessionStorage | busca no código | nenhum uso explícito identificado |
| Analytics/publicidade | busca por GA/GTM/gtag/Meta Pixel/fbq/Hotjar/Clarity/PostHog/Segment e padrões de scripts | nenhum script explícito identificado; ocorrência de `tracking-*` em classes CSS e menções textuais não são rastreadores |

Não foi acrescentado banner genérico, rastreador, armazenamento de consentimento ou dependência. A categoria funcional não dispensa análise de base legal. O inventário do código está concluído para esta revisão; a validação do ambiente real e da necessidade de cookies continua pendente.

## Fonte única dos textos

Os cinco Markdown desta pasta são importados com `?raw` e renderizados por `react-markdown`, já existente no projeto. As páginas TSX não têm cópias do conteúdo. Não habilitar HTML bruto. Atualizar versão/data em cada Markdown e revisar links quando houver mudança aprovada.

Rotas públicas: `/termos`, `/privacidade`, `/cookies`, `/cancelamento-reembolso`, `/aviso-soph-ia`. Ficam fora do AppLayout/ProtectedRoute, sem sidebar, login ou assinatura obrigatórios. O AuthProvider global existente não foi modificado; ele não bloqueia a renderização dessas rotas.

## Verificação e reversão da interface

Executar testes existentes e jurídicos, build, TypeScript, lint dos arquivos alterados e testes de navegador (`tests/legal/playwright.config.ts`). Os testes usam contas fictícias/provedores simulados e bloqueiam solicitações a serviços reais. Conferir os cinco URLs diretamente no preview, mobile/desktop, foco/teclado, links e ausência de redirecionamento.

Revisar o diff contra main: somente Markdown/checklist, páginas/componentes/estilos jurídicos, links do Footer/Login, roteamento e testes jurídicos. Nenhuma migration, Edge Function, permissão, autenticação, fornecedor, precificação, ERP, IA funcional ou integração de pagamento pode mudar.

A reversão é do commit de interface/documentos desta branch, após revisão; não requer SQL nem operação sobre clientes. Não fazer merge ou publicação definitiva antes das pendências e aprovação. O preview é ambiente de revisão, não evidência de aprovação jurídica.

## Resultados técnicos desta entrega

- `npm test`: 15 testes aprovados (10 jurídicos e os 5 existentes na main).
- `npx playwright test -c tests/legal/playwright.config.ts`: 30 testes aprovados em Chromium, mobile e desktop, incluindo visitantes, conta fictícia sem assinatura, navegação entre os cinco documentos, Footer/Login/Cadastro, recuperação de senha, proteções existentes de Soph/Gestão e renderização desses módulos com provedores simulados.
- Reflow em 320 px sem rolagem horizontal, contraste de texto verificado contra 4,5:1, títulos/landmarks, contatos clicáveis, foco visível e atalho de teclado para o documento. Não constitui auditoria completa de conformidade WCAG.
- Build de produção, TypeScript, ESLint dos arquivos alterados e `git diff --check`: aprovados.
- Markdown é a fonte exibida em runtime. Nenhuma dependência adicionada ou arquivo de autenticação/backend/produto alterado. As dependências já disponíveis no ambiente foram reutilizadas; package.json e lockfile permanecem iguais à main.
- A base e a ancestralidade foram conferidas: sem commits das Etapas 1/2, sem alterações na main ou no PR #4. Não foram executados testes reais de pagamento, IA externa, ERP externo ou envio de e-mail.
- A validação do preview deve usar a mesma suíte com `LEGAL_BASE_URL=https://deploy-preview-N--appempreendajacomsoph.netlify.app`. Os interceptadores impedem acesso a APIs reais; o teste usa somente dados fictícios locais. O status/URL específicos são registrados no PR, sem marcar as pendências jurídicas como resolvidas.

## Preview de revisão

PR separado: #5. Preview: https://deploy-preview-5--appempreendajacomsoph.netlify.app.

A mesma suíte de 30 testes passou também contra os arquivos publicados nesse preview, em mobile e desktop. No ambiente gerenciado, o Chromium não reconheceu diretamente a CA do proxy; o harness usa o cliente HTTPS do Playwright, com a CA já fornecida ao ambiente, para buscar os arquivos e renderizá-los em contexto descartável. A validação TLS permanece habilitada; nenhum certificado foi adicionado ao perfil persistente e nenhum ignoreHTTPSErrors foi usado. APIs externas continuam interceptadas com dados fictícios. Essa metodologia valida o frontend publicado, não autenticação/pagamentos reais nem o handshake TLS direto de todos os navegadores dos clientes.

O resultado técnico não resolve as pendências jurídicas/cadastrais acima e não autoriza publicação definitiva.
