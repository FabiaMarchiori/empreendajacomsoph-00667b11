import { motion } from "framer-motion";
import {
  BarChart3, Star, MessageCircle, ArrowRight, Sparkles, TrendingUp,
  AlertTriangle, DollarSign, Package, FileText, Users, Database,
  ChevronDown, Activity, Percent, Calculator, HelpCircle, Zap, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { useErpEntry } from "@/hooks/useErpEntry";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const faqs = [
  { q: "Como calcular impostos no preço?", a: "Inclua a alíquota do seu regime tributário (MEI, Simples, etc.) como percentual fixo na composição do preço. O sistema de precificação já calcula isso automaticamente." },
  { q: "O que é margem de contribuição?", a: "É o valor que sobra de cada venda após descontar os custos variáveis. Esse valor contribui para cobrir os custos fixos e gerar lucro." },
  { q: "Diferença entre markup e margem?", a: "Markup é o percentual adicionado sobre o custo para formar o preço. Margem é o percentual de lucro sobre o preço de venda. São cálculos diferentes com resultados diferentes." },
  { q: "Com que frequência devo revisar meus preços?", a: "Idealmente a cada 30 dias ou sempre que houver variação relevante nos custos de insumos, fornecedores ou impostos." },
];

export default function GestaoPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { enterErp, isLoading: erpLoading } = useErpEntry();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">Gestão do </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}>Negócio</span>
        </h1>
        <p className="text-sm lg:text-base text-white max-w-2xl leading-relaxed">
          Do ERP à precificação estratégica, organize sua operação e acompanhe a saúde do seu negócio em um único painel.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {["ERP", "Precificação", "Fluxo de Caixa", "Estoque", "DRE"].map(t => (
            <span key={t} className="px-3 py-1 rounded-full text-[11px] font-semibold border text-white" style={{ borderColor: 'rgba(0,239,255,0.25)', background: 'rgba(0,239,255,0.08)' }}>{t}</span>
          ))}
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* ── ERP – BLOCO PRINCIPAL ── */}
        <motion.div variants={item} className="rounded-2xl border border-primary/25 bg-gradient-card p-6 lg:p-8 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl bg-gradient-primary-soft border border-primary/15 flex items-center justify-center flex-shrink-0">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-xl text-foreground">ERP – Soph Gestão</h2>
                <StatusBadge status="bonus" />
              </div>
              <p className="text-sm text-muted-foreground">Sistema completo de gestão: estoque, vendas, clientes e financeiro em uma única ferramenta.</p>
            </div>
          </div>

          {/* Mini métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: DollarSign, label: "Vendas hoje", value: "R$ 1.240", color: "text-emerald-400" },
              { icon: Package, label: "Alertas estoque", value: "3 itens", color: "text-amber-400" },
              { icon: AlertTriangle, label: "Contas a pagar", value: "2 pendentes", color: "text-red-400" },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-muted/40 border border-border p-4 text-center">
                <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
                <p className={`font-display font-bold text-lg ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => enterErp()}
            disabled={erpLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-primary-btn text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {erpLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Conectando ao ERP...
              </>
            ) : (
              <>
                Acessar Sistema Completo <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.div>

        {/* ── PRECIFICAÇÃO – BLOCO ESTRATÉGICO ── */}
        <motion.div variants={item} className="rounded-2xl border border-primary/20 bg-gradient-card p-6 lg:p-8 shadow-glow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl bg-gradient-primary-soft border border-primary/15 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-xl text-foreground">Sistema de Precificação</h2>
                <StatusBadge status="liberado" />
              </div>
              <p className="text-sm text-muted-foreground">Calcule o preço ideal com margem, custos e competitividade. Ferramenta essencial para lucrar de verdade.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Percent, label: "Markup médio", value: "85%", color: "text-primary" },
              { icon: TrendingUp, label: "Margem de lucro", value: "32%", color: "text-emerald-400" },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-muted/40 border border-border p-4 text-center">
                <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
                <p className={`font-display font-bold text-lg ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => navigate("/gestao/precificacao")} className="px-6 py-3 rounded-xl bg-gradient-primary-btn text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2">
            Novo Cálculo de Preço <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* ── SOPH CONSULTIVA ── */}
        <motion.div variants={item} className="rounded-2xl border border-accent/30 bg-gradient-card p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="flex items-start gap-4 mb-5">
            <div className="h-14 w-14 rounded-xl bg-gradient-primary-soft border border-primary/15 flex items-center justify-center flex-shrink-0 animate-float">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-1">Soph está analisando sua gestão</h2>
              <StatusBadge status="liberado" />
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 border border-border p-5 mb-5">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="text-primary font-semibold">Insight:</span> Identifiquei que sua margem pode melhorar em alguns produtos. Revisar a precificação agora pode aumentar seu lucro em até 15% sem mudar o volume de vendas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-primary-btn text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2">
              Revisar Precificação <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => navigate("/soph")} className="px-5 py-2.5 rounded-xl border border-primary/20 bg-muted/30 text-foreground text-sm font-medium hover:border-primary/40 transition-all flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-primary" /> Falar com a Soph
            </button>
          </div>
        </motion.div>

        {/* ── DÚVIDAS FREQUENTES ── */}
        <motion.div variants={item} className="rounded-2xl border border-border bg-gradient-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-5">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-foreground">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── MÉTRICAS / DASHBOARD ── */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fluxo de Caixa */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center gap-3 mb-5">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Fluxo de Caixa Mensal</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Entradas", value: "R$ 12.450", pct: 78, color: "bg-emerald-500" },
                { label: "Saídas", value: "R$ 8.320", pct: 52, color: "bg-red-400" },
                { label: "Saldo", value: "R$ 4.130", pct: 100, color: "bg-primary" },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-foreground font-semibold">{r.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${r.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saúde da Gestão */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Saúde da Gestão</h3>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} initial={{ strokeDashoffset: 2 * Math.PI * 42 }} animate={{ strokeDashoffset: 2 * Math.PI * 42 * 0.24 }} transition={{ duration: 1.2, delay: 0.3 }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-2xl text-primary">76%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { label: "Financeiro", emoji: "✅" },
                { label: "Estoque", emoji: "⚠️" },
                { label: "Vendas", emoji: "✅" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-muted/30 border border-border p-2">
                  <span className="text-base">{s.emoji}</span>
                  <p className="text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ACESSOS RÁPIDOS ── */}
        <motion.div variants={item} className="rounded-2xl border border-border bg-gradient-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">Acessos Rápidos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: FileText, label: "Gerar Relatório DRE" },
              { icon: Users, label: "Contatos Clientes" },
              { icon: Database, label: "Backup de Dados" },
            ].map(a => (
              <button key={a.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40 transition-all text-left group">
                <a.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
