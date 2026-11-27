# Pendências para homologação hospedada

- Disponibilizar bancos isolados para o Auth do EmpreendaJá e o ERP, com credenciais próprias e somente dados fictícios. Validar o esquema e a configuração efetiva de privilégios do ERP com `00_preflight.sql`. Se o papel técnico alcançar funções `SECURITY DEFINER`, resolver esses acessos em homologação antes de liberar as tabelas. A checagem em `03_rls_e_grants.sql` interrompe a transação nesse caso.
- Configurar uma credencial exclusiva do backend para assumir apenas o papel técnico. Validar no servidor a sessão do emissor esperado e o benefício ERP a cada operação. Resolver o vínculo aprovado no servidor e definir o contexto na mesma transação da consulta. Os parâmetros de sessão do PostgreSQL só podem receber valores definidos pelo backend após essas verificações.
- Ajustar o adaptador do PR #23 antes de habilitar a conexão. O contrato SQL omite endereço e Instagram nas escritas. O adaptador atual envia esses campos como nulos quando ausentes e precisa passar a omiti-los, além de mapear status, SKU e estoque mínimo. Usar projeções explícitas e deixar o banco iniciar a quantidade em zero.
- Após as liberações acima, aplicar os SQLs numerados de `00` a `04` em ordem, somente em homologação. Repetir a matriz com sessões reais de homologação e duas empresas fictícias. A reversão `90` retira o acesso novo e conserva dados e vínculos.

Validação descartável com PostgreSQL 16 via `bash tests/soph-gestao/migrations/run-local.sh`.
