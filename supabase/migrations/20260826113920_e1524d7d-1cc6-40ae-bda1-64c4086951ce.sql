-- 1. Storage: restrict write operations on supplier-images to admins
DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;

CREATE POLICY "Admins can upload supplier images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'supplier-images' AND public.is_admin());

CREATE POLICY "Admins can update supplier images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'supplier-images' AND public.is_admin())
WITH CHECK (bucket_id = 'supplier-images' AND public.is_admin());

CREATE POLICY "Admins can delete supplier images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'supplier-images' AND public.is_admin());

-- 2. Revoke EXECUTE on SECURITY DEFINER functions where not needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.claim_subscriptions_for_current_user() FROM anon, public;
REVOKE ALL ON FUNCTION public.has_erp_access(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.has_role(public.user_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.get_is_admin(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.claim_subscriptions_for_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_erp_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_is_admin(uuid) TO authenticated;