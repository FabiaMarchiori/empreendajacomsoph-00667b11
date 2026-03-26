import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ExternalLink,
  ChevronDown, ChevronUp, Lightbulb, Wrench,
  Palette, Eye, Star, Paintbrush, Download, Type, Image, Layers
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const STORAGE_KEY = "logo-marca-checklist";

const journeySteps = [
  { id: 1, title: "Importância da logo", key: "importancia" },
  { id: 2, title: "Identidade da marca", key: "identidade" },
  { id: 3, title: "Ferramenta ideal", key: "ferramenta" },
  { id: 4, title: "Criar e refinar", key: "criar" },
  { id: 5, title: "Baixar e aplicar", key: "aplicar" },
];

const whyCards = [
  { icon: <Star className="h-5 w-5" />, title: "Transmite profissionalismo", desc: "Uma logo bem feita mostra que seu negócio é sério, organizado e confiável desde o primeiro contato." },
  { icon: <Eye className="h-5 w-5" />, title: "Fixa sua marca na memória", desc: "Marcas com identidade visual forte são lembradas com mais facilidade. Sua logo é o rosto do seu negócio." },
  { icon: <Layers className="h-5 w-5" />, title: "Diferencia da concorrência", desc: "No meio de milhares de vendedores, a logo é o que faz você ser reconhecido e escolhido pelo cliente." },
];

const checklistData: Record<string, { label: string }[]> = {
  importancia: [
    { label: "Entender o papel da logo no negócio" },
    { label: "Perceber impacto na confiança do cliente" },
    { label: "Entender diferenciação da concorrência" },
    { label: "Reconhecer a importância da identidade visual" },
  ],
  identidade: [
    { label: "Definir o que o negócio faz em 3 palavras" },
    { label: "Escolher 3 valores principais da marca" },
    { label: "Definir o sentimento que a marca transmite" },
    { label: "Escolher segmento de atuação" },
    { label: "Escolher direção de cores" },
  ],
  ferramenta: [
    { label: "Conhecer o Canva" },
    { label: "Conhecer o Hatchful" },
    { label: "Conhecer o Looka" },
    { label: "Conhecer o LogoAI" },
    { label: "Escolher a ferramenta ideal" },
  ],
  criar_conta: [
    { label: "Acessar o Canva" },
    { label: "Clicar em cadastrar" },
    { label: "Escolher forma de login" },
    { label: "Confirmar conta" },
    { label: "Entrar no painel" },
  ],
  criar_ia: [
    { label: 'Buscar "logo" no Canva' },
    { label: "Criar logo em branco ou usar template" },
    { label: "Usar texto para imagem (IA)" },
    { label: "Escrever prompt descritivo" },
    { label: "Testar diferentes versões" },
    { label: "Adicionar nome da empresa" },
  ],
  criar_refinar: [
    { label: "Ajustar cores da logo" },
    { label: "Ajustar tipografia" },
    { label: "Revisar proporções" },
    { label: "Simplificar elementos" },
    { label: "Testar legibilidade em tamanho pequeno" },
  ],
  aplicar: [
    { label: "Baixar PNG com fundo transparente" },
    { label: "Baixar JPG para uso geral" },
    { label: "Baixar SVG (se disponível)" },
    { label: "Organizar arquivos em pastas" },
    { label: "Criar variação horizontal" },
    { label: "Criar variação vertical" },
    { label: "Criar versão simplificada (ícone)" },
    { label: "Testar em preto e branco" },
    { label: "Salvar na nuvem (Google Drive)" },
    { label: "Aplicar em redes sociais e materiais" },
  ],
};

const colorGuide = [
  { segment: "Saúde / Bem-estar", colors: "Verde, azul claro, branco", feel: "Calma, confiança" },
  { segment: "Tecnologia", colors: "Azul, roxo, preto", feel: "Inovação, modernidade" },
  { segment: "Alimentação", colors: "Vermelho, amarelo, laranja", feel: "Apetite, energia" },
  { segment: "Beleza", colors: "Rosa, dourado, nude", feel: "Elegância, cuidado" },
  { segment: "Serviços", colors: "Azul, cinza, branco", feel: "Profissionalismo, seriedade" },
  { segment: "Arte / Criativo", colors: "Cores vibrantes, contrastes", feel: "Criatividade, ousadia" },
];

const platformCards = [
  { name: "Canva", best: "Personalização total com IA", resources: "Templates, IA generativa, editor drag & drop", free: "Sim, com limitações", limitation: "Alguns recursos são Pro", url: "https://www.canva.com/" },
  { name: "Hatchful (Shopify)", best: "Logos rápidas e prontas", resources: "Gerador automático por segmento", free: "100% gratuito", limitation: "Menos personalização", url: "https://www.shopify.com/tools/logo-maker" },
  { name: "Looka", best: "Logos premium com IA", resources: "IA avançada, kits de marca completos", free: "Visualização gratuita", limitation: "Download é pago", url: "https://looka.com/" },
  { name: "LogoAI", best: "Geração automática inteligente", resources: "IA treinada em design profissional", free: "Prévia gratuita", limitation: "Exportação paga", url: "https://www.logoai.com/" },
];

const promptExamples = [
  "Crie um logo minimalista para uma loja de roupas femininas chamada 'Bella', com tons de rosa e dourado",
  "Logo moderna para cafeteria artesanal 'Grão Nobre', estilo rústico com marrom e bege",
  "Ícone clean para marca de tecnologia 'NexTech', usando azul e branco, estilo futurista",
  "Logo elegante para pet shop 'Patinhas', com ícone de pata estilizada em verde e branco",
];

const toolGroups = [
  {
    title: "Criação e Design",
    items: [
      { name: "Canva", desc: "Editor completo com IA para criar logos", purpose: "Criação de logo", url: "https://www.canva.com/" },
      { name: "Hatchful", desc: "Gerador de logos gratuito da Shopify", purpose: "Logo rápida", url: "https://www.shopify.com/tools/logo-maker" },
      { name: "Looka", desc: "IA premium para identidade visual completa", purpose: "Branding profissional", url: "https://looka.com/" },
      { name: "LogoAI", desc: "Geração de logos com inteligência artificial", purpose: "Logo automática", url: "https://www.logoai.com/" },
    ],
  },
  {
    title: "Cores e Tipografia",
    items: [
      { name: "Coolors", desc: "Gerador de paletas de cores harmônicas", purpose: "Paleta de cores", url: "https://coolors.co/" },
      { name: "Google Fonts", desc: "Biblioteca gratuita de fontes profissionais", purpose: "Tipografia", url: "https://fonts.google.com/" },
      { name: "Adobe Color", desc: "Ferramenta avançada de combinação de cores", purpose: "Harmonização de cores", url: "https://color.adobe.com/" },
    ],
  },
  {
    title: "Imagens e Apoio Visual",
    items: [
      { name: "Remove.bg", desc: "Remove fundo de imagens automaticamente", purpose: "Fundo transparente", url: "https://www.remove.bg/" },
      { name: "Unsplash", desc: "Banco de imagens gratuitas em alta resolução", purpose: "Imagens de apoio", url: "https://unsplash.com/" },
    ],
  },
  {
    title: "Mockups",
    items: [
      { name: "MockupWorld", desc: "Mockups gratuitos para apresentar sua marca", purpose: "Visualização realista", url: "https://www.mockupworld.co/" },
      { name: "Placeit", desc: "Mockups e templates para redes sociais e produtos", purpose: "Apresentação de marca", url: "https://placeit.net/" },
    ],
  },
];

export default function LogoMarcaPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ importancia: true });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }));
  const toggleStep = (key: string) => setOpenSteps((p) => ({ ...p, [key]: !p[key] }));

  const allKeys = [...Object.keys(checklistData)];
  const totalItems = allKeys.reduce((acc, k) => acc + checklistData[k].length, 0);
  const doneItems = Object.keys(checked).filter((k) => checked[k]).length;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const stepProgress = (keys: string[]) => {
    const items = keys.flatMap((k) => checklistData[k] || []);
    const done = keys.flatMap((k, ki) =>
      (checklistData[k] || []).map((_, i) => checked[`${k}-${i}`])
    ).filter(Boolean).length;
    return { done, total: items.length };
  };

  const singleProgress = (key: string) => stepProgress([key]);

  const chips = ["Logo", "Identidade Visual", "Canva", "Hatchful", "Looka", "IA"];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* NAV */}
      <Link to="/estruture" className="inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Estruture seu Negócio
      </Link>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Como Criar sua </span>
          <span className="text-gradient-primary inline-block">Logo Marca</span>
          <br />
          <span className="text-white">com a Soph</span>
        </h1>
        <p className="text-white text-sm lg:text-base max-w-2xl leading-relaxed">
          Um guia prático para criar uma identidade visual profissional usando inteligência artificial gratuita, mesmo sem experiência em design.
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
        <div className="h-px w-full bg-gradient-primary-line opacity-80" />
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">Progresso da Jornada</h2>
          <span className="text-gradient-primary text-sm font-bold">{doneItems}/{totalItems} concluídos</span>
        </div>
        <Progress value={pct} className="h-3" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {journeySteps.map((s) => {
            const keys = s.key === "criar" ? ["criar_conta", "criar_ia", "criar_refinar"] : [s.key];
            const sp = stepProgress(keys);
            return (
              <div key={s.key} className="rounded-xl border border-border/60 p-3 bg-muted/20 text-center">
                <p className="text-white text-xs font-semibold mb-1">{s.title}</p>
                <p className="text-gradient-primary text-xs font-bold">{sp.done}/{sp.total}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* POR QUE SUA LOGO É IMPORTANTE? */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Por que sua logo é importante?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Insight da Soph:</span> "Sua logo é o primeiro aperto de mão digital com o cliente. Mesmo simples, ela precisa transmitir confiança e profissionalismo."
          </p>
        </div>
      </motion.div>

      {/* ETAPA 1 — IMPORTÂNCIA DA LOGO */}
      <StepSection stepKey="importancia" number={1} title="Entender a importância da logo" open={!!openSteps.importancia} onToggle={() => toggleStep("importancia")} progress={singleProgress("importancia")} checked={checked} onCheck={toggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <Palette className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Identidade visual = credibilidade</h4>
            <p className="text-white text-xs leading-relaxed">
              Negócios com identidade visual definida transmitem mais confiança. A logo é o elemento central que unifica toda a comunicação da marca.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <Star className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Reconhecimento imediato</h4>
            <p className="text-white text-xs leading-relaxed">
              Pense nas grandes marcas: você reconhece pelo símbolo. Uma boa logo grava sua marca na mente do consumidor.
            </p>
          </div>
        </div>
      </StepSection>

      {/* ETAPA 2 — IDENTIDADE DA MARCA */}
      <StepSection stepKey="identidade" number={2} title="Definir a identidade da marca" open={!!openSteps.identidade} onToggle={() => toggleStep("identidade")} progress={singleProgress("identidade")} checked={checked} onCheck={toggle}>
        <div className="space-y-5 mt-5">
          {/* Perguntas essenciais */}
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Perguntas essenciais
            </h4>
            <ul className="space-y-2">
              {[
                "O que meu negócio faz em 3 palavras?",
                "Quais são os 3 valores principais?",
                "Que sentimento minha marca deve transmitir?",
                "Qual é meu segmento de atuação?",
                "Quais cores representam meu negócio?",
              ].map((q) => (
                <li key={q} className="text-white text-xs flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /> {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Guia de cores por segmento */}
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Guia de cores por segmento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colorGuide.map((c) => (
                <div key={c.segment} className="rounded-lg border border-border/40 p-3 bg-muted/10">
                  <p className="text-gradient-primary text-xs font-bold">{c.segment}</p>
                  <p className="text-white text-xs mt-1">Cores: {c.colors}</p>
                  <p className="text-muted-foreground text-[11px]">Transmite: {c.feel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ferramentas de cores */}
          <div className="flex flex-wrap gap-3">
            <a href="https://coolors.co/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
              Abrir Coolors <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://youtu.be/example-coolors" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/20 text-white hover:bg-white/5 transition-all">
              Vídeo: Como usar o Coolors <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Soph dica */}
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-white text-sm leading-relaxed">
              <span className="font-bold text-gradient-primary">Soph diz:</span> "Antes de escolher cores e fontes, responda as perguntas acima. Sua identidade visual nasce da essência do negócio, não de tendências."
            </p>
          </div>
        </div>
      </StepSection>

      {/* ETAPA 3 — ESCOLHER A FERRAMENTA IDEAL */}
      <StepSection stepKey="ferramenta" number={3} title="Escolher a ferramenta ideal" open={!!openSteps.ferramenta} onToggle={() => toggleStep("ferramenta")} progress={singleProgress("ferramenta")} checked={checked} onCheck={toggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {platformCards.map((p) => (
            <div key={p.name} className="rounded-xl border border-border/60 p-5 bg-gradient-card hover:border-primary/30 transition-all flex flex-col">
              <h4 className="font-display font-bold text-sm text-white mb-2">{p.name}</h4>
              <div className="space-y-1.5 flex-1">
                <p className="text-xs text-white"><span className="text-gradient-primary font-semibold">Melhor para:</span> {p.best}</p>
                <p className="text-xs text-white"><span className="text-gradient-primary font-semibold">Recursos:</span> {p.resources}</p>
                <p className="text-xs text-white"><span className="text-gradient-primary font-semibold">Gratuito:</span> {p.free}</p>
                <p className="text-xs text-muted-foreground"><span className="font-semibold">Limitação:</span> {p.limitation}</p>
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all w-fit mt-3">
                Acessar {p.name} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </StepSection>

      {/* ETAPA 4 — CRIAR E REFINAR A LOGO */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-gradient-card overflow-hidden">
        <div className="h-px w-full bg-gradient-primary-line opacity-80" />
        <button onClick={() => toggleStep("criar")} className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-primary-btn text-primary-foreground font-bold text-sm">4</div>
            <div>
              <h2 className="font-display font-bold text-base text-white">Criar e refinar a logo</h2>
              <p className="text-muted-foreground text-xs mt-0.5">{stepProgress(["criar_conta", "criar_ia", "criar_refinar"]).done}/{stepProgress(["criar_conta", "criar_ia", "criar_refinar"]).total} concluídos</p>
            </div>
          </div>
          {openSteps.criar ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
        </button>

        {openSteps.criar && (
          <div className="px-6 pb-6 space-y-6">
            <Progress value={(() => { const p = stepProgress(["criar_conta", "criar_ia", "criar_refinar"]); return p.total ? (p.done / p.total) * 100 : 0; })()} className="h-2" />

            {/* A. Criando conta */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-gradient-primary flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-white">A</span>
                Criando conta no Canva
              </h3>
              {checklistData.criar_conta.map((ci, i) => {
                const key = `criar_conta-${i}`;
                const isDone = !!checked[key];
                return (
                  <button key={key} onClick={() => toggle(key)} className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-white/[0.03] transition-colors">
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "bg-gradient-primary-btn border-transparent" : "border-white/20"}`}>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${isDone ? "text-white/60 line-through" : "text-white"}`}>{ci.label}</span>
                  </button>
                );
              })}
            </div>

            {/* B. Gerando logo com IA */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-gradient-primary flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-white">B</span>
                Gerando logo com IA
              </h3>
              {checklistData.criar_ia.map((ci, i) => {
                const key = `criar_ia-${i}`;
                const isDone = !!checked[key];
                return (
                  <button key={key} onClick={() => toggle(key)} className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-white/[0.03] transition-colors">
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "bg-gradient-primary-btn border-transparent" : "border-white/20"}`}>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${isDone ? "text-white/60 line-through" : "text-white"}`}>{ci.label}</span>
                  </button>
                );
              })}

              {/* Prompts eficazes */}
              <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card mt-3">
                <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Exemplos de prompts eficazes
                </h4>
                <div className="space-y-2">
                  {promptExamples.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border/40 p-3 bg-muted/10">
                      <p className="text-white text-xs italic">"{p}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* C. Refinando */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-gradient-primary flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-white">C</span>
                Refinando a logo
              </h3>
              {checklistData.criar_refinar.map((ci, i) => {
                const key = `criar_refinar-${i}`;
                const isDone = !!checked[key];
                return (
                  <button key={key} onClick={() => toggle(key)} className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-white/[0.03] transition-colors">
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "bg-gradient-primary-btn border-transparent" : "border-white/20"}`}>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${isDone ? "text-white/60 line-through" : "text-white"}`}>{ci.label}</span>
                  </button>
                );
              })}

              {/* Soph dica refinamento */}
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-3">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="text-white text-sm leading-relaxed">
                  <span className="font-bold text-gradient-primary">Soph diz:</span> "Uma logo simples funciona melhor. Se precisa explicar o que ela significa, ela está complexa demais. Teste em tamanho pequeno — se continuar legível, está no caminho certo."
                </p>
              </div>
            </div>

            {/* Ferramentas da etapa */}
            <div className="flex flex-wrap gap-3">
              <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
                Canva <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://www.shopify.com/tools/logo-maker" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
                Hatchful <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://coolors.co/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
                Coolors <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
                Google Fonts <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </motion.div>

      {/* ETAPA 5 — BAIXAR, APLICAR E USAR */}
      <StepSection stepKey="aplicar" number={5} title="Baixar, aplicar e usar" open={!!openSteps.aplicar} onToggle={() => toggleStep("aplicar")} progress={singleProgress("aplicar")} checked={checked} onCheck={toggle}>
        <div className="space-y-4 mt-5">
          {/* Formatos */}
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Formatos de arquivo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">PNG</p>
                <p className="text-white text-xs mt-1">Fundo transparente. Ideal para redes sociais e materiais digitais.</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">JPG</p>
                <p className="text-white text-xs mt-1">Fundo sólido. Bom para documentos e impressão simples.</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">SVG</p>
                <p className="text-white text-xs mt-1">Vetorial. Escala sem perder qualidade. Ideal para impressão profissional.</p>
              </div>
            </div>
          </div>

          {/* Variações */}
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Variações recomendadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Horizontal</p>
                <p className="text-white text-xs mt-1">Para cabeçalhos de site, assinatura de e-mail e banners.</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Vertical</p>
                <p className="text-white text-xs mt-1">Para cartões de visita, etiquetas e embalagens.</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Simplificada</p>
                <p className="text-white text-xs mt-1">Ícone solo. Ideal para perfil de redes sociais e favicon.</p>
              </div>
            </div>
          </div>

          {/* Onde usar */}
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" /> Onde usar cada versão
            </h4>
            <ul className="space-y-2">
              {[
                "Perfil de redes sociais → versão simplificada (ícone)",
                "Capa do Instagram/Facebook → versão horizontal",
                "Cartão de visita → versão vertical",
                "Site e loja virtual → versão horizontal + favicon",
                "Embalagens → versão vertical ou horizontal",
                "Assinatura de e-mail → versão horizontal pequena",
              ].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
        <div className="h-px w-full bg-gradient-primary-line opacity-80" />
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-display font-bold text-base text-white">Sua logo está pronta. E agora?</h3>
            <p className="text-white text-sm leading-relaxed">
              Parabéns! Você criou a identidade visual do seu negócio. Agora aplique em todos os seus canais: redes sociais, loja, cartão de visita e materiais. Sua marca é o que te diferencia — use com orgulho!
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/estruture" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
            <ArrowLeft className="h-4 w-4" /> Voltar para Estruture seu Negócio
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
        <div className="h-px w-full bg-gradient-primary-line opacity-80" />
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
