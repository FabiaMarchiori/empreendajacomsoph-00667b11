UPDATE public.assinaturas a
SET user_id = u.id, updated_at = now()
FROM auth.users u
WHERE a.user_id IS NULL AND lower(a.email) = lower(u.email);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('search_path', '', true);

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

  -- Vincula assinaturas compradas antes da criação da conta (mesmo e-mail)
  UPDATE public.assinaturas
  SET user_id = new.id, updated_at = now()
  WHERE user_id IS NULL AND lower(email) = lower(new.email);

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;