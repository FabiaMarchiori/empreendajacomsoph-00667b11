# Home premium — implementação para avaliação visual

Branch exclusiva: `codex/redesign-home-premium`; PR Draft #9. Base da main: `4fdd39fd0c536b4ecb14907c0e7a5e4a5da72979`. Correção do fundo contínuo e compactação adicional sobre o refinamento `d7d98a2`.
Entrega preparada para PR Draft e Deploy Preview do Netlify, sem merge nem publicação em produção. Nenhuma configuração de hospedagem alterada.

## Interface após o refinamento

- Correção visual após reavaliação: Hero desktop em proporção natural 3:1, explicitamente autorizada pela proprietária para preservar a foto inteira. Altura em 1440 px: 377,3 px, substituindo os 301,9 px do banner 3,75:1. O arquivo é 3:1: preencher 3,75:1 sem distorção exigiria recortar 20% da altura; essa limitação foi informada antes da implementação, e a opção de foto inteira/altura natural foi escolhida.
- Uma única fotografia original preenche toda a Hero, incluindo os efeitos luminosos atrás do texto. Removidos fundo sólido, overlay e imagem limitada a 80% da largura. object-fit: cover com contêiner na mesma proporção natural do arquivo garante preenchimento sem cortes, distorção ou painel artificial.
- Hero mobile horizontal dentro do mesmo banner. Saudação usa o first_name do useProfile já existente: primeiro token de nome válido, sem e-mail, com fallback “Olá! 👋”. Mensagem: “Tudo para fazer seu negócio crescer.” Nenhuma alteração no hook, cadastro, Auth ou banco. Nomes acima de 20 caracteres recebem ajuste de fonte somente na saudação mobile para caberem no banner sem cortes. O banner mobile usa a proporção natural 1752:897 da imagem correspondente, mantendo a disposição horizontal.
- Fotografias e todos os PNGs permanecem originais. A composição horizontal funcionou com os arquivos existentes, sem edição de imagens.
- Cinco atalhos circulares preservados, com mesmas imagens, rótulos, ordem e destinos locais.
- Nove cards React/CSS preservados nas mesmas cores, ordem e destinos. Nova compactação: desktop mínimo 196 → 167 px (-14,8%), ícones de 62 px e menor intervalo entre título/descrição. Em 1024 px os cards crescem para cerca de 189,4 px para preservar a leitura; continuam em três colunas quando há espaço.
- Mobile com duas colunas, altura 160 → 146 px (-8,75%) e ícones de 54 px. Fonte e títulos preservam legibilidade em 320 px, sem sobreposição de título/seta. Descrições ocultas e informação de acesso mantida para leitores de tela.
- Utilidades desktop em quatro botões compactos com cantos arredondados, ícones e textos brancos: Último acesso #087BCE; Favoritos #A617DA; Histórico #009D97; Suporte #CE247C. No mobile, continuam somente no menu Mais, com a aparência anterior e sem novo botão fixo.
- Último acesso usa a rota anterior já registrada no layout e fallback /fornecedores. Favoritos mantém /fornecedores/importadoras-25/favoritos. Histórico agora leva à tela existente /gestao/precificacao/simulador, que contém RecentSimulations, em vez de levar apenas ao hub. Não há novo histórico, tabela, rota ou dado fictício. Suporte conserva o WhatsApp existente.
- Explorar novas soluções removido exclusivamente da Home. Nenhuma página ou ferramenta foi excluída.
- Navegação inferior, suas cinco imagens, ordem, cores, destaque ativo e área segura preservados. Mais mantém suas quatro áreas existentes e recebe os quatro atalhos, com fechamento ao navegar. Atalho Soph continua no cabeçalho.
- Máscara CSS anterior do círculo Estruture seu Negócio mantida, sem regravar o PNG. Os 24 hashes SHA-256 continuam conferindo com o inventário original: 21 recursos da UI e três referências separadas.

## Autorizações e integrações

A apresentação consulta usePlanAccess e useErpAccess sem modificar os hooks. Não anuncia liberação enquanto carregam. O hub de fornecedores mantém sua rota geral; restrições dos nichos continuam nas rotas originais. Ferramentas restritas continuam levando às mesmas rotas, que apresentam sua proteção existente. ERP aponta para /gestao, onde o fluxo atual de autorização e entrada permanece intacto; o card não executa entrada externa.

Conferidos sem alterações: App.tsx, AuthContext, ProtectedRoute, EcosystemProtected, hooks, integrações, Supabase/SQL/RLS/Edge Functions, Kiwify, Brevo, manifestos de dependências, lockfiles, Vite e configurações de publicação. Nenhuma operação nos PRs #4, #6, #7 ou #8.

## Arquivos desta correção visual

- src/components/home/home-premium.css
- src/pages/Home.tsx (somente classe de apresentação para nomes longos)
- docs/design/home-premium/IMPLEMENTACAO.md

Demais componentes, lógica dos atalhos, hooks, navegação mobile, imagens, referências e metadados preservados.

## Validação executada

- npm run build: passou. O Vite continua avisando sobre o tamanho do bundle JS (aproximadamente 1,36 MB sem gzip). Não houve divisão de bundle nem conversão dos PNGs nesta etapa.
- npm test: 36 testes passaram em quatro arquivos, incluindo navegação, carregamento, apresentação de acesso, validação de nomes/fallback e Último acesso no menu Mais.
- tsc --noEmit -p tsconfig.app.json: passou.
- ESLint dos arquivos de implementação novos/alterados, exceto a primitiva sidebar que já tinha aviso: sem erros ou avisos. Lint geral: 32 erros e nove avisos, os mesmos da base main, conferidos em cópia do commit de origem. A primitiva sidebar mantém apenas seu aviso anterior de fast refresh.
- git diff --check do refinamento: passou. O CSV de metadados original preserva seus finais de linha CRLF da etapa anterior.
- Chromium/Playwright local: cores exatas dos quatro botões e textos/ícones brancos confirmados; imagem ocupa 100% do banner e sua proporção renderizada coincide com a natural nas sete larguras, sem overlay. Home conferida em 320, 375, 390, 428, 768, 1024 e 1440 px. Sem overflow horizontal, títulos ou rótulos transbordando, imagens quebradas ou erros JavaScript. Imagem inteira contida na Hero, fotos e PNGs originais preservados.
- Verificados: cinco atalhos por hash, fechamento do menu Mais por navegação e Escape, acesso a Estruture, popover da Soph, separação do botão de ajuda e conteúdo e possibilidade de rolar o rodapé inteiro acima da barra mobile.
- Cinco páginas internas reais renderizadas em 390 px: Abrir MEI, Logo e Marca, Registrar Marca, Domínio/Site e Marketplaces. Guardas de rota originais também exercitados com fixtures de visitante, assinatura inativa, plano somente Bolsas e ecossistema sem ERP.
- Capturas desktop 1440 px, mobile 390 px, menu Mais e demais larguras geradas durante a inspeção. As capturas usam fixtures locais de teste, fora do código do aplicativo; nenhuma conta ou permissão real foi criada. Requisições Supabase bloqueadas no navegador de teste.

## Pendências e limites

- Avaliação visual da proprietária da Hero com fundo contínuo, da nova compactação e dos botões coloridos. A proporção desktop 3:1 foi autorizada antes desta correção.
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

Abra a prévia local na porta 8080 e entre com uma conta de teste autorizada. O aplicativo mantém as proteções normais de autenticação/assinatura. O servidor local de desenvolvimento já foi iniciado neste ambiente. Nenhum modo de demonstração ou bypass de autorização foi adicionado ao aplicativo. O PR #9 e seu Deploy Preview são os únicos destinos da atualização autorizada: https://deploy-preview-9--appempreendajacomsoph.netlify.app .

Aguardar avaliação visual antes de qualquer publicação.
