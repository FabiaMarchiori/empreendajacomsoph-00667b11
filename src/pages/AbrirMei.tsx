import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, ExternalLink,
  FileCheck, ShieldCheck, DollarSign, Award, AlertTriangle,
  ChevronDown, ChevronUp, Lightbulb, Wrench, BookOpen,
  Smartphone, Download, CreditCard, FileText, Users, ClipboardList
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const STORAGE_KEY = "abrir-mei-checklist";

const journeySteps = [
  { id: 1, title: "Entender o que é MEI", key: "entender" },
  { id: 2, title: "Verificar se você pode ser MEI", key: "verificar" },
  { id: 3, title: "Se preparar para abrir", key: "preparar" },
  { id: 4, title: "Abrir o MEI passo a passo", key: "abrir" },
  { id: 5, title: "Obrigações e próximos passos", key: "obrigacoes" },
];

const whyCards = [
  { icon: <FileCheck className="h-5 w-5" />, title: "Você vira empresário de verdade", desc: "Com o MEI, você tem CNPJ próprio, pode emitir nota fiscal e acessar fornecedores exclusivos para pessoa jurídica." },
  { icon: <DollarSign className="h-5 w-5" />, title: "Impostos baixos e fixos", desc: "Valor mensal fixo a partir de R$ 75,90. Sem surpresas, sem complicação. Um dos menores custos tributários do Brasil." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Direitos garantidos", desc: "Aposentadoria, auxílio-doença, salário-maternidade e outros benefícios previdenciários assegurados pelo INSS." },
];

const checklistData: Record<string, { label: string }[]> = {
  entender: [
    { label: "Entender o que significa MEI" },
    { label: "Entender que o MEI tem CNPJ" },
    { label: "Entender que pode emitir nota fiscal" },
    { label: "Entender os principais benefícios" },
  ],
  verificar: [
    { label: "Verificar idade mínima (18 anos)" },
    { label: "Verificar faturamento anual (até R$ 81 mil)" },
    { label: "Confirmar que não tem sócio" },
    { label: "Confirmar que não participa de outra empresa" },
    { label: "Verificar se a atividade é permitida" },
    { label: "Confirmar limite de 1 funcionário" },
  ],
  preparar: [
    { label: "Entender custo mensal do DAS" },
    { label: "Saber a data de pagamento (dia 20)" },
    { label: "Reunir documentos pessoais (CPF, RG)" },
    { label: "Organizar comprovante de endereço" },
    { label: "Definir local de trabalho" },
    { label: "Escolher atividade principal (CNAE)" },
    { label: "Pensar em nome fantasia" },
  ],
  abrir: [
    { label: "Acessar Portal do Empreendedor" },
    { label: 'Clicar em "Quero ser MEI"' },
    { label: "Entrar com conta Gov.br" },
    { label: "Preencher formulário" },
    { label: "Revisar dados" },
    { label: "Finalizar cadastro" },
    { label: "Baixar CCMEI" },
  ],
  obrigacoes: [
    { label: "Não pagar para abrir (é gratuito)" },
    { label: "Pagar DAS todo mês" },
    { label: "Fazer declaração anual (DASN-SIMEI)" },
    { label: "Controlar faturamento mensal" },
    { label: "Emitir nota fiscal quando necessário" },
    { label: "Observar regra de funcionário" },
    { label: "Baixar certificado CCMEI" },
    { label: "Configurar lembrete do DAS" },
    { label: "Abrir conta PJ" },
    { label: "Cadastrar emissão de nota fiscal" },
  ],
};

const faqItems = [
  { q: "Posso ser CLT e MEI ao mesmo tempo?", a: "Sim! Você pode manter seu emprego CLT e ter um MEI. Porém, se for demitido, pode perder o direito ao seguro-desemprego dependendo da situação." },
  { q: "Quanto tempo demora para abrir?", a: "O processo é imediato. Você acessa o Portal do Empreendedor, preenche o formulário e já sai com seu CNPJ na hora." },
  { q: "Preciso de contador?", a: "Não é obrigatório. O MEI foi criado para ser simples. Mas se preferir, pode contar com apoio do Sebrae gratuitamente." },
  { q: "E se ultrapassar R$ 81 mil de faturamento?", a: "Você precisará migrar para Microempresa (ME). Se ultrapassar até 20%, paga uma guia complementar. Acima disso, é desenquadrado automaticamente." },
  { q: "Posso emitir nota fiscal?", a: "Sim! O MEI pode emitir nota fiscal. Para pessoa física não é obrigatório, mas para vender para empresas é necessário." },
  { q: "O que acontece se eu não pagar o DAS?", a: "Você perde benefícios do INSS, pode ter o CNPJ cancelado após 12 meses e acumular dívida com a Receita Federal." },
];

const toolGroups = [
  {
    title: "Oficiais",
    items: [
      { name: "Portal do Empreendedor", desc: "Site oficial para abrir e gerenciar seu MEI", purpose: "Abertura e gestão", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" },
      { name: "Área do MEI / Simples Nacional", desc: "Painel completo do Simples Nacional", purpose: "Consultas e gestão", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/" },
      { name: "Emitir DAS", desc: "Gere seu boleto mensal de pagamento", purpose: "Pagamento mensal", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" },
      { name: "Declaração Anual (DASN-SIMEI)", desc: "Faça sua declaração anual obrigatória", purpose: "Declaração anual", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao" },
      { name: "Baixar CCMEI", desc: "Certificado da Condição de MEI", purpose: "Documento oficial", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-o-mei/emissao-de-comprovante-ccmei" },
      { name: "Validar conta Gov.br", desc: "Verifique e aumente o nível da sua conta", purpose: "Autenticação", url: "https://sso.acesso.gov.br/" },
    ],
  },
  {
    title: "Apoio",
    items: [
      { name: "Sebrae Atendimento", desc: "Suporte gratuito para empreendedores", purpose: "Orientação e cursos", url: "https://www.sebrae.com.br/sites/PortalSebrae/atendimento" },
      { name: "Curso gratuito MEI", desc: "Aprenda tudo sobre MEI com o Sebrae", purpose: "Capacitação", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline" },
      { name: "App MEI (Android)", desc: "Gerencie seu MEI pelo celular", purpose: "Gestão mobile", url: "https://play.google.com/store/apps/details?id=br.gov.fazenda.receita.mei" },
      { name: "App MEI (iOS)", desc: "Gerencie seu MEI pelo iPhone", purpose: "Gestão mobile", url: "https://apps.apple.com/br/app/mei/id1439463184" },
      { name: "Planilha de controle financeiro", desc: "Modelo para controlar receitas e despesas", purpose: "Controle financeiro", url: "https://sebrae.com.br/sites/PortalSebrae/artigos/planilha-de-controle-financeiro" },
    ],
  },
];

export default function AbrirMeiPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ entender: true });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

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

  const chips = ["MEI", "CNPJ", "Gov.br", "DAS", "CCMEI", "Sebrae"];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* NAV */}
      <Link to="/estruture" className="inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Estruture seu Negócio
      </Link>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Como Abrir seu </span>
          <span className="text-gradient-primary inline-block">MEI</span>
          <br />
          <span className="text-white">com a Soph</span>
        </h1>
        <p className="text-white text-sm lg:text-base max-w-2xl leading-relaxed">
          Seu primeiro passo rumo à formalização. Aprenda a se tornar MEI de forma simples, rápida e com apoio prático em cada etapa.
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

      {/* O QUE É MEI? */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">O que é MEI?</h2>
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
            <span className="font-bold text-gradient-primary">Insight da Soph:</span> "O MEI é a porta de entrada mais simples para empreender no Brasil. Com ele, você opera legalmente, acessa fornecedores e constrói credibilidade."
          </p>
        </div>
      </motion.div>

      {/* ETAPA 1 — ENTENDER O QUE É MEI */}
      <StepSection stepKey="entender" number={1} title="Entender o que é MEI" open={!!openSteps.entender} onToggle={() => toggleStep("entender")} progress={stepProgress("entender")} checked={checked} onCheck={toggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <FileCheck className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">CNPJ próprio</h4>
            <p className="text-white text-xs leading-relaxed">
              O MEI gera um CNPJ automaticamente. Com ele, você pode abrir conta PJ, emitir nota fiscal e comprar de fornecedores atacadistas.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Benefícios previdenciários</h4>
            <p className="text-white text-xs leading-relaxed">
              Aposentadoria por idade, auxílio-doença, salário-maternidade e pensão por morte. Tudo isso pagando apenas o DAS mensal.
            </p>
          </div>
        </div>
      </StepSection>

      {/* ETAPA 2 — VERIFICAR SE PODE SER MEI */}
      <StepSection stepKey="verificar" number={2} title="Verificar se você pode ser MEI" open={!!openSteps.verificar} onToggle={() => toggleStep("verificar")} progress={stepProgress("verificar")} checked={checked} onCheck={toggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-green-500/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" /> Você pode ser MEI se:
            </h4>
            <ul className="space-y-2">
              {["Tem 18 anos ou mais", "Fatura até R$ 81 mil/ano", "Não tem sócio", "Não participa de outra empresa", "Atividade está na lista permitida", "Contrata no máximo 1 funcionário"].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-500/20 p-5 bg-gradient-card">
            <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Circle className="h-4 w-4 text-red-400" /> Você NÃO pode ser MEI se:
            </h4>
            <ul className="space-y-2">
              {["É menor de 18 anos", "Fatura mais de R$ 81 mil/ano", "Tem sócio em qualquer empresa", "É titular ou sócio de outra empresa", "Exerce atividade não permitida", "Precisa de mais de 1 funcionário"].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2"><Circle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5">
          <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
            Ver atividades permitidas <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </StepSection>

      {/* ETAPA 3 — SE PREPARAR PARA ABRIR */}
      <StepSection stepKey="preparar" number={3} title="Se preparar para abrir" open={!!openSteps.preparar} onToggle={() => toggleStep("preparar")} progress={stepProgress("preparar")} checked={checked} onCheck={toggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">Quanto custa ser MEI?</h4>
            <p className="text-white text-xs leading-relaxed mb-3">O DAS mensal varia conforme a atividade:</p>
            <div className="space-y-2">
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Comércio e Indústria</p>
                <p className="text-white text-xs">R$ 75,90/mês</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Prestação de Serviços</p>
                <p className="text-white text-xs">R$ 79,90/mês</p>
              </div>
              <div className="rounded-lg border border-border/40 p-3 bg-muted/10">
                <p className="text-gradient-primary text-xs font-bold">Comércio + Serviços</p>
                <p className="text-white text-xs">R$ 80,90/mês</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-primary-btn text-primary-foreground">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white mb-2">O que você precisa antes de começar?</h4>
            <ul className="space-y-2 mt-3">
              {["CPF e RG (ou CNH)", "Comprovante de endereço", "Conta Gov.br (nível prata ou ouro)", "Definir atividade principal (CNAE)", "Pensar no nome fantasia", "Definir local de trabalho"].map((t) => (
                <li key={t} className="text-white text-xs flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-primary-btn" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 p-4 mt-5" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.02))' }}>
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-yellow-400">Atenção:</span> Abrir o MEI é <strong>100% gratuito</strong>. Não pague taxas para ninguém. Se alguém cobrar para abrir seu MEI, é golpe.
          </p>
        </div>
      </StepSection>

      {/* ETAPA 4 — ABRIR O MEI PASSO A PASSO */}
      <StepSection stepKey="abrir" number={4} title="Abrir o MEI passo a passo" open={!!openSteps.abrir} onToggle={() => toggleStep("abrir")} progress={stepProgress("abrir")} checked={checked} onCheck={toggle}>
        <div className="flex flex-wrap gap-3 mt-5">
          <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all">
            Acessar Portal do Empreendedor <ExternalLink className="h-4 w-4" />
          </a>
          <a href="https://sso.acesso.gov.br/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/5 transition-all">
            Criar conta Gov.br <ExternalLink className="h-4 w-4" />
          </a>
          <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-o-mei/emissao-de-comprovante-ccmei" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/5 transition-all">
            Baixar CCMEI <Download className="h-4 w-4" />
          </a>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Soph diz:</span> "O processo é rápido e você sai com o CNPJ na hora. Tenha sua conta Gov.br validada antes de começar — isso evita travamentos no cadastro."
          </p>
        </div>
      </StepSection>

      {/* ETAPA 5 — OBRIGAÇÕES E PRÓXIMOS PASSOS */}
      <StepSection stepKey="obrigacoes" number={5} title="Obrigações e próximos passos" open={!!openSteps.obrigacoes} onToggle={() => toggleStep("obrigacoes")} progress={stepProgress("obrigacoes")} checked={checked} onCheck={toggle}>
        {/* Cuidados importantes */}
        <div className="rounded-xl border border-yellow-500/20 p-5 bg-gradient-card mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" /> Cuidados importantes
          </h4>
          <ul className="space-y-2">
            {["Não pague para abrir — é gratuito", "Valide sua conta Gov.br antes de começar", "Atenção ao endereço informado", "Anote a data de abertura do MEI", "Evite golpes de sites falsos"].map((t) => (
              <li key={t} className="text-white text-xs flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Obrigações do MEI */}
        <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card mt-4">
          <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Obrigações do MEI
          </h4>
          <ul className="space-y-2">
            {[
              "Pagar o DAS todo mês (vence dia 20)",
              "Fazer a Declaração Anual (DASN-SIMEI) até 31 de maio",
              "Controlar o faturamento mensal",
              "Emitir nota fiscal quando vender para empresas",
              "Respeitar o limite de 1 funcionário",
            ].map((t) => (
              <li key={t} className="text-white text-xs flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-primary-btn" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Perguntas frequentes */}
        <div className="mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3">Perguntas frequentes</h4>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/60 bg-gradient-card overflow-hidden">
                <AccordionTrigger className="px-5 py-4 text-sm text-white font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-white text-xs leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Próximos passos */}
        <div className="rounded-xl border border-primary/20 p-5 bg-gradient-card mt-5">
          <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" /> Próximos passos
          </h4>
          <ul className="space-y-2">
            {[
              "Baixar certificado CCMEI",
              "Configurar lembrete mensal do DAS",
              "Anotar faturamento desde o primeiro mês",
              "Abrir conta PJ no banco",
              "Cadastrar emissão de nota fiscal",
              "Continuar aprendendo na plataforma",
            ].map((t) => (
              <li key={t} className="text-white text-xs flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 p-4 bg-gradient-card mt-5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-primary-btn">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-bold text-gradient-primary">Soph diz:</span> "Manter o DAS em dia é o mais importante. Configure um lembrete no celular para todo dia 18 e nunca mais esqueça."
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
            <h3 className="font-display font-bold text-base text-white">Pronto para se formalizar?</h3>
            <p className="text-white text-sm leading-relaxed">
              Você agora tem todo o conhecimento para abrir seu MEI, operar legalmente e começar a construir seu negócio com segurança. Continue sua jornada empreendedora!
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
