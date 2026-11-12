-- STAGE 1 ONLY: benefits + Soph + ERP. Standalone against the audited live schema.
-- No dependency on the deferred broad product/RLS, linking, Kiwify or Brevo migrations.
DO $$ BEGIN
 IF to_regclass('public.product_access_grants') IS NOT NULL THEN
   RAISE EXCEPTION 'Broad grant migration already present: reconcile individual rights before using the standalone Stage 1 package';
 END IF;
END $$;

CREATE TABLE public.erp_access_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 source text NOT NULL CHECK(length(trim(source))>0),
 reason text NOT NULL CHECK(length(trim(reason))>0),
 authorized_by uuid REFERENCES auth.users(id),
 expires_at timestamptz, revoked_at timestamptz,
 legacy_code_id uuid REFERENCES public.soph_access_codes(id) ON DELETE CASCADE,
 legacy_customer_id uuid REFERENCES public.clientes_autorizados(id) ON DELETE CASCADE,
 legacy_subscription_id uuid REFERENCES public.assinaturas(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,source),
 CHECK(num_nonnulls(legacy_code_id,legacy_customer_id,legacy_subscription_id)<=1)
);
ALTER TABLE public.erp_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_grants_own_read ON public.erp_access_grants FOR SELECT TO authenticated
 USING(user_id=(SELECT auth.uid()) OR (SELECT public.is_admin()));
CREATE POLICY erp_grants_authorized_management ON public.erp_access_grants FOR ALL TO authenticated
 USING((SELECT public.is_admin()))
 WITH CHECK((SELECT public.is_admin()) AND authorized_by=(SELECT auth.uid())
);
REVOKE ALL ON public.erp_access_grants FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.erp_access_grants TO authenticated;
GRANT ALL ON public.erp_access_grants TO service_role;

-- Freeze existing eligibility to immutable user/source IDs, never future email matches.
-- The live source still determines status/expiry, so old revocations remain effective.
INSERT INTO public.erp_access_grants(user_id,source,reason,legacy_code_id)
 SELECT c.user_id,'legacy_code:'||c.id,'Previously authorized ERP via soph_access_codes; origin preserved for review',c.id
 FROM public.soph_access_codes c WHERE c.is_active AND c.expires_at>now();
INSERT INTO public.erp_access_grants(user_id,source,reason,legacy_customer_id)
 SELECT p.id,'legacy_customer:'||c.id,'Previously authorized ERP via clientes_autorizados; not a new automatic Bolsas benefit',c.id
 FROM public.profiles p JOIN public.clientes_autorizados c ON c.email=p.email
 WHERE c.status_assinatura='ativa';
INSERT INTO public.erp_access_grants(user_id,source,reason,legacy_subscription_id)
 SELECT a.user_id,'legacy_subscription:'||a.id,'Previously contracted ERP entitlement; original subscription unchanged',a.id
 FROM public.assinaturas a WHERE a.user_id IS NOT NULL AND a.status='ativa'
 AND (a.data_expiracao IS NULL OR a.data_expiracao>now())
 AND lower(a.plano) LIKE '%erp%';

-- Not a new Starter plan: preserve only pre-existing legacy subscription IDs.
CREATE TABLE public.stage1_legacy_plan_benefits (
 assinatura_id uuid PRIMARY KEY REFERENCES public.assinaturas(id) ON DELETE CASCADE,
 reason text NOT NULL
);
INSERT INTO public.stage1_legacy_plan_benefits
 SELECT id,'Existing Starter UI benefit pending owner review, not a new commercial plan'
 FROM public.assinaturas WHERE lower(plano) LIKE '%starter%' AND lower(plano) NOT LIKE '%bolsas%';
ALTER TABLE public.stage1_legacy_plan_benefits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stage1_legacy_plan_benefits FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.stage1_current_benefits() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); admin_access boolean; eco boolean; legacy_eco boolean; bolsas boolean; active_plan boolean;
 individual boolean; historical boolean; erp boolean;
BEGIN
 IF uid IS NULL THEN RETURN jsonb_build_object('isAdmin',false,'ecosystem',false,'bolsas',false,'soph',false,'erp',false,'basic',false,'erpBenefit',NULL); END IF;
 -- Read existing authorizations only. Do not change is_admin, has_role, signup or roles.
 admin_access:=public.is_admin() OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=uid AND role='admin');
 SELECT coalesce(bool_or(lower(a.plano) NOT LIKE '%bolsas%' AND lower(a.plano) ~ '(ecossistema|anual|mensal|completo|premium)'),false),
 coalesce(bool_or(l.assinatura_id IS NOT NULL),false),coalesce(bool_or(lower(a.plano) LIKE '%bolsas%'),false),count(*)>0
 INTO eco,legacy_eco,bolsas,active_plan
 FROM public.assinaturas a LEFT JOIN public.stage1_legacy_plan_benefits l ON l.assinatura_id=a.id
 WHERE a.user_id=uid AND a.status='ativa' AND (a.data_expiracao IS NULL OR a.data_expiracao>now());
 SELECT coalesce(bool_or(g.legacy_code_id IS NULL AND g.legacy_customer_id IS NULL AND g.legacy_subscription_id IS NULL),false),
 coalesce(bool_or(g.legacy_code_id IS NOT NULL OR g.legacy_customer_id IS NOT NULL OR g.legacy_subscription_id IS NOT NULL),false)
 INTO individual,historical FROM public.erp_access_grants g
 WHERE g.user_id=uid AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now())
 AND (g.legacy_code_id IS NULL OR EXISTS(SELECT 1 FROM public.soph_access_codes c WHERE c.id=g.legacy_code_id AND c.user_id=uid AND c.is_active AND c.expires_at>now()))
 AND (g.legacy_customer_id IS NULL OR EXISTS(SELECT 1 FROM public.clientes_autorizados c WHERE c.id=g.legacy_customer_id AND c.status_assinatura='ativa'))
 AND (g.legacy_subscription_id IS NULL OR EXISTS(SELECT 1 FROM public.assinaturas a WHERE a.id=g.legacy_subscription_id AND a.user_id=uid AND a.status='ativa' AND (a.data_expiracao IS NULL OR a.data_expiracao>now())));
 erp:=admin_access OR eco OR individual OR historical;
 RETURN jsonb_build_object('isAdmin',admin_access,'ecosystem',admin_access OR eco OR legacy_eco,
 'bolsas',admin_access OR eco OR legacy_eco OR bolsas,'soph',admin_access OR eco OR legacy_eco OR bolsas,
 'erp',erp,'basic',admin_access OR active_plan,
 'erpBenefit',CASE WHEN admin_access OR eco THEN 'included' WHEN individual THEN 'promotional' WHEN historical THEN 'legacy' ELSE NULL END);
END;
$$;
REVOKE ALL ON FUNCTION public.stage1_current_benefits() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.stage1_current_benefits() TO authenticated;

-- Abort rather than silently discard any old has_erp_access eligibility not covered above.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.profiles p WHERE public.has_erp_access(p.id)
 AND NOT (p.is_admin IS TRUE OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=p.id AND r.role='admin'))
 AND NOT EXISTS(SELECT 1 FROM public.assinaturas a WHERE a.user_id=p.id AND a.status='ativa'
 AND (a.data_expiracao IS NULL OR a.data_expiracao>now()) AND lower(a.plano) NOT LIKE '%bolsas%'
 AND lower(a.plano) ~ '(ecossistema|anual|mensal|completo|premium)')
 AND NOT EXISTS(SELECT 1 FROM public.erp_access_grants g WHERE g.user_id=p.id)) THEN
 RAISE EXCEPTION 'Unexplained historical ERP authorization: preserve and review before deployment';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.current_product_access() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT public.stage1_current_benefits(); $$;
CREATE OR REPLACE FUNCTION public.has_soph_access() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT coalesce((public.stage1_current_benefits()->>'soph')::boolean,false); $$;
CREATE OR REPLACE FUNCTION public.has_erp_access(check_user_id uuid DEFAULT auth.uid()) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT coalesce(check_user_id=auth.uid() AND (public.stage1_current_benefits()->>'erp')::boolean,false); $$;
-- Compatibility for existing frontend/endpoint code; does not change any other RLS.
CREATE OR REPLACE FUNCTION public.has_product_access(requested_product text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT CASE WHEN requested_product IN ('ecosystem','bolsas','soph','erp','basic') THEN coalesce((public.stage1_current_benefits()->>requested_product)::boolean,false) ELSE false END;
$$;
REVOKE ALL ON FUNCTION public.current_product_access(),public.has_soph_access(),public.has_erp_access(uuid),public.has_product_access(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.current_product_access(),public.has_soph_access(),public.has_erp_access(uuid),public.has_product_access(text) TO authenticated;
