-- Focused subscription-claim hardening: preserve login, checkout, plans and existing users.
-- Applies to NEW associations only. Does not revoke or alter existing linked subscriptions.
-- Requires Supabase Auth's authoritative confirmed email for any association.

CREATE OR REPLACE FUNCTION public.claim_subscriptions_for_current_user()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_email text;
  v_user uuid := auth.uid();
  v_updated integer := 0;
BEGIN
  IF v_user IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(trim(u.email)) INTO v_email
  FROM auth.users AS u
  WHERE u.id = v_user AND u.email_confirmed_at IS NOT NULL;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN 0;
  END IF;

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

-- Preserve the existing admin and profile-creation behavior exactly.
-- Only change the purchase-link step to require a confirmed email.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );

  IF new.email = 'admin@admin.com' THEN
    UPDATE public.profiles SET is_admin = true WHERE id = new.id;
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  END IF;

  IF new.email_confirmed_at IS NOT NULL THEN
    UPDATE public.assinaturas
    SET user_id = new.id, updated_at = now()
    WHERE user_id IS NULL
      AND lower(trim(email)) = lower(trim(new.email));
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- A purchase made before account creation becomes linked when its owner confirms email.
CREATE OR REPLACE FUNCTION public.link_subscriptions_after_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL
     AND NEW.email_confirmed_at IS NOT NULL
     AND NEW.email IS NOT NULL THEN
    UPDATE public.assinaturas
    SET user_id = NEW.id, updated_at = now()
    WHERE user_id IS NULL
      AND lower(trim(email)) = lower(trim(NEW.email));
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block the user's email verification due to a subscription-link problem.
    RAISE LOG 'Error in link_subscriptions_after_email_confirmation: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_subscriptions_after_email_confirmation ON auth.users;
CREATE TRIGGER link_subscriptions_after_email_confirmation
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_subscriptions_after_email_confirmation();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_subscriptions_after_email_confirmation() FROM PUBLIC, anon, authenticated;

-- Guard every future association, including service-role and legacy callers.
-- Existing associations and all commercial fields remain untouched.
CREATE OR REPLACE FUNCTION public.require_verified_subscription_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN RETURN NEW; END IF;
    IF OLD.user_id IS NOT NULL THEN
      RAISE EXCEPTION 'Existing subscription owner cannot be reassigned' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = NEW.user_id
      AND u.email_confirmed_at IS NOT NULL
      AND lower(trim(u.email)) = lower(trim(NEW.email))
      AND nullif(trim(u.email), '') IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Confirmed subscription owner required' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS require_verified_subscription_owner ON public.assinaturas;
CREATE TRIGGER require_verified_subscription_owner
BEFORE INSERT OR UPDATE OF user_id ON public.assinaturas
FOR EACH ROW EXECUTE FUNCTION public.require_verified_subscription_owner();
REVOKE ALL ON FUNCTION public.require_verified_subscription_owner() FROM PUBLIC, anon, authenticated;
