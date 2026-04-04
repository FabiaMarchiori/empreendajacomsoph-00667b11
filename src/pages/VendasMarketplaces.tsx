import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, ExternalLink,
  ShoppingBag, Camera, FileText, Truck, AlertTriangle, TrendingUp,
  Package, Star, Search, BarChart3, Zap, Shield, Clock, Users,
  Target, MessageSquare, Wrench, ChevronDown, ChevronUp,
  Image, Type, DollarSign, Boxes, Send, HeartHandshake, Megaphone,
  Palette, Bot, BookOpen, Calculator
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const marketplaces = [
  {
    name: "Mercado Livre",
    badge: "LÍDER LATAM",
    desc: "O maior marketplace da América Latina, com alto volume e grande visibilidade.",
    bestFor: "Produtos de alto giro e marcas conhecidas",
    pros: ["Tráfego massivo e alta conversão", "Sistema logístico impecável", "Regras de reputação rígidas"],
    con: "Comissão pode chegar a 17% + frete",
    url: "https://www.mercadolivre.com.br",
    cta: "Acessar Guia ML",
  },
  {
    name: "Shopee",
    badge: "CRESCIMENTO VIRAL",
    desc: "Marketplace popular com foco em preço acessível e frete grátis.",
    bestFor: "Produtos de ticket baixo e volume alto",
    pros: ["Cupons de frete grátis agressivos", "App extremamente viciante", "Competição forte por preço baixo"],
    con: "Público muito sensível a preço",
    url: "https://shopee.com.br",
    cta: "Acessar Guia Shopee",
  },
  {
    name: "Amazon Brasil",
    badge: "PADRÃO GLOBAL",
    desc: "Gigante global com logística própria e forte credibilidade.",
    bestFor: "Produtos premium, eletrônicos e livros",
    pros: ["Público com alto ticket médio", "FBA (Logística Amazon) premium", "Interface de cadastro completa"],
    con: "Regras rigorosas de cadastro e compliance",
    url: "https://www.amazon.com.br",
    cta: "Acessar Guia Amazon",
  },
  {
    name: "Magazine Luiza",
    badge: "FORÇA NACIONAL",
    desc: "Grande varejista brasileira com marketplace integrado.",
    bestFor: "Eletrodomésticos, eletrônicos e casa",
    pros: ["Marca forte no Brasil", "Magalu Entregas integrado", "Suporte ao seller dedicado"],
    con: "Menor volume que ML e Shopee em algumas categorias",
    url: "https://www.magazineluiza.com.br",
    cta: "Acessar Guia Magalu",
  },
];

interface CheckItem {
  id: string;
  label: string;
}

interface StageData {
  title: string;
  icon: React.ReactNode;
  items: CheckItem[];
  tools: { name: string; url: string; icon: React.ReactNode; desc: string }[];
  sophTip: string;
}

const stages: StageData[] = [
  {
    title: "Pré-requisitos e Documentação",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { id: "doc-1", label: "Documentos pessoais (RG/CPF ou CNPJ)" },
      { id: "doc-2", label: "Conta bancária vinculada ao titular" },
      { id: "doc-3", label: "Dados do negócio (nome, endereço, contato)" },
      { id: "doc-4", label: "Produção de fotos (fundo branco e contextualizadas)" },
      { id: "doc-5", label: "Definição de categorias" },
      { id: "doc-6", label: "Cálculo de precificação com margem e taxas" },
    ],
    tools: [
      { name: "Canva", url: "https://www.canva.com", icon: <Palette className="h-4 w-4" />, desc: "Criar artes e imagens para anúncios" },
      { name: "Remove.bg", url: "https://www.remove.bg", icon: <Image className="h-4 w-4" />, desc: "Remover fundo das fotos dos produtos" },
      { name: "Calculadora Sebrae", url: "https://www.sebrae.com.br/sites/PortalSebrae/recursos-online", icon: <Calculator className="h-4 w-4" />, desc: "Calcular preços e margens de lucro" },
      { name: "Google Sheets", url: "https://sheets.google.com", icon: <BarChart3 className="h-4 w-4" />, desc: "Acompanhar estoque e vendas" },
    ],
    sophTip: "Comece organizando seus documentos e calculando suas margens antes de cadastrar qualquer produto.",
  },
  {
    title: "Anúncios de Alta Performance",
    icon: <Megaphone className="h-5 w-5" />,
    items: [
      { id: "ad-1", label: "Título Campeão: [Produto] + [Marca] + [Atributo] + [Diferencial]" },
      { id: "ad-2", label: "Descrição persuasiva e técnica completa" },
      { id: "ad-3", label: "Mapeamento de Palavras-Chave (SEO do Marketplace)" },
      { id: "ad-4", label: "Gestão de Estoque e variação de SKU" },
      { id: "ad-5", label: "Cadastrar variações (cor, tamanho)" },
      { id: "ad-6", label: "Definir preço competitivo" },
      { id: "ad-7", label: "Publicar anúncio otimizado" },
    ],
    tools: [
      { name: "ChatGPT & Claude", url: "https://chat.openai.com", icon: <Bot className="h-4 w-4" />, desc: "Criar títulos e descrições otimizadas" },
      { name: "Canva", url: "https://www.canva.com", icon: <Palette className="h-4 w-4" />, desc: "Design profissional para anúncios" },
      { name: "Remove.bg", url: "https://www.remove.bg", icon: <Image className="h-4 w-4" />, desc: "Fundo limpo para fotos de produto" },
    ],
    sophTip: "Seu anúncio vende melhor quando título, foto e frete conversam entre si.",
  },
  {
    title: "Logística e Expedição",
    icon: <Truck className="h-5 w-5" />,
    items: [
      { id: "log-1", label: "Confirmação de pedidos em até 24h" },
      { id: "log-2", label: "Embalagem segura e profissional" },
      { id: "log-3", label: "Envio no prazo combinado" },
      { id: "log-4", label: "Acompanhamento de entregas" },
      { id: "log-5", label: "Atendimento pós-venda" },
      { id: "log-6", label: "Gestão de reputação e avaliações" },
      { id: "log-7", label: "Controle de estoque atualizado" },
    ],
    tools: [],
    sophTip: "Rapidez no envio e boa embalagem são os maiores geradores de avaliações positivas.",
  },
];

const strategies = [
  { icon: <Search />, title: "SEO do Anúncio", desc: "Usam todas as 60 letras do título com as palavras que o cliente realmente busca.", action: "Pesquise os termos mais buscados no seu nicho" },
  { icon: <Camera />, title: "Fotos Profissionais", desc: "Imagens claras com fundo limpo e contextualizadas convertem até 3x mais.", action: "Tire fotos com luz natural e fundo branco" },
  { icon: <DollarSign />, title: "Preço Competitivo", desc: "Posicione seu preço com inteligência, considerando comissão e frete.", action: "Compare preços dos 5 principais concorrentes" },
  { icon: <Zap />, title: "Promoções Estratégicas", desc: "Participe de campanhas do marketplace para ganhar visibilidade rápida.", action: "Ative promoções nos primeiros 30 dias" },
  { icon: <Boxes />, title: "Estoque Organizado", desc: "Vender sem ter o produto derruba reputação e gera cancelamentos.", action: "Use planilha para controlar entradas e saídas" },
  { icon: <Clock />, title: "Velocidade de Resposta", desc: "Responda perguntas em minutos, não horas. Velocidade gera confiança.", action: "Ative notificações do app do marketplace" },
  { icon: <Star />, title: "Reputação Impecável", desc: "Despacham o produto em menos de 24h para ganhar selo de bom vendedor.", action: "Cuide de cada venda como se fosse a primeira" },
  { icon: <Target />, title: "Anúncios Patrocinados", desc: "Invista em destaque para produtos com boa margem e alto potencial.", action: "Comece com R$10/dia nos seus top 3 produtos" },
  { icon: <ShoppingBag />, title: "Diversificação", desc: "Não dependa de um único marketplace. Distribua risco e alcance.", action: "Cadastre-se em pelo menos 2 plataformas" },
  { icon: <BarChart3 />, title: "Análise de Dados", desc: "Use os relatórios da plataforma para tomar decisões baseadas em números.", action: "Revise métricas semanalmente" },
];

const commonErrors = [
  { icon: <Camera />, title: "Fotos Amadoras", desc: "Fotos escuras ou com poluição visual transmitem desconfiança e diminuem o clique." },
  { icon: <FileText />, title: "Descrição Incompleta", desc: "Falta de informações gera dúvidas e o cliente compra do concorrente." },
  { icon: <DollarSign />, title: "Preço Errado", desc: "Não calcular comissão e frete leva a prejuízo em cada venda." },
  { icon: <Send />, title: "Demora no Envio", desc: "Atrasos derrubam sua reputação rapidamente nos algoritmos." },
  { icon: <MessageSquare />, title: "Atendimento Demorado", desc: "Levar mais de 10 min para responder uma pergunta reduz em 80% a chance de venda." },
  { icon: <Boxes />, title: "Estoque Desorganizado", desc: "Vender sem ter o produto é o erro mais grave em marketplaces." },
  { icon: <Star />, title: "Ignorar Avaliações", desc: "Feedback negativo sem resposta prejudica sua loja publicamente." },
  { icon: <AlertTriangle />, title: "Vender Tudo de Uma Vez", desc: "Comece com poucos produtos e escale com base em dados reais." },
];

const toolsDetailed = [
  {
    category: "Marketplaces",
    items: [
      { name: "Mercado Livre", url: "https://www.mercadolivre.com.br", desc: "Cadastre sua loja no maior marketplace da América Latina", icon: <ShoppingBag className="h-4 w-4" /> },
      { name: "Shopee", url: "https://shopee.com.br", desc: "Comece a vender com frete subsidiado e cupons", icon: <ShoppingBag className="h-4 w-4" /> },
      { name: "Amazon", url: "https://www.amazon.com.br", desc: "Acesse o marketplace global com logística FBA", icon: <ShoppingBag className="h-4 w-4" /> },
      { name: "Magalu", url: "https://www.magazineluiza.com.br", desc: "Venda na plataforma com força de marca nacional", icon: <ShoppingBag className="h-4 w-4" /> },
      { name: "Americanas", url: "https://www.americanas.com.br", desc: "Alcance público diversificado em grande escala", icon: <ShoppingBag className="h-4 w-4" /> },
      { name: "OLX", url: "https://www.olx.com.br", desc: "Venda direta sem comissão e com contato local", icon: <ShoppingBag className="h-4 w-4" /> },
    ],
  },
  {
    category: "Imagem e Design",
    items: [
      { name: "Canva", url: "https://www.canva.com", desc: "Criar artes e imagens profissionais para anúncios", icon: <Palette className="h-4 w-4" /> },
      { name: "Remove.bg", url: "https://www.remove.bg", desc: "Remover fundo das fotos dos produtos automaticamente", icon: <Image className="h-4 w-4" /> },
    ],
  },
  {
    category: "IA e Texto",
    items: [
      { name: "ChatGPT", url: "https://chat.openai.com", desc: "Criar títulos, descrições e textos otimizados com IA", icon: <Bot className="h-4 w-4" /> },
      { name: "Claude", url: "https://claude.ai", desc: "Assistente de IA para estratégia e conteúdo avançado", icon: <Bot className="h-4 w-4" /> },
    ],
  },
  {
    category: "Gestão e Aprendizado",
    items: [
      { name: "Google Sheets", url: "https://sheets.google.com", desc: "Acompanhar estoque, vendas e métricas em planilhas", icon: <BarChart3 className="h-4 w-4" /> },
      { name: "Calculadora Sebrae", url: "https://www.sebrae.com.br/sites/PortalSebrae/recursos-online", desc: "Calcular preços, margens e viabilidade do negócio", icon: <Calculator className="h-4 w-4" /> },
      { name: "Sebrae Cursos", url: "https://www.sebrae.com.br/sites/PortalSebrae/cursosonline", desc: "Cursos gratuitos sobre vendas e empreendedorismo", icon: <BookOpen className="h-4 w-4" /> },
      { name: "ML University", url: "https://universidade.mercadolivre.com.br", desc: "Treinamentos oficiais do Mercado Livre para sellers", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
];

export default function VendasMarketplacesPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openStages, setOpenStages] = useState<Record<number, boolean>>({ 0: true });

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  const totalItems = stages.reduce((a, s) => a + s.items.length, 0);
  const doneItems = Object.values(checked).filter(Boolean).length;
  const progressPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const stageProgress = (idx: number) => {
    const s = stages[idx];
    const done = s.items.filter((i) => checked[i.id]).length;
    return { done, total: s.items.length, pct: s.items.length > 0 ? Math.round((done / s.items.length) * 100) : 0 };
  };

  const getStageStatus = (idx: number) => {
    const sp = stageProgress(idx);
    if (sp.done === sp.total) return "done";
    if (sp.done > 0) return "active";
    // If previous stage is done, this is next
    if (idx === 0) return "active";
    const prevSp = stageProgress(idx - 1);
    if (prevSp.done === prevSp.total) return "active";
    return "pending";
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-12 pb-20">
      {/* BACK */}
      <Link to="/vendas" className="inline-flex items-center gap-2 text-white text-sm hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Vendas e Presença
      </Link>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gradient-primary inline-block">
          MÓDULO ESTRATÉGICO
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          <span className="text-white">Como vender em{" "}</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)",
            }}
          >
            Marketplaces
          </span>
          <span className="text-white">{" "}com a Soph</span>
        </h1>
        <p className="text-white text-base lg:text-lg max-w-2xl leading-relaxed">
          Aprenda a estruturar sua operação, cadastrar produtos, anunciar melhor e vender em marketplaces como Mercado Livre, Shopee e Amazon.
        </p>

        {/* Marketplace buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "🛒", name: "Mercado Livre" },
            { icon: "🛍️", name: "Shopee" },
            { icon: "📦", name: "Amazon" },
            { icon: "🏪", name: "Magalu" },
            { icon: "🏬", name: "Americanas" },
            { icon: "📱", name: "OLX" },
          ].map((m) => (
            <span
              key={m.name}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white border border-primary/30 bg-gradient-primary-soft transition-all cursor-default"
            >
              {m.icon} {m.name}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#etapas"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground transition-all hover:brightness-110"
          >
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#ferramentas"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-white/20 text-white hover:border-primary/60 transition-colors"
          >
            <Wrench className="h-4 w-4" /> Ver ferramentas
          </a>
        </div>
      </motion.div>

      {/* PROGRESS TIMELINE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} id="etapas" className="space-y-6">
        {/* Progress bar */}
        <div className="rounded-2xl border border-border p-6 space-y-5" style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Progresso da Jornada</h2>
            <span className="text-white text-base font-bold">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-3 bg-muted" />

          {/* Timeline steps */}
          <div className="relative flex items-start justify-between pt-4">
            {/* Connecting line */}
            <div className="absolute top-[2.25rem] left-[calc(16.66%)] right-[calc(16.66%)] h-0.5 bg-border" />
            <div
              className="absolute top-[2.25rem] left-[calc(16.66%)] h-0.5 transition-all duration-500"
              style={{
                background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)",
                width: progressPct >= 100
                  ? "calc(66.66%)"
                  : stageProgress(0).done === stageProgress(0).total && stageProgress(1).done === stageProgress(1).total
                    ? "calc(66.66%)"
                    : stageProgress(0).done === stageProgress(0).total
                      ? "calc(33.33%)"
                      : "0%",
              }}
            />

            {stages.map((s, i) => {
              const status = getStageStatus(i);
              const sp = stageProgress(i);
              return (
                <div key={i} className="flex flex-col items-center text-center flex-1 relative z-10">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-base font-bold mb-3 border-2 transition-all ${
                      status === "done"
                        ? "border-primary/50 bg-gradient-primary-btn text-primary-foreground"
                        : status === "active"
                          ? "border-primary/30 bg-gradient-primary-soft text-white shadow-glow-sm"
                          : "border-border bg-card text-white/60"
                    }`}
                  >
                    {status === "done" ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <p className={`text-sm font-bold mb-1 ${status === "pending" ? "text-white/60" : "text-white"}`}>
                    {s.title}
                  </p>
                  <p className={`text-xs ${status === "pending" ? "text-white/40" : "text-white"}`}>
                    {sp.done}/{sp.total}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ONDE VENDER */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-white">Onde começar a vender?</h2>
          <span className="text-xs text-white font-medium hidden md:block">Deslize para ver todos →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {marketplaces.map((mp) => (
            <motion.div
              key={mp.name}
              variants={item}
              className="rounded-2xl border border-border p-6 hover:border-primary/40 transition-all space-y-4 flex flex-col"
              style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <span
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-primary-soft text-white border border-primary/20"
                >
                  {mp.badge}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">{mp.name}</h3>
              <ul className="space-y-2 flex-1">
                {mp.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-white text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-gradient-primary-btn" />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href={mp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground transition-all hover:brightness-110 mt-auto"
              >
                {mp.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ETAPAS / CHECKLISTS */}
      <div className="space-y-5">
        <h2 className="font-display font-bold text-2xl text-white">Etapas da Jornada</h2>
        {stages.map((stage, idx) => {
          const sp = stageProgress(idx);
          const isOpen = openStages[idx] ?? false;
          const status = getStageStatus(idx);
          return (
            <Collapsible key={idx} open={isOpen} onOpenChange={(v) => setOpenStages((p) => ({ ...p, [idx]: v }))}>
              <CollapsibleTrigger asChild>
                <button className="w-full rounded-2xl border border-border p-5 hover:border-primary/30 transition-all text-left" style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-primary-soft text-white border border-primary/20"
                      >
                        ETAPA {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display font-bold text-base text-white">{stage.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-semibold">{sp.done}/{sp.total}</span>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-2xl border border-border border-t-0 rounded-t-none p-6 space-y-5 -mt-2" style={{ background: "linear-gradient(180deg, #0A192F 0%, #102A43 100%)" }}>
                  {/* Checklist */}
                  <div className="space-y-1">
                    {stage.items.map((ci) => (
                      <button key={ci.id} onClick={() => toggle(ci.id)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked[ci.id]
                              ? "border-primary/40 bg-gradient-primary-btn"
                              : "border-white/40 bg-transparent"
                          }`}
                        >
                          {checked[ci.id] && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                        </div>
                        <span className={`text-sm font-medium ${checked[ci.id] ? "text-white/50 line-through" : "text-white"}`}>{ci.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tools */}
                  {stage.tools.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" style={{ color: "#00EFFF" }} />
                        <p className="text-white text-sm font-bold">Ferramentas Úteis</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stage.tools.map((t) => (
                          <a
                            key={t.name}
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors"
                            style={{ background: "rgba(16, 42, 67, 0.6)" }}
                          >
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn text-primary-foreground">
                              <span>{t.icon}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-sm font-bold">{t.name}</p>
                              <p className="text-white text-xs truncate">{t.desc}</p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-white flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soph tip */}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-gradient-primary-soft">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gradient-primary inline-block">DICA DA SOPH</p>
                      <p className="text-white text-sm leading-relaxed">{stage.sophTip}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* ESTRATÉGIAS */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "#00EFFF" }} />
          <h2 className="font-display font-bold text-2xl text-white">Estratégias para Vencer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Top sellers */}
          <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: "#00EFFF" }} />
              <h3 className="font-display font-bold text-lg text-white">O que os Top Sellers fazem</h3>
            </div>
            <div className="space-y-3">
              {strategies.slice(0, 5).map((s) => (
                <div key={s.title} className="p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-all">
                  <h4 className="font-bold text-sm text-gradient-primary inline-block mb-1">{s.title}</h4>
                  <p className="text-white text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Errors that kill sales */}
          <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h3 className="font-display font-bold text-lg text-white">Erros que matam suas vendas</h3>
            </div>
            <div className="space-y-3">
              {commonErrors.slice(0, 5).map((e) => (
                <div key={e.title} className="p-3 rounded-xl border border-border/50 hover:border-yellow-500/20 transition-all">
                  <h4 className="font-bold text-sm text-yellow-400 mb-1">{e.title}</h4>
                  <p className="text-white text-sm leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fraud warning */}
        <div className="rounded-xl border border-yellow-500/30 p-5 flex items-start gap-3" style={{ background: "rgba(234, 179, 8, 0.05)" }}>
          <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display font-bold text-base text-white mb-1">Cuidado com fraudes</h4>
            <p className="text-white text-sm leading-relaxed">
              Desconfie de propostas fora da plataforma, links suspeitos e pedidos de pagamento externo. Venda sempre pelo canal oficial do marketplace.
            </p>
          </div>
        </div>
      </motion.div>

      {/* FERRAMENTAS ÚTEIS */}
      <div className="space-y-6" id="ferramentas">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5" style={{ color: "#00EFFF" }} />
          <h2 className="font-display font-bold text-2xl text-white">Ferramentas Úteis</h2>
        </div>
        {toolsDetailed.map((sec) => (
          <div key={sec.category} className="space-y-3">
            <h3 className="font-display font-bold text-base text-gradient-primary inline-block">{sec.category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sec.items.map((t) => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 transition-all group"
                  style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn text-primary-foreground">
                    <span>{t.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-bold">{t.name}</p>
                    <p className="text-white text-xs leading-relaxed">{t.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PRONTO PARA COMEÇAR - CTA FINAL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-[#00EFFF]/25 p-8 text-center space-y-5"
        style={{ background: "linear-gradient(135deg, #102A43 0%, #0A192F 100%)" }}
      >
        <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-white">Pronto para começar?</h2>
        <p className="text-white text-base max-w-lg mx-auto leading-relaxed">
          Você está a um passo de colocar seu negócio no radar de milhões de compradores.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="#etapas"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#0A192F] transition-all hover:opacity-90 shadow-[0_0_20px_-4px_rgba(0,239,255,0.4)]"
            style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
          >
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/vendas"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:border-white/60 transition-colors"
          >
            Voltar para Vendas
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 pt-4">
          {[
            { value: "45min", label: "TEMPO MÉDIO" },
            { value: "8", label: "AULAS EM VÍDEO" },
            { value: "03", label: "CHECKLISTS PDF" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-extrabold text-2xl text-gradient-primary">{stat.value}</p>
              <p className="text-white text-[10px] font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
