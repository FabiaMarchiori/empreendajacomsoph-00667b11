import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { businessImages } from "@/components/business/assets";
import {
  BusinessHero,
  SophAccess,
  ToolIllustration,
} from "@/components/business/BusinessVisuals";

const pathCards = [
  {
    title: "Criar seu Domínio e Site",
    description:
      "Aprenda a criar seu site e domínio próprio usando ferramentas gratuitas e inteligência artificial.",
    image: businessImages.site,
    steps: [
      "Entender domínio e hospedagem",
      "Escolher nome e registrar",
      "Criar site com IA",
    ],
    cta: "Iniciar Jornada Digital",
    link: "/vendas/dominio-site",
  },
  {
    title: "Como Vender em Marketplaces",
    description:
      "Aprenda a estruturar sua operação para vender em grandes marketplaces com mais clareza e eficiência.",
    image: businessImages.marketplace,
    steps: [
      "Pré-requisitos e documentação",
      "Anúncios de alta performance",
      "Logística e expedição",
    ],
    cta: "Escalar em Marketplaces",
    link: "/vendas/marketplaces",
  },
];

const tips = [
  {
    image: businessImages.camera,
    title: "Fotos que Vendem",
    description:
      "Aprenda a criar imagens profissionais que convertem visitantes em compradores reais.",
  },
  {
    image: businessImages.star,
    title: "Prova Social",
    description:
      "Use depoimentos, avaliações e números para gerar confiança imediata no seu público.",
  },
  {
    image: businessImages.target,
    title: "Anúncios Estratégicos",
    description:
      "Invista de forma inteligente em tráfego pago para escalar suas vendas com previsibilidade.",
  },
];

export default function VendasPage() {
  return (
    <div className="business-premium business-sales">
      <BusinessHero
        kind="sales"
        title={
          <>
            Vendas e <span>Presença Digital</span>
          </>
        }
        description="Não basta estar online. É preciso ser encontrado, gerar confiança e transformar presença digital em vendas reais."
      />
      <section
        className="business-sales-grid"
        aria-label="Caminhos para vender"
      >
        {pathCards.map((card) => (
          <article
            key={card.title}
            className="business-sales-card business-panel"
          >
            <div className="business-sales-intro">
              <ToolIllustration src={card.image} />
              <div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </div>
            <ol className="business-sales-steps">
              {card.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>{step}</div>
                </li>
              ))}
            </ol>
            <Link to={card.link} className="business-action">
              {card.cta} <ArrowRight size={20} />
            </Link>
          </article>
        ))}
      </section>
      <section className="business-tips" aria-labelledby="business-tips-title">
        <div className="business-section-heading">
          <TrendingUp size={28} />
          <h2 id="business-tips-title">Dicas de Especialista</h2>
        </div>
        <div className="business-tip-grid">
          {tips.map((tip) => (
            <article key={tip.title} className="business-tip">
              <div className="business-tip-icon" aria-hidden="true">
                <ToolIllustration src={tip.image} />
              </div>
              <div className="business-tip-copy">
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SophAccess>
        Converse sobre presença digital, marketplaces e estratégias para o seu
        negócio.
      </SophAccess>
    </div>
  );
}
