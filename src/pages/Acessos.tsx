import { motion } from "framer-motion";
import {
  Package, BarChart3, MessageCircle, ArrowRight, Bell,
  FileText, Globe, ShoppingBag, Database, Star,
  Shirt, Footprints, Gem, HeadphonesIcon, Sparkles
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import sophAvatar from "@/assets/soph-avatar.png";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface AccessItem {
  title: string;
  description: string;
  status: "adquirido" | "brinde" | "em_breve";
  icon: React.ReactNode;
  route?: string;
}

const produtoPrincipal: AccessItem[] = [
  { title: "Importadoras 25 de Março", description: "Catálogo completo de fornecedores e importadoras da região da 25 de Março", status: "adquirido", icon: <Package className="h-5 w-5" />, route: "/fornecedores" },
];

const brindes: AccessItem[] = [
  { title: "Sistema de Precificação", description: "Calcule margens, markup e preço ideal para seus produtos", status: "brinde", icon: <BarChart3 className="h-5 w-5" />, route: "/gestao" },
  { title: "Soph, sua Sócia Digital", description: "Assistente inteligente com orientações estratégicas para seu negócio", status: "brinde", icon: <MessageCircle className="h-5 w-5" />, route: "/soph" },
  { title: "Abrir CNPJ / MEI", description: "Passo a passo completo para formalizar seu negócio", status: "brinde", icon: <FileText className="h-5 w-5" />, route: "/abrir-mei" },
  { title: "Criar sua Logo Marca", description: "Guia para criar uma identidade visual profissional", status: "brinde", icon: <Star className="h-5 w-5" />, route: "/logo-marca" },
  { title: "Registrar sua Marca", description: "Proteja seu nome e marca legalmente", status: "brinde", icon: <FileText className="h-5 w-5" />, route: "/registrar-marca" },
  { title: "Criar seu Domínio e Site", description: "Monte sua presença digital profissional", status: "brinde", icon: <Globe className="h-5 w-5" />, route: "/dominio-site" },
  { title: "Como Vender em Marketplaces", description: "Estratégias para vender no Mercado Livre, Shopee e mais", status: "brinde", icon: <ShoppingBag className="h-5 w-5" />, route: "/vendas-marketplaces" },
  { title: "ERP – Soph Gestão", description: "Gestão completa: estoque, vendas, financeiro e relatórios", status: "brinde", icon: <Database className="h-5 w-5" />, route: "/gestao" },
];

const emBreve = {
  moda: [
    { title: "Moda Feminina", description: "Fornecedores de moda feminina por atacado", status: "em_breve" as const, icon: <Shirt className="h-5 w-5" /> },
    { title: "Moda Masculina", description: "Catálogo de fornecedores masculinos", status: "em_breve" as const, icon: <Shirt className="h-5 w-5" /> },
    { title: "Moda Infantil", description: "Fornecedores especializados em moda kids", status: "em_breve" as const, icon: <Shirt className="h-5 w-5" /> },
    { title: "Moda Íntima", description: "Fabricantes e atacadistas de moda íntima", status: "em_breve" as const, icon: <Shirt className="h-5 w-5" /> },
    { title: "Moda Fitness", description: "Fornecedores de roupas fitness e esportivas", status: "em_breve" as const, icon: <Shirt className="h-5 w-5" /> },
  ],
  calcados: [
    { title: "Calçados – Jaú", description: "Fábricas e atacadistas do polo de Jaú", status: "em_breve" as const, icon: <Footprints className="h-5 w-5" /> },
    { title: "Calçados – Nova Serrana", description: "Polo calçadista de Nova Serrana/MG", status: "em_breve" as const, icon: <Footprints className="h-5 w-5" /> },
    { title: "Calçados – Birigui", description: "Polo calçadista infantil de Birigui/SP", status: "em_breve" as const, icon: <Footprints className="h-5 w-5" /> },
    { title: "Calçados – Região Sul", description: "Fornecedores dos polos do Rio Grande do Sul", status: "em_breve" as const, icon: <Footprints className="h-5 w-5" /> },
  ],
  outros: [
    { title: "Semi-jóias de Limeira", description: "Fabricantes direto do polo joalheiro de Limeira/SP", status: "em_breve" as const, icon: <Gem className="h-5 w-5" /> },
  ],
};

function AccessCard({ item: a, isPrimary }: { item: AccessItem; isPrimary?: boolean }) {
  const navigate = useNavigate();
  const isEmBreve = a.status === "em_breve";

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      onClick={a.route && !isEmBreve ? () => navigate(a.route!) : undefined}
      className={`group relative rounded-2xl border p-5 transition-all duration-200 flex items-center gap-4 ${
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
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isPrimary ? "bg-primary/15 text-primary" : isEmBreve ? "bg-muted/30 text-white/50" : "bg-primary/10 text-primary"
      }`}>
        {a.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-display font-semibold text-sm ${isEmBreve ? "text-white/60" : "text-white"}`}>{a.title}</h3>
        <p className={`text-xs mt-0.5 ${isEmBreve ? "text-white/40" : "text-white/80"}`}>{a.description}</p>
      </div>
      <StatusBadge status={a.status} />
      {isEmBreve ? (
        <button className="px-4 py-2 rounded-xl text-xs font-bold border border-border/60 text-white/60 hover:border-primary/30 hover:text-white transition-all flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" /> Avise-me
        </button>
      ) : (
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A192F] flex items-center gap-1.5 hover:gap-2.5 transition-all"
          style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
        >
          Acessar <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

function SubgroupTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

export default function AcessosPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Central de </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}>Acessos</span>
        </h1>
        <p className="text-sm lg:text-base text-white max-w-2xl leading-relaxed">
          Veja tudo o que já está incluído no seu acesso, seus brindes exclusivos e os próximos módulos que serão lançados no ecossistema.
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
        <p className="text-sm text-white/80 mb-4">O acesso principal que você adquiriu</p>
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {produtoPrincipal.map(a => (
            <AccessCard key={a.title} item={a} isPrimary />
          ))}
        </motion.div>
      </section>

      {/* ── GRUPO 2: BRINDES ── */}
      <section>
        <h2 className="font-display font-bold text-lg text-white mb-1">Brindes inclusos no seu acesso</h2>
        <p className="text-sm text-white/80 mb-4">Módulos e ferramentas liberados como benefício do seu plano</p>
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {brindes.map(a => (
            <AccessCard key={a.title} item={a} />
          ))}
        </motion.div>
      </section>

      {/* ── GRUPO 3: EM BREVE ── */}
      <section>
        <h2 className="font-display font-bold text-lg text-white mb-1">Em breve</h2>
        <p className="text-sm text-white/80 mb-5">Novos módulos e catálogos que serão lançados no ecossistema</p>

        <SubgroupTitle label="Moda" />
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3 mb-6">
          {emBreve.moda.map(a => <AccessCard key={a.title} item={a} />)}
        </motion.div>

        <SubgroupTitle label="Calçados" />
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3 mb-6">
          {emBreve.calcados.map(a => <AccessCard key={a.title} item={a} />)}
        </motion.div>

        <SubgroupTitle label="Outros" />
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {emBreve.outros.map(a => <AccessCard key={a.title} item={a} />)}
        </motion.div>
      </section>

      {/* ── SUPORTE ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 bg-gradient-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <HeadphonesIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white text-base mb-1">Suporte</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Precisa de ajuda com seu acesso, dúvidas sobre módulos ou orientação para usar melhor o ecossistema? Fale com nosso suporte.
          </p>
        </div>
        <a
          href="https://wa.me/5511983348749?text=Empreendaja%20"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] flex items-center gap-2 hover:brightness-110 transition-all flex-shrink-0"
          style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
        >
          Falar no WhatsApp <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </motion.div>

      {/* ── DICA DA SOPH ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-[hsl(210,63%,14%)] p-6">
        <div className="flex items-start gap-4">
          <img src={sophAvatar} alt="Soph" className="h-11 w-11 rounded-full object-cover border-2 border-primary/30 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-bold text-white text-base">Dica da Soph</h3>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Você já tem acesso ao seu produto principal e a vários brindes importantes. O próximo passo ideal é começar pelos módulos que ajudam a estruturar seu negócio e depois avançar para vendas e presença digital.
            </p>
            <button
              onClick={() => {}}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] flex items-center gap-2 hover:brightness-110 transition-all"
              style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
            >
              Ver recomendação <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
