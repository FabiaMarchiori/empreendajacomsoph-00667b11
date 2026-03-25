import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Globe, ShoppingBag, ArrowRight, Circle, Camera, Star, Target, Sparkles, TrendingUp, Users } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const pathCards = [
  {
    title: "Criar Site e Presença Online",
    description: "Construa sua base digital, fortaleça sua marca e prepare seu negócio para ser encontrado.",
    icon: <Globe className="h-6 w-6" />,
    steps: ["Configurar Google Meu Negócio", "Identidade visual no Instagram", "Landing page de conversão"],
    cta: "Iniciar Jornada Digital",
    link: "",
  },
  {
    title: "Como Vender em Marketplaces",
    description: "Aprenda a estruturar sua operação para vender em grandes marketplaces com mais clareza e eficiência.",
    icon: <ShoppingBag className="h-6 w-6" />,
    steps: ["Pré-requisitos e documentação", "Anúncios de alta performance", "Logística e expedição"],
    cta: "Escalar em Marketplaces",
    link: "/vendas/marketplaces",
  },
];

const tips = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Fotos que Vendem",
    description: "Aprenda a criar imagens profissionais que convertem visitantes em compradores reais.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Prova Social",
    description: "Use depoimentos, avaliações e números para gerar confiança imediata no seu público.",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Anúncios Estratégicos",
    description: "Invista de forma inteligente em tráfego pago para escalar suas vendas com previsibilidade.",
  },
];

export default function VendasPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Domine sua </span>
          <span style={{ color: "#00EFFF" }}>Presença Digital</span>
          <br />
          <span className="text-white">& Venda Mais</span>
        </h1>
        <p className="text-white text-sm lg:text-base max-w-2xl leading-relaxed">
          Não basta estar online. É preciso ser encontrado, gerar confiança e transformar presença digital em vendas reais.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-7 w-7 rounded-full border-2 border-background flex items-center justify-center" style={{ background: "#00EFFF" }}>
                <Users className="h-3 w-3" style={{ color: "#0A192F" }} />
              </div>
            ))}
          </div>
          <p className="text-white text-xs font-medium">
            Empreendedores já estão fortalecendo sua presença digital esta semana.
          </p>
        </div>
      </motion.div>

      {/* DOIS CAMINHOS */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pathCards.map((card) => (
          <motion.div
            key={card.title}
            variants={item}
            className="relative rounded-2xl border border-primary/20 p-6 flex flex-col bg-gradient-card hover:border-primary/40 transition-all group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#00EFFF" }}>
              <span style={{ color: "#0A192F" }}>{card.icon}</span>
            </div>

            <h3 className="font-display font-bold text-lg text-white mb-2">{card.title}</h3>
            <p className="text-white text-sm leading-relaxed mb-5">{card.description}</p>

            <div className="space-y-4 mb-6 flex-1">
              {card.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: "#00EFFF" }}>
                      <Circle className="h-3 w-3" style={{ color: "#00EFFF" }} />
                    </div>
                    {idx < card.steps.length - 1 && (
                      <div className="w-px h-4 mt-1" style={{ background: "#007A7A" }} />
                    )}
                  </div>
                  <div className="pt-1">
                    <span className="text-white text-sm font-medium">{step}</span>
                    <p className="text-white text-xs mt-0.5">Não iniciado</p>
                  </div>
                </div>
              ))}
            </div>

            {card.link ? (
              <Link to={card.link} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm group-hover:gap-3 transition-all" style={{ background: "#00EFFF", color: "#0A192F" }}>
                {card.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm group-hover:gap-3 transition-all" style={{ background: "#00EFFF", color: "#0A192F" }}>
                {card.cta} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* SOPH ESTRATÉGICA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative rounded-2xl border border-primary/20 p-6 bg-gradient-card overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#00EFFF" }}>
            <Sparkles className="h-5 w-5" style={{ color: "#0A192F" }} />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-display font-bold text-base text-white">Soph sugere para seu nicho</h3>
            <p className="text-white text-sm leading-relaxed">
              "Pelo seu perfil, começar pelo Instagram Shopping e por marketplaces pode gerar retorno mais rápido. Quer que eu monte um roteiro inicial para você?"
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: "#00EFFF", color: "#0A192F" }}
              >
                Criar roteiro <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <span className="text-white text-xs">Baseado no seu perfil e segmento</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DICAS DE ESPECIALISTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "#00EFFF" }} />
          <h2 className="font-display font-bold text-lg text-white">Dicas de Especialista</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-xl border border-border/60 p-5 bg-gradient-card hover:border-primary/20 transition-all">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#00EFFF" }}>
                <span style={{ color: "#0A192F" }}>{tip.icon}</span>
              </div>
              <h4 className="font-display font-bold text-sm text-white mb-1.5">{tip.title}</h4>
              <p className="text-white text-xs leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
