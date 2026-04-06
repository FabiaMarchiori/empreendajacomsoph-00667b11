
-- 1. Fix profiles: block users from changing is_admin on themselves
-- Drop the current user self-update policy
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;

-- Recreate it: users can update their own profile BUT cannot change is_admin
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()));

-- 2. Fix soph_access_codes: remove public insert/update policies
DROP POLICY IF EXISTS "Service role pode inserir códigos" ON public.soph_access_codes;
DROP POLICY IF EXISTS "Service role pode atualizar códigos" ON public.soph_access_codes;

-- Recreate restricted to service_role only
CREATE POLICY "Service role pode inserir códigos"
ON public.soph_access_codes
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role pode atualizar códigos"
ON public.soph_access_codes
FOR UPDATE
TO service_role
USING (true);
