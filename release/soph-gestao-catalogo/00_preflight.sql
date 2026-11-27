-- Run with ON_ERROR_STOP. Read-only compatibility and security checks.
do $preflight$
begin
  if exists (
    select 1 from (values
      ('empresas','id','uuid'),
      ('contatos','id','uuid'), ('contatos','empresa_id','uuid'), ('contatos','nome','text'),
      ('contatos','tipo','text'), ('contatos','telefone','text'), ('contatos','email','text'),
      ('contatos','documento','text'), ('contatos','endereco','text'), ('contatos','instagram','text'),
      ('produtos','id','uuid'), ('produtos','empresa_id','uuid'), ('produtos','nome','text'),
      ('produtos','categoria','text'), ('produtos','custo','numeric'), ('produtos','preco','numeric'),
      ('produtos','quantidade','integer')
    ) as expected(table_name, column_name, data_type)
    where not exists (
      select 1 from information_schema.columns col where col.table_schema = 'public'
        and col.table_name = expected.table_name and col.column_name = expected.column_name
        and col.data_type = expected.data_type
    )
  ) then
    raise exception 'Catálogo: esquema legado incompatível.';
  end if;

  if (select count(*) from pg_class where relnamespace = 'public'::regnamespace
      and relname in ('contatos', 'produtos') and relrowsecurity) <> 2 then
    raise exception 'Catálogo: contatos e produtos devem ter RLS ativo.';
  end if;

  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'produtos' and column_name = 'quantidade'
       and is_nullable = 'NO' and column_default in ('0', '0::integer', '(0)::integer')
  ) then
    raise exception 'Catálogo: quantidade deve manter NOT NULL e default zero.';
  end if;

  if exists (
    select 1
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
    where n.nspname = 'public' and p.prosecdef and acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'Catálogo: revisar funções SECURITY DEFINER públicas antes de conceder acesso.';
  end if;
end
$preflight$;
