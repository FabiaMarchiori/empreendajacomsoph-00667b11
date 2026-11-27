-- Disable the application integration and disconnect its sessions before this
-- script. Keep new columns, constraints, catalog rows and approval history.
begin;

revoke usage on schema soph_catalogo_privado from soph_catalogo_backend;

revoke select (issuer, subject, empresa_id, aprovado_em, vigente_ate, revogado_em)
  on soph_catalogo_privado.vinculos from soph_catalogo_backend;
revoke select (id, empresa_id, tipo, nome, telefone, email, documento, endereco, instagram, status),
       insert (empresa_id, tipo, nome, telefone, email, documento, status),
       update (tipo, nome, telefone, email, documento, status)
  on public.contatos from soph_catalogo_backend;
revoke select (id, empresa_id, nome, categoria, custo, preco, quantidade, sku, estoque_minimo),
       insert (empresa_id, nome, categoria, custo, preco, sku, estoque_minimo),
       update (nome, categoria, custo, preco, sku, estoque_minimo)
  on public.produtos from soph_catalogo_backend;
revoke usage on schema public from soph_catalogo_backend;

drop policy soph_catalogo_contatos_base on public.contatos;
drop policy soph_catalogo_contatos_escopo on public.contatos;
drop policy soph_catalogo_produtos_base on public.produtos;
drop policy soph_catalogo_produtos_escopo on public.produtos;

commit;
