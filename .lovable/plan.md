## Causa raiz

Na tabela `fornecedores`, cada combinação fornecedor+categoria é uma linha com `id` único (ex.: "DAFU" tem IDs 1, 279, 280, 281, 358). Por isso a deduplicação anterior por `id` não eliminou os duplicados.

## Correção (apenas frontend)

**Arquivo:** `src/pages/importadoras/ImportadorasBusca.tsx`

1. Trocar a chave do `Map` de `s.id` para `nome_loja` normalizado (lowercase + trim + remoção de acentos), agrupando todas as linhas do mesmo fornecedor.
2. Manter o **primeiro `id` encontrado** como referência para navegação (`/fornecedor/:id`) e para o toggle de favorito.
3. Acumular todos os IDs do fornecedor em `allIds: number[]` para que o estado de favorito seja `true` se **qualquer** um dos IDs estiver favoritado.
4. Continuar consolidando categorias em `categorias: string[]` (já implementado).
5. Ordenar resultado final alfabeticamente por `nome_loja`.

## Não alterado
- Estrutura do banco (`fornecedores`, `favoritos`)
- Hook `useSupabaseSuppliers` (continua retornando todas as linhas)
- Filtros, RLS, regras de negócio, navegação para detalhe do fornecedor

## Resultado esperado
Cada fornecedor aparece **uma única vez** na lista `/fornecedores/importadoras-25/busca`, mesmo que esteja vinculado a múltiplas categorias.