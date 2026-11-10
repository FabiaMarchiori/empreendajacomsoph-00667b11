-- Guard the existing manual subscription claim RPC against unconfirmed email claims.
-- Preserves its public signature, integer return value, and existing subscription records.
-- IMPORTANT: review against the live database definition before deployment.
CREATE OR REPLACE FUNCTION public.claim_subscriptions_for_current_user()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_email text;
  v_user uuid;
  v_updated integer := 0;
BEGIN
  v_user := auth.uid();

  IF v_user IS NULL THEN
    RETURN 0;
  END IF;

  -- Read the authoritative email and verification state from Supabase Auth.
  -- A caller cannot claim subscriptions just by supplying a matching email.
  SELECT lower(trim(u.email))
  INTO v_email
  FROM auth.users AS u
  WHERE u.id = v_user
    AND u.email_confirmed_at IS NOT NULL;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN 0;
  END IF;

  -- Retain the previous scope (unlinked rows), without modifying active paid links.
  -- Entitlement decisions must separately check status/expiry.
  UPDATE public.assinaturas AS a
  SET user_id = v_user,
      updated_at = now()
  WHERE a.user_id IS NULL
    AND lower(trim(a.email)) = v_email;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_subscriptions_for_current_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_subscriptions_for_current_user() TO authenticated;
