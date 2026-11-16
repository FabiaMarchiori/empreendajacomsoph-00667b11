# Soph: correção CORS preparada, sem ativação

## Diagnóstico e alteração

Origem observada no navegador: `https://deploy-preview-12--appempreendajacomsoph.netlify.app`.
A requisição OPTIONS do endpoint `https://ospnuclymrxjoqwyolfn.supabase.co/functions/v1/soph-chat` responde com `Access-Control-Allow-Origin: https://appempreendajacomsoph.netlify.app`. A incompatibilidade bloqueia o POST no navegador e resulta em `Failed to fetch`.

A alteração adiciona somente essa origem exata à lista existente e declara `Access-Control-Allow-Methods: POST, OPTIONS`. Todos os domínios e padrões previamente autorizados permanecem iguais. `buildCorsHeaders` é chamado uma única vez por requisição e seus cabeçalhos já são usados no OPTIONS e em todas as respostas reais: streaming, autenticação, validação, gateway e erro interno.

Origens não autorizadas continuam recebendo o fallback anterior, que não coincide com a origem solicitante. Isso bloqueia a leitura no navegador; CORS não substitui autenticação e não impede clientes HTTP fora do navegador de fazer requisições. Não há `*`, nova resposta 403, bypass de JWT, proxy ou `no-cors`.

Não foram alterados autenticação, secrets, payloads, limites, prompt, modelo, gateway, banco, configuração de funções ou frontend.

## Testes

`npm run test -- --run src/test/soph-chat-cors.test.ts` executa o arquivo real da Edge Function em um contexto local isolado, após transpilar TypeScript. Somente Deno.serve/env, Supabase Auth e gateway externo são substituídos por fixtures. Não usa secrets, JWTs ou dados reais e não chama a IA em produção.

Cobre prévia exata, todas as origens/padrões legados, outras prévias não autorizadas, domínios semelhantes maliciosos, OPTIONS sem autenticação/gateway, POST com SSE e contrato original, 401 sem token/token inválido, 400/413 de payload e 402/429/502/500 de falhas. Lint, TypeScript e build também devem passar.

A suíte não é um teste autenticado contra a função publicada. Não há Deno instalado neste ambiente; a execução de teste é no runtime Node com as primitivas HTTP reais. A validação no runtime Supabase fica para a ativação autorizada.

## Ativação segura — somente após autorização expressa

1. Confirmar o diff de duas linhas da função e guardar uma cópia da versão realmente publicada no projeto `ospnuclymrxjoqwyolfn`, incluindo configuração de JWT, para reversão. Comparar a fonte publicada com a base revisada; se houver diferenças adicionais, parar e reconciliar antes de publicar. Não supor que a main é um backup fiel do serviço publicado.
2. Confirmar branch/commit e testes. Usar um diretório de trabalho isolado com esse commit para não publicar alterações locais ou outros PRs.
3. Publicar exclusivamente `soph-chat` no projeto confirmado, pelo fluxo de deploy já utilizado. Não publicar todas as funções, não executar migrations, não alterar secrets, verificação JWT, configuração de projeto ou variáveis. É uma alteração no serviço compartilhado de produção, mesmo que o objetivo seja habilitar a prévia; o Deploy Preview do Netlify não ativa esta alteração.
4. Repetir OPTIONS com Origin da prévia, Access-Control-Request-Method POST e Access-Control-Request-Headers authorization,content-type. Esperar origem exata, métodos POST/OPTIONS e cabeçalhos existentes. Conferir também origens legadas e uma origem não autorizada, que não deve receber autorização correspondente.
5. Abrir a prévia em um navegador sem cache antigo. Entrar normalmente com conta de teste autorizada e enviar uma pergunta sem dados de clientes. Conferir no Network o OPTIONS, POST, resposta SSE, ausência de bloqueio CORS e balões de envio/resposta. Conferir segunda mensagem com contexto e rolagem em desktop/mobile. Não copiar tokens para relatórios nem alterar dados reais.
6. Fazer uma verificação de regressão da Soph no domínio de produção já autorizado, com conta de teste. Confirmar que requisição sem JWT continua sendo rejeitada e que erros existentes continuam legíveis, sem relaxar limites ou autenticação.
7. Se houver regressão, republicar somente a cópia anterior da função, com configuração original, e repetir a verificação de produção. A reversão não requer alterações de banco, secrets ou frontend.

## Estado desta entrega

Apenas preparação em branch. Nenhum deploy da Edge Function, migration, merge ou publicação em produção foi executado. Até a ativação expressamente autorizada, o bloqueio CORS na prévia permanece esperado.
