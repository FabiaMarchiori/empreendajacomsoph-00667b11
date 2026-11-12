-- PREPARED ONLY: no production execution authorized.
-- Target scope only; no RLS, ownership, grants or commercial changes.
BEGIN;
DO $preflight$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.get_is_admin(uuid)') AND prosecdef AND prorettype='boolean'::regtype AND proconfig=ARRAY['search_path=public']::text[] AND md5(prosrc)='f97ed35ae75dd80611ad9558829fbd05') THEN RAISE EXCEPTION 'Definition drift for get_is_admin; compare before applying'; END IF;
IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.has_active_subscription(uuid)') AND prosecdef AND prorettype='boolean'::regtype AND proconfig=ARRAY['search_path=public']::text[] AND md5(prosrc)='a0d67ed4e44a555d7f7a6ef82a91ace6') THEN RAISE EXCEPTION 'Definition drift for has_active_subscription; compare before applying'; END IF;
IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.has_erp_access(uuid)') AND prosecdef AND prorettype='boolean'::regtype AND proconfig=ARRAY['search_path=public']::text[] AND md5(prosrc)='b2bd9182a752f858f220204df4e131ab') THEN RAISE EXCEPTION 'Definition drift for has_erp_access; compare before applying'; END IF;
END $preflight$;
CREATE OR REPLACE FUNCTION public.get_is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN COALESCE(auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL AND (_user_id = auth.uid() OR public.is_admin())), false) THEN (SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = _user_id) ELSE false END;
$function$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN COALESCE(auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL AND (user_uuid = auth.uid() OR public.is_admin())), false) THEN EXISTS (
    SELECT 1
    FROM public.assinaturas
    WHERE user_id = user_uuid
    AND status = 'ativa'
    AND (data_expiracao IS NULL OR data_expiracao > now())
  ) ELSE false END;
$function$;

CREATE OR REPLACE FUNCTION public.has_erp_access(check_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text;
BEGIN
  -- Scope the target; retain all existing entitlement branches below.
  IF NOT COALESCE(auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL AND (check_user_id = auth.uid() OR public.is_admin())), false) THEN RETURN false; END IF;
  -- Admins always have access
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Check soph_access_codes (active + not expired)
  IF EXISTS (
    SELECT 1 FROM public.soph_access_codes
    WHERE user_id = check_user_id
      AND is_active = true
      AND expires_at > now()
  ) THEN
    RETURN true;
  END IF;

  -- Get user email for clientes_autorizados check
  SELECT email INTO v_email FROM public.profiles WHERE id = check_user_id;

  -- Check clientes_autorizados
  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.clientes_autorizados
    WHERE email = v_email
      AND status_assinatura = 'ativa'
  ) THEN
    RETURN true;
  END IF;

  -- Check assinaturas with ERP-eligible plans
  -- Plans containing 'erp', 'completo', 'premium', 'ecossistema' grant ERP access
  IF EXISTS (
    SELECT 1 FROM public.assinaturas
    WHERE user_id = check_user_id
      AND status = 'ativa'
      AND (data_expiracao IS NULL OR data_expiracao > now())
      AND (
        lower(plano) LIKE '%erp%'
        OR lower(plano) LIKE '%completo%'
        OR lower(plano) LIKE '%premium%'
        OR lower(plano) LIKE '%ecossistema%'
      )
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;

COMMIT;
