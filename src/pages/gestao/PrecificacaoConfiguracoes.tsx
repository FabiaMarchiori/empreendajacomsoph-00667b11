import { motion } from "framer-motion";
import PricingSettings from "@/components/precificacao/PricingSettings";
import PricingProducts from "@/components/precificacao/PricingProducts";
import PricingFixedCosts from "@/components/precificacao/PricingFixedCosts";

export default function PrecificacaoConfiguracoes() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-8 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          <span className="text-foreground">Configurações do </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
          >
            Cálculo
          </span>
        </h1>
        <p className="text-sm text-foreground/80 max-w-lg leading-relaxed">
          Defina seus parâmetros para que o simulador calcule com precisão.
        </p>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <PricingSettings />
      </motion.div>

      {/* Fixed costs */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PricingFixedCosts />
      </motion.div>

      {/* Products */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <PricingProducts />
      </motion.div>
    </div>
  );
}
