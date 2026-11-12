-- Existing outbox already exists in production. No recreation or secret changes.
ALTER TABLE public.comunicacoes_transacionais
 ADD COLUMN send_token uuid,
 ADD COLUMN lease_until timestamptz,
 ADD COLUMN dispatch_started_at timestamptz,
 ADD COLUMN requires_reconciliation boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.reserve_access_email(p_subscription_id text,p_assinatura_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.comunicacoes_transacionais; a public.assinaturas; inserted boolean := false; token uuid := gen_random_uuid();
BEGIN
 SELECT * INTO a FROM public.assinaturas WHERE id=p_assinatura_id AND kiwify_subscription_id=p_subscription_id;
 IF NOT FOUND OR a.status<>'ativa' THEN RAISE EXCEPTION 'Active purchase association required'; END IF;
 INSERT INTO public.comunicacoes_transacionais(kiwify_subscription_id,assinatura_id,email,tipo,provider,template_id,status)
 VALUES(p_subscription_id,a.id,a.email,'acesso_liberado','brevo',5,'sending') ON CONFLICT(kiwify_subscription_id,tipo) DO NOTHING;
 inserted := FOUND;
 SELECT * INTO c FROM public.comunicacoes_transacionais WHERE kiwify_subscription_id=p_subscription_id AND tipo='acesso_liberado' FOR UPDATE;
 IF c.assinatura_id<>a.id OR lower(trim(c.email))<>lower(trim(a.email)) THEN RAISE EXCEPTION 'Communication association mismatch'; END IF;
 IF c.status='sent' THEN RETURN jsonb_build_object('state','sent'); END IF;
 IF c.requires_reconciliation THEN RETURN jsonb_build_object('state','reconcile'); END IF;
 IF c.lease_until>now() THEN RETURN jsonb_build_object('state','busy'); END IF;
 -- No provider receipt after a dispatch may mean the email was already delivered.
 -- Never guess: successful/ambiguous sends require provider reconciliation.
 IF c.dispatch_started_at IS NOT NULL OR (NOT inserted AND c.send_token IS NULL AND (
 c.status='sending' OR (c.status='failed'
 AND coalesce(c.error_message,'')<>'BREVO_API_KEY não configurada'
 AND coalesce(c.error_message,'') NOT LIKE 'Brevo respondeu HTTP 4%'))) THEN
 UPDATE public.comunicacoes_transacionais SET requires_reconciliation=true WHERE id=c.id;
 RETURN jsonb_build_object('state','reconcile');
 END IF;
 UPDATE public.comunicacoes_transacionais SET send_token=token,lease_until=now()+interval '2 minutes',
 status='sending',attempted_at=now(),dispatch_started_at=NULL,error_message=NULL,
 attempt_count=CASE WHEN inserted THEN attempt_count ELSE attempt_count+1 END WHERE id=c.id;
 RETURN jsonb_build_object('state','reserved','id',c.id,'token',token,'email',c.email);
END;
$$;
CREATE OR REPLACE FUNCTION public.begin_access_email_dispatch(p_id uuid,p_token uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 UPDATE public.comunicacoes_transacionais SET dispatch_started_at=now()
 WHERE id=p_id AND send_token=p_token AND status='sending' AND lease_until>now() AND dispatch_started_at IS NULL;
 RETURN FOUND;
END; $$;
CREATE OR REPLACE FUNCTION public.finish_access_email(p_id uuid,p_token uuid,p_success boolean,p_message_id text DEFAULT NULL,p_error text DEFAULT NULL,p_uncertain boolean DEFAULT false)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 UPDATE public.comunicacoes_transacionais SET status=CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
 provider_message_id=CASE WHEN p_success THEN p_message_id ELSE provider_message_id END,
 sent_at=CASE WHEN p_success THEN now() ELSE sent_at END,error_message=p_error,
 requires_reconciliation=p_uncertain,dispatch_started_at=CASE WHEN p_uncertain THEN dispatch_started_at ELSE NULL END,lease_until=NULL
 WHERE id=p_id AND send_token=p_token AND status='sending';
 RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_access_email(text,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.begin_access_email_dispatch(uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.finish_access_email(uuid,uuid,boolean,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_access_email(text,uuid),public.begin_access_email_dispatch(uuid,uuid),public.finish_access_email(uuid,uuid,boolean,text,text,boolean) TO service_role;
