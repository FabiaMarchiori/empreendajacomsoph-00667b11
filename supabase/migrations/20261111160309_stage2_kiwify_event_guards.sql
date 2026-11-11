-- Stage 2 only. Depends on durable_webhook_reviews; no backfill or commercial DML.
-- Does not depend on the broad product/RLS/admin migration or Stage 1 benefits.
CREATE OR REPLACE FUNCTION public.kiwify_payload_ids(p_payload jsonb)
RETURNS text[] LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path='' AS $$
 SELECT coalesce(array_agg(DISTINCT value) FILTER(WHERE value IS NOT NULL AND value<>''),ARRAY[]::text[])
 FROM (
  SELECT nullif(trim(v),'') value FROM unnest(ARRAY[
   p_payload->>'subscription_id',p_payload#>>'{Subscription,id}',
   p_payload->>'order_id',p_payload#>>'{Transaction,order_id}'
  ]) v
  UNION ALL
  SELECT nullif(trim(c->>'order_id'),'') FROM jsonb_array_elements(
   CASE WHEN jsonb_typeof(p_payload#>'{Subscription,charges,completed}')='array'
    THEN p_payload#>'{Subscription,charges,completed}' ELSE '[]'::jsonb END) c
 ) ids;
$$;
CREATE INDEX webhook_logs_kiwify_identity_idx ON public.webhook_logs
 USING gin(public.kiwify_payload_ids(payload));

CREATE OR REPLACE FUNCTION public.kiwify_event_context(p_candidate_ids text[])
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object(
  'pending',coalesce(bool_or(w.status='review_required'),false),
  'recurring',coalesce(bool_or(
   nullif(trim(w.payload->>'subscription_id'),'') IS NOT NULL OR
   (jsonb_typeof(w.payload->'Subscription')='object' AND w.payload->'Subscription'<>'{}'::jsonb)
  ),false)
 ) FROM public.webhook_logs w
 WHERE public.kiwify_payload_ids(w.payload) && p_candidate_ids;
$$;

-- Serialize legacy customer authorization with a refund of the SAME purchase.
-- Preserve the original customer/product identifiers on email conflict.
CREATE OR REPLACE FUNCTION public.authorize_kiwify_purchase(p_assinatura_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.assinaturas;
BEGIN
 SELECT * INTO a FROM public.assinaturas WHERE id=p_assinatura_id FOR UPDATE;
 IF NOT FOUND OR a.status<>'ativa' OR (a.data_expiracao IS NOT NULL AND a.data_expiracao<=now()) THEN RETURN false; END IF;
 IF (public.kiwify_event_context(ARRAY[a.kiwify_subscription_id])->>'pending')::boolean THEN RETURN false; END IF;
 INSERT INTO public.clientes_autorizados(email,status_assinatura,customer_id,produto_id,data_compra)
 VALUES(a.email,'ativa',a.kiwify_customer_id,a.kiwify_subscription_id,now()) ON CONFLICT(email) DO NOTHING;
 UPDATE public.clientes_autorizados SET status_assinatura='ativa' WHERE email=a.email AND produto_id=a.kiwify_subscription_id;
 RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_kiwify_single_purchase(p_assinatura_id uuid,p_email text,p_status text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.assinaturas;
BEGIN
 IF p_status IS NULL OR p_status NOT IN ('reembolsada','cancelada') THEN RAISE EXCEPTION 'Unsupported refund disposition'; END IF;
 SELECT * INTO a FROM public.assinaturas WHERE id=p_assinatura_id FOR UPDATE;
 IF NOT FOUND OR lower(trim(a.email)) IS DISTINCT FROM lower(trim(p_email)) THEN RETURN false; END IF;
 -- Never apply a charge-only refund to a known recurring contract or pending case.
 IF (public.kiwify_event_context(ARRAY[a.kiwify_subscription_id])->>'recurring')::boolean
 OR (public.kiwify_event_context(ARRAY[a.kiwify_subscription_id])->>'pending')::boolean THEN RETURN false; END IF;
 IF a.status='ativa' THEN
  UPDATE public.assinaturas SET status=p_status::public.subscription_status,updated_at=now() WHERE id=a.id;
 END IF;
 -- Only this purchase's legacy customer authorization, and only without another
 -- active purchase. Never revoke an unrelated product or individual promotion.
 UPDATE public.clientes_autorizados c SET status_assinatura='inativa'
 WHERE c.email=a.email AND c.produto_id=a.kiwify_subscription_id
 AND NOT EXISTS(SELECT 1 FROM public.assinaturas other WHERE other.id<>a.id
  AND lower(trim(other.email))=lower(trim(a.email)) AND other.status='ativa'
  AND (other.data_expiracao IS NULL OR other.data_expiracao>now()));
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.kiwify_payload_ids(jsonb),public.kiwify_event_context(text[]),public.authorize_kiwify_purchase(uuid),public.refund_kiwify_single_purchase(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_payload_ids(jsonb),public.kiwify_event_context(text[]),public.authorize_kiwify_purchase(uuid),public.refund_kiwify_single_purchase(uuid,text,text) TO service_role;
