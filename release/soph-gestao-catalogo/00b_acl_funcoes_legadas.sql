-- ERP qdfjujkfclfoojjofgpq. Executar somente após validar a recuperação do backup.
-- Mantém os grants diretos observados para os papéis do ERP anterior.
begin;

do $acl$
declare
  signature text;
  routine oid;
  legacy_role text;
begin
  foreach signature in array array[
    'public.cancelar_compra_estoque(uuid,uuid)',
    'public.cancelar_venda(uuid,uuid)',
    'public.editar_compra_estoque(uuid,uuid,uuid,date,text,text,jsonb)',
    'public.enforce_safe_usuario_role()',
    'public.estornar_compra_estoque(uuid,uuid)',
    'public.finalizar_venda_completa(uuid,uuid,text,text,date,jsonb)',
    'public.finalizar_venda_completa(uuid,uuid,text,text,date,jsonb,integer,date)',
    'public.get_empresa_id_do_usuario(uuid)',
    'public.has_permission(uuid,text)',
    'public.has_role(uuid,public.app_role)',
    'public.has_role(uuid,public.app_role,uuid)',
    'public.registrar_compra_estoque(uuid,uuid,date,text,text,jsonb,uuid)',
    'public.rls_auto_enable()',
    'public.upsert_ecosystem_user(uuid,text,text,uuid)'
  ] loop
    routine := to_regprocedure(signature);
    if not exists (select 1 from pg_proc where oid = routine and prosecdef) then
      raise exception 'Assinatura SECURITY DEFINER divergente: %', signature;
    end if;
    foreach legacy_role in array array['anon', 'authenticated', 'service_role'] loop
      if not exists (
        select 1 from pg_proc p
        cross join lateral aclexplode(p.proacl) a
        join pg_roles r on r.oid = a.grantee
        where p.oid = routine and r.rolname = legacy_role and a.privilege_type = 'EXECUTE'
      ) then
        raise exception 'Grant direto legado divergente: % / %', signature, legacy_role;
      end if;
    end loop;
    execute format('revoke execute on function %s from public', signature);
    if exists (
      select 1 from pg_proc p
      cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
      where p.oid = routine and a.grantee = 0 and a.privilege_type = 'EXECUTE'
    ) then
      raise exception 'PUBLIC ainda tem EXECUTE: %', signature;
    end if;
  end loop;
end
$acl$;

commit;
