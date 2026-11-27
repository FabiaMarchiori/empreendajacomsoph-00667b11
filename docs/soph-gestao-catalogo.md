# Soph Gestão 2.0 — persistência de Contatos e Produtos

O backend expõe `contacts.list/create/update` e `products.list/create/update` quando recebe um adaptador de banco configurado no servidor. A UI segue em demonstração e nenhum endpoint ou conexão é registrado nesta etapa.

A sessão continua validada pelo backend do EmpreendaJá. A autorização consulta o benefício e o vínculo ativo com a empresa de destino na mesma operação. O identificador solicitado apenas delimita o escopo. A conexão futura deve confinar o escopo de identidade e empresa à transação, usar um papel restrito sem propriedade das tabelas ou `BYPASSRLS` e garantir que o contexto seja limpo ao devolver a conexão ao pool.

As consultas parametrizadas usam as tabelas legadas `public.contatos` e `public.produtos` e incluem `empresa_id` em todas as operações. A listagem entrega até 100 registros por cursor. Cadastro deriva a empresa do escopo verificado. Edição substitui os campos aceitos, com os opcionais de Contatos omitidos convertidos em nulos. Uma edição de ID alheio tem o mesmo retorno de um ID inexistente. Preços e custos são strings decimais no contrato para preservar os valores exatos do PostgreSQL.

O adaptador lê a quantidade existente de Produtos. Não grava quantidade, SKU ou estoque mínimo. Esses dois últimos campos não constavam no esquema legado auditado. Na demonstração, continuam disponíveis como antes. Nenhum fluxo de estoque, vendas ou financeiro usa o adaptador.

## Validação descartável

Executar `bash tests/soph-gestao/integration/run-local.sh`. O runner prepara duas instâncias locais do GoTrue e dois PostgreSQL descartáveis. A fixture do catálogo cria apenas a estrutura sintética e concede leitura e escrita por colunas ao papel de teste. São verificadas as duas direções de acesso entre empresas, inclusive pela execução direta das políticas RLS. A fixture não é uma migração de produto.

## Antes de conectar

1. Confirmar em homologação o esquema, tipos, nulabilidade, defaults, precisão de valores, constraints e índices do ERP legado. Confirmar o default real de quantidade na criação de produto.
2. Validar a origem da sessão e a fonte comercial do benefício no EmpreendaJá. Aprovar o vínculo de identidade externa por empresa, preservando o cliente legado.
3. Revisar as RPCs privilegiadas e as políticas legadas. Preparar grants mínimos de coluna e RLS com testes de leitura e escrita em ambos os sentidos, além da regressão do ERP antigo. O filtro das queries serve como defesa adicional.
4. Definir como SKU e estoque mínimo serão tratados antes de conectar a UI, sem perder informações dos formulários aprovados. Manter a gravação de estoque fora desta fase. Só habilitar a conexão e testar o endpoint com as autorizações de homologação correspondentes.
