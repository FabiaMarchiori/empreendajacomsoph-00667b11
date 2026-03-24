import { motion } from "framer-motion";
import { Briefcase, FileCheck, Palette, Shield, ArrowRight, CheckCircle2, Circle, MessageCircle } from "lucide-react";
import { useState } from "react";

interface GuideItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
}

const guides: GuideItem[] = [
  {
    title: "Abrir CNPJ / MEI",
    description: "Formalize seu negócio de forma simples e rápida",
    icon: <FileCheck className="h-5 w-5" />,
    steps: [
      "Separar documentos necessários (CPF, RG, comprovante de endereço)",
      "Acessar o portal do Gov.br",
      "Preencher o formulário de abertura MEI",
      "Escolher atividades econômicas (CNAEs)",
      "Gerar o CCMEI (Certificado)",
      "Emitir primeiro DAS",
    ],
  },
  {
    title: "Criar Logotipo e Identidade",
    description: "Defina a cara do seu negócio com orientações práticas",
    icon: <Palette className="h-5 w-5" />,
    steps: [
      "Definir o conceito e valores da marca",
      "Escolher paleta de cores",
      "Selecionar tipografia",
      "Criar ou encomendar o logotipo",
      "Montar kit de identidade visual básico",
    ],
  },
  {
    title: "Registrar sua Marca",
    description: "Proteja seu negócio com o registro de marca no INPI",
    icon: <Shield className="h-5 w-5" />,
    steps: [
      "Pesquisar se a marca já existe no INPI",
      "Preparar documentação necessária",
      "Realizar o pedido de registro online",
      "Acompanhar o processo",
      "Receber o certificado de registro",
    ],
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EstruturePage() {
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean[]>>({});

  const toggleStep = (guideTitle: string, stepIdx: number, totalSteps: number) => {
    setCompletedSteps((prev) => {
      const current = prev[guideTitle] || Array(totalSteps).fill(false);
      const updated = [...current];
      updated[stepIdx] = !updated[stepIdx];
      return { ...prev, [guideTitle]: updated };
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Estruture seu Negócio</h1>
        <p className="text-sm text-muted-foreground">Formalize e organize a base do seu negócio com jornadas guiadas.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-card rounded-xl border border-primary/15 p-4 flex items-start gap-3 shadow-glow-sm">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-foreground/80 font-medium">Soph diz:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">"Começar pelo MEI é o passo mais importante. Quer que eu te guie?"</p>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {guides.map((guide, idx) => {
          const steps = completedSteps[guide.title] || Array(guide.steps.length).fill(false);
          const done = steps.filter(Boolean).length;
          const isOpen = openGuide === idx;

          return (
            <motion.div key={guide.title} variants={item} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setOpenGuide(isOpen ? null : idx)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-foreground">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground">{guide.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{done}/{guide.steps.length}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(done / guide.steps.length) * 100}%` }} />
                  </div>
                  <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </button>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
                  <div className="p-5 space-y-3">
                    {guide.steps.map((step, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => toggleStep(guide.title, sIdx, guide.steps.length)}
                        className="w-full flex items-center gap-3 text-left group"
                      >
                        {steps[sIdx] ? (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary/50" />
                        )}
                        <span className={`text-sm ${steps[sIdx] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {step}
                        </span>
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
