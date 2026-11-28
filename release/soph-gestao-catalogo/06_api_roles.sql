-- Safe additive setup for the catalog API, not a replacement for legacy permissions.
-- The transport login has NO PASSWORD and cannot connect until a credential is
-- explicitly provisioned as a secret through the authorized deployment process.
begin;
create role soph_catalogo_discovery nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
create role soph_catalogo_transport login noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
grant soph_catalogo_discovery to soph_catalogo_transport;
grant soph_catalogo_backend to soph_catalogo_transport;

grant usage on schema soph_catalogo_privado to soph_catalogo_discovery;
grant select (issuer,subject,empresa_id,aprovado_em,vigente_ate,revogado_em)
  on soph_catalogo_privado.vinculos to soph_catalogo_discovery;
create policy soph_catalogo_vinculos_descoberta
  on soph_catalogo_privado.vinculos for select to soph_catalogo_discovery
  using (
    issuer = current_setting('soph.issuer', true)
    and subject::text = current_setting('soph.subject', true)
    and revogado_em is null
    and aprovado_em <= statement_timestamp()
    and (vigente_ate is null or vigente_ate > statement_timestamp())
  );

grant select (id,nome) on public.empresas to soph_catalogo_backend;
create policy soph_catalogo_empresas_base
  on public.empresas for select to soph_catalogo_backend using (
    exists (
      select 1 from soph_catalogo_privado.vinculos v where v.empresa_id = empresas.id
    )
  );

-- Explicitly deny incidental role privileges and verify capability boundaries.
do $guard$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname !~ '^pg_' and n.nspname <> 'information_schema' and p.prosecdef
      and has_schema_privilege('soph_catalogo_backend',n.oid,'USAGE')
      and has_function_privilege('soph_catalogo_backend',p.oid,'EXECUTE')
  ) then raise exception 'Catalog role can execute privileged function'; end if;
  if exists (
    select 1 from pg_roles where rolname='soph_catalogo_transport'
      and (rolsuper or rolbypassrls or rolinherit)
  ) then raise exception 'Transport role privileges invalid'; end if;
  if has_table_privilege('soph_catalogo_transport','public.contatos','SELECT')
     or has_table_privilege('soph_catalogo_transport','public.produtos','SELECT')
  then raise exception 'Transport role must not inherit table privileges'; end if;
end $guard$;
commit;
