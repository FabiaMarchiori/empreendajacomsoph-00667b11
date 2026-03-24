import { motion } from "framer-motion";
import {
  ArrowRight,
  Package,
  BarChart3,
  MessageCircle,
  Sparkles,
  History,
  Heart,
  BookOpen,
  HelpCircle,
  Star,
  Check,
  Lock,
  Gem,
  Factory,
  ShoppingBag,
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

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      {/* Bloco 1 — Hero / Boas-vindas */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="rounded-2xl p-8 lg:p-10 border border-[#007A7A]/30 relative overflow-hidden min-h-[260px]" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
          {/* Background ambient glows */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4 opacity-20" style={{ background: 'radial-gradient(circle, #007A7A 0%, transparent 70%)' }} />

          {/* Soph hero image - right side, integrated */}
          <div className="absolute right-0 bottom-0 top-0 w-[45%] lg:w-[40%] pointer-events-none hidden md:block">
            <img
              src={sophHero}
              alt=""
              className="absolute right-0 bottom-0 h-full w-full object-cover object-top opacity-60"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.5) 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.5) 100%)',
              }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.6) 0%, rgba(0,122,122,0.1) 100%)' }} />
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-bold tracking-widest uppercase text-[#00FFFF] mb-3">Seu Ecossistema Empreendedor</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">
              Olá, Empreendedora! <span className="inline-block">👋</span>
            </h1>
            <p className="text-white text-base max-w-lg mb-2 leading-relaxed">
              Bem-vinda ao <span className="font-bold text-[#00FFFF]">EmpreendaJá</span>. Tudo o que você precisa para empreender, em um só lugar.
            </p>
            <p className="text-sm text-white mb-8">
              Você tem <span className="font-bold text-[#00FFFF]">3 acessos ativos</span> e <span className="font-bold text-[#00FFFF]">2 próximos passos</span> recomendados.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/estruture")} className="px-5 py-2.5 rounded-xl text-[#0A192F] text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_-4px_rgba(0,255,255,0.4)]" style={{ background: 'linear-gradient(90deg, #00FFFF 0%, #00CFCF 100%)' }}>
                Continuar jornada <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("/acessos")} className="px-5 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-bold hover:bg-white/10 hover:border-white/50 transition-all">
                Ver meus acessos
              </button>
              <button onClick={() => navigate("/soph")} className="px-5 py-2.5 rounded-xl border-2 border-[#00FFFF]/40 text-[#00FFFF] text-sm font-bold hover:bg-[#00FFFF]/10 transition-all flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Falar com a Soph
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 2 — Acessos principais */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-white">Seus acessos principais</h2>
          <button onClick={() => navigate("/acessos")} className="text-xs text-[#00FFFF] hover:underline font-bold">Ver todos</button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Central de Fornecedores", desc: "Encontre os melhores fornecedores para seu negócio", status: "liberado" as const, icon: <Package className="h-5 w-5" />, premium: true, url: "/fornecedores" },
            { title: "Sistema de Precificação", desc: "Calcule o preço ideal dos seus produtos", status: "liberado" as const, icon: <BarChart3 className="h-5 w-5" />, premium: true, url: "/gestao" },
            { title: "ERP – Soph Gestão", desc: "Gerencie seu negócio em um só lugar", status: "bonus" as const, icon: <Star className="h-5 w-5" />, premium: true, url: "/gestao" },
            { title: "Soph, sua Sócia Digital", desc: "Sua agente inteligente para orientação", status: "liberado" as const, icon: <MessageCircle className="h-5 w-5" />, premium: true, url: "/soph" },
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
          <h2 className="font-display text-xl font-bold text-white mb-8">Sua jornada empreendedora</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 mx-8" />
            <div
              className="absolute top-5 left-0 h-0.5 mx-8"
              style={{
                width: `${(1 / (journeySteps.length - 1)) * 100}%`,
                background: 'linear-gradient(90deg, #00FFFF 0%, #007A7A 100%)',
              }}
            />
            <div className="relative flex justify-between">
              {journeySteps.map((step) => (
                <div key={step.label} className="flex flex-col items-center text-center" style={{ width: `${100 / journeySteps.length}%` }}>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 relative z-10 transition-all ${
                      step.status === "concluido"
                        ? "border-[#00FFFF] text-[#0A192F]"
                        : step.status === "em_andamento"
                        ? "border-[#00FFFF]/60 text-[#00FFFF]"
                        : "bg-[#102A43] border-white/15 text-white/50"
                    }`}
                    style={
                      step.status === "concluido"
                        ? { background: 'linear-gradient(135deg, #00FFFF 0%, #007A7A 100%)' }
                        : step.status === "em_andamento"
                        ? { background: 'linear-gradient(135deg, rgba(0,255,255,0.15) 0%, rgba(0,122,122,0.1) 100%)', boxShadow: '0 0 12px -2px rgba(0,255,255,0.25)' }
                        : undefined
                    }
                  >
                    {step.status === "concluido" ? (
                      <Check className="h-4 w-4" />
                    ) : step.status === "em_andamento" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className={`text-xs font-bold mt-3 ${
                    step.status === "concluido"
                      ? "text-[#00FFFF]"
                      : step.status === "em_andamento"
                      ? "text-white"
                      : "text-white/50"
                  }`}>
                    {step.label}
                  </span>
                  <span className={`text-[10px] mt-0.5 font-medium ${
                    step.status === "concluido"
                      ? "text-[#00FFFF]/70"
                      : step.status === "em_andamento"
                      ? "text-white/60"
                      : "text-white/30"
                  }`}>
                    {step.status === "concluido" ? "Concluído" : step.status === "em_andamento" ? "Em andamento" : "Bloqueado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 4 — Insight da Soph (compacto) */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="rounded-2xl border border-[#00FFFF]/20 p-6 lg:p-8 shadow-[0_0_30px_-8px_rgba(0,255,255,0.15)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #007A7A 0%, #102A43 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-15" style={{ background: '#00FFFF' }} />
          <div className="relative flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00FFFF 0%, #007A7A 100%)' }}>
              <Sparkles className="h-5 w-5 text-[#0A192F]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-bold text-white mb-1">Insight da Soph</h2>
              <p className="text-xs text-white/70 font-medium mb-3">Recomendação personalizada para você</p>
              <p className="text-sm text-white leading-relaxed mb-5">
                💡 Com base no seu progresso, o próximo passo ideal é revisar sua precificação para proteger sua margem.
              </p>
              <button onClick={() => navigate("/gestao")} className="px-5 py-2.5 rounded-xl text-[#0A192F] text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_-4px_rgba(0,255,255,0.4)]" style={{ background: 'linear-gradient(90deg, #00FFFF 0%, #00CFCF 100%)' }}>
                Revisar agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 5 — Explorar */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-white">Explorar novas soluções</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Fornecedores de Semi-jóias de Limeira", desc: "Acesse fabricantes direto de Limeira", icon: <Gem className="h-5 w-5" /> },
            { title: "Fornecedores de Calçados dos Polos", desc: "Conecte-se com fábricas de calçados", icon: <ShoppingBag className="h-5 w-5" /> },
            { title: "Fabricantes Nacionais", desc: "Brinquedos, decoração, eletrônicos e mais", icon: <Factory className="h-5 w-5" /> },
          ].map((p) => (
            <motion.div key={p.title} variants={item}>
              <ProductCard title={p.title} description={p.desc} status="disponivel" icon={p.icon} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Bloco 6 — Ações rápidas */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Último acesso", icon: <History className="h-4 w-4" /> },
              { label: "Favoritos", icon: <Heart className="h-4 w-4" /> },
              { label: "Histórico", icon: <BookOpen className="h-4 w-4" /> },
              { label: "Materiais salvos", icon: <BookOpen className="h-4 w-4" /> },
              { label: "Suporte", icon: <HelpCircle className="h-4 w-4" /> },
            ].map((a) => (
              <button key={a.label} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-white/10 text-sm text-white font-semibold hover:border-[#00FFFF]/30 transition-all hover:shadow-[0_0_12px_-4px_rgba(0,255,255,0.2)]" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)' }}>
                <span className="text-[#00FFFF]">{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
