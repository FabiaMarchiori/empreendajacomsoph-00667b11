
-- Table for pre-configured default channels with marketplace data
CREATE TABLE public.pricing_default_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canal_nome text NOT NULL,
  tipo_canal text NOT NULL DEFAULT 'marketplace',
  comissao_pct_default numeric NOT NULL DEFAULT 0,
  taxa_cartao_pct_default numeric NOT NULL DEFAULT 0,
  taxa_fixa_default numeric NOT NULL DEFAULT 0,
  imposto_pct_sugerido numeric NOT NULL DEFAULT 0,
  usa_faixa_preco boolean NOT NULL DEFAULT false,
  usa_categoria boolean NOT NULL DEFAULT false,
  usa_parcelamento boolean NOT NULL DEFAULT false,
  observacoes text,
  data_referencia text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS: anyone authenticated can read default channels (they are shared reference data)
ALTER TABLE public.pricing_default_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read default channels"
  ON public.pricing_default_channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage default channels"
  ON public.pricing_default_channels FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed initial marketplace data
INSERT INTO public.pricing_default_channels (canal_nome, tipo_canal, comissao_pct_default, taxa_cartao_pct_default, taxa_fixa_default, imposto_pct_sugerido, usa_faixa_preco, usa_categoria, usa_parcelamento, observacoes, data_referencia) VALUES
('Mercado Livre — Clássico', 'marketplace', 11, 0, 5.00, 6, true, true, false, 'A comissão pode variar de 11% a 16% conforme a categoria. Taxa fixa de R$5,00 para produtos abaixo de R$79. Verifique a tabela oficial do Mercado Livre.', 'Abril 2026'),
('Mercado Livre — Premium', 'marketplace', 16, 0, 5.00, 6, true, true, false, 'Anúncios Premium têm comissão mais alta (14%–19%), mas maior visibilidade. Taxa fixa de R$6,00 para produtos abaixo de R$79.', 'Abril 2026'),
('Shopee — CNPJ sem frete grátis', 'marketplace', 14, 0, 0, 6, true, false, false, 'Comissão padrão de 14% + taxa fixa que varia por faixa de preço. Produtos de ticket baixo podem ter margem muito reduzida. A comissão pode mudar conforme campanhas.', 'Abril 2026'),
('Shopee — CNPJ com frete grátis', 'marketplace', 20, 0, 0, 6, true, false, false, 'Comissão de ~20% incluindo programa de frete grátis. A taxa varia por faixa de preço e pode incluir subsídio de frete. Atenção ao impacto no ticket baixo.', 'Abril 2026'),
('Amazon Brasil — Profissional', 'marketplace', 15, 0, 0, 6, false, true, false, 'Comissão varia de 8% a 20% conforme a categoria do produto. Plano Profissional tem mensalidade. Verifique a tabela de comissões por categoria.', 'Abril 2026'),
('Magalu Marketplace', 'marketplace', 16, 0, 0, 6, false, true, true, 'Comissão varia de 12% a 20% por categoria. Pode haver variação por parcelamento oferecido ao cliente. Consulte a tabela atualizada do Magalu.', 'Abril 2026'),
('Americanas Marketplace', 'marketplace', 16, 0, 0, 6, false, true, false, 'Comissão varia de 12% a 19% por categoria. Atenção aos prazos de repasse. Verifique condições atuais.', 'Abril 2026'),
('Loja Própria — Cartão', 'loja_propria', 0, 4.99, 0, 6, false, false, true, 'Sem comissão de marketplace, mas há custo do gateway de pagamento (~3,5% a 5,5%). Taxa pode variar conforme parcelamento e bandeira.', 'Abril 2026'),
('Loja Própria — Pix', 'loja_propria', 0, 0.99, 0, 6, false, false, false, 'Pix geralmente tem taxa muito baixa ou zero em alguns gateways. Custo financeiro mínimo. Excelente para margem.', 'Abril 2026'),
('WhatsApp / Instagram + Link', 'social', 0, 3.49, 0, 6, false, false, false, 'Sem comissão de plataforma. Custo do link de pagamento/gateway (~2,5% a 4,5%). Considere custos de anúncios se usar tráfego pago.', 'Abril 2026'),
('Maquininha / PDV', 'presencial', 0, 4.99, 0, 6, false, false, true, 'Sem comissão de marketplace. Taxa da maquininha varia por operadora e parcelamento (~1,5% débito, ~3,5%–6% crédito). Considere aluguel da maquininha.', 'Abril 2026');

-- Add taxa_fixa column to pricing_channels for user custom channels
ALTER TABLE public.pricing_channels ADD COLUMN IF NOT EXISTS taxa_fixa numeric NOT NULL DEFAULT 0;
