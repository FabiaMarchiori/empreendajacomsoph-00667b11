import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingSimulator from "@/components/precificacao/PricingSimulator";
import PricingSettings from "@/components/precificacao/PricingSettings";
import PricingChannels from "@/components/precificacao/PricingChannels";
import PricingProducts from "@/components/precificacao/PricingProducts";
import PricingFixedCosts from "@/components/precificacao/PricingFixedCosts";
import { usePricingProducts, usePricingChannels } from "@/hooks/usePricingData";
import { useDefaultChannels } from "@/hooks/useDefaultChannels";

const tips = [
  { icon: AlertTriangle, text: "Nunca defina preço apenas pelo 'feeling'. Sempre considere todas as taxas do canal." },
  { icon: Lightbulb, text: "Produtos de ticket baixo sofrem mais com taxas fixas. Avalie a viabilidade por canal." },
  { icon: TrendingUp, text: "Revise suas taxas e custos periodicamente. Marketplaces atualizam comissões com frequência." },
];

export default function PrecificacaoPage() {
  const navigate = useNavigate();
  const { products, isLoading: loadingProducts } = usePricingProducts();
  const { channels, isLoading: loadingChannels } = usePricingChannels();
  const { defaultChannels, isLoading: loadingDefaults } = useDefaultChannels();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Bloco 1 — Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <button
          onClick={() => navigate("/gestao")}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar para Gestão
        </button>

        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">Sistema de </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
          >
            Precificação
          </span>
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Descubra o preço ideal para cada produto e canal de venda. O sistema calcula automaticamente todas as taxas e mostra o lucro real.
        </p>
      </motion.div>

      {/* Bloco 2 — Simulador (principal) */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PricingSimulator
          products={products}
          channels={channels}
          defaultChannels={defaultChannels}
          isLoading={loadingProducts || loadingChannels || loadingDefaults}
        />
      </motion.div>

      {/* Bloco 4 — Dicas e avisos */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-4 flex items-start gap-3">
            <tip.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </motion.div>

      {/* Bloco 3 — Configuração */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <PricingSettings />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <PricingChannels />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PricingProducts />
        <PricingFixedCosts />
      </motion.div>

      {/* Fórmula info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">Fórmula:</span>{" "}
          Preço = (Custo Total + Taxa Fixa) ÷ (1 − (Taxas% + Margem%) ÷ 100). Margem real por dentro, garantindo lucro verdadeiro.
        </p>
      </motion.div>
    </div>
  );
}
