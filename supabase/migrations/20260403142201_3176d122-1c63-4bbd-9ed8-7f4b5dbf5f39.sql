
CREATE TABLE public.pricing_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_produto text DEFAULT 'Produto sem nome',
  canal_nome text NOT NULL,
  custo_compra numeric NOT NULL DEFAULT 0,
  margem_desejada numeric NOT NULL DEFAULT 0,
  preco_sugerido numeric NOT NULL DEFAULT 0,
  lucro_liquido numeric NOT NULL DEFAULT 0,
  margem_final numeric NOT NULL DEFAULT 0,
  custo_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own simulations" ON public.pricing_simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON public.pricing_simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON public.pricing_simulations FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_pricing_simulations_user ON public.pricing_simulations(user_id, created_at DESC);
