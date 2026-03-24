import { motion } from "framer-motion";
import { Globe, ShoppingBag, ArrowRight, CheckCircle2, Circle, MessageCircle } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    title: "Criar Site e Presença Online",
    description: "O essencial para sua marca existir no digital",
    icon: <Globe className="h-5 w-5" />,
    steps: [
      "Definir objetivos da presença digital",
      "Escolher plataforma (Instagram, site, marketplace)",
      "Criar perfis profissionais nas redes sociais",
      "Definir identidade visual para o digital",
      "Criar conteúdo inicial (fotos, textos, vídeos)",
      "Configurar link na bio e catálogo online",
    ],
  },
  {
    title: "Como Vender em Marketplaces",
    description: "Venda no Mercado Livre, Shopee, Amazon e mais",
    icon: <ShoppingBag className="h-5 w-5" />,
    steps: [
      "Escolher os marketplaces mais adequados",
      "Criar conta de vendedor",
      "Cadastrar produtos com boas fotos e descrições",
      "Definir preços competitivos",
      "Configurar frete e logística",
      "Acompanhar métricas e avaliações",
    ],
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function VendasPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean[]>>({});

  const toggleStep = (title: string, idx: number, total: number) => {
    setCompleted((prev) => {
      const c = prev[title] || Array(total).fill(false);
      const u = [...c]; u[idx] = !u[idx];
      return { ...prev, [title]: u };
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Vendas e Presença</h1>
        <p className="text-sm text-muted-foreground">Construa sua presença digital e aprenda a vender mais.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-card rounded-xl border border-primary/15 p-4 flex items-start gap-3 shadow-glow-sm">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-foreground/80 font-medium">Soph diz:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">"Ter presença online é essencial. Comece pelo Instagram e depois expanda!"</p>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {sections.map((sec, idx) => {
          const steps = completed[sec.title] || Array(sec.steps.length).fill(false);
          const done = steps.filter(Boolean).length;
          const isOpen = openSection === idx;
          return (
            <motion.div key={sec.title} variants={item} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setOpenSection(isOpen ? null : idx)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">{sec.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-foreground">{sec.title}</h3>
                  <p className="text-xs text-muted-foreground">{sec.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{done}/{sec.steps.length}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(done / sec.steps.length) * 100}%` }} />
                  </div>
                  <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </button>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
                  <div className="p-5 space-y-3">
                    {sec.steps.map((step, sIdx) => (
                      <button key={sIdx} onClick={() => toggleStep(sec.title, sIdx, sec.steps.length)} className="w-full flex items-center gap-3 text-left group">
                        {steps[sIdx] ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary/50" />}
                        <span className={`text-sm ${steps[sIdx] ? "text-muted-foreground line-through" : "text-foreground"}`}>{step}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
