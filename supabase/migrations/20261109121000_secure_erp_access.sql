-- Restrict ERP entitlement checks to the authenticated, email-verified owner.
-- Preserve existing plan rules, admin roles, and paid entitlements.
CREATE OR REPLACE FUNCTION public.has_erp_access(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL OR check_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  SELECT lower(trim(u.email)) INTO v_email
  FROM auth.users u
  WHERE u.id = auth.uid()
    AND u.email_confirmed_at IS NOT NULL;

  IF v_email IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.soph_access_codes
    WHERE user_id = auth.uid()
      AND is_active = true
      AND expires_at > now()
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.clientes_autorizados
    WHERE lower(trim(email)) = v_email
      AND status_assinatura = 'ativa'
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.assinaturas
    WHERE user_id = auth.uid()
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
$$;

REVOKE ALL ON FUNCTION public.has_erp_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_erp_access(uuid) TO authenticated;
