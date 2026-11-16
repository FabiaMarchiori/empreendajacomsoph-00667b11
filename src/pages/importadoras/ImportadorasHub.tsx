import "@/styles/header-artwork.css";
import { motion } from "framer-motion";
import { ArrowRight, Store, LayoutGrid, Bookmark } from "lucide-react";
import { ImportadorasArtwork } from "@/components/importadoras/ImportadorasArtwork";
import "@/components/importadoras/importadoras-hub.css";
import { useNavigate } from "react-router-dom";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseSuppliers } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";

const navCards = [
  {
    icon: <ImportadorasArtwork kind="explore" />,
    title: "Explorar Categorias",
    desc: "Navegue por nichos de produtos e descubra oportunidades",
    route: "/fornecedores/importadoras-25/categorias",
    accent: true,
  },
  {
    icon: <ImportadorasArtwork kind="search" />,
    title: "Buscar Importadoras",
    desc: "Encontre pelo nome e acesse contato direto",
    route: "/fornecedores/importadoras-25/busca",
    accent: false,
  },
  {
    icon: <ImportadorasArtwork kind="favorites" />,
    title: "Meus Favoritos",
    desc: "Acesse rapidamente as importadoras que você salvou",
    route: "/fornecedores/importadoras-25/favoritos",
    accent: false,
  },
  {
    icon: <ImportadorasArtwork kind="back" />,
    title: "Voltar para Central",
    desc: "Retorne à Central de Fornecedores",
    route: "/fornecedores",
    accent: false,
  },
];

const steps = [
  {
    num: "1",
    icon: <LayoutGrid className="h-4 w-4" />,
    text: "Explore categorias de produtos",
  },
  {
    num: "2",
    icon: <Store className="h-4 w-4" />,
    text: "Encontre importadoras ideais",
  },
  {
    num: "3",
    icon: <Bookmark className="h-4 w-4" />,
    text: "Salve seus favoritos",
  },
];

export default function ImportadorasHub() {
  const navigate = useNavigate();
  const { data: categories } = useSupabaseCategories();
  const { data: suppliers } = useSupabaseSuppliers();
  const { favorites } = useSupabaseFavorites();

  const catCount = categories?.length ?? 0;
  const supCount = suppliers?.length ?? 0;
  const favCount = favorites?.length ?? 0;

  const stats = [
    {
      label: "Categorias",
      value: catCount,
      icon: <ImportadorasArtwork kind="categories" />,
    },
    {
      label: "Importadoras",
      value: supCount,
      icon: <ImportadorasArtwork kind="stores" />,
    },
    {
      label: "Favoritos salvos",
      value: favCount,
      icon: <ImportadorasArtwork kind="heart" />,
    },
  ];

  return (
    <div className="importadoras-hub">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="importadoras-hub-header"
      >
        <div className="importadoras-hub-heading">
          <p className="importadoras-hub-eyebrow">Central de Fornecedores</p>
          <h1>
            Importadoras <span>25 de Março</span>
          </h1>
        </div>
        <div className="importadoras-hub-header-art">
          <ImportadorasArtwork kind="header" />
        </div>
        <p className="importadoras-hub-description">
          Sua central completa de importadoras do maior polo Comercial do
          Brasil. Explore categorias, encontre contatos e monte sua carteira de
          Importadoras.
        </p>
      </motion.header>

      <div>
        <dl className="importadoras-hub-stats" aria-live="polite">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="importadoras-hub-stat"
              data-tone={index}
            >
              <div className="importadoras-hub-stat-art">{stat.icon}</div>
              <div className="importadoras-hub-stat-copy">
                <dt id={`importadoras-stat-label-${index}`}>{stat.label}</dt>
                <dd aria-labelledby={`importadoras-stat-label-${index}`}>
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="importadoras-hub-count-note">
          O total de Importadoras corresponde aos registros do catálogo,
          incluindo repetições entre categorias.
        </p>
      </div>

      <section
        className="importadoras-hub-start"
        aria-labelledby="importadoras-start-title"
      >
        <h2 id="importadoras-start-title">Comece por aqui</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.num}>
              <span className="importadoras-hub-step-number" aria-hidden="true">
                {step.num}
              </span>
              <span className="importadoras-hub-step-icon" aria-hidden="true">
                {step.icon}
              </span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <nav
        className="importadoras-hub-cards"
        aria-label="Áreas de Importadoras 25 de Março"
      >
        {navCards.map((card, index) => (
          <motion.button
            key={card.title}
            type="button"
            onClick={() => navigate(card.route)}
            className="importadoras-hub-card"
            data-tone={index}
          >
            <span className="importadoras-hub-card-art">{card.icon}</span>
            <span className="importadoras-hub-card-copy">
              <span className="importadoras-hub-card-title">{card.title}</span>
              <span className="importadoras-hub-card-description">
                {card.desc}
              </span>
            </span>
            <span className="importadoras-hub-card-arrow" aria-hidden="true">
              <ArrowRight size={23} />
            </span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}
