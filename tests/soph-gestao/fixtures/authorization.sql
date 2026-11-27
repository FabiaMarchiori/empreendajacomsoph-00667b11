-- Disposable test schema. The runner creates an in-memory PostgreSQL instance.
create role anon nologin;
create role authenticated nologin;
create schema erp_fixture_private;
create schema erp_fixture;

create table erp_fixture_private.companies (
  id uuid primary key,
  owner_user_id uuid not null,
  active boolean not null default true
);

create table erp_fixture_private.benefits (
  user_id uuid primary key,
  product text not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (starts_at < expires_at)
);

create table erp_fixture.records (
  company_id uuid not null references erp_fixture_private.companies,
  id integer not null,
  parent_id integer,
  body text not null,
  primary key (company_id, id),
  foreign key (company_id, parent_id) references erp_fixture.records (company_id, id)
);

-- The runner sets the subject as a trusted gateway would after validating a token.
-- The helper cannot be passed a subject, a product, or a plan by the caller.
create function erp_fixture_private.can_access(target_company uuid) returns boolean
language sql stable security definer set search_path = pg_catalog
as $$
  select exists (
    select 1
      from erp_fixture_private.companies as company
      join erp_fixture_private.benefits as benefit on benefit.user_id = company.owner_user_id
     where company.id = target_company
       and company.owner_user_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
       and company.active
       and benefit.product = 'soph-gestao-2'
       and benefit.revoked_at is null
       and benefit.starts_at <= transaction_timestamp()
       and benefit.expires_at > transaction_timestamp()
  );
$$;

revoke all on function erp_fixture_private.can_access(uuid) from public;
grant execute on function erp_fixture_private.can_access(uuid) to authenticated;
grant usage on schema erp_fixture, erp_fixture_private to authenticated;
grant usage on schema erp_fixture to anon;
grant select, insert on erp_fixture.records to authenticated;
grant update (body, parent_id) on erp_fixture.records to authenticated;

alter table erp_fixture.records enable row level security;
create policy read_owned on erp_fixture.records for select to authenticated
  using (erp_fixture_private.can_access(company_id));
create policy insert_owned on erp_fixture.records for insert to authenticated
  with check (erp_fixture_private.can_access(company_id));
create policy update_owned on erp_fixture.records for update to authenticated
  using (erp_fixture_private.can_access(company_id))
  with check (erp_fixture_private.can_access(company_id));

insert into erp_fixture_private.companies (id, owner_user_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222');

insert into erp_fixture_private.benefits (user_id, product, starts_at, expires_at)
select owner_user_id, 'soph-gestao-2', transaction_timestamp() - interval '1 day',
       transaction_timestamp() + interval '1 day'
from erp_fixture_private.companies;

insert into erp_fixture.records (company_id, id, body) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'record a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'record b');
