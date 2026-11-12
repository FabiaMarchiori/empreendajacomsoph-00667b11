-- Prepared only. Run after verified_claims_only, never as a blanket db push.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT auth.uid() IS NOT NULL AND (
   EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
   OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin')
 );
$$;

-- Explicit individual grants. No email-based grants and no automatic Bolsas ERP.
CREATE TABLE public.product_access_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 product text NOT NULL CHECK(product IN ('erp','ecosystem','bolsas','soph','basic')),
 source text NOT NULL, reason text NOT NULL CHECK(length(trim(reason))>0),
 authorized_by uuid REFERENCES auth.users(id),
 expires_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,product,source)
);
CREATE INDEX product_access_grants_user_idx ON public.product_access_grants(user_id,product);
ALTER TABLE public.product_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY grants_own_read ON public.product_access_grants FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()) OR (SELECT public.is_admin()));
CREATE POLICY grants_admin_manage ON public.product_access_grants FOR ALL TO authenticated
 USING((SELECT public.is_admin())) WITH CHECK((SELECT public.is_admin()) AND authorized_by=(SELECT auth.uid()));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.product_access_grants TO authenticated;

-- Freeze only pre-existing Starter subscriptions: not a new commercial product.
CREATE TABLE public.legacy_subscription_access (
 assinatura_id uuid PRIMARY KEY REFERENCES public.assinaturas(id) ON DELETE CASCADE,
 reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.legacy_subscription_access(assinatura_id,reason)
 SELECT id,'Existing Starter keyword access pending owner review'
 FROM public.assinaturas WHERE lower(plano) LIKE '%starter%' AND lower(plano) NOT LIKE '%bolsas%';
ALTER TABLE public.legacy_subscription_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legacy_subscription_access FROM anon,authenticated;

-- Preserve only benefits already conferred by active legacy codes, with their expiry.
-- Never grant future codes ERP automatically. Source is explicitly pending review.
INSERT INTO public.product_access_grants(user_id,product,source,reason,expires_at)
 SELECT user_id,'erp','legacy_code_pending_review',
 'Pre-existing ERP access via legacy code; preserve until individually reviewed',max(expires_at)
 FROM public.soph_access_codes WHERE is_active AND expires_at>now() GROUP BY user_id
 ON CONFLICT DO NOTHING;

INSERT INTO public.product_access_grants(user_id,product,source,reason)
 SELECT DISTINCT a.user_id,'erp','legacy_starter_erp_pending_review','ERP already authorized before migration for legacy Starter'
 FROM public.assinaturas a JOIN public.legacy_subscription_access l ON l.assinatura_id=a.id
 WHERE a.user_id IS NOT NULL AND public.has_erp_access(a.user_id)
 ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.has_product_access(requested_product text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid(); v_ecosystem boolean; v_legacy boolean; v_bolsas boolean; v_active boolean;
BEGIN
 IF v_user IS NULL OR requested_product NOT IN ('ecosystem','bolsas','soph','erp','basic') THEN RETURN false; END IF;
 IF public.is_admin() THEN RETURN true; END IF;
 SELECT
 coalesce(bool_or(lower(a.plano) NOT LIKE '%bolsas%' AND (
 lower(a.plano) ~ '(ecossistema|completo|premium|mensal|anual)')),false),
 coalesce(bool_or(l.assinatura_id IS NOT NULL),false),
 coalesce(bool_or(lower(a.plano) LIKE '%bolsas%'),false),count(*)>0
 INTO v_ecosystem,v_legacy,v_bolsas,v_active
 FROM public.assinaturas a LEFT JOIN public.legacy_subscription_access l ON l.assinatura_id=a.id
 WHERE a.user_id=v_user AND a.status='ativa' AND (a.data_expiracao IS NULL OR a.data_expiracao>now());
 IF EXISTS(SELECT 1 FROM public.product_access_grants g WHERE g.user_id=v_user
 AND g.product IN (requested_product,'ecosystem') AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now())) THEN RETURN true; END IF;
 IF requested_product='erp' THEN RETURN v_ecosystem; END IF;
 v_ecosystem := v_ecosystem OR v_legacy;
 IF requested_product='basic' THEN RETURN v_active; END IF;
 IF requested_product='soph' THEN RETURN v_ecosystem OR v_bolsas; END IF;
 IF requested_product='bolsas' THEN RETURN v_ecosystem OR v_bolsas; END IF;
 RETURN v_ecosystem;
END;
$$;
REVOKE ALL ON FUNCTION public.has_product_access(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_product_access(text) TO authenticated;

-- Stop rather than strip any unresolved historical ERP exception.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.profiles p WHERE public.has_erp_access(p.id)
 AND NOT (p.is_admin IS TRUE OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=p.id AND r.role='admin'))
 AND NOT EXISTS(SELECT 1 FROM public.assinaturas a LEFT JOIN public.legacy_subscription_access l ON l.assinatura_id=a.id
 WHERE a.user_id=p.id AND a.status='ativa' AND (a.data_expiracao IS NULL OR a.data_expiracao>now())
 AND lower(a.plano) NOT LIKE '%bolsas%' AND (lower(a.plano) ~ '(ecossistema|completo|premium|mensal|anual)' OR l.assinatura_id IS NOT NULL))
 AND NOT EXISTS(SELECT 1 FROM public.product_access_grants g WHERE g.user_id=p.id AND g.product='erp' AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()))) THEN
 RAISE EXCEPTION 'Unresolved historical ERP access: preserve and review individual grants before deployment';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.has_erp_access(check_user_id uuid DEFAULT auth.uid()) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT check_user_id=auth.uid() AND public.has_product_access('erp');
$$;
REVOKE ALL ON FUNCTION public.has_erp_access(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_erp_access(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.current_product_access() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT jsonb_build_object('isAdmin',public.is_admin(),
 'ecosystem',public.has_product_access('ecosystem'),'bolsas',public.has_product_access('bolsas'),
 'soph',public.has_product_access('soph'),'erp',public.has_product_access('erp'),'basic',public.has_product_access('basic'));
$$;
REVOKE ALL ON FUNCTION public.current_product_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.current_product_access() TO authenticated;

-- No automatic classification of unknown categories as common. Explicit shared
-- content is marked by an administrator; Bolsas category remains shared with ecosystem.
CREATE TABLE public.supplier_shared_access (
 fornecedor_id bigint PRIMARY KEY REFERENCES public.fornecedores(id) ON DELETE CASCADE,
 reason text NOT NULL, authorized_by uuid NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.supplier_shared_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY shared_read ON public.supplier_shared_access FOR SELECT TO authenticated USING((SELECT public.has_product_access('basic')));
CREATE POLICY shared_admin_manage ON public.supplier_shared_access FOR ALL TO authenticated USING((SELECT public.is_admin())) WITH CHECK((SELECT public.is_admin()) AND authorized_by=(SELECT auth.uid()));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.supplier_shared_access TO authenticated;
-- RESTRICTIVE policies compose with existing ownership/admin policies (no OR bypass).
CREATE POLICY fornecedores_product_boundary ON public.fornecedores AS RESTRICTIVE FOR SELECT TO authenticated
 USING((SELECT public.has_product_access('ecosystem')) OR (
 (SELECT public.has_product_access('bolsas')) AND upper(trim(categoria))='BOLSAS, MOCHILAS E MALAS') OR (
 (SELECT public.has_product_access('basic')) AND EXISTS(SELECT 1 FROM public.supplier_shared_access s WHERE s.fornecedor_id=id)));
-- Replace the old permissive subscription gate so explicit grants also work.
DROP POLICY IF EXISTS "Users with active subscription can view fornecedores" ON public.fornecedores;
CREATE POLICY fornecedores_subscriber_read ON public.fornecedores FOR SELECT TO authenticated
 USING((SELECT public.has_product_access('basic')) OR (SELECT public.has_product_access('bolsas')) OR (SELECT public.has_product_access('ecosystem')));
DO $$ DECLARE tbl text; BEGIN
 FOREACH tbl IN ARRAY ARRAY['pricing_settings','pricing_products','pricing_channels','pricing_fixed_costs','pricing_simulations','pricing_default_channels'] LOOP
 EXECUTE format('CREATE POLICY pricing_product_boundary ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((SELECT public.has_product_access(''ecosystem''))) WITH CHECK ((SELECT public.has_product_access(''ecosystem'')))',tbl);
 END LOOP;
END $$;

-- Keep verified owner protection and profile creation; remove email bootstrap admin.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO public.profiles(id,email,first_name,last_name) VALUES(NEW.id,NEW.email,NEW.raw_user_meta_data->>'first_name',NEW.raw_user_meta_data->>'last_name');
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'user');
 IF NEW.email_confirmed_at IS NOT NULL THEN
 UPDATE public.assinaturas SET user_id=NEW.id,updated_at=now()
 WHERE user_id IS NULL AND lower(trim(email))=lower(trim(NEW.email));
 END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE LOG 'Error in handle_new_user: %',SQLERRM; RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.has_role(requested_role public.user_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT CASE WHEN requested_role='admin' THEN public.is_admin() ELSE EXISTS(
 SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role=requested_role) END;
$$;
REVOKE ALL ON FUNCTION public.has_role(public.user_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.user_role) TO authenticated;
