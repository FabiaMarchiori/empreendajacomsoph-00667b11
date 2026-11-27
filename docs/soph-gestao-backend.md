# Soph Gestão 2.0 — backend isolado

Esta etapa adiciona uma interface de servidor para ler o identificador e o nome de uma empresa autorizada. Nenhuma rota registra o módulo. Os adaptadores de sessão, benefício e banco são injetados. Só os testes fornecem implementações, com duas empresas fictícias em memória.

## Fluxo futuro

1. Validar o bearer token do EmpreendaJá com Supabase Auth do emissor configurado. Usar validação de assinatura suportada para a configuração de chaves desse projeto. Conferir emissor, audiência, expiração e identidade (`sub`). Configurar emissão e rotação de chaves no servidor, sem aceitar o emissor ou a URL de chaves informados pelo cliente. Definir e testar como logout e revogação de sessão afetam tokens já emitidos.
2. Resolver o benefício ERP no servidor e a cada solicitação. Em homologação, usar uma fonte controlada. Em produção, adotar uma fonte canônica após a revisão de confirmação de e-mail, vínculos e benefícios. Manter a regra legada `has_erp_access` fora desse fluxo.
3. No banco do ERP, resolver um vínculo aprovado entre emissor, identidade e empresa. O ID solicitado delimita a consulta, mas não prova titularidade. Validar se o vínculo já existente pode ser protegido sem interferir na conta legada. Se precisar de uma extensão, limitar ao mapeamento de identidades, preservando as tabelas operacionais.
4. Abrir uma transação no ERP com papel específico de menor privilégio, sem `BYPASSRLS` e sem propriedade das tabelas protegidas. Usar o escopo vinculado pelo servidor nessa transação. Exigir RLS no acesso efetivo e comprovar que o escopo não vaza no pool. Preservar as políticas usadas pelo ERP antigo. O contrato do adaptador não implementa RLS. O adaptador real deve revalidar o vínculo ativo no acesso efetivo aos dados. Em operações futuras de escrita, aplicar também integridade por empresa e controle de concorrência.
5. Manter os clientes e credenciais dos dois projetos no servidor e separados por função. O token do EmpreendaJá é consumido como prova de identidade no backend. Sua aceitação pelo banco do ERP não é assumida. Não usar `service_role` no CRUD do 2.0. Uma falha de verificação ou consulta deve bloquear a leitura.

## Destino do ERP legado

O próximo caminho de integração tem como destino proposto o projeto `qdfjujkfclfoojjofgpq`. O código legado `supabase/functions/erp-entry/index.ts` usa `ERP_SOPH_URL` em execução e tem como fallback o projeto `kgbodlrfbtpiqjbinpxn`. A variável não estava disponível no ambiente de execução local, e a leitura do repositório não estabelece o valor implantado. Um responsável com acesso autorizado à configuração deverá verificar internamente apenas a referência do destino, sem exportar valores de configuração ou credenciais. Este módulo não usa o fallback legado.

## Pré-requisitos para homologação com JWT real

- EmpreendaJá Auth e ERP de homologação isolados, com referências confirmadas e sem dados de assinantes. Provisionar somente após autorização. Usar duas usuárias fictícias, duas empresas e um cenário equivalente ao acesso legado.
- Autorizar a preparação dos dados fictícios por um canal administrativo restrito. Usar os papéis efetivos de usuária e backend nas validações de leitura. Comprovar isolamento, revisão das funções privilegiadas do ERP e ausência de bypass antes de qualquer acesso ao ERP operacional.
- Validar tokens emitidos pelo Auth de homologação. Cobrir token modificado, expirado e de outro emissor, audiência incorreta e logout. Testar benefício expirado ou revogado durante sessão ativa, empresa alheia nos dois sentidos, falha de consulta e reciclagem de conexão.
- Antes de integrar benefício comercial, rever os pacotes de confirmação e vínculo dos PRs #2, #4 e #7 e os controles aplicáveis dos PRs #6 e #8. Validar conciliação de eventos de assinatura com dados fictícios. O PR #17 é a base desta etapa e permanece separado.
- Conservar a conta, o vínculo e os dados do cliente legado. Nenhuma verificação funcional desta etapa deve usar essa conta.

## Testes locais

Executar `npm test -- src/features/soph-gestao` e `npx tsc --noEmit -p tsconfig.app.json`. Estes testes validam a orquestração com sessões simuladas e não comprovam assinatura criptográfica, acesso à API remota ou RLS implantada. A suíte PostgreSQL em memória herdada da Fase 1A pode ser executada com `node --test tests/soph-gestao/authorization.test.mjs` após disponibilizar o PGlite localmente.
