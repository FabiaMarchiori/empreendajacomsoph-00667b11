import { motion } from "framer-motion";
import { Calculator, ArrowLeft, Settings, ShoppingBag, Store, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const modules = [
  { icon: Settings, label: "Configuração Financeira", desc: "Regime tributário, dados da empresa e faturamento", soon: true },
  { icon: Store, label: "Canais e Taxas", desc: "Cadastre seus canais de venda com comissões e impostos", soon: true },
  { icon: Landmark, label: "Custos Fixos", desc: "Registre seus custos fixos mensais", soon: true },
  { icon: ShoppingBag, label: "Produtos", desc: "Cadastre seus produtos com custos de compra e variáveis", soon: true },
  { icon: Calculator, label: "Simulador de Preço", desc: "Calcule o preço ideal com a fórmula real de precificação", soon: true },
];

export default function PrecificacaoPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <button
          onClick={() => navigate("/gestao")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Gestão
        </button>

        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">Sistema de </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}>
            Precificação
          </span>
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Calcule o preço ideal dos seus produtos com margem real, custos e taxas de cada canal de venda.
        </p>
      </motion.div>

      {/* Módulos */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((m) => (
          <motion.div
            key={m.label}
            variants={item}
            className="rounded-2xl border border-primary/20 bg-gradient-card p-6 relative overflow-hidden group hover:border-primary/40 transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary-soft border border-primary/15 flex items-center justify-center flex-shrink-0">
                <m.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground">{m.label}</h3>
                  {m.soon && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-muted-foreground" style={{ borderColor: "rgba(0,239,255,0.2)", background: "rgba(0,239,255,0.06)" }}>
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-border bg-gradient-card p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">Fórmula utilizada:</span>{" "}
          Preço = Custo Total ÷ (1 − (Taxas + Margem) ÷ 100). Essa é a fórmula real de precificação por dentro, garantindo que sua margem seja real e não inflada.
        </p>
      </motion.div>
    </div>
  );
}
