begin;
set local role soph_catalogo_provisionador;
insert into soph_catalogo_privado.vinculos (issuer, subject, empresa_id, aprovado_por) values
  ('https://auth.fixture.invalid', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fixture'),
  ('https://auth.fixture.invalid', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'fixture');

do $test$
begin
  begin
    insert into soph_catalogo_privado.vinculos (issuer,subject,empresa_id,aprovado_por)
     values ('https://auth.fixture.invalid','22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','fixture');
    raise exception 'Aceitou segunda proprietária';
  exception when unique_violation then null;
  end;
end
$test$;
commit;

begin;
set local role authenticated;
set local fixture.legacy_empresa = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
do $test$
begin
  if not exists (select 1 from public.contatos where nome = 'Legado A' and status is null)
    or not exists (select 1 from public.produtos where nome = 'Produto legado A' and sku is null and estoque_minimo is null and quantidade=8)
    then raise exception 'Registros existentes incompatíveis'; end if;
  update public.contatos set nome = 'Legado A editado';
  if not found then raise exception 'Edição legada bloqueada'; end if;
  insert into public.produtos (empresa_id, nome)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Novo legado');
  if not exists (select 1 from public.produtos where nome='Novo legado' and quantidade=0 and sku is null)
    then raise exception 'Cadastro legado incompatível'; end if;
end
$test$;
rollback;

begin;
set local role soph_catalogo_backend;
do $test$
begin
  if exists (select id from public.produtos) or exists (select id from public.contatos)
    then raise exception 'Acesso sem contexto'; end if;
end
$test$;

do $test$
declare
  context record;
  affected integer;
begin
  for context in select * from (values
    ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Legado A'),
    ('22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Legado B')
  ) c(subject, empresa, alheia, legado) loop
    perform set_config('soph.issuer', 'https://auth.fixture.invalid', true);
    perform set_config('soph.subject', context.subject, true);
    perform set_config('soph.company', context.empresa, true);
    if (select count(id) from public.contatos) <> 1 or (select count(id) from public.produtos) <> 1 then
      raise exception 'Falha no isolamento de leitura';
    end if;

    insert into public.produtos (empresa_id,nome,sku,estoque_minimo,custo,preco)
      values (context.empresa::uuid,'Novo','ABC',0,12.34,20.15);
    if not exists (select id from public.produtos where sku='ABC' and quantidade=0 and custo=12.34 and preco=20.15)
      then raise exception 'Cadastro precisa preservar decimais e iniciar com saldo zero'; end if;
    update public.produtos set preco=22.02 where sku='ABC';
    if not exists (select id from public.produtos where sku='ABC' and preco=22.02 and quantidade=0)
      then raise exception 'Edição de produto inválida'; end if;

    insert into public.contatos (empresa_id,nome,status) values (context.empresa::uuid,'Contato novo','ativo');
    update public.contatos set status='em_negociacao' where nome=context.legado;
    if not exists (select id from public.contatos where nome=context.legado and status='em_negociacao')
      then raise exception 'Edição de contato inválida'; end if;
    if context.legado = 'Legado A' and not exists (
      select id from public.contatos where nome='Legado A' and endereco='Endereço fictício' and instagram='@fixture'
    ) then raise exception 'Campos legados foram perdidos'; end if;

    update public.contatos set nome='bloqueado' where empresa_id=context.alheia::uuid;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Edição cruzada permitida'; end if;
    update public.produtos set nome='bloqueado' where empresa_id=context.alheia::uuid;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Edição cruzada de produto permitida'; end if;
    begin
      insert into public.contatos (empresa_id,nome) values (context.alheia::uuid,'bloqueado');
      raise exception 'Cadastro cruzado permitido';
    exception when insufficient_privilege then null;
    end;
    begin
      insert into public.produtos (empresa_id,nome) values (context.alheia::uuid,'bloqueado');
      raise exception 'Cadastro cruzado de produto permitido';
    exception when insufficient_privilege then null;
    end;
    begin
      insert into public.produtos (empresa_id,sku) values (context.empresa::uuid,' abc ');
      raise exception 'SKU duplicado aceito';
    exception when unique_violation then null;
    end;
    begin
      update public.produtos set estoque_minimo=-1;
      raise exception 'Estoque mínimo negativo aceito';
    exception when check_violation then null;
    end;
    begin
      update public.contatos set status='inválido';
      raise exception 'Status inválido aceito';
    exception when check_violation then null;
    end;
    begin
      update public.produtos set quantidade=999;
      raise exception 'Ajuste de saldo autorizado';
    exception when insufficient_privilege then null;
    end;
    begin
      update public.contatos set empresa_id=context.alheia::uuid;
      raise exception 'Transferência de empresa autorizada';
    exception when insufficient_privilege then null;
    end;

    perform set_config('soph.company',context.alheia,true);
    if exists (select id from public.produtos) or exists (select id from public.contatos)
      then raise exception 'Empresa alheia aceita no contexto'; end if;
  end loop;
end
$test$;
commit;

begin;
set local role soph_catalogo_backend;
do $test$
begin
  if exists (select id from public.produtos) or exists (select id from public.contatos)
    then raise exception 'Contexto vazou para transação seguinte'; end if;
end
$test$;
rollback;

begin;
set local role soph_catalogo_provisionador;
update soph_catalogo_privado.vinculos set revogado_em=now() where subject='11111111-1111-1111-1111-111111111111';
reset role;
set local role soph_catalogo_backend;
set local soph.issuer = 'https://auth.fixture.invalid';
set local soph.subject = '11111111-1111-1111-1111-111111111111';
set local soph.company = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
do $test$
begin
  if exists (select id from public.produtos) or exists (select id from public.contatos)
    then raise exception 'Vínculo revogado concedeu acesso'; end if;
end
$test$;
rollback;
