import { motion } from "framer-motion";
import { FileCheck, Palette, Shield, ArrowRight, CheckCircle2, Circle, MessageCircle, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface GuideItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  isPrimary?: boolean;
}

const guides: GuideItem[] = [
  {
    title: "Abrir CNPJ / MEI",
    description: "Formalize seu negócio de forma simples e rápida. Esse é o primeiro passo para operar legalmente.",
    icon: <FileCheck className="h-6 w-6" />,
    isPrimary: true,
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const GRAD = "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)";

export default function EstruturePage() {
  const [openGuide, setOpenGuide] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean[]>>({});

  const toggleStep = (guideTitle: string, stepIdx: number, totalSteps: number) => {
    setCompletedSteps((prev) => {
      const current = prev[guideTitle] || Array(totalSteps).fill(false);
      const updated = [...current];
      updated[stepIdx] = !updated[stepIdx];
      return { ...prev, [guideTitle]: updated };
    });
  };

  const totalAllSteps = guides.reduce((acc, g) => acc + g.steps.length, 0);
  const totalAllDone = guides.reduce((acc, g) => {
    const s = completedSteps[g.title] || [];
    return acc + s.filter(Boolean).length;
  }, 0);
  const overallPercent = totalAllSteps > 0 ? Math.round((totalAllDone / totalAllSteps) * 100) : 0;

  const primaryGuide = guides[0];
  const secondaryGuides = guides.slice(1);
  const primarySteps = completedSteps[primaryGuide.title] || Array(primaryGuide.steps.length).fill(false);
  const primaryDone = primarySteps.filter(Boolean).length;
  const isPrimaryOpen = openGuide === 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">Estruture seu </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>Negócio</span>
        </h1>
        <p className="text-sm lg:text-base text-white max-w-2xl leading-relaxed">
          O alicerce do seu sucesso começa aqui. Siga nossa jornada guiada para formalizar sua empresa, proteger sua marca e construir uma identidade profissional.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Principal — Abrir CNPJ / MEI */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)',
              borderColor: 'rgba(0, 239, 255, 0.2)',
            }}
          >
            {/* Top glow line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #9EEBFF, #00EFFF, transparent)' }} />

            <button
              onClick={() => setOpenGuide(isPrimaryOpen ? null : 0)}
              className="w-full flex items-center gap-4 p-6 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: GRAD }}
              >
                <FileCheck className="h-6 w-6 text-[#0A192F]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-base text-foreground">{primaryGuide.title}</h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#0A192F]"
                    style={{ background: GRAD }}
                  >
                    PRIORIDADE
                  </span>
                </div>
                <p className="text-xs text-white">{primaryGuide.description}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{primaryDone}/{primaryGuide.steps.length}</span>
                  <div className="w-20 h-1.5 rounded-full overflow-hidden mt-1" style={{ background: '#102A43' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(primaryDone / primaryGuide.steps.length) * 100}%`,
                        background: GRAD,
                      }}
                    />
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${isPrimaryOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isPrimaryOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t px-6 pb-6 pt-4"
                style={{ borderColor: 'rgba(0, 239, 255, 0.1)' }}
              >
                <div className="space-y-1">
                  {primaryGuide.steps.map((step, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => toggleStep(primaryGuide.title, sIdx, primaryGuide.steps.length)}
                      className="w-full flex items-center gap-4 text-left group py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-bold text-white w-4 text-center">{sIdx + 1}</span>
                        {primarySteps[sIdx] ? (
                          <div
                            className="h-5 w-5 rounded-full flex items-center justify-center"
                            style={{ background: GRAD }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0A192F]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center group-hover:border-primary/50 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                            <Circle className="h-2.5 w-2.5 text-transparent" />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${primarySteps[sIdx] ? 'text-white/60 line-through' : 'text-white'}`}>
                        {step}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(0, 239, 255, 0.1)' }}>
                  <Link to="/estrutura/abrir-mei" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
                    Começar MEI <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Cards Secundários */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryGuides.map((guide, idx) => {
              const realIdx = idx + 1;
              const steps = completedSteps[guide.title] || Array(guide.steps.length).fill(false);
              const done = steps.filter(Boolean).length;
              const isOpen = openGuide === realIdx;

              return (
                <motion.div
                  key={guide.title}
                  variants={item}
                  className="rounded-2xl border border-border/60 overflow-hidden bg-gradient-card"
                >
                  <button
                    onClick={() => setOpenGuide(isOpen ? null : realIdx)}
                    className="w-full flex flex-col gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-primary-soft border border-primary/15 text-white">
                        <span>{guide.icon}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-foreground mb-1">{guide.title}</h3>
                      <p className="text-xs text-white">{guide.description}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-semibold text-white">{done}/{guide.steps.length}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#102A43' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(done / guide.steps.length) * 100}%`,
                            background: GRAD,
                          }}
                        />
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border/40 px-5 pb-5 pt-3"
                    >
                      <div className="space-y-0.5">
                        {guide.steps.map((step, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => toggleStep(guide.title, sIdx, guide.steps.length)}
                            className="w-full flex items-center gap-3 text-left group py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              <span className="text-[10px] font-bold text-white w-3 text-center">{sIdx + 1}</span>
                              {steps[sIdx] ? (
                                <div
                                  className="h-4.5 w-4.5 rounded-full flex items-center justify-center"
                                  style={{ background: GRAD }}
                                >
                                  <CheckCircle2 className="h-3 w-3 text-[#0A192F]" />
                                </div>
                              ) : (
                                  <div className="h-4 w-4 rounded-full border-2 group-hover:border-primary/40 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                              )}
                            </div>
                            <span className={`text-xs font-medium ${steps[sIdx] ? 'text-white/60 line-through' : 'text-white'}`}>
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

        {/* Soph — Lateral Premium */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-1 space-y-5"
        >
          {/* Card Soph */}
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{
              background: 'linear-gradient(145deg, #102A43, #0A192F)',
              borderColor: 'rgba(0, 239, 255, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: GRAD }}
              >
                <Sparkles className="h-4 w-4 text-[#0A192F]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">Soph</h3>
                <p className="text-[10px] text-white">Assistente estratégica</p>
              </div>
            </div>

            <div className="rounded-xl p-3.5 space-y-2 bg-gradient-primary-soft border border-primary/10">
              <p className="text-xs text-white leading-relaxed">
                "Comece pelo <strong className="text-foreground">MEI</strong>. É o passo mais importante para vender legalmente e acessar fornecedores com CNPJ."
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-white font-semibold uppercase tracking-wider">Recomendações</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-primary-btn" />
                  Abra o MEI antes de comprar estoque
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-primary-btn" />
                  Defina sua identidade visual cedo
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-primary-btn" />
                  Proteja sua marca no INPI
                </div>
              </div>
            </div>
          </div>

          {/* Card Progresso Geral */}
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{
              background: 'linear-gradient(145deg, #102A43, #0A192F)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <h4 className="font-display font-semibold text-sm text-foreground">Progresso Geral</h4>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 flex-shrink-0">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#102A43" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallPercent / 100)}`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F2FBFF" />
                      <stop offset="40%" stopColor="#9EEBFF" />
                      <stop offset="100%" stopColor="#00EFFF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{overallPercent}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white">{totalAllDone} de {totalAllSteps} etapas</p>
                <p className="text-[10px] text-white mt-0.5">Complete todas as etapas para estruturar seu negócio</p>
              </div>
            </div>

            <div className="space-y-2">
              {guides.map((g) => {
                const s = completedSteps[g.title] || [];
                const d = s.filter(Boolean).length;
                const pct = (d / g.steps.length) * 100;
                return (
                  <div key={g.title} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white truncate">{g.title}</span>
                      <span className="text-[10px] font-semibold text-white">{d}/{g.steps.length}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#102A43' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: GRAD,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
