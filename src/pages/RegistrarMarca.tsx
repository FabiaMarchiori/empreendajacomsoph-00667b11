import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, ExternalLink,
  Shield, ShieldCheck, Award, TrendingUp, Handshake, AlertTriangle,
  ChevronDown, ChevronUp, Lightbulb, Wrench, BookOpen, Search,
  FileText, ClipboardList, HelpCircle, MessageCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const STORAGE_KEY = "registrar-marca-checklist";
const GRAD = "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)";

const journeySteps = [
  { id: 1, title: "Entender por que registrar", key: "entender" },
  { id: 2, title: "Se preparar antes de começar", key: "preparar" },
  { id: 3, title: "Registrar sua marca no INPI", key: "registrar" },
  { id: 4, title: "Acompanhar com segurança", key: "acompanhar" },
  { id: 5, title: "Dúvidas e recursos extras", key: "duvidas" },
];

const whyCards = [
  { icon: <Shield className="h-5 w-5" />, title: "Exclusividade do nome e logotipo", desc: "Garante que só você pode usar o nome e a identidade visual do seu negócio em todo o território nacional." },
  { icon: <TrendingUp className="h-5 w-5" />, title: "Valorização do negócio", desc: "Uma marca registrada é um ativo intangível que agrega valor à sua empresa e atrai investidores e parceiros." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Segurança jurídica", desc: "Proteção legal contra cópias, imitações e uso indevido do seu nome por concorrentes." },
  { icon: <Handshake className="h-5 w-5" />, title: "Facilidade para franquias e parcerias", desc: "Marca registrada é pré-requisito para franquear, licenciar ou firmar parcerias estratégicas." },
];

const checklistData: Record<string, { label: string }[]> = {
  entender: [
    { label: "Entender exclusividade da marca" },
    { label: "Entender proteção do nome e logotipo" },
    { label: "Perceber valorização do negócio" },
    { label: "Entender segurança jurídica" },
    { label: "Ver impacto em crescimento e parcerias" },
  ],
  preparar: [
    { label: "Definir nome da marca" },
    { label: "Definir logotipo" },
    { label: "Confirmar CNPJ ativo ou MEI" },
    { label: "Separar e-mail e documentos" },
    { label: "Entender a classe NICE" },
    { label: "Identificar a classe correta da marca" },
  ],
  registrar: [
    { label: "Acessar site do INPI" },
    { label: "Criar conta no e-INPI" },
    { label: "Fazer busca de anterioridade" },
    { label: "Escolher a classe correta" },
    { label: "Preencher formulário" },
    { label: "Gerar e pagar a GRU" },
    { label: "Guardar número de protocolo" },
  ],
  acompanhar: [
    { label: "Evitar nomes genéricos ou parecidos" },
    { label: "Usar apenas o site oficial do INPI" },
    { label: "Guardar número de protocolo" },
    { label: "Acompanhar prazos e despachos" },
    { label: "Consultar andamento do pedido" },
  ],
  duvidas: [
    { label: "Ler perguntas frequentes" },
    { label: "Consultar Manual de Marcas" },
    { label: "Verificar lista de Classes NICE" },
    { label: "Conhecer recursos de apoio" },
  ],
};

const faqItems = [
  { q: "Posso registrar nome e logotipo juntos?", a: "Sim! Você pode solicitar o registro misto, que protege o nome e o logotipo em um único pedido. Mas também pode registrá-los separadamente para maior proteção." },
  { q: "Quanto tempo leva o registro?", a: "O processo costuma levar entre 6 a 12 meses, podendo ser mais longo se houver exigências ou oposições. Por isso, comece o quanto antes." },
  { q: "O registro vale para sempre?", a: "Não. O registro tem validade de 10 anos, mas pode ser renovado indefinidamente. Fique atento ao prazo de renovação." },
  { q: "Preciso contratar um despachante?", a: "Não é obrigatório. Você pode fazer todo o processo sozinho pelo e-INPI. Mas um despachante pode ajudar em casos mais complexos." },
  { q: "Quanto custa registrar uma marca?", a: "Para MEIs e pessoas físicas, a taxa básica (GRU) é de cerca de R$ 142. Para empresas de maior porte, o valor é de cerca de R$ 355. Consulte o site do INPI para valores atualizados." },
];

const niceExamples = [
  { segment: "Roupas e acessórios", classe: "Classe 25" },
  { segment: "Cosméticos", classe: "Classe 3" },
  { segment: "Papelaria", classe: "Classe 16" },
  { segment: "Alimentação", classe: "Classe 30/43" },
  { segment: "Tecnologia", classe: "Classe 9/42" },
  { segment: "Saúde", classe: "Classe 5/44" },
];

const toolGroups = [
  {
    title: "Registro e Busca",
    items: [
      { name: "INPI", desc: "Instituto Nacional da Propriedade Industrial", purpose: "Órgão oficial de registro", url: "https://www.gov.br/inpi/pt-br" },
      { name: "e-INPI", desc: "Sistema eletrônico do INPI para pedidos", purpose: "Cadastro e pedido online", url: "https://www.gov.br/inpi/pt-br/servicos/marcas/e-marcas" },
      { name: "Busca de Marcas", desc: "Pesquise marcas já registradas no INPI", purpose: "Busca de anterioridade", url: "https://busca.inpi.gov.br/pePI/servlet/MarcasServletController" },
    ],
  },
  {
    title: "Classes e Orientação",
    items: [
      { name: "Lista de Classes NICE", desc: "Classificação internacional de produtos e serviços", purpose: "Identificar a classe correta", url: "https://www.gov.br/inpi/pt-br/servicos/marcas/classificacao-de-produtos-e-servicos/classificacao-nice" },
      { name: "Manual de Marcas", desc: "Guia completo do INPI sobre registro de marcas", purpose: "Referência oficial", url: "https://manualdemarcas.inpi.gov.br/" },
    ],
  },
  {
    title: "Apoio e Acompanhamento",
    items: [
      { name: "Sebrae", desc: "Atendimento gratuito para empreendedores", purpose: "Orientação e suporte", url: "https://www.sebrae.com.br/" },
      { name: "Revista da Propriedade Industrial (RPI)", desc: "Publicação oficial com decisões do INPI", purpose: "Acompanhar despachos", url: "http://revistas.inpi.gov.br/rpi/" },
      { name: "Consulta de Andamento", desc: "Acompanhe o status do seu pedido de registro", purpose: "Monitorar processo", url: "https://busca.inpi.gov.br/pePI/servlet/MarcasServletController" },
    ],
  },
];

export default function RegistrarMarcaPage() {
  const [checked, setChecked] = useState<Record<string, boolean[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggleCheck = (key: string, idx: number) => {
    setChecked((prev) => {
      const arr = prev[key] ? [...prev[key]] : Array(checklistData[key].length).fill(false);
      arr[idx] = !arr[idx];
      return { ...prev, [key]: arr };
    });
  };

  const getStepProgress = (key: string) => {
    const arr = checked[key] || [];
    const total = checklistData[key]?.length || 0;
    const done = arr.filter(Boolean).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const totalItems = Object.values(checklistData).reduce((a, b) => a + b.length, 0);
  const totalDone = Object.entries(checklistData).reduce((a, [key]) => {
    return a + (checked[key] || []).filter(Boolean).length;
  }, 0);
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const renderChecklist = (key: string) => {
    const items = checklistData[key] || [];
    const arr = checked[key] || [];
    return (
      <div className="space-y-1">
        {items.map((it, idx) => (
          <button key={idx} onClick={() => toggleCheck(key, idx)} className="w-full flex items-center gap-3 text-left group py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-[10px] font-bold text-white/50 w-4 text-center">{idx + 1}</span>
              {arr[idx] ? (
                <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: GRAD }}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0A192F]" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 group-hover:border-primary/50 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Circle className="h-2.5 w-2.5 text-transparent" />
                </div>
              )}
            </div>
            <span className={`text-sm font-medium transition-colors ${arr[idx] ? 'text-white/50 line-through' : 'text-white'}`}>{it.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* Nav */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
        <Link to="/estruture" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Estruture seu Negócio
        </Link>
      </motion.div>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-6 lg:p-8 space-y-5" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)', borderColor: 'rgba(0,239,255,0.2)' }}>
        <div className="h-px w-full -mt-6 lg:-mt-8 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, #9EEBFF, #00EFFF, transparent)' }} />
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GRAD }}>
            <Shield className="h-6 w-6 text-[#0A192F]" />
          </div>
          <div className="space-y-2 flex-1">
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight">
              <span className="text-foreground">Como Registrar Sua Marca </span>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>com a Soph</span>
            </h1>
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
              Garanta o direito sobre o nome do seu negócio e proteja o que você construiu com uma jornada simples e prática para registrar sua marca no INPI.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["INPI", "Marca", "Classe NICE", "e-INPI", "GRU", "Protocolo"].map((chip) => (
            <span key={chip} className="px-3 py-1 rounded-full text-[11px] font-semibold border" style={{ borderColor: 'rgba(0,239,255,0.25)', color: '#9EEBFF', background: 'rgba(0,239,255,0.08)' }}>{chip}</span>
          ))}
        </div>

        {/* Soph tip */}
        <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.15)' }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#00EFFF' }} />
          <p className="text-xs text-white/80 leading-relaxed">
            <strong className="text-foreground">Soph diz:</strong> Registrar sua marca é um investimento na proteção do seu negócio. Não espere alguém copiar seu nome para agir — comece agora.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => scrollTo("etapa-1")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-primary-foreground hover:brightness-110 transition-all" style={{ background: GRAD }}>
            Continuar jornada <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => scrollTo("ferramentas")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-white/5" style={{ borderColor: 'rgba(0,239,255,0.3)', color: '#9EEBFF' }}>
            <Wrench className="h-4 w-4" /> Ver ferramentas
          </button>
        </div>
      </motion.div>

      {/* PROGRESS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border p-5 space-y-4" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-foreground">Progresso da Jornada</h2>
          <span className="text-xs font-bold" style={{ color: '#9EEBFF' }}>{overallPct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0A192F' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallPct}%`, background: GRAD }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {journeySteps.map((s, i) => {
            const p = getStepProgress(s.key);
            return (
              <button key={s.id} onClick={() => { setActiveStep(i); scrollTo(`etapa-${s.id}`); }} className={`rounded-xl p-3 text-left border transition-all hover:bg-white/[0.03] ${activeStep === i ? 'border-primary/30 bg-white/[0.03]' : 'border-transparent'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: p.pct === 100 ? GRAD : 'rgba(255,255,255,0.1)', color: p.pct === 100 ? '#0A192F' : '#9EEBFF' }}>{s.id}</span>
                  <span className="text-[10px] font-semibold text-white/50">{p.done}/{p.total}</span>
                </div>
                <p className="text-[11px] font-medium text-white/80 leading-tight">{s.title}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* WHY REGISTER */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Por que registrar sua marca?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {whyCards.map((c) => (
            <motion.div key={c.title} variants={item} className="rounded-2xl border p-5 space-y-3" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,239,255,0.1)', border: '1px solid rgba(0,239,255,0.2)' }}>
                <span style={{ color: '#00EFFF' }}>{c.icon}</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">{c.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.15)' }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#00EFFF' }} />
          <p className="text-xs text-white/80 leading-relaxed">
            <strong className="text-foreground">Soph diz:</strong> A marca é o ativo mais valioso de muitos negócios. Protegê-la custa pouco e evita dores de cabeça no futuro.
          </p>
        </div>
      </motion.div>

      {/* ETAPA 1 */}
      <motion.div id="etapa-1" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 space-y-5" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-[#0A192F]" style={{ background: GRAD }}>Etapa 1</span>
          <h2 className="font-display font-bold text-base text-foreground">Entender por que registrar</h2>
        </div>
        {renderChecklist("entender")}
      </motion.div>

      {/* ETAPA 2 */}
      <motion.div id="etapa-2" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 space-y-5" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-[#0A192F]" style={{ background: GRAD }}>Etapa 2</span>
          <h2 className="font-display font-bold text-base text-foreground">Se preparar antes de começar</h2>
        </div>
        {renderChecklist("preparar")}

        {/* O que você precisa */}
        <div className="rounded-xl border p-5 space-y-3" style={{ background: 'rgba(0,239,255,0.04)', borderColor: 'rgba(0,239,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" style={{ color: '#00EFFF' }} />
            <h3 className="font-display font-semibold text-sm text-foreground">O que você precisa antes de começar</h3>
          </div>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="flex items-start gap-2"><span style={{ color: '#00EFFF' }}>•</span> Nome da marca definido e verificado</li>
            <li className="flex items-start gap-2"><span style={{ color: '#00EFFF' }}>•</span> Logotipo pronto (se for registro misto)</li>
            <li className="flex items-start gap-2"><span style={{ color: '#00EFFF' }}>•</span> CNPJ ativo (MEI ou empresa)</li>
            <li className="flex items-start gap-2"><span style={{ color: '#00EFFF' }}>•</span> E-mail válido e documentos pessoais</li>
            <li className="flex items-start gap-2"><span style={{ color: '#00EFFF' }}>•</span> Classe NICE identificada para seu segmento</li>
          </ul>
        </div>

        {/* Classe NICE */}
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'rgba(0,239,255,0.04)', borderColor: 'rgba(0,239,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: '#00EFFF' }} />
            <h3 className="font-display font-semibold text-sm text-foreground">O que é a Classe NICE?</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            A Classificação NICE organiza produtos e serviços em 45 classes internacionais. Você precisa escolher a classe correta para proteger sua marca no segmento certo.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {niceExamples.map((ex) => (
              <div key={ex.segment} className="rounded-lg p-3 border text-center" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.1)' }}>
                <p className="text-[11px] font-semibold text-white/90">{ex.segment}</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: '#00EFFF' }}>{ex.classe}</p>
              </div>
            ))}
          </div>
          <a href="https://www.gov.br/inpi/pt-br/servicos/marcas/classificacao-de-produtos-e-servicos/classificacao-nice" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110" style={{ background: '#00EFFF', color: '#0A192F' }}>
            Ver lista completa de classes <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </motion.div>

      {/* ETAPA 3 */}
      <motion.div id="etapa-3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 space-y-5" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-[#0A192F]" style={{ background: GRAD }}>Etapa 3</span>
          <h2 className="font-display font-bold text-base text-foreground">Registrar sua marca no INPI</h2>
        </div>
        {renderChecklist("registrar")}

        {/* Soph tip */}
        <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.15)' }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#00EFFF' }} />
          <p className="text-xs text-white/80 leading-relaxed">
            <strong className="text-foreground">Soph diz:</strong> Antes de preencher o formulário, faça a busca de anterioridade. Isso evita que você pague a taxa e tenha o pedido negado por já existir marca semelhante.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="https://www.gov.br/inpi/pt-br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110" style={{ background: '#00EFFF', color: '#0A192F' }}>
            Acessar INPI <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href="https://www.gov.br/inpi/pt-br/servicos/marcas/e-marcas" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110" style={{ background: '#00EFFF', color: '#0A192F' }}>
            Entrar no e-INPI <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href="https://busca.inpi.gov.br/pePI/servlet/MarcasServletController" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-white/5" style={{ borderColor: 'rgba(0,239,255,0.3)', color: '#9EEBFF' }}>
            <Search className="h-3.5 w-3.5" /> Buscar marcas registradas
          </a>
        </div>
      </motion.div>

      {/* ETAPA 4 */}
      <motion.div id="etapa-4" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 space-y-5" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-[#0A192F]" style={{ background: GRAD }}>Etapa 4</span>
          <h2 className="font-display font-bold text-base text-foreground">Acompanhar com segurança</h2>
        </div>
        {renderChecklist("acompanhar")}

        {/* Cuidados */}
        <div className="rounded-xl border p-5 space-y-3" style={{ background: 'rgba(0,239,255,0.04)', borderColor: 'rgba(0,239,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: '#FBBF24' }} />
            <h3 className="font-display font-semibold text-sm text-foreground">Cuidados importantes</h3>
          </div>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="flex items-start gap-2"><span style={{ color: '#FBBF24' }}>⚠</span> Use apenas o site oficial do INPI — desconfie de sites que cobram para registrar</li>
            <li className="flex items-start gap-2"><span style={{ color: '#FBBF24' }}>⚠</span> Guarde sempre o número de protocolo do seu pedido</li>
            <li className="flex items-start gap-2"><span style={{ color: '#FBBF24' }}>⚠</span> Acompanhe a Revista da Propriedade Industrial (RPI) para despachos</li>
            <li className="flex items-start gap-2"><span style={{ color: '#FBBF24' }}>⚠</span> Responda a exigências dentro do prazo para não perder o pedido</li>
            <li className="flex items-start gap-2"><span style={{ color: '#FBBF24' }}>⚠</span> Evite nomes muito genéricos — são mais difíceis de registrar</li>
          </ul>
        </div>

        {/* Soph tip */}
        <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.15)' }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#00EFFF' }} />
          <p className="text-xs text-white/80 leading-relaxed">
            <strong className="text-foreground">Soph diz:</strong> Após protocolar, fique atento aos despachos na RPI. Se houver exigência, você terá prazo limitado para responder.
          </p>
        </div>

        <a href="https://busca.inpi.gov.br/pePI/servlet/MarcasServletController" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110" style={{ background: '#00EFFF', color: '#0A192F' }}>
          Consultar andamento do pedido <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </motion.div>

      {/* ETAPA 5 — FAQ + Recursos */}
      <motion.div id="etapa-5" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 space-y-5" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.12)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-[#0A192F]" style={{ background: GRAD }}>Etapa 5</span>
          <h2 className="font-display font-bold text-base text-foreground">Dúvidas e recursos extras</h2>
        </div>
        {renderChecklist("duvidas")}

        {/* FAQ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" style={{ color: '#00EFFF' }} />
            <h3 className="font-display font-semibold text-sm text-foreground">Perguntas frequentes</h3>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4" style={{ borderColor: 'rgba(0,239,255,0.1)', background: 'rgba(0,239,255,0.03)' }}>
                <AccordionTrigger className="text-xs font-semibold text-white/90 hover:no-underline py-3">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-xs text-white/70 leading-relaxed pb-3">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Recursos extras */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: '#00EFFF' }} />
            <h3 className="font-display font-semibold text-sm text-foreground">Recursos extras</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Manual de Marcas (INPI)", desc: "Guia oficial completo sobre registro", url: "https://manualdemarcas.inpi.gov.br/" },
              { name: "Lista de Classes NICE", desc: "Classificação internacional de produtos", url: "https://www.gov.br/inpi/pt-br/servicos/marcas/classificacao-de-produtos-e-servicos/classificacao-nice" },
              { name: "Atendimento Sebrae", desc: "Suporte gratuito para empreendedores", url: "https://www.sebrae.com.br/" },
              { name: "Revista da Propriedade Industrial", desc: "Publicação oficial com despachos", url: "http://revistas.inpi.gov.br/rpi/" },
            ].map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors group" style={{ borderColor: 'rgba(0,239,255,0.1)', background: 'rgba(0,239,255,0.04)' }}>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/90">{r.name}</p>
                  <p className="text-[10px] text-white/50">{r.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FERRAMENTAS */}
      <motion.div id="ferramentas" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,239,255,0.1)', border: '1px solid rgba(0,239,255,0.2)' }}>
            <Wrench className="h-5 w-5" style={{ color: '#00EFFF' }} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Ferramentas Úteis</h2>
            <p className="text-xs text-white/60">Tudo que você precisa para registrar sua marca</p>
          </div>
        </div>

        {toolGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9EEBFF' }}>{group.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((tool) => (
                <div key={tool.name} className="rounded-xl border p-4 space-y-3" style={{ background: 'linear-gradient(145deg, #102A43, #0A192F)', borderColor: 'rgba(0,239,255,0.1)' }}>
                  <h4 className="text-sm font-semibold text-foreground">{tool.name}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">{tool.desc}</p>
                  <p className="text-[10px] font-semibold" style={{ color: '#9EEBFF' }}>{tool.purpose}</p>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: '#00EFFF', color: '#0A192F' }}>
                    Acessar <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* BLOCO FINAL */}
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 lg:p-8 space-y-5 text-center" style={{ background: 'linear-gradient(135deg, #102A43 0%, #0A192F 100%)', borderColor: 'rgba(0,239,255,0.2)' }}>
        <div className="h-px w-full -mt-6 lg:-mt-8" style={{ background: 'linear-gradient(90deg, transparent, #9EEBFF, #00EFFF, transparent)' }} />
        <h2 className="font-display text-xl lg:text-2xl font-extrabold text-foreground">Sua marca merece proteção</h2>
        <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
          Você aprendeu por que registrar, como se preparar, como fazer o pedido no INPI e como acompanhar com segurança. Agora é hora de agir e proteger o que você construiu.
        </p>

        <div className="rounded-xl p-4 border inline-flex items-start gap-3 mx-auto text-left max-w-md" style={{ background: 'rgba(0,239,255,0.06)', borderColor: 'rgba(0,239,255,0.15)' }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#00EFFF' }} />
          <p className="text-xs text-white/80 leading-relaxed">
            <strong className="text-foreground">Soph diz:</strong> Sua marca é única. Protegê-la no INPI garante que ninguém mais poderá usá-la. Esse é um passo que todo empreendedor sério precisa dar.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/estruture" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-white/5" style={{ borderColor: 'rgba(0,239,255,0.3)', color: '#9EEBFF' }}>
            <ArrowLeft className="h-4 w-4" /> Voltar para Estruture
          </Link>
          <Link to="/soph" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-primary-foreground hover:brightness-110 transition-all" style={{ background: GRAD }}>
            <MessageCircle className="h-4 w-4" /> Falar com a Soph
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
