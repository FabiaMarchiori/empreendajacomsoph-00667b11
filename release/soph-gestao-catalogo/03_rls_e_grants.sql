begin;

grant usage on schema public to soph_catalogo_backend;

-- Abort before granting table access if the proposed role can invoke legacy
-- definer functions, including grants inherited through PUBLIC.
do $gate$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname !~ '^pg_' and n.nspname <> 'information_schema' and p.prosecdef
      and has_schema_privilege('soph_catalogo_backend', n.oid, 'USAGE')
      and has_function_privilege('soph_catalogo_backend', p.oid, 'EXECUTE')
  ) then
    raise exception 'Catálogo: papel técnico tem acesso a função SECURITY DEFINER.';
  end if;
end
$gate$;

grant select (id, empresa_id, tipo, nome, telefone, email, documento, endereco, instagram, status),
      insert (empresa_id, tipo, nome, telefone, email, documento, status),
      update (tipo, nome, telefone, email, documento, status)
  on public.contatos to soph_catalogo_backend;
grant select (id, empresa_id, nome, categoria, custo, preco, quantidade, sku, estoque_minimo),
      insert (empresa_id, nome, categoria, custo, preco, sku, estoque_minimo),
      update (nome, categoria, custo, preco, sku, estoque_minimo)
  on public.produtos to soph_catalogo_backend;

-- A permissive policy supplies the base grant. A restrictive one enforces the
-- tenant even if another permissive policy later applies to the same role.
create policy soph_catalogo_contatos_base on public.contatos
  for all to soph_catalogo_backend using (true) with check (true);
create policy soph_catalogo_contatos_escopo on public.contatos as restrictive
  for all to soph_catalogo_backend
  using (exists (select 1 from soph_catalogo_privado.vinculos where empresa_id = contatos.empresa_id))
  with check (exists (select 1 from soph_catalogo_privado.vinculos where empresa_id = contatos.empresa_id));

create policy soph_catalogo_produtos_base on public.produtos
  for all to soph_catalogo_backend using (true) with check (true);
create policy soph_catalogo_produtos_escopo on public.produtos as restrictive
  for all to soph_catalogo_backend
  using (exists (select 1 from soph_catalogo_privado.vinculos where empresa_id = produtos.empresa_id))
  with check (exists (select 1 from soph_catalogo_privado.vinculos where empresa_id = produtos.empresa_id));

commit;
