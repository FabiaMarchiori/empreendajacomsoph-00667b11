-- Read-only aggregates. Never output identifiers or subscriber details.
SELECT
 count(*) FILTER (WHERE a.status='ativa') AS active_total,
 count(*) FILTER (WHERE a.status='ativa' AND a.user_id IS NOT NULL AND u.email_confirmed_at IS NULL) AS active_linked_unconfirmed,
 count(*) FILTER (WHERE a.status='ativa' AND a.user_id IS NULL) AS active_unlinked,
 count(*) FILTER (WHERE a.user_id IS NOT NULL AND u.id IS NULL) AS orphan_links,
 count(*) FILTER (WHERE a.status='ativa' AND a.user_id IS NOT NULL AND lower(trim(a.email)) IS DISTINCT FROM lower(trim(u.email))) AS active_email_mismatch
FROM public.assinaturas a LEFT JOIN auth.users u ON u.id=a.user_id;
