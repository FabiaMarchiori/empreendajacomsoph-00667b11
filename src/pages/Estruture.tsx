import { motion } from "framer-motion";
import {
  FileCheck,
  Palette,
  Shield,
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronDown,
  ClipboardCheck,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { businessImages } from "@/components/business/assets";
import {
  BusinessHero,
  ProgressRing,
  ToolIllustration,
} from "@/components/business/BusinessVisuals";

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
    description:
      "Formalize seu negócio de forma simples e rápida. Esse é o primeiro passo para operar legalmente.",
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

export default function EstruturePage() {
  const [openGuide, setOpenGuide] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<
    Record<string, boolean[]>
  >({});

  const toggleStep = (
    guideTitle: string,
    stepIdx: number,
    totalSteps: number,
  ) => {
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
  const overallPercent =
    totalAllSteps > 0 ? Math.round((totalAllDone / totalAllSteps) * 100) : 0;

  const destinations = [
    "/estrutura/abrir-mei",
    "/estrutura/logo-marca",
    "/estrutura/registrar-marca",
  ];
  const illustrations = [
    businessImages.mei,
    businessImages.identity,
    businessImages.brand,
  ];
  const actions = ["Começar MEI", "Criar minha logo", "Registrar minha marca"];

  return (
    <div className="business-premium business-structure">
      <BusinessHero
        kind="structure"
        area="Estruture seu Negócio"
        title={
          <>
            Formalize, Proteja e Fortaleça <span>sua Marca</span>
          </>
        }
        description="O alicerce do seu sucesso começa aqui. Siga nossa jornada guiada para formalizar sua empresa, proteger sua marca e construir uma identidade profissional."
      />
      <nav
        className="business-primary-grid"
        aria-label="Ferramentas de estruturação"
      >
        {guides.map((guide, index) => (
          <Link
            key={guide.title}
            to={destinations[index]}
            className="business-tool-link"
          >
            <ToolIllustration src={illustrations[index]} />
            <div>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
            </div>
            <span className="business-arrow" aria-hidden="true">
              <ArrowRight size={22} />
            </span>
          </Link>
        ))}
      </nav>
      <section
        className="business-journey business-panel"
        aria-labelledby="journey-title"
      >
        <div className="business-journey-summary">
          <div className="business-section-heading">
            <ClipboardCheck size={40} />
            <div>
              <h2 id="journey-title">Jornada de Estruturação</h2>
              <p>Complete as etapas e construa um negócio sólido e seguro.</p>
            </div>
          </div>
          <div className="business-journey-overall">
            Progresso da Jornada <strong>{overallPercent}%</strong>
            <div className="business-progress-track" aria-hidden="true">
              <span style={{ width: `${overallPercent}%` }} />
            </div>
          </div>
        </div>
        {guides.map((guide, index) => {
          const steps =
            completedSteps[guide.title] ||
            Array(guide.steps.length).fill(false);
          const done = steps.filter(Boolean).length;
          const isOpen = openGuide === index;
          const state =
            done === guide.steps.length
              ? "done"
              : done > 0
                ? "started"
                : "empty";
          return (
            <div key={guide.title} className="business-guide">
              <button
                type="button"
                onClick={() => setOpenGuide(isOpen ? null : index)}
                className="business-guide-toggle"
                aria-expanded={isOpen}
                aria-controls={`business-guide-${index}`}
              >
                <span className="business-step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="business-guide-copy">
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </div>
                <span className="business-guide-count">
                  {done}/{guide.steps.length} etapas
                </span>
                <span className="business-state" data-state={state}>
                  {state === "done"
                    ? "Concluído"
                    : state === "started"
                      ? "Em andamento"
                      : "Não iniciado"}
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                />
              </button>
              {isOpen && (
                <motion.div
                  id={`business-guide-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="business-guide-details"
                >
                  <div className="business-checklist">
                    {guide.steps.map((step, stepIndex) => (
                      <button
                        type="button"
                        key={step}
                        aria-pressed={steps[stepIndex]}
                        onClick={() =>
                          toggleStep(guide.title, stepIndex, guide.steps.length)
                        }
                      >
                        {steps[stepIndex] ? (
                          <CheckCircle2 size={21} aria-hidden="true" />
                        ) : (
                          <Circle size={21} aria-hidden="true" />
                        )}
                        <span>{step}</span>
                      </button>
                    ))}
                  </div>
                  <Link to={destinations[index]} className="business-action">
                    {actions[index]} <ArrowRight size={18} />
                  </Link>
                </motion.div>
              )}
            </div>
          );
        })}
      </section>
      <div className="business-two-column">
        <aside className="business-advice business-panel">
          <div className="business-advice-header">
            <ToolIllustration src={businessImages.soph} />
            <div>
              <h2>Soph</h2>
              <p>Assistente estratégica</p>
            </div>
          </div>
          <blockquote>
            “Comece pelo <strong>MEI</strong>. É o passo mais importante para
            vender legalmente e acessar fornecedores com CNPJ.”
          </blockquote>
        </aside>
        <section
          className="business-overall business-panel"
          aria-labelledby="overall-title"
        >
          <h2 id="overall-title">Progresso Geral</h2>
          <div className="business-overall-main">
            <ProgressRing value={overallPercent} />
            <div>
              <strong>
                {totalAllDone} de {totalAllSteps} etapas
              </strong>
              <p>Complete todas as etapas para estruturar seu negócio</p>
            </div>
          </div>
          <div className="business-progress-breakdown">
            {guides.map((guide) => {
              const done = (completedSteps[guide.title] || []).filter(
                Boolean,
              ).length;
              return (
                <div key={guide.title}>
                  <p>
                    <span>{guide.title}</span>
                    <span>
                      {done}/{guide.steps.length}
                    </span>
                  </p>
                  <div className="business-progress-track" aria-hidden="true">
                    <span
                      style={{ width: `${(done / guide.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section
        className="business-recommendations business-panel"
        aria-labelledby="recommendations-title"
      >
        <div className="business-section-heading">
          <Lightbulb size={28} />
          <h2 id="recommendations-title">Recomendações da Soph</h2>
        </div>
        <ul>
          {[
            "Abra o MEI antes de comprar estoque",
            "Defina sua identidade visual cedo",
            "Proteja sua marca no INPI",
          ].map((text) => (
            <li key={text}>
              <CheckCircle2 size={25} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
