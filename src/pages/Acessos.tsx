import { motion } from "framer-motion";
import {
  Package, BarChart3, MessageCircle, ArrowRight, Bell,
  FileText, Globe, ShoppingBag, Database, Star,
  Shirt, Footprints, Gem, HeadphonesIcon, Sparkles
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import sophAvatar from "@/assets/soph-avatar.png";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface AccessItem {
  title: string;
  description: string;
  status: "adquirido" | "brinde" | "em_breve";
  icon: React.ReactNode;
  route?: string;
}

const produtoPrincipal: AccessItem[] = [
  { title: "Importadoras 25 de Março", description: "Catálogo completo de fornecedores e importadoras", status: "adquirido", icon: <Package className="h-5 w-5" />, route: "/fornecedores" },
];

const brindes: AccessItem[] = [
  { title: "Sistema de Precificação", description: "Margens, markup e preço ideal", status: "brinde", icon: <BarChart3 className="h-5 w-5" />, route: "/gestao" },
  { title: "Soph, sua Sócia Digital", description: "Assistente estratégica para seu negócio", status: "brinde", icon: <MessageCircle className="h-5 w-5" />, route: "/soph" },
  { title: "Abrir CNPJ / MEI", description: "Passo a passo para formalizar", status: "brinde", icon: <FileText className="h-5 w-5" />, route: "/estrutura/abrir-mei" },
  { title: "Criar sua Logo Marca", description: "Identidade visual profissional", status: "brinde", icon: <Star className="h-5 w-5" />, route: "/estrutura/logo-marca" },
  { title: "Registrar sua Marca", description: "Proteja seu nome legalmente", status: "brinde", icon: <FileText className="h-5 w-5" />, route: "/estrutura/registrar-marca" },
  { title: "Domínio e Site", description: "Presença digital profissional", status: "brinde", icon: <Globe className="h-5 w-5" />, route: "/vendas/dominio-site" },
  { title: "Vender em Marketplaces", description: "Mercado Livre, Shopee e mais", status: "brinde", icon: <ShoppingBag className="h-5 w-5" />, route: "/vendas/marketplaces" },
  { title: "ERP – Soph Gestão", description: "Estoque, vendas e financeiro", status: "brinde", icon: <Database className="h-5 w-5" />, route: "/gestao" },
];

const allEmBreve: AccessItem[] = [
  { title: "Moda Feminina", description: "Atacado feminino", status: "em_breve", icon: <Shirt className="h-5 w-5" /> },
  { title: "Moda Masculina", description: "Fornecedores masculinos", status: "em_breve", icon: <Shirt className="h-5 w-5" /> },
  { title: "Moda Infantil", description: "Moda kids", status: "em_breve", icon: <Shirt className="h-5 w-5" /> },
  { title: "Moda Íntima", description: "Atacado de moda íntima", status: "em_breve", icon: <Shirt className="h-5 w-5" /> },
  { title: "Moda Fitness", description: "Roupas fitness e esportivas", status: "em_breve", icon: <Shirt className="h-5 w-5" /> },
  { title: "Calçados – Jaú", description: "Polo calçadista de Jaú", status: "em_breve", icon: <Footprints className="h-5 w-5" /> },
  { title: "Calçados – Nova Serrana", description: "Polo de Nova Serrana/MG", status: "em_breve", icon: <Footprints className="h-5 w-5" /> },
  { title: "Calçados – Birigui", description: "Polo infantil de Birigui/SP", status: "em_breve", icon: <Footprints className="h-5 w-5" /> },
  { title: "Calçados – Região Sul", description: "Polos do Rio Grande do Sul", status: "em_breve", icon: <Footprints className="h-5 w-5" /> },
  { title: "Semi-jóias de Limeira", description: "Polo joalheiro de Limeira/SP", status: "em_breve", icon: <Gem className="h-5 w-5" /> },
];

function GridCard({ item: a, isPrimary }: { item: AccessItem; isPrimary?: boolean }) {
  const navigate = useNavigate();
  const isEmBreve = a.status === "em_breve";

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={a.route && !isEmBreve ? () => navigate(a.route!) : undefined}
      className={`group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col gap-3 ${
        isEmBreve ? "cursor-default" : "cursor-pointer"
      } ${
        isPrimary
          ? "bg-gradient-card border-primary/30 shadow-glow-sm hover:shadow-glow hover:border-primary/50"
          : "bg-gradient-card border-border/60 hover:border-primary/20"
      }`}
    >
      {isPrimary && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isPrimary ? "bg-primary/15 text-primary" : isEmBreve ? "bg-primary/5 text-white" : "bg-primary/10 text-primary"
        }`}>
          {a.icon}
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-sm text-white leading-tight">{a.title}</h3>
        <p className="text-xs mt-1 text-white/80 leading-relaxed line-clamp-2">{a.description}</p>
      </div>

      {isEmBreve ? (
        <button className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-border/60 text-white hover:border-primary/30 transition-all flex items-center justify-center gap-1.5">
          <Bell className="h-3.5 w-3.5" /> Avise-me
        </button>
      ) : (
        <button
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0A192F] flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
          style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
        >
          Acessar <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export default function AcessosPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Central de </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}>Acessos</span>
        </h1>
        <p className="text-sm lg:text-base text-white max-w-2xl leading-relaxed">
          Tudo o que está incluído no seu acesso, brindes exclusivos e os próximos módulos do ecossistema.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {["Produto Principal", "8 Brindes", "Novos Módulos em Breve"].map(t => (
            <span key={t} className="px-3 py-1 rounded-full text-[11px] font-semibold border text-white" style={{ borderColor: "rgba(0,239,255,0.25)", background: "rgba(0,239,255,0.08)" }}>{t}</span>
          ))}
        </div>
      </motion.div>

      {/* ── GRUPO 1: PRODUTO PRINCIPAL ── */}
      <section>
        <h2 className="font-display font-bold text-lg text-white mb-1">Seu produto principal</h2>
        <p className="text-sm text-white mb-4">O acesso principal que você adquiriu</p>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {produtoPrincipal.map(a => (
            <GridCard key={a.title} item={a} isPrimary />
          ))}
        </motion.div>
      </section>

      {/* ── GRUPO 2: BRINDES ── */}
      <section>
        <h2 className="font-display font-bold text-lg text-white mb-1">Brindes inclusos no seu acesso</h2>
        <p className="text-sm text-white mb-4">Módulos e ferramentas liberados como benefício do seu plano</p>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {brindes.map(a => (
            <GridCard key={a.title} item={a} />
          ))}
        </motion.div>
      </section>

      {/* ── GRUPO 3: EM BREVE ── */}
      <section>
        <h2 className="font-display font-bold text-lg text-white mb-1">Em breve</h2>
        <p className="text-sm text-white mb-4">Novos módulos e catálogos que serão lançados no ecossistema</p>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {allEmBreve.map(a => (
            <GridCard key={a.title} item={a} />
          ))}
        </motion.div>
      </section>

      {/* ── SUPORTE + SOPH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SUPORTE */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 bg-gradient-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-white text-base">Suporte</h3>
          </div>
          <p className="text-sm text-white leading-relaxed">
            Dúvidas sobre módulos ou orientação para usar o ecossistema? Fale com nosso suporte.
          </p>
          <a
            href="https://wa.me/5511983348749?text=Empreendaja%20"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
          >
            Falar no WhatsApp <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>

        {/* DICA DA SOPH */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-[hsl(210,63%,14%)] p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src={sophAvatar} alt="Soph" className="h-10 w-10 rounded-full object-cover border-2 border-primary/30 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white text-base">Dica da Soph</h3>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-sm text-white leading-relaxed">
            Comece pelos módulos que estruturam seu negócio e depois avance para vendas e presença digital.
          </p>
          <button
            onClick={() => {}}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
          >
            Ver recomendação <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
