import { motion } from "framer-motion";
import { ArrowRight, Store, Bookmark, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBolsasSuppliers } from "@/hooks/useBolsasSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { BolsasArtwork } from "@/components/bolsas/BolsasArtwork";
import "./bolsas-premium.css";

const navCards = [
  {
    kind: "all",
    title: "Ver Todos os Fornecedores",
    desc: "Lista completa de bolsas, mochilas e malas",
    route: "/fornecedores/bolsas-mochilas-malas/lista",
  },
  {
    kind: "search",
    title: "Buscar Fornecedor",
    desc: "Encontre pelo nome e acesse o contato direto",
    route: "/fornecedores/bolsas-mochilas-malas/busca",
  },
  {
    kind: "favorites",
    title: "Meus Favoritos",
    desc: "Acesse rapidamente os fornecedores que você salvou",
    route: "/fornecedores/bolsas-mochilas-malas/favoritos",
  },
  {
    kind: "back",
    title: "Voltar para Central",
    desc: "Retorne à Central de Fornecedores",
    route: "/fornecedores",
  },
] as const;
const steps = [
  {
    num: "1",
    icon: <ShoppingBag className="h-4 w-4" />,
    text: "Explore os fornecedores do nicho",
  },
  {
    num: "2",
    icon: <Store className="h-4 w-4" />,
    text: "Encontre seus parceiros ideais",
  },
  {
    num: "3",
    icon: <Bookmark className="h-4 w-4" />,
    text: "Salve seus favoritos",
  },
];

export default function BolsasHub() {
  const navigate = useNavigate();
  const { data: suppliers } = useBolsasSuppliers();
  const { favorites } = useSupabaseFavorites();
  const supCount = suppliers?.length ?? 0;
  const favCount = (suppliers || []).filter((s) =>
    s.allIds.some((id) => favorites.includes(id)),
  ).length;
  const stats = [
    { label: "Fornecedores", value: supCount, kind: "suppliers", tone: 0 },
    { label: "Favoritos salvos", value: favCount, kind: "heart", tone: 2 },
    { label: "Nicho", value: "Premium", kind: "premium", tone: 1 },
  ] as const;

  return (
    <div className="bolsas-hub">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bolsas-hub-header"
      >
        <div className="bolsas-hub-heading">
          <p className="bolsas-hub-eyebrow">Central de Fornecedores</p>
          <h1>
            Bolsas, Mochilas <span>e Malas</span>
          </h1>
        </div>
        <div className="bolsas-hub-header-art">
          <BolsasArtwork kind="header" />
        </div>
        <p className="bolsas-hub-description">
          Fornecedores curados especialmente para o nicho de bolsas, mochilas e
          malas. Acesse contatos diretos e monte sua carteira de parceiros.
        </p>
      </motion.header>
      <dl className="bolsas-hub-stats" aria-live="polite">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bolsas-hub-stat"
            data-tone={stat.tone}
          >
            <div className="bolsas-hub-stat-art">
              <BolsasArtwork kind={stat.kind} />
            </div>
            <div className="bolsas-hub-stat-copy">
              <dt id={`bolsas-stat-${index}`}>{stat.label}</dt>
              <dd aria-labelledby={`bolsas-stat-${index}`}>{stat.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <section
        className="bolsas-hub-start"
        aria-labelledby="bolsas-start-title"
      >
        <h2 id="bolsas-start-title">Comece por aqui</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.num}>
              <span className="bolsas-hub-step-number" aria-hidden="true">
                {step.num}
              </span>
              <span className="bolsas-hub-step-icon" aria-hidden="true">
                {step.icon}
              </span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </section>
      <nav
        className="bolsas-hub-cards"
        aria-label="Áreas de Bolsas, Mochilas e Malas"
      >
        {navCards.map((card, index) => (
          <motion.button
            key={card.title}
            type="button"
            onClick={() => navigate(card.route)}
            className="bolsas-hub-card"
            data-tone={index}
          >
            <span className="bolsas-hub-card-art">
              <BolsasArtwork kind={card.kind} />
            </span>
            <span className="bolsas-hub-card-copy">
              <span className="bolsas-hub-card-title">{card.title}</span>
              <span className="bolsas-hub-card-description">{card.desc}</span>
            </span>
            <span className="bolsas-hub-card-arrow" aria-hidden="true">
              <ArrowRight size={23} />
            </span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}
