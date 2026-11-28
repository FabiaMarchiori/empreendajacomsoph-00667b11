# Soph Gestão 2.0 — entrega do catálogo real (PR #29)

## Estado confirmado em 28/11/2026

**Banco ERP:** `qdfjujkfclfoojjofgpq`. Migrações aplicadas diretamente, nessa ordem:

1. `soph_catalogo_campos_aditivos` (campos Contatos/Produtos, constraints, índice).
2. `soph_catalogo_vinculos_privados` (roles, vínculos privados, RLS).
3. `soph_catalogo_acl_funcoes_legadas` (REVOKE de EXECUTE de PUBLIC nas 14 funções antigas; **grants diretos anon/authenticated/service_role preservados**).
4. `soph_catalogo_rls_grants` (políticas e grants por coluna).
5. `soph_catalogo_api_roles` (role de descoberta, transporte sem senha, concessões mínimas e política de empresa).
6. `soph_catalogo_vendas_financeiro_rls` (grants limitados e RLS por empresa para Vendas, Itens de Venda e Financeiro).

Os SQLs de pré-verificação e verificação de permissões passaram. As conferências posteriores indicaram 41 contatos, 7 produtos, 10 vendas, 16 itens de venda, 25 lançamentos financeiros e 0 vínculos aprovados. **Não executar novamente essas migrações indiscriminadamente**.

## O que foi desenvolvido

- `supabase/functions/soph-catalog/index.ts`: autentica token no Auth da aplicação, valida e-mail confirmado, verifica o benefício ERP via `has_erp_access` e usa o vínculo privado para determinar a empresa. O `companyId` **não é confiado ao navegador**. Acesso SQL somente em transação com `SET LOCAL ROLE`, parâmetros de escopo locais e RLS.
- `src/features/soph-gestao/screens/RealCatalog.tsx`: telas reais de Contatos e Produtos (listagem, cadastro, edição, paginação). Erro fechado quando credenciais/vínculo faltam; não usa fixtures como substituto silencioso.
- `Overview.tsx`: Contatos e Produtos usam RealCatalog. Vendas e Financeiro usam RealOperations com leitura, lançamento e edição limitada pelo escopo da empresa. **Dashboard permanece em demonstração e está identificado.**
- `erp-sales-finance.ts`: registra vendas em uma transação que bloqueia produtos, calcula total dos preços lidos no banco, insere itens, baixa estoque e cria a receita; contas manuais podem ser cadastradas e quitadas. Sem exclusões de histórico. Financeiro vinculado a vendas ou compras não pode ser quitado pela rotina manual.
- `tsconfig.soph-catalog.json`, `.github/workflows/soph-catalog-ci.yml`: verificação da função Edge no Deno, testes unitários, testes de autenticação/RLS com PostgreSQL e GoTrue descartáveis e build do app.

## Etapas que faltam antes de liberar clientes

1. **Provisionar credencial restrita com segurança.** Role `soph_catalogo_transport` está `LOGIN NOINHERIT NOBYPASSRLS`, **sem senha**. Gerar credencial aleatória com armazenamento seguro, criar senha somente na role restrita e configurar `SOPH_ERP_CATALOG_DATABASE_URL` como segredo de runtime Supabase Edge no projeto EmpreendaJá. Formato: URL PostgreSQL do banco ERP, nunca usar `postgres`, `service_role` ou uma key de alto privilégio. O backend rejeita host e username incompatíveis com o projeto ERP. **Não registrar ou enviar senha por PR, logs ou mensagens.**
2. Usar a variável automática `SUPABASE_ANON_KEY` do Supabase Edge do projeto EmpreendaJá; a API fica no Supabase independentemente do host frontend.
3. **Aprovar vínculos administrativos reais** com `05_aprovar_vinculo.psql`, conferindo o UUID de uma conta Auth **com e-mail confirmado** na aplicação e o UUID da empresa ERP por documentação/autorização da titular. Não usar correspondência por e-mail como prova. Nenhum vínculo foi aprovado até o registro deste documento.
4. Testar na prévia/ambiente não público: login próprio, ausência de acesso, benefício revogado, conta sem vínculo, outra empresa, CRUD com registros fictícios e releitura após recarregar, paginação, concorrência e conta legada. Testar cliente antigo com autorização e manter registros reais inalterados.
5. Revisar as 14 concessões diretas antigas ao papel `anon` apontadas pelo Supabase Security Advisor. O REVOKE de `PUBLIC` **não eliminou** esses avisos; alterações adicionais podem afetar o ERP antigo.
6. Confirmar estratégia de recuperação/backup antes de mudanças potencialmente destrutivas. Nenhuma evidência de restauração foi validada nesta etapa.
7. Liberar a branch somente após prévia aprovada, sem mesclar automaticamente outras mudanças de segurança ou assinaturas do EmpreendaJá.

## Hospedagem independente

O frontend chama Supabase Edge Functions via `supabase.functions.invoke`. A API e os segredos pertencem ao projeto Supabase do EmpreendaJá, não ao Netlify. Nenhuma senha deve ir para o browser. A função Edge não foi implantada nesta etapa, pois o transporte ainda não possui uma senha segura e os vínculos ainda não foram aprovados.

## Limitações intencionais

- A API não permite exclusão, alteração arbitrária de estoque ou edição de uma venda concluída. Inclui registro de vendas e lançamentos financeiros, além de quitação manual de contas sem vínculos com vendas/compras. Compras, parcelamento e conciliação detalhada ainda exigem contratos próprios.
- A interface de vendas usa preço do banco e estoque da transação, nunca o preço enviado pelo navegador. **Ainda exige testes reais para concorrência, valores, RLS e recuperação**, mesmo com testes unitários aprovados.
- O Dashboard permanece demonstrativo. Não publicar como painel financeiro real enquanto suas métricas não forem alimentadas por consultas autorizadas.
- `has_erp_access` é a fonte comercial atual; a revisão de segurança das assinaturas do EmpreendaJá continua sendo uma frente separada.
- Os testes em GitHub CI validam código, banco/auth descartáveis e RLS, **não** substituem ensaio ponta a ponta com credenciais de produção em prévia isolada.
- Se a conexão estiver ausente ou falhar, a interface informa indisponibilidade em vez de salvar dados no navegador. O site poderá mudar de hospedagem sem reconfigurar o backend: a tela usa `supabase.functions.invoke("soph-catalog")`.

## Verificação pós-release (consultas somente leitura)

```sql
select
  (select count(*) from public.contatos) as contatos,
  (select count(*) from public.produtos) as produtos,
  (select count(*) from soph_catalogo_privado.vinculos) as vinculos;
```

Em caso de falha do front, reverter **apenas o deploy** para a versão anterior, preservando tabelas e vínculos. Não executar exclusões de schema, role, dados ou reset de migrações sem análise independente.
