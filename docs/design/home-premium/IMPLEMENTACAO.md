# Home premium — implementação para avaliação visual

Branch exclusiva: `codex/redesign-home-premium`; PR Draft #9. Base da main: `4fdd39fd0c536b4ecb14907c0e7a5e4a5da72979`. Correção exclusiva dos breakpoints da Hero sobre `0290d61`, preservando a Alternativa B e o mobile aprovado.
Entrega preparada para PR Draft e Deploy Preview do Netlify, sem merge nem publicação em produção. Nenhuma configuração de hospedagem alterada.

## Interface após o refinamento

- Correção responsiva: a imagem e as regras desktop da Hero agora começam em 768 px, junto à navegação. A partir dessa largura a foto desktop inteira mantém 3:1; antes dela, a Hero mobile permanece inalterada.
- Faixa intermediária: tipografia e margens internas variam com a largura real do contêiner, inclusive com a sidebar aberta. Em 768 px, com 464 px disponíveis, título de 22 px e descrição de 12 px; crescem progressivamente até os tamanhos desktop já aprovados. Nomes com mais de 30 caracteres têm ajuste tipográfico específico para não sair do banner.
- Em 1023/1024 px não há mais troca de foto/proporção: altura muda cerca de 0,33 px e fonte varia no máximo 0,04 px. Em 767/768 px ocorre a mudança real de layout, com a entrada da sidebar e passagem do mobile para desktop. A largura disponível e a proporção mudam nesse ponto; não se promete continuidade absoluta da altura sem alterar a navegação/mobile aprovados.

- Alternativa B aprovada: Hero desktop centralizada, largura responsiva limitada a 1020 px e proporção 3:1. Em viewport de 1440 px: exatamente 1020 × 340 px. Em espaços menores, largura e altura diminuem proporcionalmente, sem recorte ou distorção. Uma única instância do PNG original, sem duplicação, máscaras, overlays, emendas ou painel sólido. A abordagem de duas camadas foi abandonada.
- Saudação personalizada no desktop com 30–32 px e peso 700; descrição curta “Tudo para fazer seu negócio crescer.” com 15–16 px. Conjunto centralizado verticalmente na área esquerda, limitada a 40%/400 px, com margem interna horizontal de 32 px. Fotografia, dimensões e enquadramento preservados. Primeiro nome válido do perfil existente ou “Olá! 👋”; nenhuma consulta/alteração adicional de Auth ou cadastro foi implementada.
- Hero mobile horizontal dentro do mesmo banner. Saudação usa o first_name do useProfile já existente: primeiro token de nome válido, sem e-mail, com fallback “Olá! 👋”. Mensagem: “Tudo para fazer seu negócio crescer.” Nenhuma alteração no hook, cadastro, Auth ou banco. Margem esquerda mobile de 16 px, saudação de 17–20 px e frase curta em 13–14 px, com largura de leitura limitada para preservar legibilidade sobre o fundo original. Nomes longos mantêm o ajuste de fonte já existente. O banner mobile usa a proporção natural 1752:897 da imagem correspondente, mantendo a disposição horizontal.
- Fotografias e todos os PNGs permanecem originais. A composição horizontal funcionou com os arquivos existentes, sem edição de imagens.
- Cinco atalhos circulares preservados, com mesmas imagens, rótulos, ordem e destinos locais.
- Nove cards React/CSS preservados nas mesmas cores, ordem e destinos. Dimensões desktop mantidas: 167 px em 1440 px; cerca de 189,4 px em 1024 px, com três colunas quando há espaço.
- Cards mobile mantêm duas colunas e altura mínima de 146 px, sem nova redução. Ícones passaram de 54 para 64 px, títulos de 14–15 px, grupo de conteúdo centralizado e seta em coluna própria ao lado do título. Menor distância entre ícone e texto e distribuição equilibrada do espaço restante. Não há cortes ou interseções entre título e seta em 320, 375, 390 e 428 px. Descrições permanecem ocultas no mobile.
- Utilidades desktop em quatro botões compactos com cantos arredondados, ícones e textos brancos: Último acesso #087BCE; Favoritos #A617DA; Histórico #009D97; Suporte #CE247C. No mobile, continuam somente no menu Mais, com a aparência anterior e sem novo botão fixo.
- Último acesso usa a rota anterior já registrada no layout e fallback /fornecedores. Favoritos mantém /fornecedores/importadoras-25/favoritos. Histórico agora leva à tela existente /gestao/precificacao/simulador, que contém RecentSimulations, em vez de levar apenas ao hub. Não há novo histórico, tabela, rota ou dado fictício. Suporte conserva o WhatsApp existente.
- Explorar novas soluções removido exclusivamente da Home. Nenhuma página ou ferramenta foi excluída.
- Navegação inferior, suas cinco imagens, ordem, cores, destaque ativo e área segura preservados. Mais mantém suas quatro áreas existentes e recebe os quatro atalhos, com fechamento ao navegar. Atalho Soph continua no cabeçalho.
- Máscara CSS anterior do círculo Estruture seu Negócio mantida, sem regravar o PNG. Os 24 hashes SHA-256 continuam conferindo com o inventário original: 21 recursos da UI e três referências separadas.

## Autorizações e integrações

A apresentação consulta usePlanAccess e useErpAccess sem modificar os hooks. Não anuncia liberação enquanto carregam. O hub de fornecedores mantém sua rota geral; restrições dos nichos continuam nas rotas originais. Ferramentas restritas continuam levando às mesmas rotas, que apresentam sua proteção existente. ERP aponta para /gestao, onde o fluxo atual de autorização e entrada permanece intacto; o card não executa entrada externa.

Conferidos sem alterações: App.tsx, AuthContext, ProtectedRoute, EcosystemProtected, hooks, integrações, Supabase/SQL/RLS/Edge Functions, Kiwify, Brevo, manifestos de dependências, lockfiles, Vite e configurações de publicação. Nenhuma operação nos PRs #4, #6, #7 ou #8.

## Arquivos desta correção

- src/components/home/home-premium.css (somente regras desktop da Hero e tipografia intermediária)
- src/pages/Home.tsx (source da imagem em 768 px e classe de apresentação para nomes muito longos)
- docs/design/home-premium/IMPLEMENTACAO.md

Cards, atalhos circulares, botões coloridos, navegação, helpers de perfil/acesso, fotos e integrações permanecem intactos. O CSS fora do bloco desktop da Hero não mudou; a captura mobile de 390 px permanece idêntica pixel a pixel.

## Validação executada

- npm run build: passou. O Vite continua avisando sobre o tamanho do bundle JS (aproximadamente 1,36 MB sem gzip). Não houve divisão de bundle nem conversão dos PNGs nesta etapa.
- npm test: 36 testes passaram em quatro arquivos, incluindo navegação, carregamento, apresentação de acesso, validação de nomes/fallback e Último acesso no menu Mais.
- tsc --noEmit -p tsconfig.app.json: passou.
- ESLint dos arquivos de implementação novos/alterados, exceto a primitiva sidebar que já tinha aviso: sem erros ou avisos. Lint geral: 32 erros e nove avisos, os mesmos da base main, conferidos em cópia do commit de origem. A primitiva sidebar mantém apenas seu aviso anterior de fast refresh.
- git diff --check do refinamento: passou. O CSV de metadados original preserva seus finais de linha CRLF da etapa anterior.
- Chromium/Playwright local: cores exatas dos quatro botões e textos/ícones brancos confirmados; imagem ocupa 100% do banner e sua proporção renderizada coincide com a natural nas sete larguras, sem overlay. Home conferida em 320, 375, 390, 428, 767, 768, 820, 920, 1023, 1024, 1280, 1366 e 1440 px, com a sidebar aberta e recolhida. Em celular, a sidebar aberta é o drawer existente sobre o conteúdo, sem mudar as medidas da Hero. Sem overflow horizontal, títulos ou rótulos transbordando, imagens quebradas ou erros JavaScript. Imagem inteira contida na Hero, fotos e PNGs originais preservados.
- Verificados: cinco atalhos por hash, fechamento do menu Mais por navegação e Escape, acesso a Estruture, popover da Soph, separação do botão de ajuda e conteúdo e possibilidade de rolar o rodapé inteiro acima da barra mobile.
- Cinco páginas internas reais renderizadas em 390 px: Abrir MEI, Logo e Marca, Registrar Marca, Domínio/Site e Marketplaces. Guardas de rota originais também exercitados com fixtures de visitante, assinatura inativa, plano somente Bolsas e ecossistema sem ERP.
- Capturas desktop 1440 px, mobile 390 px, menu Mais e demais larguras geradas durante a inspeção. As capturas usam fixtures locais de teste, fora do código do aplicativo; nenhuma conta ou permissão real foi criada. Requisições Supabase bloqueadas no navegador de teste.

## Pendências e limites

- Avaliação visual da implementação definitiva da Alternativa B e da redistribuição interna dos cards mobile. Dimensões, cores e botões desktop permanecem preservados.
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

## Medidas da correção responsiva

Viewport CSS, zoom 100%, dimensões em pixels. Medidas locais conferidas também após o Deploy Preview. Em celular, aberto/recolhido referem-se ao drawer existente.

| Viewport | Sidebar aberta — Hero | Sidebar recolhida — Hero | Título aberto / recolhido |
|---:|---:|---:|---:|
| 320 | 296.00 × 151.55 | 296.00 × 151.55 | 17.00 / 17.00 px |
| 375 | 351.00 × 179.70 | 351.00 × 179.70 | 17.00 / 17.00 px |
| 390 | 366.00 × 187.38 | 366.00 × 187.38 | 17.00 / 17.00 px |
| 428 | 404.00 × 206.83 | 404.00 × 206.83 | 18.18 / 18.18 px |
| 767 | 743.00 × 380.39 | 743.00 × 380.39 | 20.00 / 20.00 px |
| 768 | 464.00 × 154.66 | 664.00 × 221.33 | 22.00 / 28.25 px |
| 820 | 516.00 × 172.00 | 716.00 × 238.66 | 23.62 / 29.88 px |
| 920 | 616.00 × 205.33 | 816.00 × 272.00 | 26.75 / 30.00 px |
| 1023 | 719.00 × 239.66 | 919.00 × 306.33 | 29.97 / 30.00 px |
| 1024 | 720.00 × 240.00 | 920.00 × 306.66 | 30.00 / 30.00 px |
| 1280 | 976.00 × 325.33 | 1020.00 × 340.00 | 31.23 / 32.00 px |
| 1366 | 1020.00 × 340.00 | 1020.00 × 340.00 | 32.00 / 32.00 px |
| 1440 | 1020.00 × 340.00 | 1020.00 × 340.00 | 32.00 / 32.00 px |
