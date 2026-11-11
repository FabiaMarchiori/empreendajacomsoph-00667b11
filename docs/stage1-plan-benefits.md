# Etapa 1 — benefícios dos planos (preparada, não implantada)

Esta etapa é um pacote independente das demais correções do PR #4. Não aplicar todas as migrations do PR, não executar `supabase db push` e não publicar todo o PR como se ele contivesse somente esta etapa. O PR permanece rascunho; não há autorização de produção.

## Matriz implementada

| Direito vigente | Soph | ERP | Exclusivos do Ecossistema |
| --- | --- | --- | --- |
| Ecossistema / Anual / Mensal | incluída | incluído | liberados na navegação |
| Bolsas, Mochilas e Malas | incluída | somente concessão individual | bloqueados na navegação |
| Bolsas + concessão ERP vigente | incluída | promocional | bloqueados na navegação |
| Sem assinatura / assinatura vencida ou cancelada | não | somente concessão individual independente vigente | não |
| Administrador existente | sim | sim | sim |

Soph não é um produto independente. Não foram alterados login, confirmação de e-mail, IA, histórico, checkout nem dados de assinaturas. `current_product_access()` é uma consulta sem reivindicação de assinaturas. Frontend, Meus Acessos, Soph e ERP consultam o mesmo cálculo do servidor.

## Migration única desta etapa

`supabase/migrations/20261111152724_stage1_plan_benefits.sql`

Cria `erp_access_grants` (usuário, origem, motivo, autorizador, validade, revogação e referência histórica), `stage1_legacy_plan_benefits` e as RPCs `stage1_current_benefits`, `current_product_access`, `has_soph_access`, `has_erp_access` e o adaptador `has_product_access`.

Preserva direitos ERP existentes identificados pela função antiga: códigos ativos e válidos, clientes autorizados ativos associados aos perfis atuais, assinaturas ERP vigentes e administradores. A associação histórica é congelada por IDs de usuário e fonte; nunca é transferida automaticamente após mudança de e-mail. Validade, revogação e status das fontes continuam sendo consultados. Não altera linhas de `assinaturas`, `profiles`, `user_roles`, `soph_access_codes` ou `clientes_autorizados`.

Novas entradas em `clientes_autorizados` ou novos códigos não transformam Bolsas automaticamente em ERP: novas promoções precisam de concessão individual explícita. O cadastro da concessão exige um administrador já autorizado pela função existente e seu próprio ID como autorizador. Nenhuma regra de criação/concessão de administradores foi alterada. Não foi criada tela administrativa nova.

Acesso histórico de Starter é preservado somente para IDs de assinaturas já existentes na implantação; não cria um novo plano nem habilita futuras assinaturas Starter. Aliases históricos completo/premium continuam compatíveis. Meus Acessos distingue ERP incluído, promocional e legado.

O preflight da migration aborta se uma autorização ERP anterior ficar sem cobertura ou se a estrutura ampla `product_access_grants` já tiver sido aplicada. Nesse caso, reconciliar concessões antes da implantação; não remover a proteção. Usar execução transacional da migration específica.

## Pacote isolado e arquivos

`release/stage1-plan-benefits.json` é a lista explícita de arquivos. `npm run prepare:stage1 -- /caminho/novo` monta um pacote a partir de `origin/main`, sobrepondo somente frontend, migration e Soph permitidos. Recusa sobrescrever diretórios existentes. O manifesto gerado registra o commit base. A função ERP da base é incluída somente como fixture de validação, não para implantação. As dependências de testes e o lockfile são preservados para instalação reproduzível.

Arquivos de interface reutilizados: App, AppSidebar, ProtectedRoute, ProductProtected, SophFloatingButton, StatusBadge, usePlanAccess, useErpAccess, useNichoAccess, product-access, tipos Supabase, Acessos, Erp, Home e gates de Bolsas. A lista exata está no manifesto. O pacote não inclui as outras funções, outras migrations, alterações anteriores de vínculo em useSubscription nem hooks que dependam da RLS futura de fornecedores.

Não há mudança nesta etapa nas RLS de fornecedores/precificação. Os bloqueios desses módulos são de navegação/rotas existentes; a revisão de segurança do acesso direto aos respectivos dados continua fora desta etapa. Não afirmar que esta migration resolveu a segurança de todos os módulos do aplicativo.

## Validação isolada

- `npm run test:stage1`: SQL real em PGlite contra baseline mínimo das definições atuais e handlers reais Soph/ERP com provedores simulados.
- `npm test`: Meus Acessos, login padrão com autenticação simulada, navegação/gates e isolamento de cache.
- `npm run build` e TypeScript.
- Suíte anterior do PR executada separadamente para verificar regressões; ela não representa o conjunto de migrations a publicar nesta etapa.

Somente dados fictícios e mocks; nenhuma compra, mensagem, webhook, chamada de IA/ERP externo ou modificação de assinante real. Os testes de login não constituem login de produção nem teste ponta a ponta do Supabase Auth real.

## Sequência futura, somente após autorização

1. Contratar/confirmar Supabase Pro e comprovar backup recuperável, retenção e procedimento de restauração. Não presumir PITR. Guardar definições anteriores das RPCs e versões implantadas de Soph/frontend; coletar contagens agregadas de direitos e acessos antes/depois sem exportar dados pessoais para a conversa.
2. Regerar o pacote isolado contra a base aprovada e revisar seu diff; não fazer merge do PR completo. Confirmar esquema e ausência da migration ampla conflitante. Ensaiar em ambiente separado com dados fictícios.
3. Aplicar somente a migration indicada, transacionalmente; validar contagens e acessos históricos. Falha no preflight exige interrupção, não remoção de direitos.
4. Implantar somente `soph-chat` deste pacote. ERP já consulta `has_erp_access`; não precisa de nova publicação. Publicar o frontend isolado após RPCs disponíveis. Não publicar Kiwify, Brevo ou generate-soph-token.
5. Validar Soph/ERP, Meus Acessos e navegação dos quatro grupos com contas fictícias autorizadas. Conferir agregados, sem tocar pagamentos ou assinaturas reais.

Reversão: interromper a sequência se houver discrepância; restaurar versões anteriores do frontend e Soph e definições SQL capturadas antes da implantação. Preservar as novas tabelas/concessões para análise, sem apagar/reassociar assinaturas. Usar backup restaurado em ambiente separado se necessário para recuperação verificada, evitando restauração cega sobre pagamentos posteriores. Esta etapa não altera registros comerciais, portanto não exige desfazer assinaturas.

O preview da Netlify é da branch inteira e não prova implantação desta migration. O pacote isolado foi testado separadamente; a publicação de banco continua bloqueada até Pro, backup recuperável e autorização específica.
