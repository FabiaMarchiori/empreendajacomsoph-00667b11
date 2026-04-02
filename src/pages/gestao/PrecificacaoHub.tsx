import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calculator, Store, Settings, Zap, AlertTriangle, Lightbulb, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingChannels, usePricingSettings, usePricingFixedCosts } from "@/hooks/usePricingData";
import { useDefaultChannels } from "@/hooks/useDefaultChannels";

const tips = [
  { icon: AlertTriangle, text: "Canais com taxa fixa podem reduzir muito a margem em ticket baixo." },
  { icon: Lightbulb, text: "O imposto incide sobre o valor bruto da venda, não sobre o lucro." },
  { icon: TrendingUp, text: "Revise taxas periodicamente — marketplaces atualizam comissões com frequência." },
  { icon: Lightbulb, text: "Configure seus canais antes de comparar preços entre plataformas." },
];

export default function PrecificacaoHub() {
  const navigate = useNavigate();
  const { channels } = usePricingChannels();
  const { defaultChannels } = useDefaultChannels();
  const { settings } = usePricingSettings();
  const { costs } = usePricingFixedCosts();

  const activeCustomChannels = channels.filter((c) => c.ativo).length;
  const hasSettings = !!(settings?.regime_tributario);
  const hasCosts = costs.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-8 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          <span className="text-foreground">Central de </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
          >
            Precificação
          </span>
        </h1>
        <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">
          Descubra quanto cobrar com lucro real, entendendo taxas, impostos e margem em cada canal de venda.
        </p>
      </motion.div>

      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>Simulador Inteligente</h2>
            <p className="text-sm text-foreground/70 mt-1">Informe o custo, escolha o canal e veja instantaneamente o preço ideal de venda com lucro real.</p>
          </div>
          <Button
            onClick={() => navigate("/gestao/precificacao/simulador")}
            className="bg-gradient-to-r from-[#F2FBFF] via-[#9EEBFF] to-[#00EFFF] text-[#062638] font-bold text-sm hover:shadow-[0_0_24px_rgba(0,239,255,0.3)] transition-shadow shrink-0"
          >
            Abrir Simulação
          </Button>
        </div>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Calculator, title: "Simulador", desc: "Calcule o preço ideal para cada produto e canal", path: "/gestao/precificacao/simulador" },
          { icon: Store, title: "Canais e Taxas", desc: "Gerencie marketplaces, comissões e taxas", path: "/gestao/precificacao/canais" },
          { icon: Settings, title: "Configurações", desc: "Regime tributário, custos fixos e parâmetros", path: "/gestao/precificacao/configuracoes" },
        ].map((card, i) => (
          <button
            key={i}
            onClick={() => navigate(card.path)}
            className="rounded-2xl border border-border/50 bg-card hover:bg-card/80 p-5 text-left transition-all hover:border-primary/30 group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>{card.title}</h3>
            <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </motion.div>

      {/* Status summary */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50" style={{ fontFamily: "Manrope, sans-serif" }}>Resumo do Módulo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatusItem label="Canais pré-configurados" value={String(defaultChannels.length)} ok />
          <StatusItem label="Canais personalizados" value={String(activeCustomChannels)} ok={activeCustomChannels > 0} />
          <StatusItem label="Configuração tributária" value={hasSettings ? "Configurada" : "Pendente"} ok={hasSettings} />
          <StatusItem label="Custos fixos" value={hasCosts ? `${costs.length} cadastrados` : "Pendente"} ok={hasCosts} />
        </div>
      </motion.div>

      {/* Soph tips */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50" style={{ fontFamily: "Manrope, sans-serif" }}>Dicas da Soph</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card/60 p-4 flex items-start gap-3">
              <tip.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatusItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-foreground/30 shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs text-foreground/50">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
