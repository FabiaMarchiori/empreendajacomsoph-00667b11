begin;

alter table public.contatos
  add column status text,
  add constraint soph_contatos_status check (status in ('ativo', 'em_negociacao'));

alter table public.produtos
  add column sku text,
  add column estoque_minimo integer,
  add constraint soph_produtos_sku_nonempty check (btrim(sku) <> ''),
  add constraint soph_produtos_sku_empresa check (sku is null or empresa_id is not null),
  add constraint soph_produtos_estoque_minimo check (estoque_minimo >= 0);

create unique index soph_produtos_empresa_sku
  on public.produtos (empresa_id, lower(btrim(sku))) where sku is not null;

commit;
