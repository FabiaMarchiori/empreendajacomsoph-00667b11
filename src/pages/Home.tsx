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
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { JourneyStep } from "@/components/JourneyStep";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Bloco 1 — Boas-vindas */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="bg-gradient-hero rounded-2xl p-8 border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)' }} />
          <div className="relative">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Olá, Empreendedora! 👋
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mb-1">
              Bem-vinda ao seu ecossistema empreendedor.
            </p>
            <p className="text-xs text-primary/80 mb-6">
              Você tem <span className="font-semibold text-primary">3 acessos ativos</span> e <span className="font-semibold text-primary">2 próximos passos</span> recomendados.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/estruture")} className="px-4 py-2 rounded-lg bg-gradient-primary-btn text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                Continuar jornada <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => navigate("/acessos")} className="px-4 py-2 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors">
                Ver meus acessos
              </button>
              <button onClick={() => navigate("/soph")} className="px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" /> Falar com a Soph
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 2 — Acessos principais */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Seus acessos principais</h2>
          <button onClick={() => navigate("/acessos")} className="text-xs text-primary hover:underline">Ver todos</button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Bloco 3 — Jornada + Recomendado pela Soph */}
      <motion.section variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-gradient-card rounded-xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">Sua jornada empreendedora</h2>
          <div className="space-y-0">
            {[
              { title: "Encontrar fornecedores", status: "concluido" as const },
              { title: "Estruturar seu negócio", status: "em_andamento" as const },
              { title: "Criar presença digital", status: "nao_iniciado" as const },
              { title: "Aprender a vender", status: "nao_iniciado" as const },
              { title: "Definir preço", status: "nao_iniciado" as const },
              { title: "Organizar a gestão", status: "nao_iniciado" as const },
            ].map((s, i, arr) => (
              <JourneyStep key={s.title} title={s.title} status={s.status} stepNumber={i + 1} isLast={i === arr.length - 1} />
            ))}
          </div>
        </motion.div>

        {/* Bloco 4 — Recomendado pela Soph — destaque com gradient #007A7A → #102A43 */}
        <motion.div variants={item} className="bg-gradient-highlight rounded-xl border border-accent/30 p-6 shadow-glow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Recomendado pela Soph</h2>
          </div>
          <div className="space-y-3">
            {[
              "Você já acessou fornecedores. Agora o próximo passo ideal é revisar sua precificação.",
              "Quer ajuda para decidir por onde começar?",
              "Com base no seu perfil, recomendo avançar em presença digital.",
            ].map((msg, i) => (
              <div key={i} className="bg-secondary/40 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-foreground/80 leading-relaxed">💡 {msg}</p>
              </div>
            ))}
            <button onClick={() => navigate("/soph")} className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
              Conversar com a Soph <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* Bloco 5 — Explorar */}
      <motion.section variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Explorar novas soluções</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Fornecedores de Semi-jóias de Limeira", desc: "Acesse fabricantes direto de Limeira" },
            { title: "Fornecedores de Calçados dos Polos", desc: "Conecte-se com fábricas de calçados" },
            { title: "Fabricantes Nacionais", desc: "Brinquedos, decoração, eletrônicos e mais" },
          ].map((p) => (
            <motion.div key={p.title} variants={item}>
              <ProductCard title={p.title} description={p.desc} status="disponivel" icon={<Zap className="h-5 w-5" />} />
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
              <button key={a.label} className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
