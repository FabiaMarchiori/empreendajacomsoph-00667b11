
-- ============================================
-- PRICING MODULE TABLES
-- ============================================

-- 1. pricing_settings (1 per user)
CREATE TABLE public.pricing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_empresa text,
  regime_tributario text,
  faturamento_avg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own pricing_settings" ON public.pricing_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pricing_settings" ON public.pricing_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pricing_settings" ON public.pricing_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pricing_settings" ON public.pricing_settings FOR DELETE USING (auth.uid() = user_id);

-- 2. pricing_products
CREATE TABLE public.pricing_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_produto text NOT NULL,
  custo_compra numeric NOT NULL DEFAULT 0,
  custo_variavel numeric NOT NULL DEFAULT 0,
  fornecedor text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own pricing_products" ON public.pricing_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pricing_products" ON public.pricing_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pricing_products" ON public.pricing_products FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pricing_products" ON public.pricing_products FOR DELETE USING (auth.uid() = user_id);

-- 3. pricing_channels
CREATE TABLE public.pricing_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canal_nome text NOT NULL,
  comissao_pct numeric NOT NULL DEFAULT 0,
  imposto_pct numeric NOT NULL DEFAULT 0,
  taxa_cartao_pct numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own pricing_channels" ON public.pricing_channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pricing_channels" ON public.pricing_channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pricing_channels" ON public.pricing_channels FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pricing_channels" ON public.pricing_channels FOR DELETE USING (auth.uid() = user_id);

-- 4. pricing_fixed_costs
CREATE TABLE public.pricing_fixed_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_custo text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_fixed_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own pricing_fixed_costs" ON public.pricing_fixed_costs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pricing_fixed_costs" ON public.pricing_fixed_costs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pricing_fixed_costs" ON public.pricing_fixed_costs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pricing_fixed_costs" ON public.pricing_fixed_costs FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER update_pricing_settings_updated_at BEFORE UPDATE ON public.pricing_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_products_updated_at BEFORE UPDATE ON public.pricing_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_channels_updated_at BEFORE UPDATE ON public.pricing_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_fixed_costs_updated_at BEFORE UPDATE ON public.pricing_fixed_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
