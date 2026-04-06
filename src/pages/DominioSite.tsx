import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, ExternalLink,
  Globe, Server, Search, Shield, Zap, Clock, Users, TrendingUp,
  ChevronDown, ChevronUp, Star, Eye, ShoppingBag, Award,
  Lightbulb, Wrench, BookOpen, MousePointerClick, FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

/* ───── data ───── */

const journeySteps = [
  { id: 1, title: "Entender domínio e hospedagem", key: "entender" },
  { id: 2, title: "Escolher nome e registrar domínio", key: "nome" },
  { id: 3, title: "Criar o site com IA", key: "criar" },
  { id: 4, title: "Otimizar e publicar", key: "otimizar" },
];

const whyCards = [
  { icon: <Globe className="h-5 w-5" />, title: "Presença profissional online", desc: "Seu negócio visível 24 horas para qualquer pessoa no mundo. Um site é seu cartão de visitas digital." },
  { icon: <ShoppingBag className="h-5 w-5" />, title: "Vendas 24/7", desc: "Enquanto você dorme, seu site continua vendendo. Automatize seu funil e escale sem limites de horário." },
  { icon: <Award className="h-5 w-5" />, title: "Credibilidade e confiança", desc: "Clientes confiam mais em negócios com site próprio. Um domínio profissional transmite seriedade." },
];

const checklistData: Record<string, { label: string }[]> = {
  entender: [
    { label: "Entender o que é domínio" },
    { label: "Entender o que é hospedagem" },
    { label: "Conhecer as terminações principais" },
    { label: "Escolher entre .com.br e .com" },
  ],
  nome: [
    { label: "Definir 3 opções de nome" },
    { label: "Validar se o nome é curto e fácil" },
    { label: "Evitar hífens, números e nomes confusos" },
    { label: "Verificar disponibilidade" },
    { label: "Escolher onde registrar" },
    { label: "Registrar o domínio" },
  ],
  criar: [
    { label: "Escolher plataforma" },
    { label: "Criar conta" },
    { label: "Definir tipo de site" },
    { label: "Usar IA ou template" },
    { label: "Editar textos" },
    { label: "Trocar imagens" },
    { label: "Inserir contatos" },
    { label: "Criar páginas essenciais" },
    { label: "Conectar domínio" },
    { label: "Publicar" },
  ],
  otimizar: [
    { label: "Criar título do site" },
    { label: "Escrever meta description" },
    { label: "Escolher palavras-chave" },
    { label: "Nomear imagens corretamente" },
    { label: "Criar links internos" },
    { label: "Testar velocidade" },
    { label: "Revisar versão mobile" },
    { label: "Cadastrar Google Meu Negócio" },
    { label: "Acessar Google Search Console" },
  ],
};

const platforms = [
  {
    name: "Wix",
    bestFor: "Quem quer visual profissional sem programar",
    ease: "Muito fácil",
    features: "Editor drag-and-drop, IA para gerar site, loja integrada",
    free: "Sim, com marca Wix",
    limitation: "Domínio próprio só no plano pago",
    url: "https://www.wix.com",
  },
  {
    name: "Google Sites",
    bestFor: "Sites simples e portfólios rápidos",
    ease: "Extremamente fácil",
    features: "Integração com Google Drive, totalmente gratuito",
    free: "Sim, 100% grátis",
    limitation: "Poucas opções de personalização",
    url: "https://sites.google.com",
  },
  {
    name: "WordPress.com",
    bestFor: "Blogs, sites completos e lojas robustas",
    ease: "Moderado",
    features: "Milhares de plugins e temas, SEO avançado",
    free: "Sim, com marca WordPress",
    limitation: "Curva de aprendizado maior",
    url: "https://wordpress.com",
  },
  {
    name: "Canva Sites",
    bestFor: "Landing pages e sites visuais rápidos",
    ease: "Muito fácil",
    features: "Templates visuais prontos, edição intuitiva",
    free: "Sim, com limitações",
    limitation: "Funcionalidades limitadas para e-commerce",
    url: "https://www.canva.com/websites",
  },
];

const terminacoes = [
  { ext: ".com.br", desc: "Ideal para negócios brasileiros. Transmite confiança local." },
  { ext: ".com", desc: "Padrão global. Boa opção para marcas internacionais." },
  { ext: ".net.br", desc: "Alternativa quando .com.br não está disponível." },
  { ext: ".blog.br", desc: "Perfeito para blogs e conteúdo editorial." },
];

const domainTools = [
  { name: "Registro.br", desc: "Registrador oficial de domínios .br no Brasil.", url: "https://registro.br" },
  { name: "Hostinger", desc: "Verificação rápida de disponibilidade e registro acessível.", url: "https://www.hostinger.com.br/verificar-dominio" },
  { name: "GoDaddy", desc: "Maior registrador global com ampla variedade de extensões.", url: "https://www.godaddy.com/pt-br/dominio/pesquisa-de-dominio" },
];

const seoTools = [
  { name: "Google Keyword Planner", desc: "Descubra as melhores palavras-chave para seu nicho.", purpose: "Pesquisa de palavras-chave", url: "https://ads.google.com/intl/pt-BR_br/home/tools/keyword-planner/" },
  { name: "PageSpeed Insights", desc: "Teste a velocidade do seu site e receba recomendações.", purpose: "Análise de performance", url: "https://pagespeed.web.dev/" },
  { name: "Google Meu Negócio", desc: "Cadastre sua empresa para aparecer no Google Maps.", purpose: "Presença local", url: "https://www.google.com/intl/pt-BR_br/business/" },
  { name: "Google Search Console", desc: "Monitore como seu site aparece nos resultados de busca.", purpose: "Indexação e SEO", url: "https://search.google.com/search-console" },
];

const toolGroups = [
  {
    title: "Domínio",
    items: [
      { name: "Registro.br", desc: "Registrador oficial de domínios .br", purpose: "Registro de domínio .br", url: "https://registro.br" },
      { name: "Hostinger", desc: "Registro e hospedagem acessível", purpose: "Domínio + hospedagem", url: "https://www.hostinger.com.br" },
      { name: "GoDaddy", desc: "Maior registrador global", purpose: "Registro de domínio global", url: "https://www.godaddy.com" },
    ],
  },
  {
    title: "Criação de site",
    items: [
      { name: "Wix", desc: "Editor visual com IA integrada", purpose: "Criar site profissional", url: "https://www.wix.com" },
      { name: "Google Sites", desc: "Totalmente gratuito e simples", purpose: "Sites simples e portfólios", url: "https://sites.google.com" },
      { name: "WordPress.com", desc: "Plataforma completa com plugins", purpose: "Sites robustos e blogs", url: "https://wordpress.com" },
      { name: "Canva Sites", desc: "Templates visuais prontos", purpose: "Landing pages rápidas", url: "https://www.canva.com/websites" },
    ],
  },
  {
    title: "SEO e presença local",
    items: seoTools,
  },
];

/* ───── component ───── */

export default function DominioSitePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ entender: true });

  const toggle = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }));
  const toggleStep = (key: string) => setOpenSteps((p) => ({ ...p, [key]: !p[key] }));

  const totalItems = Object.values(checklistData).flat().length;
  const doneItems = Object.keys(checked).filter((k) => checked[k]).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  const stepProgress = (key: string) => {
    const items = checklistData[key];
    const done = items.filter((_, i) => checked[`${key}-${i}`]).length;
    return { done, total: items.length };
  };

  const chips = ["Domínio", "Hospedagem", "Wix", "Google Sites", "WordPress", "Canva Sites"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 sm:space-y-10">
      {/* NAV */}
      <Link to="/vendas" className="inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Vendas e Presença
      </Link>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Como Criar seu </span>
          <span className="text-gradient-primary inline-block">Domínio e Site</span>
          <br />
          <span className="text-white">com a Soph</span>
        </h1>
        <p className="text-white text-sm lg:text-base max-w-2xl leading-relaxed">
          Tenha sua presença digital profissional. Aprenda a criar seu site e domínio próprio usando ferramentas gratuitas e inteligência artificial.
        </p>

        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full text-xs font-semibold border border-primary/30 text-white bg-primary/10">{c}</span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </button>
          <a href="#ferramentas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/5 transition-all">
            Ver ferramentas <Wrench className="h-4 w-4" />
          </a>
        </div>

      </motion.div>

      {/* PROGRESSO GERAL */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-primary/20 p-6 bg-gradient-card space-y-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-80" style={{ position: "relative" }} />
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">Progresso da Jornada</h2>
          <span className="text-gradient-primary text-sm font-bold">{doneItems}/{totalItems} concluídos</span>
        </div>
        <Progress value={pct} className="h-3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {journeySteps.map((s) => {
            const sp = stepProgress(s.key);
            return (
              <div key={s.key} className="rounded-xl border border-border/60 p-3 bg-muted/20 text-center">
                <p className="text-white text-xs font-semibold mb-1">{s.title}</p>
                <p className="text-gradient-primary text-xs font-bold">{sp.done}/{sp.total}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* POR QUE SEU NEGÓCIO PRECISA DE UM SITE */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Por que seu negócio precisa de um site?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {whyCards.map((c) => (
            <motion.div key={c.title} variants={item} className="rounded-xl border border-border/60 p-5 bg-gradient-card hover:border-primary/30 transition-all">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
                {c.icon}
              </div>
              <h4 className="font-display font-bold text-sm text-white mb-1.5">{c.title}</h4>
              <p className="text-white text-xs leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
        {/* Soph insight */}
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Insight da Soph:</span> "93% dos consumidores pesquisam online antes de comprar. Sem um site, você está invisível para a maioria dos seus potenciais clientes."
          </p>
        </div>
      </motion.div>

      {/* ETAPA 1 — ENTENDER DOMÍNIO E HOSPEDAGEM */}
      <StepSection
        stepKey="entender"
        number={1}
        title="Entender Domínio e Hospedagem"
        open={!!openSteps.entender}
        onToggle={() => toggleStep("entender")}
        progress={stepProgress("entender")}
        checked={checked}
        onCheck={toggle}
      >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Domínio = Endereço</h4>
            <p className="text-white text-xs leading-relaxed">
              O domínio é o endereço que as pessoas digitam no navegador para encontrar seu site. Exemplo: <span className="font-bold text-gradient-primary">www.suamarca.com.br</span>
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <Server className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Hospedagem = Loja Física</h4>
            <p className="text-white text-xs leading-relaxed">
              A hospedagem é o espaço onde seu site fica armazenado. É como o ponto comercial onde tudo funciona — seus arquivos, imagens e páginas.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3">Terminações de domínio</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {terminacoes.map((t) => (
              <div key={t.ext} className="rounded-lg border border-border/60 p-3 bg-muted/20 text-center">
                <p className="text-gradient-primary text-sm font-bold mb-1">{t.ext}</p>
                <p className="text-white text-[11px] leading-snug">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Soph diz:</span> "Para a maioria dos negócios brasileiros, o .com.br é a melhor escolha. Transmite confiança e é fácil de lembrar."
          </p>
        </div>
      </StepSection>

      {/* ETAPA 2 — ESCOLHER NOME E REGISTRAR */}
      <StepSection
        stepKey="nome"
        number={2}
        title="Escolher Nome e Registrar Domínio"
        open={!!openSteps.nome}
        onToggle={() => toggleStep("nome")}
        progress={stepProgress("nome")}
        checked={checked}
        onCheck={toggle}
      >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div className="rounded-xl border border-green-500/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" /> Boas práticas
            </h4>
            <ul className="space-y-2">
              {["Curto e fácil de lembrar", "Sem hífens ou números", "Fácil de soletrar", "Relacionado ao seu negócio"].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-500/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Circle className="h-4 w-4 text-red-400" /> O que evitar
            </h4>
            <ul className="space-y-2">
              {["Nomes muito longos", "Hífens e números desnecessários", "Nomes difíceis de soletrar", "Nomes parecidos com concorrentes"].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2"><Circle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3">Ferramentas para verificar e registrar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {domainTools.map((t) => (
              <div key={t.name} className="rounded-xl border border-border/60 p-4 bg-gradient-card flex flex-col">
                <p className="text-white text-sm font-bold mb-1">{t.name}</p>
                <p className="text-white text-xs leading-relaxed mb-3 flex-1">{t.desc}</p>
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all w-fit">
                  Acessar <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-2">Domínio grátis x domínio próprio</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="rounded-lg border border-border/40 p-4 bg-muted/10">
              <p className="text-gradient-primary text-xs font-bold mb-2">DOMÍNIO GRÁTIS</p>
              <p className="text-white text-xs leading-relaxed">Ex: suamarca.wixsite.com — funcional, mas sem credibilidade profissional. Bom para testes.</p>
            </div>
            <div className="rounded-lg border border-primary/30 p-4 bg-primary/5">
              <p className="text-gradient-primary text-xs font-bold mb-2">DOMÍNIO PRÓPRIO ★</p>
              <p className="text-white text-xs leading-relaxed">Ex: suamarca.com.br — transmite profissionalismo, melhora SEO e é essencial para crescer.</p>
            </div>
          </div>
        </div>
      </StepSection>

      {/* ETAPA 3 — CRIAR O SITE COM IA */}
      <StepSection
        stepKey="criar"
        number={3}
        title="Criar o Site com IA"
        open={!!openSteps.criar}
        onToggle={() => toggleStep("criar")}
        progress={stepProgress("criar")}
        checked={checked}
        onCheck={toggle}
      >
        <div className="mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3">Plataformas para criar seu site</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="rounded-xl border border-border/60 p-5 bg-gradient-card hover:border-primary/30 transition-all flex flex-col">
                <h5 className="font-display font-bold text-base text-gradient-primary mb-2">{p.name}</h5>
                <div className="space-y-2 flex-1">
                  <Row label="Melhor para" value={p.bestFor} />
                  <Row label="Facilidade" value={p.ease} />
                  <Row label="Recursos" value={p.features} />
                  <Row label="Versão grátis" value={p.free} />
                  <Row label="Limitações" value={p.limitation} />
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all w-fit">
                  Acessar {p.name} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Soph diz:</span> "Para quem está começando, o Wix é a melhor opção. Com IA, você cria um site profissional em minutos, sem precisar de nenhum conhecimento técnico."
          </p>
        </div>
      </StepSection>

      {/* ETAPA 4 — OTIMIZAR E PUBLICAR */}
      <StepSection
        stepKey="otimizar"
        number={4}
        title="Otimizar e Publicar"
        open={!!openSteps.otimizar}
        onToggle={() => toggleStep("otimizar")}
        progress={stepProgress("otimizar")}
        checked={checked}
        onCheck={toggle}
      >
        <div className="mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3">Ferramentas de SEO e presença local</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seoTools.map((t) => (
              <div key={t.name} className="rounded-xl border border-border/60 p-4 bg-gradient-card flex flex-col">
                <p className="text-white text-sm font-bold mb-0.5">{t.name}</p>
                <p className="text-muted-foreground text-[11px] mb-1">{t.purpose}</p>
                <p className="text-white text-xs leading-relaxed mb-3 flex-1">{t.desc}</p>
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all w-fit">
                  Acessar <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Soph diz:</span> "SEO não é luxo, é necessidade. Um site otimizado aparece no Google sem você precisar pagar por anúncios. Comece pelo título e meta description."
          </p>
        </div>
      </StepSection>

      {/* FERRAMENTAS ÚTEIS */}
      <motion.div id="ferramentas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-xl text-white">Ferramentas Úteis</h2>
        </div>

        {toolGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="font-display font-bold text-sm text-gradient-primary">{group.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((t) => (
                <div key={t.name} className="rounded-xl border border-border/60 p-4 bg-gradient-card hover:border-primary/20 transition-all flex flex-col">
                  <p className="text-white text-sm font-bold mb-0.5">{t.name}</p>
                  <p className="text-muted-foreground text-[11px] mb-1">{t.purpose}</p>
                  <p className="text-white text-xs leading-relaxed mb-3 flex-1">{t.desc}</p>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all w-fit">
                    Acessar <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* BLOCO FINAL */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-primary/20 p-6 bg-gradient-card space-y-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-80" style={{ position: "relative" }} />
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-display font-bold text-base text-white">Parabéns por chegar até aqui!</h3>
            <p className="text-white text-sm leading-relaxed">
              Você agora tem todo o conhecimento para criar seu domínio, construir seu site e otimizar sua presença digital. Continue sua jornada empreendedora!
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/vendas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
            <ArrowLeft className="h-4 w-4" /> Voltar para Vendas e Presença
          </Link>
          <Link to="/soph" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/5 transition-all">
            Falar com a Soph <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ───── sub-components ───── */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground text-xs font-medium min-w-[80px]">{label}:</span>
      <span className="text-white text-xs">{value}</span>
    </div>
  );
}

interface StepSectionProps {
  stepKey: string;
  number: number;
  title: string;
  open: boolean;
  onToggle: () => void;
  progress: { done: number; total: number };
  checked: Record<string, boolean>;
  onCheck: (key: string) => void;
  children: React.ReactNode;
}

function StepSection({ stepKey, number, title, open, onToggle, progress, checked, onCheck, children }: StepSectionProps) {
  const items = checklistData[stepKey];
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-gradient-card overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-80" style={{ position: "relative" }} />
        <CollapsibleTrigger className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-primary-btn text-primary-foreground font-bold text-sm">
              {number}
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">{title}</h2>
              <p className="text-muted-foreground text-xs mt-0.5">{progress.done}/{progress.total} concluídos</p>
            </div>
          </div>
          {open ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-3">
            <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} className="h-2" />
            {items.map((ci, i) => {
              const key = `${stepKey}-${i}`;
              const isDone = !!checked[key];
              return (
                <button key={key} onClick={() => onCheck(key)} className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-white/[0.03] transition-colors">
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "bg-gradient-primary-btn border-transparent" : "border-white/20"}`}>
                    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${isDone ? "text-white/60 line-through" : "text-white"}`}>{ci.label}</span>
                </button>
              );
            })}
            {children}
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}
