-- EmpreendaJá com Soph — verification before subscription-security migrations
-- READ ONLY. Run each SELECT in Supabase SQL Editor using a privileged administrator.
-- No customer rows, passwords, secrets or purchase payloads are returned.
-- DO NOT run the proposed migrations on production based on these queries alone.

-- 1. Exact live definitions of entitlement/claim functions (essential for safe patch).
SELECT n.nspname AS schema_name,
       p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'claim_subscriptions_for_current_user',
    'has_active_subscription',
    'has_erp_access',
    'handle_new_user',
    'get_is_admin',
    'is_admin',
    'has_role'
  )
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

-- 2. Actual EXECUTE privileges (do not infer these from the migration files).
SELECT n.nspname AS schema_name,
       p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       p.prosecdef AS security_definer,
       p.proconfig AS function_settings,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'claim_subscriptions_for_current_user',
    'has_active_subscription',
    'has_erp_access',
    'handle_new_user',
    'get_is_admin',
    'is_admin',
    'has_role'
  )
ORDER BY p.proname;

-- 3. Active triggers that link/authenticate users.
SELECT event_object_schema, event_object_table,
       trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name, event_manipulation;

-- 4. RLS policy definitions for entitlements and account tables.
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'assinaturas', 'clientes_autorizados', 'profiles',
    'user_roles', 'soph_access_codes'
  )
ORDER BY tablename, policyname;

-- 5. Relevant table metadata without reading customer records.
SELECT table_name, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('assinaturas', 'clientes_autorizados')
ORDER BY table_name, ordinal_position;

-- NOTE: Confirm the Kiwify checkout, cancellation/reimbursement and manual
-- entitlement workflows before modifying any status or expiry logic.
