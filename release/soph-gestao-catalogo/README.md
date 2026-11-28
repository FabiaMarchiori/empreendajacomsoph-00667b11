# Pendências para homologação hospedada

- Disponibilizar bancos isolados para o Auth do EmpreendaJá e o ERP, com credenciais próprias e somente dados fictícios. Validar o esquema e a configuração efetiva de privilégios do ERP com `00_preflight.sql`. Se o papel técnico alcançar funções `SECURITY DEFINER`, resolver esses acessos em homologação antes de liberar as tabelas. A checagem em `03_rls_e_grants.sql` interrompe a transação nesse caso.
- Configurar uma credencial exclusiva do backend para assumir apenas o papel técnico. Validar no servidor a sessão do emissor esperado e o benefício ERP a cada operação. Resolver o vínculo aprovado no servidor e definir o contexto na mesma transação da consulta. Os parâmetros de sessão do PostgreSQL só podem receber valores definidos pelo backend após essas verificações.
Validação descartável com PostgreSQL 16 via `bash tests/soph-gestao/migrations/run-local.sh`.

## Bloqueios da ativação em produção

- Confirmar um backup recente do projeto do ERP, seu ponto de recuperação e evidência de restauração. O conector disponível não fornece inventário ou evidência de recuperação.
- A leitura do catálogo do ERP confirmou 14 funções `SECURITY DEFINER` no esquema `public` com `EXECUTE` concedido a `PUBLIC`. O papel `soph_catalogo_backend` ainda não existe. A política de acesso precisa preservar os papéis e as chamadas necessárias ao ERP anterior e remover o acesso efetivo a essas funções para a credencial técnica. A verificação em `03_rls_e_grants.sql` deve passar antes da habilitação.
- A tabela privada de vínculos ainda não existe. A autorização de cada empresa exige um vínculo vigente aprovado, associado ao emissor e ao UUID confirmado da conta do EmpreendaJá. A empresa informada pelo navegador não pode servir como prova de vínculo.

O adaptador já mapeia status, SKU e estoque mínimo. Atualizações omitem os campos que não foram enviados. Endereço e Instagram são somente leitura neste fluxo, e novos produtos usam a quantidade inicial definida pelo banco. A interface publicada continua em demonstração. Após comprovar os requisitos acima, falta ligar a API e a interface ao adaptador usando uma transação com o papel restrito e a checagem do benefício ERP em cada operação.

### Preparação no PR #28

- Antes de qualquer DDL, em **Database → Backups** no projeto ERP, confirmar um backup concluído ou um ponto disponível em **Point in Time Recovery**. Registrar o horário UTC, o estado do backup e evidência de restauração em destino isolado autorizado ou de um teste de recuperação já realizado. A listagem por si só não comprova recuperação. Manter a restauração fora do projeto em uso.
- Depois de comprovado o backup, revisar `00b_acl_funcoes_legadas.sql`. O script só retira `EXECUTE` de `PUBLIC` nas 14 assinaturas observadas. Aborta se uma assinatura ou um grant direto legado esperado divergir. Após a mudança, executar a pré-verificação `00`, verificar os consumidores legados, aplicar `01` e `02`, e usar `03` e `04` para verificar o acesso efetivo do novo papel. A credencial do novo backend não deve pertencer aos papéis legados.
- Para cada vínculo, verificar no Auth do EmpreendaJá o UUID da conta e obter o UUID da empresa no ERP com comprovação de titularidade e aprovação administrativa. Não inferir o par pelo e-mail. Usar `05_aprovar_vinculo.psql` com variáveis psql `subject`, `empresa_id` e `aprovado_por` (identificador da aprovação). Executar por uma conta autorizada a assumir exclusivamente o papel de provisionamento para a operação. O vínculo existente não é substituído implicitamente.
