-- Prepared only: restores cross-account query exposure. Separate approval required.
BEGIN;
CREATE OR REPLACE FUNCTION public.get_is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = _user_id;
$function$;
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.assinaturas
    WHERE user_id = user_uuid
    AND status = 'ativa'
    AND (data_expiracao IS NULL OR data_expiracao > now())
  );
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
