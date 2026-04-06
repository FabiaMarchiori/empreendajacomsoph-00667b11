
-- Create security definer function to get current is_admin value
CREATE OR REPLACE FUNCTION public.get_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = _user_id;
$$;

-- Fix the policy to use the function instead of self-referencing query
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_admin IS NOT DISTINCT FROM public.get_is_admin(auth.uid()));
