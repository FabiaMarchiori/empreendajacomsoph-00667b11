# EmpreendaJá com Soph — protótipo visual Taste 2.5.1

Proposta experimental independente. Branch: `experiment/taste-home-prototype`.
Base: `a17e8043fb5f3957cdaddb67528ec1777cf13d0e` (main).

## Visualização

Prévia privada, separada da hospedagem do aplicativo:
https://empreendaja-soph-taste-home-preview.beefythrush2.chatgpt.site

Este diretório é um projeto estático autônomo: index.html, style.css, app.js e assets locais.
Não é importado por src/App.tsx e não modifica nenhuma rota do aplicativo existente.

## Direção visual

Taste Skill 2.5.1, commit f6b76575f949707b4e3c37cd86cb44b0b98643e8:
alinhamento, sistema de espaçamento, hierarquia, acabamento dos cards, hover de 2px,
resposta ao pressionamento e respeito a prefers-reduced-motion.
A identidade aprovada prevalece sobre regras incompatíveis: roxo/violeta preservado,
layout de aplicativo compacto em vez de uma seção por tela, sem sorteio de paleta ou fontes.
Não instalamos a skill globalmente nem executamos seus scripts ou hooks.

## Isolamento

- Os únicos arquivos acrescentados ao repositório ficam neste diretório experiments/.
- Nenhuma dependência nova no aplicativo. Sem alteração em package.json ou lockfile.
- Sem Supabase, Auth, RLS, assinaturas, Kiwify, banco, pagamentos ou APIs.
- Perfil Marina Oliveira e plano são fictícios.
- Favoritos e histórico existem somente em memória, durante a sessão.
- Soph usa respostas locais predefinidas, não IA real.
- Cards abrem demonstrações; suporte não envia mensagens ou abre WhatsApp.
- Fontes Inter e Space Grotesk locais; imagens são cópias otimizadas dos assets existentes.
- Prévia hospedada em um Site novo, privado, acessível à proprietária, sem domínio do app.

## Recursos preservados

Nove ferramentas; atalhos das áreas; navegação desktop e inferior mobile;
Meus Acessos, Conta e plano; Último acesso, Favoritos, Histórico e Suporte;
busca de ferramentas, notificações demonstrativas e identidade da Soph.

## Verificação

Capturas reais do Chromium em 1440 e 390 px. Inspeção adicional em 320 e 820 px:
sem overflow horizontal, nove acessos presentes, sem imagens quebradas;
filtros, favorito da sessão, conversa local e movimento reduzido verificados.
Não representa teste funcional das integrações do aplicativo.

Licenças das fontes: Inter e Space Grotesk distribuídas sob SIL Open Font License.
Assets da marca provenientes do próprio projeto; não utilizados novos bancos de imagens.
