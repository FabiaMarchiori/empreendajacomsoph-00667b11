-- Security hardening: never grant administrator rights based on a signup email.
-- Link pre-purchased subscriptions only after Supabase has confirmed email ownership.
-- Forward-only migration; existing paid subscriptions and existing admins are untouched.

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

  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');

  IF new.email_confirmed_at IS NOT NULL THEN
    UPDATE public.assinaturas
    SET user_id = new.id, updated_at = now()
    WHERE user_id IS NULL
      AND lower(email) = lower(new.email);
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_subscriptions_after_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF new.email_confirmed_at IS NOT NULL
     AND old.email_confirmed_at IS NULL
     AND new.email IS NOT NULL THEN
    UPDATE public.assinaturas
    SET user_id = new.id, updated_at = now()
    WHERE user_id IS NULL AND lower(email) = lower(new.email);
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS link_subscriptions_after_email_confirmation ON auth.users;
CREATE TRIGGER link_subscriptions_after_email_confirmation
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_subscriptions_after_email_confirmation();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_subscriptions_after_email_confirmation() FROM PUBLIC, anon, authenticated;
