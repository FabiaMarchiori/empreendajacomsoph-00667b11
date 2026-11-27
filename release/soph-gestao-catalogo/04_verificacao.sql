-- Read-only verification after applying the package in the approved environment.
do $verify$
begin
  if not exists (
    select 1 from pg_roles
    where rolname = 'soph_catalogo_backend'
      and not (rolsuper or rolbypassrls or rolinherit or rolcanlogin or rolcreaterole or rolcreatedb)
  ) or exists (
    select 1 from pg_auth_members where member = 'soph_catalogo_backend'::regrole
  ) then
    raise exception 'Catálogo: papel técnico com atributos ou associações indevidos.';
  end if;

  if exists (
    select 1 from pg_class
    where oid in ('public.contatos'::regclass, 'public.produtos'::regclass, 'soph_catalogo_privado.vinculos'::regclass)
      and (not relrowsecurity or relowner = 'soph_catalogo_backend'::regrole
        or has_table_privilege('soph_catalogo_backend', oid, 'INSERT,UPDATE,DELETE,TRUNCATE'))
  ) or has_column_privilege('soph_catalogo_backend', 'public.contatos', 'empresa_id', 'UPDATE')
    or has_column_privilege('soph_catalogo_backend', 'public.contatos', 'endereco', 'UPDATE')
    or has_column_privilege('soph_catalogo_backend', 'public.contatos', 'instagram', 'UPDATE')
    or has_column_privilege('soph_catalogo_backend', 'public.produtos', 'empresa_id', 'UPDATE')
    or has_column_privilege('soph_catalogo_backend', 'public.produtos', 'quantidade', 'INSERT,UPDATE')
    or has_any_column_privilege('soph_catalogo_backend', 'soph_catalogo_privado.vinculos', 'INSERT,UPDATE')
  then
    raise exception 'Catálogo: RLS ou privilégios de coluna fora do escopo.';
  end if;

  if (select count(*) from pg_policies where schemaname = 'public'
      and policyname in ('soph_catalogo_contatos_escopo', 'soph_catalogo_produtos_escopo')
      and permissive = 'RESTRICTIVE' and roles = array['soph_catalogo_backend'::name])
    <> 2 then
    raise exception 'Catálogo: políticas restritivas não encontradas.';
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname !~ '^pg_' and n.nspname <> 'information_schema' and p.prosecdef
      and has_schema_privilege('soph_catalogo_backend', n.oid, 'USAGE')
      and has_function_privilege('soph_catalogo_backend', p.oid, 'EXECUTE')
  ) then
    raise exception 'Catálogo: papel técnico pode executar função SECURITY DEFINER.';
  end if;
end
$verify$;
