import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, ExternalLink,
  ShoppingBag, Camera, FileText, Truck, AlertTriangle, TrendingUp,
  Package, Star, Search, BarChart3, Zap, Shield, Clock, Users,
  Target, MessageSquare, Wrench, CalendarDays, ChevronDown, ChevronUp,
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
    desc: "O maior marketplace da América Latina, com alto volume e grande visibilidade.",
    bestFor: "Produtos de alto giro e marcas conhecidas",
    pros: ["Alto tráfego", "Mercado Envios integrado", "Programa de reputação"],
    con: "Comissão pode chegar a 17% + frete",
    url: "https://www.mercadolivre.com.br",
  },
  {
    name: "Shopee",
    desc: "Marketplace popular com foco em preço acessível e frete grátis.",
    bestFor: "Produtos de ticket baixo e volume alto",
    pros: ["Frete grátis subsidiado", "Cupons e promoções", "Crescimento acelerado"],
    con: "Público muito sensível a preço",
    url: "https://shopee.com.br",
  },
  {
    name: "Amazon",
    desc: "Gigante global com logística própria e forte credibilidade.",
    bestFor: "Produtos premium, eletrônicos e livros",
    pros: ["FBA (Fulfillment by Amazon)", "Prime", "Confiança do consumidor"],
    con: "Regras rigorosas de cadastro e compliance",
    url: "https://www.amazon.com.br",
  },
  {
    name: "Magazine Luiza",
    desc: "Grande varejista brasileira com marketplace integrado.",
    bestFor: "Eletrodomésticos, eletrônicos e casa",
    pros: ["Marca forte", "Magalu Entregas", "Suporte ao seller"],
    con: "Menor volume que ML e Shopee em algumas categorias",
    url: "https://www.magazineluiza.com.br",
  },
  {
    name: "Americanas / B2W",
    desc: "Plataforma tradicional com público fiel e grande alcance.",
    bestFor: "Variedade de categorias e público diversificado",
    pros: ["Base de clientes grande", "Estrutura logística", "Promoções frequentes"],
    con: "Processo de onboarding pode ser mais burocrático",
    url: "https://www.americanas.com.br",
  },
  {
    name: "OLX / Facebook",
    desc: "Plataformas de venda direta, sem intermediário logístico.",
    bestFor: "Produtos usados, locais e de nicho",
    pros: ["Sem comissão (OLX)", "Contato direto", "Fácil de começar"],
    con: "Sem estrutura logística ou proteção ao vendedor",
    url: "https://www.olx.com.br",
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
  tools: { name: string; url: string; icon: React.ReactNode }[];
  sophTip: string;
}

const stages: StageData[] = [
  {
    title: "Pré-requisitos e Documentação",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { id: "doc-1", label: "Documentos pessoais (RG/CPF ou CNPJ)" },
      { id: "doc-2", label: "Conta bancária vinculada" },
      { id: "doc-3", label: "Dados do negócio (nome, endereço, contato)" },
      { id: "doc-4", label: "Informações básicas dos produtos" },
      { id: "doc-5", label: "Definição de categorias" },
      { id: "doc-6", label: "Imagens e fotos dos produtos" },
      { id: "doc-7", label: "Cálculo de preço e margem" },
    ],
    tools: [
      { name: "Canva", url: "https://www.canva.com", icon: <Palette className="h-4 w-4" /> },
      { name: "Remove.bg", url: "https://www.remove.bg", icon: <Image className="h-4 w-4" /> },
      { name: "Calculadora Sebrae", url: "https://www.sebrae.com.br/sites/PortalSebrae/recursos-online", icon: <Calculator className="h-4 w-4" /> },
      { name: "Google Sheets", url: "https://sheets.google.com", icon: <BarChart3 className="h-4 w-4" /> },
    ],
    sophTip: "Comece organizando seus documentos e calculando suas margens antes de cadastrar qualquer produto.",
  },
  {
    title: "Anúncios de Alta Performance",
    icon: <Megaphone className="h-5 w-5" />,
    items: [
      { id: "ad-1", label: "Criar título campeão com palavras-chave" },
      { id: "ad-2", label: "Escrever descrição clara e completa" },
      { id: "ad-3", label: "Usar palavras-chave estratégicas" },
      { id: "ad-4", label: "Organizar fotos profissionais" },
      { id: "ad-5", label: "Cadastrar variações (cor, tamanho)" },
      { id: "ad-6", label: "Definir preço competitivo" },
      { id: "ad-7", label: "Revisar estoque disponível" },
      { id: "ad-8", label: "Publicar anúncio otimizado" },
    ],
    tools: [
      { name: "ChatGPT", url: "https://chat.openai.com", icon: <Bot className="h-4 w-4" /> },
      { name: "Claude", url: "https://claude.ai", icon: <Bot className="h-4 w-4" /> },
      { name: "Canva", url: "https://www.canva.com", icon: <Palette className="h-4 w-4" /> },
      { name: "Remove.bg", url: "https://www.remove.bg", icon: <Image className="h-4 w-4" /> },
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
  { icon: <Search />, title: "SEO do anúncio", desc: "Use palavras-chave que o cliente realmente busca." },
  { icon: <Camera />, title: "Fotos profissionais", desc: "Imagens claras e com fundo limpo vendem mais." },
  { icon: <DollarSign />, title: "Preço competitivo", desc: "Pesquise concorrentes e posicione com inteligência." },
  { icon: <Zap />, title: "Promoções", desc: "Participe de campanhas do marketplace para ganhar visibilidade." },
  { icon: <Boxes />, title: "Estoque organizado", desc: "Evite vender o que não tem e perder reputação." },
  { icon: <Clock />, title: "Velocidade de resposta", desc: "Responda perguntas em minutos, não horas." },
  { icon: <Star />, title: "Reputação", desc: "Cuide de cada venda como se fosse a primeira." },
  { icon: <Target />, title: "Anúncios patrocinados", desc: "Invista em destaque para produtos com boa margem." },
  { icon: <ShoppingBag />, title: "Diversificação", desc: "Não dependa de um único marketplace." },
  { icon: <BarChart3 />, title: "Análise de dados", desc: "Use os relatórios da plataforma para decidir melhor." },
];

const commonErrors = [
  { icon: <Camera />, title: "Fotos ruins", desc: "Imagens escuras, tremidas ou com fundo sujo afastam compradores." },
  { icon: <FileText />, title: "Descrição incompleta", desc: "Falta de informações gera dúvidas e perda de vendas." },
  { icon: <DollarSign />, title: "Preço errado", desc: "Não calcular comissão e frete leva a prejuízo." },
  { icon: <Send />, title: "Demora no envio", desc: "Atrasos derrubam sua reputação rapidamente." },
  { icon: <MessageSquare />, title: "Atendimento ruim", desc: "Ignorar perguntas é perder vendas garantidas." },
  { icon: <Boxes />, title: "Estoque desorganizado", desc: "Vender sem ter o produto é o erro mais grave." },
  { icon: <Star />, title: "Ignorar avaliações", desc: "Feedback negativo sem resposta prejudica sua loja." },
  { icon: <AlertTriangle />, title: "Vender tudo de uma vez", desc: "Comece com poucos produtos e escale com dados." },
];

const toolsSections = [
  {
    category: "Marketplaces",
    tools: [
      { name: "Mercado Livre", url: "https://www.mercadolivre.com.br" },
      { name: "Shopee", url: "https://shopee.com.br" },
      { name: "Amazon", url: "https://www.amazon.com.br" },
      { name: "Magalu", url: "https://www.magazineluiza.com.br" },
      { name: "Americanas", url: "https://www.americanas.com.br" },
      { name: "OLX", url: "https://www.olx.com.br" },
    ],
  },
  {
    category: "Imagem e Design",
    tools: [
      { name: "Canva", url: "https://www.canva.com" },
      { name: "Remove.bg", url: "https://www.remove.bg" },
    ],
  },
  {
    category: "IA e Texto",
    tools: [
      { name: "ChatGPT", url: "https://chat.openai.com" },
      { name: "Claude", url: "https://claude.ai" },
    ],
  },
  {
    category: "Gestão e Aprendizado",
    tools: [
      { name: "Google Sheets", url: "https://sheets.google.com" },
      { name: "Sebrae Cursos", url: "https://www.sebrae.com.br/sites/PortalSebrae/cursosonline" },
      { name: "Mercado Livre University", url: "https://universidade.mercadolivre.com.br" },
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
    return { done, total: s.items.length };
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10 pb-20">
      {/* BACK */}
      <Link to="/vendas" className="inline-flex items-center gap-2 text-white text-sm hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Vendas e Presença
      </Link>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Como vender em </span>
          <span className="text-primary">Marketplaces</span>
        </h1>
        <p className="text-white text-sm lg:text-base max-w-2xl leading-relaxed">
          Aprenda a estruturar sua operação, cadastrar produtos, anunciar melhor e vender em marketplaces como Mercado Livre, Shopee e Amazon.
        </p>

        {/* Marketplace chips */}
        <div className="flex flex-wrap gap-2">
          {["Mercado Livre", "Shopee", "Amazon", "Magalu", "Americanas", "OLX"].map((m) => (
            <span key={m} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card border border-border text-white">
              {m}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <a href="#etapas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-primary-foreground" style={{ background: "linear-gradient(90deg, hsl(180 100% 24%) 0%, hsl(180 100% 50%) 100%)" }}>
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#ferramentas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/30 text-white hover:border-primary/60 transition-colors">
            <Wrench className="h-4 w-4" /> Ver ferramentas
          </a>
        </div>
      </motion.div>

      {/* PROGRESS BAR */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border p-5 bg-card space-y-3" id="etapas">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-white">Progresso da Jornada</h2>
          <span className="text-white text-sm font-semibold">{doneItems}/{totalItems} etapas · {progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2.5 bg-muted" />
        <div className="grid grid-cols-3 gap-3 pt-1">
          {stages.map((s, i) => {
            const sp = stageProgress(i);
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary/20 text-primary flex-shrink-0">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{s.title}</p>
                  <p className="text-white text-[11px]">{sp.done}/{sp.total}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* SOPH HERO TIP */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-primary/20 p-5 bg-card">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-white">Soph recomenda</h3>
            <p className="text-white text-sm leading-relaxed">
              "Comece pela Shopee se quiser validar mais rápido. Ela tem menor barreira de entrada e frete subsidiado para novos sellers."
            </p>
          </div>
        </div>
      </motion.div>

      {/* ONDE VENDER */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Onde vender?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaces.map((mp) => (
            <motion.div key={mp.name} variants={item} className="rounded-2xl border border-border p-5 bg-card hover:border-primary/30 transition-all space-y-3">
              <h3 className="font-display font-bold text-base text-white">{mp.name}</h3>
              <p className="text-white text-sm leading-relaxed">{mp.desc}</p>
              <div className="text-white text-xs"><span className="font-semibold text-primary">Melhor para:</span> {mp.bestFor}</div>
              <ul className="space-y-1">
                {mp.pros.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-white text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-white text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" /> {mp.con}
              </div>
              <a href={mp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary text-xs font-semibold hover:underline">
                Acessar plataforma <ExternalLink className="h-3 w-3" />
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ETAPAS / CHECKLISTS */}
      <div className="space-y-5">
        <h2 className="font-display font-bold text-xl text-white">Etapas da Jornada</h2>
        {stages.map((stage, idx) => {
          const sp = stageProgress(idx);
          const isOpen = openStages[idx] ?? false;
          return (
            <Collapsible key={idx} open={isOpen} onOpenChange={(v) => setOpenStages((p) => ({ ...p, [idx]: v }))}>
              <CollapsibleTrigger asChild>
                <button className="w-full rounded-2xl border border-border p-5 bg-card hover:border-primary/30 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground flex-shrink-0">
                        {stage.icon}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white">Etapa {idx + 1}: {stage.title}</h3>
                        <p className="text-white text-xs">{sp.done}/{sp.total} concluídos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={sp.total > 0 ? (sp.done / sp.total) * 100 : 0} className="w-20 h-2 bg-muted" />
                      {isOpen ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-2xl border border-border border-t-0 rounded-t-none p-5 bg-card space-y-4 -mt-2">
                  {/* Checklist */}
                  <div className="space-y-2">
                    {stage.items.map((ci) => (
                      <button key={ci.id} onClick={() => toggle(ci.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left">
                        {checked[ci.id] ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-white flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${checked[ci.id] ? "text-primary line-through" : "text-white"}`}>{ci.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Soph tip */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-primary/10">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-white text-xs leading-relaxed">
                      <span className="font-semibold text-primary">Soph:</span> {stage.sophTip}
                    </p>
                  </div>

                  {/* Tools */}
                  {stage.tools.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-white text-xs font-semibold">Ferramentas úteis:</p>
                      <div className="flex flex-wrap gap-2">
                        {stage.tools.map((t) => (
                          <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border text-white text-xs font-medium hover:border-primary/40 transition-colors">
                            {t.icon} {t.name} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* ESTRATÉGIAS */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-xl text-white">Estratégias para Vender Mais</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {strategies.map((s) => (
            <motion.div key={s.title} variants={item} className="rounded-xl border border-border p-4 bg-card hover:border-primary/30 transition-all">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary text-primary-foreground mb-2">
                {s.icon}
              </div>
              <h4 className="font-display font-bold text-sm text-white mb-1">{s.title}</h4>
              <p className="text-white text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ERROS COMUNS */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h2 className="font-display font-bold text-xl text-white">Erros Comuns para Evitar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonErrors.map((e) => (
            <motion.div key={e.title} variants={item} className="rounded-xl border border-border p-4 bg-card flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-destructive/20 text-destructive flex-shrink-0">
                {e.icon}
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white mb-0.5">{e.title}</h4>
                <p className="text-white text-xs leading-relaxed">{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-xl border border-yellow-500/30 p-4 bg-yellow-500/5 flex items-start gap-3">
          <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-0.5">Cuidado com fraudes</h4>
            <p className="text-white text-xs leading-relaxed">
              Desconfie de propostas fora da plataforma, links suspeitos e pedidos de pagamento externo. Venda sempre pelo canal oficial do marketplace.
            </p>
          </div>
        </div>
      </motion.div>

      {/* FERRAMENTAS */}
      <div className="space-y-4" id="ferramentas">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-xl text-white">Ferramentas Úteis</h2>
        </div>
        {toolsSections.map((sec) => (
          <div key={sec.category} className="space-y-2">
            <h3 className="font-display font-semibold text-sm text-primary">{sec.category}</h3>
            <div className="flex flex-wrap gap-2">
              {sec.tools.map((t) => (
                <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm font-medium hover:border-primary/40 transition-colors">
                  {t.name} <ExternalLink className="h-3.5 w-3.5 text-primary" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PRÓXIMOS PASSOS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Próximos Passos</h2>

        <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Checklist de Lançamento
              </h3>
              <ul className="space-y-1.5 text-white text-xs">
                <li className="flex items-center gap-2"><Circle className="h-3 w-3 text-white flex-shrink-0" /> Escolher 1-2 marketplaces para começar</li>
                <li className="flex items-center gap-2"><Circle className="h-3 w-3 text-white flex-shrink-0" /> Cadastrar os 5 primeiros produtos</li>
                <li className="flex items-center gap-2"><Circle className="h-3 w-3 text-white flex-shrink-0" /> Monitorar métricas na primeira semana</li>
                <li className="flex items-center gap-2"><Circle className="h-3 w-3 text-white flex-shrink-0" /> Ajustar preços e fotos com base nos dados</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Cronograma de 30 dias
              </h3>
              <ul className="space-y-1.5 text-white text-xs">
                <li><span className="font-semibold text-primary">Semana 1:</span> Documentação + cadastro na plataforma</li>
                <li><span className="font-semibold text-primary">Semana 2:</span> Primeiros anúncios publicados</li>
                <li><span className="font-semibold text-primary">Semana 3:</span> Otimizar títulos, fotos e preços</li>
                <li><span className="font-semibold text-primary">Semana 4:</span> Avaliar resultados e escalar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Soph final */}
        <div className="rounded-2xl border border-primary/20 p-5 bg-card">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-white">Quer que a Soph te ajude?</h3>
              <p className="text-white text-sm leading-relaxed">
                "Posso te ajudar a escolher o primeiro marketplace, montar seus anúncios e acompanhar seus resultados. É só pedir."
              </p>
              <Link to="/soph" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-primary-foreground" style={{ background: "linear-gradient(90deg, hsl(180 100% 24%) 0%, hsl(180 100% 50%) 100%)" }}>
                Falar com a Soph <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/vendas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-border text-white hover:border-primary/40 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar para Vendas
          </Link>
          <a href="#etapas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-primary-foreground" style={{ background: "linear-gradient(90deg, hsl(180 100% 24%) 0%, hsl(180 100% 50%) 100%)" }}>
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
