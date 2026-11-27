begin;

create role soph_catalogo_backend nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
create role soph_catalogo_provisionador nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;

create schema soph_catalogo_privado;
revoke all on schema soph_catalogo_privado from public;
grant usage on schema soph_catalogo_privado to soph_catalogo_backend, soph_catalogo_provisionador;

create table soph_catalogo_privado.vinculos (
  issuer text not null check (issuer <> ''),
  subject uuid not null,
  empresa_id uuid not null references public.empresas(id),
  aprovado_por text not null check (btrim(aprovado_por) <> ''),
  aprovado_em timestamptz not null default now(),
  vigente_ate timestamptz,
  revogado_em timestamptz,
  primary key (issuer, subject, empresa_id),
  check (vigente_ate is null or vigente_ate > aprovado_em)
);

-- Expiration denies access without a background job. Provisioning must revoke
-- the previous binding before replacing an expired owner.
create unique index soph_catalogo_empresa_proprietaria
  on soph_catalogo_privado.vinculos (empresa_id) where revogado_em is null;

alter table soph_catalogo_privado.vinculos enable row level security;
create policy soph_catalogo_vinculos_provisionar on soph_catalogo_privado.vinculos
  for all to soph_catalogo_provisionador using (true) with check (true);
grant select, insert on soph_catalogo_privado.vinculos to soph_catalogo_provisionador;
grant update (revogado_em) on soph_catalogo_privado.vinculos to soph_catalogo_provisionador;

create policy soph_catalogo_vinculos_ler on soph_catalogo_privado.vinculos
  for select to soph_catalogo_backend using (
    issuer = current_setting('soph.issuer', true)
    and subject::text = current_setting('soph.subject', true)
    and empresa_id::text = current_setting('soph.company', true)
    and revogado_em is null
    and aprovado_em <= statement_timestamp()
    and (vigente_ate is null or vigente_ate > statement_timestamp())
  );
grant select (issuer, subject, empresa_id, aprovado_em, vigente_ate, revogado_em)
  on soph_catalogo_privado.vinculos to soph_catalogo_backend;

commit;
