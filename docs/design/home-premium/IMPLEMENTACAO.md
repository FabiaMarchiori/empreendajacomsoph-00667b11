# Home premium — implementação para avaliação visual

Branch exclusiva: `codex/redesign-home-premium`. Base: `4fdd39fd0c536b4ecb14907c0e7a5e4a5da72979`.
Entrega preparada para PR Draft e Deploy Preview do Netlify, sem merge nem publicação em produção. Nenhuma configuração de hospedagem alterada.

## Interface

- Hero usa os dois PNGs originais, texto React e nenhum botão. A imagem inteira é mantida, sem object-fit cover ou recorte de produtos. No espaço estreito, texto acima da fotografia; a sobreposição na área esquerda é usada quando o contêiner comporta o texto com legibilidade. Essa composição mobile fica sujeita à avaliação visual da proprietária.
- Cinco atalhos locais, na ordem solicitada, apontam para a primeira ferramenta da seção correspondente na Home. Em 320 px, Fornecedores pode quebrar em duas linhas sem abreviar o nome.
- Nove cards React/CSS com os nove PNGs transparentes e cores-base exatamente como solicitadas. O kit não trouxe tokens de cores de cards que substituam esses valores. Gradientes e sombras acrescentam profundidade.
- Duas colunas no espaço estreito; três quando a largura interna da Home alcança 620 px. Com a sidebar aberta, 768 px de viewport ainda usa duas colunas; 1024 e 1440 usam três. Descrições aparecem na composição ampla.
- Barra mobile: Início, Fornecedores, Vendas, Gestão e Mais. Mais abre sheet acessível com Estruture seu Negócio, Soph, Meus Acessos e Conta / Plano, usando rotas existentes. Fechamento por seleção, botão, toque fora ou Escape do componente existente.
- A faixa lateral de ícones mobile foi desativada apenas no AppSidebar por uma nova opção da primitiva Sidebar. O menu lateral expansível permanece disponível e o desktop preserva a sidebar.
- Barra inferior considera env(safe-area-inset-bottom), com espaço reservado no final do layout e viewport-fit=cover. O atalho Soph fica no cabeçalho e o painel abre abaixo dele, sem ocultar títulos ou setas dos cards.
- Pequena irregularidade do círculo Estruture seu Negócio ocultada por clip-path na exibição. Nenhum PNG foi retocado ou regravado. Os 24 hashes SHA-256 conferem com o inventário original; 21 recursos são usados na UI e três imagens são exclusivamente referências.
- Favoritos, Histórico, Último acesso, Suporte e soluções Em breve continuam acessíveis. O registro de última rota usa observação do router, substituindo a interceptação de history.pushState da Home antiga. Contadores e progresso estáticos foram retirados da apresentação.

## Autorizações e integrações

A apresentação consulta usePlanAccess e useErpAccess sem modificar os hooks. Não anuncia liberação enquanto carregam. O hub de fornecedores mantém sua rota geral; restrições dos nichos continuam nas rotas originais. Ferramentas restritas continuam levando às mesmas rotas, que apresentam sua proteção existente. ERP aponta para /gestao, onde o fluxo atual de autorização e entrada permanece intacto; o card não executa entrada externa.

Conferidos sem alterações: App.tsx, AuthContext, ProtectedRoute, EcosystemProtected, hooks, integrações, Supabase/SQL/RLS/Edge Functions, Kiwify, Brevo, manifestos de dependências, lockfiles, Vite e configurações de publicação. Nenhuma operação nos PRs #4, #6, #7 ou #8.

## Arquivos de implementação

- src/pages/Home.tsx
- src/components/MobileNavigation.tsx (novo)
- src/components/home/assets.ts (novo)
- src/components/home/home-premium.css (novo)
- src/components/home/home-premium.test.tsx (novo)
- src/components/AppLayout.tsx
- src/components/AppSidebar.tsx
- src/components/ui/sidebar.tsx
- src/components/SophFloatingButton.tsx
- index.html (somente viewport-fit=cover)
- docs/design/home-premium/IMPLEMENTACAO.md (este relatório)

O inventário, metadados e recursos adicionados na etapa anterior permanecem nas mesmas pastas.

## Validação executada

- npm run build: passou. O Vite continua avisando sobre o tamanho do bundle JS (aproximadamente 1,36 MB sem gzip). Não houve divisão de bundle nem conversão dos PNGs nesta etapa.
- npm test: 22 testes passaram em quatro arquivos, incluindo sete testes novos de navegação, carregamento e apresentação de acesso.
- tsc --noEmit -p tsconfig.app.json: passou.
- ESLint dos arquivos de implementação novos/alterados, exceto a primitiva sidebar que já tinha aviso: sem erros ou avisos. Lint geral: 32 erros e nove avisos, os mesmos da base main, conferidos em cópia do commit de origem. A primitiva sidebar mantém apenas seu aviso anterior de fast refresh.
- git diff --check: passou.
- Chromium/Playwright local: Home conferida em 320, 375, 390, 428, 768, 1024 e 1440 px. Sem overflow horizontal, títulos ou rótulos transbordando, imagens quebradas ou erros JavaScript. Imagem inteira contida na Hero, fotos e PNGs originais preservados.
- Verificados: cinco atalhos por hash, fechamento do menu Mais por navegação e Escape, acesso a Estruture, popover da Soph, separação do botão de ajuda e conteúdo e possibilidade de rolar o rodapé inteiro acima da barra mobile.
- Cinco páginas internas reais renderizadas em 390 px: Abrir MEI, Logo e Marca, Registrar Marca, Domínio/Site e Marketplaces. Guardas de rota originais também exercitados com fixtures de visitante, assinatura inativa, plano somente Bolsas e ecossistema sem ERP.
- Capturas desktop 1440 px, mobile 390 px, menu Mais e demais larguras geradas durante a inspeção. As capturas usam fixtures locais de teste, fora do código do aplicativo; nenhuma conta ou permissão real foi criada. Requisições Supabase bloqueadas no navegador de teste.

## Pendências e limites

- Avaliação visual da proprietária, incluindo composição mobile da Hero e reposicionamento do atalho Soph no cabeçalho.
- Login, renovação de sessão, assinaturas reais e abertura externa do ERP não foram exercitados com credenciais reais; código e proteções originais foram preservados. Os testes com fixtures verificam apresentação e guardas existentes, não certificam integrações de produção.
- Safe area física em iPhone e navegadores Safari/Firefox ainda requerem conferência em dispositivo. A validação automatizada usou Chromium com as larguras solicitadas.
- Os PNGs foram mantidos em resolução original, sem compressão adicional. Brilhos/sombras foram inspecionados nos tamanhos usados pela interface; não se certifica ausência de artefatos em toda escala possível.
- Lint global preexistente e aviso de bundle continuam pendentes, fora do escopo visual autorizado.

## Como visualizar sem publicar

No repositório, confirme a branch com `git branch --show-current` e execute:

```sh
npm ci --cache /tmp/empreendaja-npm-cache
npm run dev -- --host 0.0.0.0
```

Abra a prévia local na porta 8080 e entre com uma conta de teste autorizada. O aplicativo mantém as proteções normais de autenticação/assinatura. O servidor local de desenvolvimento já foi iniciado neste ambiente. Nenhum modo de demonstração ou bypass de autorização foi adicionado ao aplicativo.

Aguardar avaliação visual antes de qualquer publicação.
