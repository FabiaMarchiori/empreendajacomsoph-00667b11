# Soph Gestão 2.0 — autenticação local da Fase 1C

## Reproduzir no Codex Cloud

Com Docker, Node, npm, curl e OpenSSL disponíveis, instalar as dependências com `npm ci` e rodar:

```sh
bash tests/soph-gestao/integration/run-local.sh
```

O script inicia duas instâncias do Supabase Auth (GoTrue v2.177.0) e dois PostgreSQL 16. Cada instância tem emissor, segredo de teste e banco próprios. As portas são publicadas somente em loopback. Os containers, volumes descartáveis e a rede dessa execução são removidos ao sair. Nenhum endpoint remoto pode ser configurado no teste. O runner usa uma configuração Vitest própria, sem o setup de UI do aplicativo.

## O que a integração exercita

O GoTrue cria contas fictícias e emite os JWTs. O teste conecta o backend do PR #18 a um verificador HS256 de teste. O backend valida sessão e benefício e abre uma transação no ERP. RLS roda no PostgreSQL real com papel de leitura independente, sem superusuário, propriedade das tabelas ou `BYPASSRLS`. O papel de leitura do benefício também é separado dos papéis usados para preparar os dados fictícios.

Os testes verificam autorização das duas proprietárias com apenas a sessão do EmpreendaJá, isolamento nos dois sentidos, contexto limpo ao reutilizar uma conexão, token alterado ou de outro emissor, parâmetros de identidade ignorados, benefício vencido ou revogado com sessão ativa e falha de acesso ao banco seguida de reenvio. O acesso ao ERP testado é de leitura. O papel do teste também é impedido de executar atualizações.

Logout no GoTrue revoga o refresh token. O JWT de acesso emitido antes do logout continua válido até expirar no verificador sem estado. Para exigir bloqueio imediato após logout no futuro, o servidor precisará de uma verificação de sessão revogável, com comportamento validado em homologação. A expiração e a revogação do benefício são reavaliadas a cada solicitação, independentemente da validade do JWT.

## Limites e dependências

- A suíte valida Auth e PostgreSQL reais. Não inclui API Gateway, PostgREST, OAuth ou configuração dos projetos hospedados. O verificador HS256 é exclusivo da suíte local. O adaptador real deve seguir as chaves e políticas do emissor de homologação.
- A fonte do benefício é uma tabela de teste com dados fictícios. A fonte comercial continua condicionada à confirmação segura de identidade e vínculos e à definição do benefício explícito (PRs #2, #4 e #7). Revisar os controles aplicáveis dos PRs #6 e #8 e as funções privilegiadas no ERP legado antes de qualquer integração com produção.
- Nenhuma mudança de schema, papéis ou RLS deste teste é uma migração de produto. Nenhum cliente, conta ou credencial de produção é necessário.
