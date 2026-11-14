# Home premium — implementação para avaliação visual

Branch exclusiva: `codex/redesign-home-premium`; PR Draft #9. Base da main: `4fdd39fd0c536b4ecb14907c0e7a5e4a5da72979`. Refinamento visual sobre a primeira implementação aprovada (`3bfc1ff`).
Entrega preparada para PR Draft e Deploy Preview do Netlify, sem merge nem publicação em produção. Nenhuma configuração de hospedagem alterada.

## Interface após o refinamento

- Hero desktop com proporção 3,75:1: 20% mais baixa que a anterior em 1440 px (377,3 → 301,9 px) e em 1024 px (240 → 192 px). Imagem original inteira, com object-fit: contain, sem distorção; texto à esquerda e produtos à direita.
- Hero mobile horizontal dentro do mesmo banner. Saudação usa o first_name do useProfile já existente: primeiro token de nome válido, sem e-mail, com fallback “Olá! 👋”. Mensagem: “Tudo para fazer seu negócio crescer.” Nenhuma alteração no hook, cadastro, Auth ou banco. Nomes longos podem aumentar a altura do banner para preservar legibilidade, mantendo a composição horizontal.
- Fotografias e todos os PNGs permanecem originais. A composição horizontal funcionou com os arquivos existentes, sem edição de imagens.
- Cinco atalhos circulares preservados, com mesmas imagens, rótulos, ordem e destinos locais.
- Nove cards React/CSS preservados nas mesmas cores, ordem e destinos. Desktop em três colunas a partir de 620 px internos; altura mínima 252 → 196 px (-22,2%), ícones e espaços reduzidos. Em 1440 px todos mediram 196 px. Em 1024 px os cards crescem conforme títulos/descrições para evitar cortes.
- Mobile com duas colunas e altura 192 → 160 px (-16,7%). Mostra ícone, título e seta; descrições ocultas e informação de acesso mantida para leitores de tela. Fonte usa largura do contêiner para evitar sobreposição em 768 px com sidebar aberta.
- Desktop: Último acesso, Favoritos, Histórico e Suporte em barra compacta e discreta abaixo dos cards. Mobile: mesmos comandos somente no menu Mais; nenhum botão fixo adicional. Links e lógica compartilhados por QuickActions.
- Último acesso usa a rota anterior já registrada no layout e fallback /fornecedores. Favoritos mantém /fornecedores/importadoras-25/favoritos. Histórico agora leva à tela existente /gestao/precificacao/simulador, que contém RecentSimulations, em vez de levar apenas ao hub. Não há novo histórico, tabela, rota ou dado fictício. Suporte conserva o WhatsApp existente.
- Explorar novas soluções removido exclusivamente da Home. Nenhuma página ou ferramenta foi excluída.
- Navegação inferior, suas cinco imagens, ordem, cores, destaque ativo e área segura preservados. Mais mantém suas quatro áreas existentes e recebe os quatro atalhos, com fechamento ao navegar. Atalho Soph continua no cabeçalho.
- Máscara CSS anterior do círculo Estruture seu Negócio mantida, sem regravar o PNG. Os 24 hashes SHA-256 continuam conferindo com o inventário original: 21 recursos da UI e três referências separadas.

## Autorizações e integrações

A apresentação consulta usePlanAccess e useErpAccess sem modificar os hooks. Não anuncia liberação enquanto carregam. O hub de fornecedores mantém sua rota geral; restrições dos nichos continuam nas rotas originais. Ferramentas restritas continuam levando às mesmas rotas, que apresentam sua proteção existente. ERP aponta para /gestao, onde o fluxo atual de autorização e entrada permanece intacto; o card não executa entrada externa.

Conferidos sem alterações: App.tsx, AuthContext, ProtectedRoute, EcosystemProtected, hooks, integrações, Supabase/SQL/RLS/Edge Functions, Kiwify, Brevo, manifestos de dependências, lockfiles, Vite e configurações de publicação. Nenhuma operação nos PRs #4, #6, #7 ou #8.

## Arquivos deste refinamento

- src/pages/Home.tsx
- src/components/MobileNavigation.tsx
- src/components/home/home-premium.css
- src/components/home/home-premium.test.tsx
- src/components/home/QuickActions.tsx (novo; comportamentos existentes compartilhados)
- src/components/home/firstName.ts (novo; validação do nome somente para apresentação)
- docs/design/home-premium/IMPLEMENTACAO.md

Demais componentes do primeiro redesign, imagens, referências e metadados preservados.

## Validação executada

- npm run build: passou. O Vite continua avisando sobre o tamanho do bundle JS (aproximadamente 1,36 MB sem gzip). Não houve divisão de bundle nem conversão dos PNGs nesta etapa.
- npm test: 36 testes passaram em quatro arquivos, incluindo navegação, carregamento, apresentação de acesso, validação de nomes/fallback e Último acesso no menu Mais.
- tsc --noEmit -p tsconfig.app.json: passou.
- ESLint dos arquivos de implementação novos/alterados, exceto a primitiva sidebar que já tinha aviso: sem erros ou avisos. Lint geral: 32 erros e nove avisos, os mesmos da base main, conferidos em cópia do commit de origem. A primitiva sidebar mantém apenas seu aviso anterior de fast refresh.
- git diff --check do refinamento: passou. O CSV de metadados original preserva seus finais de linha CRLF da etapa anterior.
- Chromium/Playwright local: Home conferida em 320, 375, 390, 428, 768, 1024 e 1440 px. Sem overflow horizontal, títulos ou rótulos transbordando, imagens quebradas ou erros JavaScript. Imagem inteira contida na Hero, fotos e PNGs originais preservados.
- Verificados: cinco atalhos por hash, fechamento do menu Mais por navegação e Escape, acesso a Estruture, popover da Soph, separação do botão de ajuda e conteúdo e possibilidade de rolar o rodapé inteiro acima da barra mobile.
- Cinco páginas internas reais renderizadas em 390 px: Abrir MEI, Logo e Marca, Registrar Marca, Domínio/Site e Marketplaces. Guardas de rota originais também exercitados com fixtures de visitante, assinatura inativa, plano somente Bolsas e ecossistema sem ERP.
- Capturas desktop 1440 px, mobile 390 px, menu Mais e demais larguras geradas durante a inspeção. As capturas usam fixtures locais de teste, fora do código do aplicativo; nenhuma conta ou permissão real foi criada. Requisições Supabase bloqueadas no navegador de teste.

## Pendências e limites

- Avaliação visual da proprietária do refinamento, especialmente da nova Hero mobile horizontal e da redução dos cards.
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
