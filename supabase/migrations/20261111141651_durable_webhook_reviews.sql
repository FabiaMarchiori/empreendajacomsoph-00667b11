-- Prepared only. No backfill, deletion, payment or subscription changes.
-- NULL permits existing diagnostic/audit rows to remain unchanged.
ALTER TABLE public.webhook_logs ADD COLUMN event_key text;
CREATE UNIQUE INDEX webhook_logs_event_key_unique ON public.webhook_logs(event_key);
ALTER TABLE public.webhook_logs ADD CONSTRAINT webhook_review_event_status
  CHECK(event_key IS NULL OR (status='review_required' AND length(event_key)=64));
COMMENT ON COLUMN public.webhook_logs.event_key IS
  'SHA-256 v1 identity of a pending Kiwify event snapshot; retries never imply payment approval';
