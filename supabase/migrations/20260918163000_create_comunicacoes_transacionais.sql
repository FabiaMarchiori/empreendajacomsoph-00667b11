CREATE TABLE public.comunicacoes_transacionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiwify_subscription_id text NOT NULL,
  assinatura_id uuid NOT NULL REFERENCES public.assinaturas(id) ON DELETE RESTRICT,
  email text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('acesso_liberado')),
  provider text NOT NULL DEFAULT 'brevo',
  template_id integer NOT NULL DEFAULT 5,
  status text NOT NULL CHECK (status IN ('sending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count >= 1),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comunicacoes_transacionais_kiwify_tipo_key
    UNIQUE (kiwify_subscription_id, tipo)
);

ALTER TABLE public.comunicacoes_transacionais ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_comunicacoes_transacionais_updated_at
  BEFORE UPDATE ON public.comunicacoes_transacionais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
