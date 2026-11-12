-- Emergency only after separately authorized recovery; no subscription DML.
-- Retains audit/outbox columns, receipts and indexes. Restores legacy claim behavior.
-- Prefer roll-forward. Never run while B webhook remains active.
BEGIN;
DROP TRIGGER IF EXISTS require_verified_subscription_owner ON public.assinaturas;
DROP TRIGGER IF EXISTS link_subscriptions_after_email_confirmation ON auth.users;
CREATE OR REPLACE FUNCTION public.claim_subscriptions_for_current_user()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text;
  v_user uuid;
  v_updated int;
BEGIN
  v_user := auth.uid();
  v_email := auth.email();

  IF v_user IS NULL OR v_email IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.assinaturas
  SET user_id = v_user,
      updated_at = now()
  WHERE user_id IS NULL
    AND email = v_email;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );

  IF new.email = 'admin@admin.com' THEN
    UPDATE public.profiles SET is_admin = true WHERE id = new.id;
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  END IF;

  UPDATE public.assinaturas
  SET user_id = new.id, updated_at = now()
  WHERE user_id IS NULL AND lower(email) = lower(new.email);

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$function$;
COMMIT;
