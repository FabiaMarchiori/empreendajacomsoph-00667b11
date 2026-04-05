import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  ArrowRight,
  Package,
  BarChart3,
  MessageCircle,
  Sparkles,
  History,
  Heart,
  HelpCircle,
  Star,
  Check,
  Lock,
  Gem,
  Factory,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import sophHero from "@/assets/soph-hero.png";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type JourneyStatus = "concluido" | "em_andamento" | "nao_iniciado";

const journeySteps: { label: string; status: JourneyStatus }[] = [
  { label: "Fornecedores", status: "concluido" },
  { label: "Estrutura", status: "em_andamento" },
  { label: "Presença", status: "nao_iniciado" },
  { label: "Vendas", status: "nao_iniciado" },
  { label: "Preço", status: "nao_iniciado" },
  { label: "Gestão", status: "nao_iniciado" },
];

const GRAD = "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)";

export default function HomePage() {
  const navigate = useNavigate();

  // Track last visited page for "Último acesso"
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("empreendaja_last_page", window.location.pathname);
    };
    const originalPushState = history.pushState.bind(history);
    history.pushState = function (...args) {
      localStorage.setItem("empreendaja_last_page", window.location.pathname);
      return originalPushState(...args);
    };
    return () => {
      history.pushState = originalPushState;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8 sm:space-y-10">
      {/* Bloco 1 — Hero / Boas-vindas */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="rounded-2xl p-5 sm:p-8 lg:p-10 border border-[#007A7A]/30 relative overflow-hidden min-h-[220px] sm:min-h-[260px]" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4 opacity-20" style={{ background: 'radial-gradient(circle, #007A7A 0%, transparent 70%)' }} />

          <div className="absolute right-0 bottom-0 top-0 w-[40%] lg:w-[36%] pointer-events-none hidden md:flex items-end justify-center">
            <img
              src={sophHero}
              alt=""
              className="h-[95%] w-auto max-w-full object-contain object-bottom opacity-75"
              style={{
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 82%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 82%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.8) 88%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskComposite: 'destination-in',
              }}
            />
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-primary inline-block mb-3">Seu Ecossistema Empreendedor</p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              Olá, Empreendedora! <span className="inline-block">👋</span>
            </h1>
            <p className="text-white text-base max-w-lg mb-2 leading-relaxed">
              Bem-vinda ao <span className="font-bold text-gradient-primary inline-block">EmpreendaJá</span>. Tudo o que você precisa para empreender, em um só lugar.
            </p>
            <p className="text-sm text-white mb-8 leading-relaxed">
              Você tem <span className="font-bold text-gradient-primary inline-block">3 acessos ativos</span> e <span className="font-bold text-gradient-primary inline-block">2 próximos passos</span> recomendados.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/estruture")} className="px-5 py-2.5 rounded-xl text-[#0A192F] text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_-4px_rgba(0,239,255,0.4)]" style={{ background: GRAD }}>
                Continuar jornada <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("/acessos")} className="px-5 py-2.5 rounded-xl border-2 border-white/40 text-white text-sm font-bold hover:bg-white/10 hover:border-white/60 transition-all">
                Ver meus acessos
              </button>
              <button onClick={() => navigate("/soph")} className="px-5 py-2.5 rounded-xl bg-gradient-primary-btn text-primary-foreground text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-glow-sm">
                <MessageCircle className="h-4 w-4" /> Falar com a Soph
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 2 — Acessos principais */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white tracking-tight">Seus acessos principais</h2>
          <button onClick={() => navigate("/acessos")} className="text-xs text-gradient-primary inline-block hover:underline font-bold tracking-wide">Ver todos</button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Central de Fornecedores", desc: "Encontre os melhores fornecedores para seu negócio", status: "liberado" as const, icon: <Package className="h-5 w-5" />, premium: true, url: "/fornecedores" },
            { title: "Sistema de Precificação", desc: "Calcule o preço ideal dos seus produtos", status: "liberado" as const, icon: <BarChart3 className="h-5 w-5" />, premium: true, url: "/gestao" },
            { title: "ERP – Soph Gestão", desc: "Gerencie seu negócio em um só lugar", status: "bonus" as const, icon: <Star className="h-5 w-5" />, premium: true, url: "/gestao" },
            { title: "Soph, sua Sócia Digital", desc: "Sua agente inteligente de orientação", status: "liberado" as const, icon: <MessageCircle className="h-5 w-5" />, premium: true, url: "/soph" },
          ].map((p) => (
            <motion.div key={p.title} variants={item}>
              <ProductCard {...p} description={p.desc} isPremium={p.premium} onClick={() => navigate(p.url)} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Bloco 3 — Jornada Horizontal */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="rounded-2xl border border-[#007A7A]/20 p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
          <h2 className="font-display text-xl font-bold text-white mb-8 tracking-tight">Sua jornada empreendedora</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 mx-8" />
            <div
              className="absolute top-5 left-0 h-0.5 mx-8 bg-gradient-primary-btn"
              style={{
                width: `${(1 / (journeySteps.length - 1)) * 100}%`,
              }}
            />
            <div className="relative flex justify-between">
              {journeySteps.map((step) => (
                <div key={step.label} className="flex flex-col items-center text-center min-w-0" style={{ width: `${100 / journeySteps.length}%` }}>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 relative z-10 ${
                      step.status === "concluido"
                        ? "border-primary/50 text-primary-foreground bg-gradient-primary-btn"
                        : step.status === "em_andamento"
                        ? "border-primary/40 text-white bg-gradient-primary-soft shadow-glow-sm"
                        : "bg-[#102A43] border-white/15 text-white/40"
                    }`}
                  >
                    {step.status === "concluido" ? (
                      <Check className="h-4 w-4" />
                    ) : step.status === "em_andamento" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold mt-3 ${
                    step.status === "concluido"
                      ? "text-transparent bg-clip-text bg-gradient-primary-btn"
                      : step.status === "em_andamento"
                      ? "text-white"
                      : "text-white/40"
                  }`}>
                    {step.label}
                  </span>
                  <span className={`text-[10px] mt-1 font-semibold ${
                    step.status === "concluido"
                      ? "text-transparent bg-clip-text bg-gradient-primary-btn"
                      : step.status === "em_andamento"
                      ? "text-white/80"
                      : "text-white/25"
                  }`}>
                    {step.status === "concluido" ? "Concluído" : step.status === "em_andamento" ? "Em andamento" : "Bloqueado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 4 — Insight da Soph */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="rounded-2xl border border-[#00EFFF]/25 p-6 shadow-[0_0_25px_-8px_rgba(0,239,255,0.15)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[70px] -translate-y-1/2 translate-x-1/3 opacity-20" style={{ background: 'radial-gradient(circle, #00EFFF 0%, transparent 70%)' }} />
          <div className="relative flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GRAD }}>
              <Sparkles className="h-5 w-5 text-[#0A192F]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-base font-bold text-white mb-0.5 tracking-tight">Insight da Soph</h2>
              <p className="text-[11px] text-white/70 font-medium mb-3">Recomendação personalizada para você</p>
              <p className="text-sm text-white leading-relaxed mb-4">
                💡 Com base no seu progresso, o próximo passo ideal é revisar sua precificação para proteger sua margem.
              </p>
              <button onClick={() => navigate("/gestao")} className="px-5 py-2 rounded-xl text-[#0A192F] text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_-4px_rgba(0,239,255,0.4)]" style={{ background: GRAD }}>
                Revisar agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 5 — Explorar */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white tracking-tight">Explorar novas soluções</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Semi-jóias de Limeira", desc: "Acesse fabricantes direto de Limeira", icon: <Gem className="h-5 w-5" /> },
            { title: "Calçados dos Polos", desc: "Conecte-se com fábricas de calçados", icon: <ShoppingBag className="h-5 w-5" /> },
            { title: "Fabricantes Nacionais", desc: "Brinquedos, decoração, eletrônicos e mais", icon: <Factory className="h-5 w-5" /> },
          ].map((p) => (
            <motion.div key={p.title} variants={item}>
              <ProductCard title={p.title} description={p.desc} status="em_breve" icon={p.icon} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Bloco 6 — Ações rápidas */}
      <motion.section variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "Último acesso", icon: <RotateCcw className="h-4 w-4" />, action: () => {
                const last = localStorage.getItem("empreendaja_last_page");
                navigate(last && last !== "/" ? last : "/fornecedores");
              }},
              { label: "Favoritos", icon: <Heart className="h-4 w-4" />, action: () => navigate("/fornecedores/importadoras-25/favoritos") },
              { label: "Histórico", icon: <History className="h-4 w-4" />, action: () => navigate("/gestao/precificacao") },
              { label: "Suporte", icon: <HelpCircle className="h-4 w-4" />, action: () => window.open("https://wa.me/5511983348749?text=Suporte%20Ecossistema", "_blank") },
            ].map((a) => (
              <button key={a.label} onClick={a.action} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-white/10 text-sm text-white font-semibold hover:border-[#00EFFF]/30 hover:shadow-[0_0_12px_-4px_rgba(0,239,255,0.2)] transition-all" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
                <span className="text-[#00EFFF]">{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
