-- Soph Gestão 2.0: acesso transacional restrito para Vendas e Financeiro.
-- Aditivo: não altera políticas, dados ou funções do ERP anterior.
begin;
grant select (id,empresa_id,cliente_id,valor_total,status,created_at,forma_pagamento,data_vencimento),
      insert (empresa_id,cliente_id,valor_total,status,forma_pagamento,data_vencimento)
  on public.vendas to soph_catalogo_backend;
grant select (id,venda_id,produto_id,quantidade,preco_unitario,subtotal),
      insert (venda_id,produto_id,quantidade,preco_unitario,subtotal)
  on public.itens_venda to soph_catalogo_backend;
grant select (id,empresa_id,type,descricao,value,date,category,status,created_at,venda_id,fornecedor_id,compra_id,categoria_id),
      insert (empresa_id,type,descricao,value,date,category,status,venda_id),
      update (status)
  on public.financeiro to soph_catalogo_backend;
-- Somente o fluxo de venda autorizado pode diminuir o estoque dentro da transação.
grant update (quantidade) on public.produtos to soph_catalogo_backend;

create policy soph_catalogo_vendas_select_base on public.vendas for select to soph_catalogo_backend using (true);
create policy soph_catalogo_vendas_insert_base on public.vendas for insert to soph_catalogo_backend with check (true);
create policy soph_catalogo_vendas_scope on public.vendas as restrictive for all to soph_catalogo_backend
  using (exists (select 1 from soph_catalogo_privado.vinculos v where v.empresa_id=vendas.empresa_id))
  with check (exists (select 1 from soph_catalogo_privado.vinculos v where v.empresa_id=vendas.empresa_id));

create policy soph_catalogo_itens_select_base on public.itens_venda for select to soph_catalogo_backend using (true);
create policy soph_catalogo_itens_insert_base on public.itens_venda for insert to soph_catalogo_backend with check (true);
create policy soph_catalogo_itens_scope on public.itens_venda as restrictive for all to soph_catalogo_backend
  using (exists (select 1 from public.vendas v where v.id=itens_venda.venda_id))
  with check (exists (
    select 1 from public.vendas v
    join public.produtos p on p.id=itens_venda.produto_id and p.empresa_id=v.empresa_id
    where v.id=itens_venda.venda_id
  ));

create policy soph_catalogo_financeiro_select_base on public.financeiro for select to soph_catalogo_backend using (true);
create policy soph_catalogo_financeiro_insert_base on public.financeiro for insert to soph_catalogo_backend with check (true);
create policy soph_catalogo_financeiro_update_base on public.financeiro for update to soph_catalogo_backend using (true) with check (true);
create policy soph_catalogo_financeiro_scope on public.financeiro as restrictive for all to soph_catalogo_backend
  using (exists (select 1 from soph_catalogo_privado.vinculos v where v.empresa_id=financeiro.empresa_id))
  with check (exists (select 1 from soph_catalogo_privado.vinculos v where v.empresa_id=financeiro.empresa_id));

-- Transport login does not inherit table privileges.
do $check$
begin
 if has_table_privilege('soph_catalogo_transport','public.vendas','SELECT')
 or has_table_privilege('soph_catalogo_transport','public.financeiro','INSERT')
 then raise exception 'Transport must not inherit ERP privileges'; end if;
end $check$;
commit;
