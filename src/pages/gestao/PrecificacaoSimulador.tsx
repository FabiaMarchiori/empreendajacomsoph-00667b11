import { motion } from "framer-motion";
import PricingSimulator from "@/components/precificacao/PricingSimulator";
import { usePricingProducts, usePricingChannels } from "@/hooks/usePricingData";
import { useDefaultChannels } from "@/hooks/useDefaultChannels";

export default function PrecificacaoSimulador() {
  const { products, isLoading: loadingProducts } = usePricingProducts();
  const { channels, isLoading: loadingChannels } = usePricingChannels();
  const { defaultChannels, isLoading: loadingDefaults } = useDefaultChannels();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-4">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
          <span>Simulador </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
          >
            Inteligente
          </span>
        </h1>
        <p className="text-sm text-white/80 max-w-lg leading-relaxed">
          Informe o custo do produto, escolha o canal de venda e descubra quanto cobrar para ter lucro real.
        </p>
      </motion.div>

      {/* Simulator */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <PricingSimulator
          products={products}
          channels={channels}
          defaultChannels={defaultChannels}
          isLoading={loadingProducts || loadingChannels || loadingDefaults}
        />
      </motion.div>
    </div>
  );
}
