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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-4">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          <span className="text-white">Central de </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
          >
            Precificação
          </span>
        </h1>
        <p className="text-sm text-white/80 max-w-xl leading-relaxed">
          Descubra quanto cobrar com lucro real, entendendo taxas, impostos e margem em cada canal de venda.
        </p>
      </motion.div>

      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-[#00EFFF]/25 p-6 lg:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,239,255,0.4), transparent)" }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-[#00EFFF]/20" style={{ background: "rgba(0,239,255,0.08)" }}>
            <Zap className="h-7 w-7 text-[#00EFFF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Simulador Inteligente</h2>
            <p className="text-sm text-white/70 mt-1">Informe o custo, escolha o canal e veja instantaneamente o preço ideal de venda com lucro real.</p>
          </div>
          <Button
            onClick={() => navigate("/gestao/precificacao/simulador")}
            className="text-[#062638] font-bold text-sm hover:shadow-[0_0_24px_rgba(0,239,255,0.3)] transition-shadow shrink-0"
            style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 50%, #00EFFF 100%)" }}
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
            className="rounded-2xl border border-white/10 hover:border-[#00EFFF]/30 p-5 text-left transition-all group"
            style={{ background: "#102A43" }}
          >
            <div
              className="h-10 w-10 rounded-xl border border-[#00EFFF]/20 flex items-center justify-center mb-3 group-hover:border-[#00EFFF]/40 transition-colors"
              style={{ background: "rgba(0,239,255,0.08)" }}
            >
              <card.icon className="h-5 w-5 text-[#00EFFF]" />
            </div>
            <h3 className="font-bold text-sm text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{card.title}</h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </motion.div>

      {/* Status summary */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/10 p-5 space-y-3"
        style={{ background: "#102A43" }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: "Manrope, sans-serif" }}>Resumo do Módulo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatusItem label="Canais pré-configurados" value={String(defaultChannels.length)} ok />
          <StatusItem label="Canais personalizados" value={String(activeCustomChannels)} ok={activeCustomChannels > 0} />
          <StatusItem label="Configuração tributária" value={hasSettings ? "Configurada" : "Pendente"} ok={hasSettings} />
          <StatusItem label="Custos fixos" value={hasCosts ? `${costs.length} cadastrados` : "Pendente"} ok={hasCosts} />
        </div>
      </motion.div>

      {/* Soph tips */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: "Manrope, sans-serif" }}>Dicas da Soph</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 flex items-start gap-3" style={{ background: "#0A192F" }}>
              <tip.icon className="h-4 w-4 text-[#00EFFF] shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-relaxed">{tip.text}</p>
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
      {ok ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
