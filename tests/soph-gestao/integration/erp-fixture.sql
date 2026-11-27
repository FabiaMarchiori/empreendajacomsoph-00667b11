create schema soph_fixture;
create table soph_fixture.companies (
  id uuid primary key,
  name text not null
);
create table soph_fixture.ownership (
  company_id uuid primary key references soph_fixture.companies(id),
  issuer text not null,
  owner_user_id uuid not null,
  active boolean not null default true
);

alter table soph_fixture.ownership enable row level security;
alter table soph_fixture.companies enable row level security;
grant usage on schema soph_fixture to soph_local_reader;
grant select on soph_fixture.ownership, soph_fixture.companies to soph_local_reader;

create policy own_binding on soph_fixture.ownership for select to soph_local_reader
using (
  issuer = current_setting('soph.issuer', true)
  and owner_user_id::text = current_setting('soph.subject', true)
  and company_id::text = current_setting('soph.company', true)
  and active
);
create policy own_company on soph_fixture.companies for select to soph_local_reader
using (
  exists (select 1 from soph_fixture.ownership where company_id = companies.id)
);
