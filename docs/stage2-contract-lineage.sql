-- Read-only provenance. Returns pseudonymous row numbers, never customer/order IDs.
+WITH events AS (
 SELECT id,created_at,evento,status,payload,
 nullif(coalesce(payload->>'subscription_id',payload#>>'{Subscription,id}'),'') AS contract_id,
 nullif(payload->>'order_id','') AS order_id,
 coalesce(payload->>'webhook_event_type',evento) AS event_type
 FROM public.webhook_logs
), contracts AS (SELECT DISTINCT contract_id FROM events WHERE contract_id IS NOT NULL),
keys AS (
 SELECT contract_id,contract_id AS identity,'contract' AS kind FROM contracts
 UNION SELECT contract_id,order_id,'order' FROM events WHERE contract_id IS NOT NULL AND order_id IS NOT NULL
 UNION SELECT e.contract_id,c->>'order_id','completed_charge'
 FROM events e CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(e.payload#>'{Subscription,charges,completed}')='array' THEN e.payload#>'{Subscription,charges,completed}' ELSE '[]'::jsonb END) c
 WHERE e.contract_id IS NOT NULL AND c->>'order_id' IS NOT NULL
), matches AS (
 SELECT DISTINCT k.contract_id,a.id FROM keys k JOIN public.assinaturas a ON a.kiwify_subscription_id=k.identity
), targets AS (SELECT contract_id FROM matches GROUP BY contract_id HAVING count(*)=3)
SELECT 'contrato_com_tres_registros' AS group_label,
 row_number() OVER(ORDER BY a.created_at,a.id) AS local_row,
 a.status,a.plano,a.created_at,a.data_inicio,a.data_expiracao,
 a.user_id IS NOT NULL AS linked,
 (SELECT array_agg(DISTINCT kind ORDER BY kind) FROM keys k WHERE k.contract_id=m.contract_id AND k.identity=a.kiwify_subscription_id) AS identity_kinds,
 (SELECT jsonb_agg(x) FROM (
  SELECT e.event_type,e.status,count(*) AS observations,min(e.created_at) AS first_log,max(e.created_at) AS last_log
  FROM events e WHERE e.contract_id=m.contract_id AND (e.order_id=a.kiwify_subscription_id OR m.contract_id=a.kiwify_subscription_id)
  GROUP BY e.event_type,e.status ORDER BY first_log
 ) x) AS related_events,
 (SELECT count(*) FROM events e WHERE e.contract_id=m.contract_id AND e.order_id=a.kiwify_subscription_id) AS direct_order_observations,
 (SELECT bool_and(lower(trim(e.payload#>>'{Customer,email}'))=lower(trim(a.email))) FROM events e WHERE e.contract_id=m.contract_id AND e.payload#>>'{Customer,email}' IS NOT NULL) AS purchase_email_consistent,
 (SELECT count(*) FROM public.comunicacoes_transacionais c WHERE c.assinatura_id=a.id) AS existing_communication_rows
FROM matches m JOIN targets t USING(contract_id) JOIN public.assinaturas a ON a.id=m.id ORDER BY local_row;
