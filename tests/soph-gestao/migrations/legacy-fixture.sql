create role authenticated nologin;
create table public.empresas (id uuid primary key default gen_random_uuid());
create table public.contatos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null, tipo text not null default 'cliente', nome text not null,
  telefone text, email text, documento text, endereco text, instagram text,
  created_at timestamptz not null default now()
);
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(id), nome text, categoria text not null default 'Geral',
  custo numeric, preco numeric, quantidade integer not null default 0,
  fornecedor_principal_id uuid references public.contatos(id), created_at timestamp default now()
);
alter table public.contatos enable row level security;
alter table public.produtos enable row level security;
grant select, insert, update, delete on public.contatos, public.produtos to authenticated;
create policy legacy_contatos on public.contatos for all to authenticated
  using (empresa_id::text = current_setting('fixture.legacy_empresa', true));
create policy legacy_produtos on public.produtos for all to authenticated
  using (empresa_id::text = current_setting('fixture.legacy_empresa', true));

insert into public.empresas values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
insert into public.contatos (empresa_id, nome, endereco, instagram) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Legado A', 'Endereço fictício', '@fixture'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Legado B', null, null);
insert into public.produtos (empresa_id, nome, quantidade) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Produto legado A', 8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Produto legado B', 5);
