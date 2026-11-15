import { ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useProfile } from "@/hooks/useProfile";
import { QuickActions } from "@/components/home/QuickActions";
import { getFirstName } from "@/components/home/firstName";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useErpAccess } from "@/hooks/useErpAccess";
import { homeAssets } from "@/components/home/assets";
import "@/components/home/home-premium.css";

const categories = [
  { title: "Fornecedores", id: "home-fornecedores" },
  { title: "Estruture seu Negócio", id: "home-estrutura" },
  { title: "Vendas e Presença", id: "home-vendas" },
  { title: "Gestão do Negócio", id: "home-gestao" },
  { title: "Soph — Sua Sócia Digital", id: "home-soph" },
];

const homeCards = [
  {
    title: "Central de Fornecedores",
    description: "Encontre fornecedores e oportunidades para o seu negócio.",
    to: "/fornecedores",
    color: "#00B8B2",
    section: "home-fornecedores",
    access: "hub",
  },
  {
    title: "Abrir CNPJ / MEI",
    description: "Dê o primeiro passo para formalizar seu negócio.",
    to: "/estrutura/abrir-mei",
    color: "#0057F5",
    section: "home-estrutura",
    access: "ecosystem",
  },
  {
    title: "Criar Logotipo e Identidade Visual",
    description: "Construa uma marca com a sua personalidade.",
    to: "/estrutura/logo-marca",
    color: "#8800E8",
    access: "ecosystem",
  },
  {
    title: "Registrar sua Marca",
    description: "Conheça os passos para proteger sua marca.",
    to: "/estrutura/registrar-marca",
    color: "#E600A9",
    access: "ecosystem",
  },
  {
    title: "Criar Domínio e Site",
    description: "Prepare o endereço digital do seu negócio.",
    to: "/vendas/dominio-site",
    color: "#087BFF",
    section: "home-vendas",
    access: "ecosystem",
  },
  {
    title: "Como Vender em Marketplaces",
    description: "Explore os canais para levar seus produtos mais longe.",
    to: "/vendas/marketplaces",
    color: "#FF3854",
    access: "ecosystem",
  },
  {
    title: "ERP — Soph Gestão",
    description: "Organize sua operação, estoque e financeiro.",
    to: "/gestao",
    color: "#00C83C",
    section: "home-gestao",
    access: "erp",
  },
  {
    title: "Sistema de Precificação",
    description: "Calcule preços para proteger a sua margem.",
    to: "/gestao/precificacao",
    color: "#00BFC5",
    access: "ecosystem",
  },
  {
    title: "Conversar com a Soph IA",
    description: "Conte com a sua sócia digital para dar o próximo passo.",
    to: "/soph",
    color: "#00C9CC",
    section: "home-soph",
    access: "ecosystem",
  },
];

export default function HomePage() {
  const { hasEcosystemAccess, isLoading } = usePlanAccess();
  const { hasErpAccess, isLoading: erpLoading } = useErpAccess();
  const { data: profile } = useProfile();
  const firstName = getFirstName(profile?.first_name);

  return (
    <div className="home-premium">
      <section className="premium-hero" aria-labelledby="home-title">
        <picture>
          <source media="(min-width: 768px)" srcSet={homeAssets.hero[0]} />
          <img
            src={homeAssets.hero[1]}
            width="1752"
            height="897"
            alt="Caixa de fornecedores da 25 de Março com bolsas, presentes e outros produtos"
            loading="eager"
          />
        </picture>
        <div
          className={`premium-hero-copy${firstName && firstName.length > 20 ? " premium-hero-copy-long-name" : ""}${firstName && firstName.length > 30 ? " premium-hero-copy-very-long-name" : ""}`}
        >
          <h1 id="home-title">
            <span className="premium-hero-desktop">
              {firstName ? (
                <>
                  Olá, <strong>{firstName}!</strong>
                </>
              ) : (
                "Olá!"
              )}{" "}
              <span className="premium-hero-wave">👋</span>
            </span>
            <span className="premium-hero-mobile">
              {firstName ? `Olá, ${firstName}!` : "Olá!"}{" "}
              <span className="premium-hero-wave">👋</span>
            </span>
          </h1>
          <p className="premium-hero-desktop">
            Tudo para fazer seu negócio crescer.
          </p>
          <p className="premium-hero-mobile">
            Tudo para fazer seu negócio crescer.
          </p>
        </div>
      </section>

      <nav className="premium-categories" aria-label="Seções da Home">
        {categories.map((category, index) => (
          <a href={`#${category.id}`} key={category.id}>
            <img
              src={homeAssets.categories[index]}
              alt=""
              width="512"
              height="512"
            />
            <span>
              {category.title === "Fornecedores" ? (
                <>
                  Fornece
                  <wbr />
                  dores
                </>
              ) : (
                category.title
              )}
            </span>
          </a>
        ))}
      </nav>

      <section
        aria-label="Ferramentas para empreender"
        className="premium-card-grid"
      >
        {homeCards.map((card, index) => {
          // These labels reflect the existing hooks; destination guards remain authoritative.
          const loading =
            card.access !== "hub" &&
            (isLoading || (card.access === "erp" && erpLoading));
          const allowed =
            card.access === "hub" ||
            (hasEcosystemAccess && (card.access !== "erp" || hasErpAccess));
          const status = loading
            ? "Verificando acesso"
            : !allowed
              ? card.access === "erp" && hasEcosystemAccess
                ? "Módulo adicional"
                : "Ecossistema Completo"
              : "";
          return (
            <Link
              to={card.to}
              key={card.title}
              id={card.section}
              className="premium-tool-card"
              style={{ "--card-color": card.color } as CSSProperties}
              aria-describedby={status ? `home-access-${index}` : undefined}
            >
              <img
                className="premium-tool-icon"
                src={homeAssets.cards[index]}
                alt=""
                loading="lazy"
              />
              <div className="premium-tool-copy">
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
              {status && (
                <span className="premium-access" id={`home-access-${index}`}>
                  {!loading && <Lock size={11} aria-hidden="true" />}
                  {status}
                </span>
              )}
              <span className="premium-card-arrow" aria-hidden="true">
                <ArrowRight size={19} />
              </span>
            </Link>
          );
        })}
      </section>

      <nav className="premium-quick-actions" aria-label="Ações rápidas">
        <QuickActions />
      </nav>
    </div>
  );
}
