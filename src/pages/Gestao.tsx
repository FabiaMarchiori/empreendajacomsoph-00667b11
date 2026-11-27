import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  ChevronDown,
  Percent,
  HelpCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { useErpEntry } from "@/hooks/useErpEntry";
import { useErpAccess } from "@/hooks/useErpAccess";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { businessImages } from "@/components/business/assets";
import {
  BusinessHero,
  SophAccess,
  ToolIllustration,
} from "@/components/business/BusinessVisuals";

import { useSophGestaoPreview } from "@/features/soph-gestao/access/PreviewAccess";

const faqs = [
  {
    q: "Como calcular impostos no preço?",
    a: "Inclua a alíquota do seu regime tributário (MEI, Simples, etc.) como percentual fixo na composição do preço. O sistema de precificação já calcula isso automaticamente.",
  },
  {
    q: "O que é margem de contribuição?",
    a: "É o valor que sobra de cada venda após descontar os custos variáveis. Esse valor contribui para cobrir os custos fixos e gerar lucro.",
  },
  {
    q: "Diferença entre markup e margem?",
    a: "Markup é o percentual adicionado sobre o custo para formar o preço. Margem é o percentual de lucro sobre o preço de venda. São cálculos diferentes com resultados diferentes.",
  },
  {
    q: "Com que frequência devo revisar meus preços?",
    a: "Idealmente a cada 30 dias ou sempre que houver variação relevante nos custos de insumos, fornecedores ou impostos.",
  },
];

export default function GestaoPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { enterErp, isLoading: erpLoading } = useErpEntry();
  const { hasErpAccess, isLoading: accessLoading } = useErpAccess();
  const { user } = useAuth();
  const previewAccess = useSophGestaoPreview();

  const { data: simulations } = useQuery({
    queryKey: ["pricing_simulations_dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("pricing_simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: fixedCosts } = useQuery({
    queryKey: ["pricing_fixed_costs_dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("pricing_fixed_costs")
        .select("*")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const hasSimulations = simulations && simulations.length > 0;
  const hasCosts = fixedCosts && fixedCosts.length > 0;

  // Real metrics from simulations
  const totalRevenue = hasSimulations
    ? simulations.reduce((acc, s) => acc + (s.preco_sugerido || 0), 0)
    : 0;
  const totalCost = hasSimulations
    ? simulations.reduce((acc, s) => acc + (s.custo_total || 0), 0)
    : 0;
  const totalProfit = hasSimulations
    ? simulations.reduce((acc, s) => acc + (s.lucro_liquido || 0), 0)
    : 0;
  const avgMargin = hasSimulations
    ? simulations.reduce((acc, s) => acc + (s.margem_final || 0), 0) /
      simulations.length
    : 0;
  const totalFixedCosts = hasCosts
    ? fixedCosts.reduce((acc, c) => acc + (c.valor || 0), 0)
    : 0;

  // Health score based on real data
  const hasData = hasSimulations || hasCosts;
  const precificacaoScore = hasSimulations
    ? avgMargin > 20
      ? 100
      : avgMargin > 10
        ? 70
        : 40
    : 0;
  const custosScore = hasCosts ? 100 : 0;
  const healthScore = hasData
    ? Math.round((precificacaoScore + custosScore) / 2)
    : 0;

  const handleErpClick = () => {
    if (!hasErpAccess) {
      toast.error(
        "O ERP Soph é um módulo premium do seu Ecossistema. Ative este módulo para acessar gestão completa, financeiro, estoque e operação.",
        { duration: 6000 },
      );
      return;
    }
    enterErp();
  };

  return (
    <div className="business-premium business-management">
      <BusinessHero
        kind="management"
        title={
          <>
            Gestão do <span>Negócio</span>
          </>
        }
        description="Do ERP à precificação estratégica, organize sua operação e acompanhe a saúde do seu negócio em um único painel."
      >
        <div className="business-chips">
          {["ERP", "Precificação", "Fluxo de Caixa", "Estoque", "DRE"].map(
            (text) => (
              <span key={text}>{text}</span>
            ),
          )}
        </div>
      </BusinessHero>
      <div className="business-management-stack">
        <section
          className="business-management-card business-management-card--erp business-panel"
          aria-labelledby="erp-title"
        >
          <div className="business-management-heading">
            <ToolIllustration src={businessImages.erp} />
            <div>
              <div className="business-title-line">
                <h2 id="erp-title">Soph Gestão 2.0</h2>
                <StatusBadge status="bonus" />
              </div>
              <p>
                Sistema completo de gestão: estoque, vendas, clientes e
                financeiro em uma única ferramenta.
              </p>
            </div>
          </div>
          <div className="business-management-body">
            <div
              className="business-metric-grid"
              aria-label="Informações disponíveis no ERP"
            >
              {[
                { icon: DollarSign, label: "Vendas hoje" },
                { icon: Package, label: "Alertas estoque" },
                { icon: AlertTriangle, label: "Contas a pagar" },
              ].map((metric) => (
                <div key={metric.label} className="business-metric">
                  <metric.icon aria-hidden="true" />
                  <strong>Consulte no ERP</strong>
                  <p>{metric.label}</p>
                </div>
              ))}
            </div>
            {previewAccess === "allowed" ? (
              <Link to="/gestao/soph-gestao" className="business-action">
                Acessar Soph Gestão 2.0 <ArrowRight size={18} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleErpClick}
                disabled={accessLoading || previewAccess === "unavailable"}
                className="business-action"
              >
                {accessLoading ? "Verificando acesso…" : previewAccess === "unavailable"
                  ? "Acesso indisponível no momento"
                  : "Ativar Módulo ERP"}
              </button>
            )}
          </div>
          {previewAccess === "allowed" && (
            <button
              type="button"
              onClick={handleErpClick}
              disabled={erpLoading}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
            >
              {erpLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Conectando ao ERP…</>
              ) : (
                <>Acessar ERP Anterior <ArrowRight size={18} /></>
              )}
            </button>
          )}
          <p className="business-data-note">
            <Info size={15} /> Soph Gestão 2.0 é uma demonstração. Os dados operacionais continuam disponíveis no ERP anterior.
          </p>
        </section>
        <section
          className="business-management-card business-management-card--pricing business-panel"
          aria-labelledby="pricing-title"
        >
          <div className="business-management-heading">
            <ToolIllustration src={businessImages.pricing} />
            <div>
              <div className="business-title-line">
                <h2 id="pricing-title">Sistema de Precificação</h2>
                <StatusBadge status="liberado" />
              </div>
              <p>
                Calcule o preço ideal com margem, custos e competitividade.
                Ferramenta essencial para lucrar de verdade.
              </p>
            </div>
          </div>
          <div className="business-management-body">
            <div className="business-metric-grid business-metric-grid--two">
              <div className="business-metric">
                <Percent aria-hidden="true" />
                <strong>—</strong>
                <p>Markup médio</p>
                <p>Consulte suas simulações</p>
              </div>
              <div className="business-metric">
                <TrendingUp aria-hidden="true" />
                <strong>
                  {hasSimulations
                    ? `${avgMargin.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                    : "Sem simulações"}
                </strong>
                <p>Margem de lucro</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/gestao/precificacao")}
              className="business-action business-action--rose"
            >
              Novo Cálculo de Preço <ArrowRight size={19} />
            </button>
          </div>
        </section>
      </div>
      <section
        className="business-management-tools"
        aria-labelledby="management-tools-title"
      >
        <div className="business-section-heading">
          <Layers size={28} aria-hidden="true" />
          <h2 id="management-tools-title">Ferramentas da Gestão</h2>
        </div>
        <div className="business-management-tools-grid">
          {[
            {
              title: "Controle de Estoque",
              description: "Entradas, saídas e giro de produtos.",
              image: businessImages.stock,
            },
            {
              title: "Fluxo de Caixa",
              description: "Receitas, despesas e saldo.",
              image: businessImages.cashFlow,
            },
            {
              title: "Contas a Pagar",
              description: "Vencimentos e pagamentos.",
              image: businessImages.payable,
            },
            {
              title: "DRE Simplificado",
              description: "Resultado do negócio.",
              image: businessImages.dre,
            },
          ].map((tool) => (
            <article key={tool.title} className="business-management-tool">
              <div className="business-management-tool-art" aria-hidden="true">
                {tool.image && <ToolIllustration src={tool.image} />}
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </article>
          ))}
        </div>
        <p className="business-data-note">
          <Info size={15} aria-hidden="true" /> Não há acesso direto a estas
          ferramentas neste aplicativo.
        </p>
      </section>
      <div className="business-management-footer">
        <SophAccess>
          Conte com a Soph para entender custos, precificação e os próximos
          passos do seu negócio.
        </SophAccess>
        <section
          className="business-faq business-panel"
          aria-labelledby="business-faq-title"
        >
          <div className="business-section-heading">
            <HelpCircle size={27} />
            <h2 id="business-faq-title">Dúvidas Frequentes</h2>
          </div>
          {faqs.map((faq, index) => (
            <div key={faq.q} className="business-faq-item">
              <button
                type="button"
                aria-expanded={openFaq === index}
                aria-controls={`business-faq-${index}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === index ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>
              {openFaq === index && (
                <motion.div
                  id={`business-faq-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>{faq.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
