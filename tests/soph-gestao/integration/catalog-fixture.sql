-- Only loaded by the disposable integration runner.
create table public.contatos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references soph_fixture.companies(id),
  tipo text not null,
  nome text not null,
  telefone text, email text, documento text, endereco text, instagram text
);
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references soph_fixture.companies(id),
  nome text not null,
  categoria text,
  custo numeric,
  preco numeric,
  quantidade integer default 0
);

alter table public.contatos enable row level security;
alter table public.produtos enable row level security;
grant select on public.contatos, public.produtos to soph_local_reader;
grant insert (empresa_id, tipo, nome, telefone, email, documento, endereco, instagram),
      update (tipo, nome, telefone, email, documento, endereco, instagram) on public.contatos to soph_local_reader;
grant insert (empresa_id, nome, categoria, custo, preco),
      update (nome, categoria, custo, preco) on public.produtos to soph_local_reader;

create policy contact_tenant on public.contatos for all to soph_local_reader
using (exists (select 1 from soph_fixture.ownership where company_id = contatos.empresa_id))
with check (exists (select 1 from soph_fixture.ownership where company_id = contatos.empresa_id));
create policy product_tenant on public.produtos for all to soph_local_reader
using (exists (select 1 from soph_fixture.ownership where company_id = produtos.empresa_id))
with check (exists (select 1 from soph_fixture.ownership where company_id = produtos.empresa_id));
