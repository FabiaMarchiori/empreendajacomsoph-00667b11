import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { ImportadorasArtwork } from "@/components/importadoras/ImportadorasArtwork";
import "@/components/importadoras/importadoras-hub.css";
import "./importadoras-categorias.css";

import acessorios from "@/assets/importadoras/categories/01-acessorios-lacos.png";
import bijuterias from "@/assets/importadoras/categories/02-bijuterias-semijoias.png";
import bolsas from "@/assets/importadoras/categories/03-bolsas-mochilas-malas.png";
import cosmeticos from "@/assets/importadoras/categories/04-cosmeticos-perfumes.png";
import embalagens from "@/assets/importadoras/categories/05-embalagens-personalizadas.png";
import games from "@/assets/importadoras/categories/06-games-eletronicos.png";
import garrafas from "@/assets/importadoras/categories/07-garrafas-marmitas.png";
import maquiagem from "@/assets/importadoras/categories/08-maquiagem.png";
import papelaria from "@/assets/importadoras/categories/09-papelaria-fofa.png";
import peliculas from "@/assets/importadoras/categories/10-peliculas-capinhas.png";
import perucas from "@/assets/importadoras/categories/11-perucas-cabelos.png";
import presentes from "@/assets/importadoras/categories/12-presentes-pelucias.png";
import unhas from "@/assets/importadoras/categories/13-unhas-cilios.png";
import utilidades from "@/assets/importadoras/categories/14-utilidades-domesticas.png";

// Presentation only: entries, counts and destinations still come from the hook.
const visuals = [
  {
    slugs: ["acessorios-e-lacos"],
    title: "Acessórios e Laços",
    image: acessorios,
    tone: "turquoise",
  },
  {
    slugs: ["bijouterias-e-semijoias", "bijuterias-e-semijoias"],
    title: "Bijouterias e Semijoias",
    image: bijuterias,
    tone: "blue",
  },
  {
    slugs: [
      "mochilas-e-malas",
      "bolsas-mochilas-e-malas",
      "bolsas-mochilas-malas",
    ],
    title: "Bolsas, Mochilas e Malas",
    image: bolsas,
    tone: "purple",
  },
  {
    slugs: ["cosmeticos-e-perfumes"],
    title: "Cosméticos e Perfumes",
    image: cosmeticos,
    tone: "coral",
  },
  {
    slugs: ["embalagens-personalizadas"],
    title: "Embalagens Personalizadas",
    image: embalagens,
    tone: "blue",
  },
  {
    slugs: ["games-e-eletronicos", "games-e-acessorios", "eletronicos"],
    title: "Games e Eletrônicos",
    image: games,
    tone: "green",
  },
  {
    slugs: ["garrafas-e-marmitas"],
    title: "Garrafas e Marmitas",
    image: garrafas,
    tone: "cyan",
  },
  {
    slugs: ["maquiagem"],
    title: "Maquiagem",
    image: maquiagem,
    tone: "magenta",
  },
  {
    slugs: ["papelaria-fofa"],
    title: "Papelaria Fofa",
    image: papelaria,
    tone: "purple",
  },
  {
    slugs: ["peliculas-e-capinhas"],
    title: "Películas e Capinhas",
    image: peliculas,
    tone: "blue",
  },
  {
    slugs: ["perucas-e-cabelos"],
    title: "Perucas e Cabelos",
    image: perucas,
    tone: "pink",
  },
  {
    slugs: ["presentes-e-pelucias"],
    title: "Presentes e Pelúcias",
    image: presentes,
    tone: "turquoise",
  },
  {
    slugs: ["unhas-e-cilios"],
    title: "Unhas e Cílios",
    image: unhas,
    tone: "green",
  },
  {
    slugs: ["utilidades-domesticas"],
    title: "Utilidades Domésticas",
    image: utilidades,
    tone: "blue",
  },
];
const visualIndex = (slug: string) => {
  const index = visuals.findIndex((item) => item.slugs.includes(slug));
  return index < 0 ? visuals.length : index;
};

export default function ImportadorasCategorias() {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useSupabaseCategories();
  const orderedCategories = [...(categories ?? [])].sort(
    (a, b) => visualIndex(a.slug) - visualIndex(b.slug),
  );

  return (
    <div className="importadoras-categories">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="importadoras-categories-header"
      >
        <button
          type="button"
          onClick={() => navigate("/fornecedores/importadoras-25")}
          className="importadoras-categories-back"
          aria-label="Voltar para Importadoras 25 de Março"
        >
          <ArrowLeft size={23} />
        </button>
        <div className="importadoras-categories-heading">
          <h1>Categorias</h1>
          <p>Escolha um nicho para explorar as importadoras.</p>
        </div>
        <div className="importadoras-categories-header-art">
          <ImportadorasArtwork kind="header" />
        </div>
      </motion.header>

      {isLoading && (
        <div className="importadoras-categories-state" role="status">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando categorias...</span>
        </div>
      )}
      {error && (
        <p className="importadoras-categories-state" role="alert">
          Erro ao carregar categorias. Tente novamente.
        </p>
      )}
      {!isLoading && !error && categories?.length === 0 && (
        <p className="importadoras-categories-state">
          Nenhuma categoria disponível no momento.
        </p>
      )}

      {orderedCategories.length > 0 && (
        <nav
          className="importadoras-categories-grid"
          aria-label="Categorias de importadoras"
        >
          {orderedCategories.map((cat) => {
            const visual = visuals.find((item) =>
              item.slugs.includes(cat.slug),
            );
            // Keep legacy Games/Eletrônicos entries distinct if both exist in the catalog.
            const title = ["games-e-acessorios", "eletronicos"].includes(
              cat.slug,
            )
              ? cat.categoria
              : (visual?.title ?? cat.categoria);
            const imgSrc = visual?.image ?? cat.imagem_url;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/fornecedores/importadoras-25/categoria/${cat.slug}`,
                  )
                }
                className="importadoras-category-card"
                data-tone={visual?.tone ?? "turquoise"}
                data-category-slug={cat.slug}
              >
                <span className="importadoras-category-art" aria-hidden="true">
                  {imgSrc && (
                    <img src={imgSrc} alt="" loading="lazy" draggable={false} />
                  )}
                </span>
                <span className="importadoras-category-title">{title}</span>
                <span className="importadoras-category-count">
                  <Store size={19} aria-hidden="true" />
                  <span>
                    {cat.count}{" "}
                    {cat.count === 1 ? "Importadora" : "Importadoras"}
                  </span>
                </span>
                <span
                  className="importadoras-category-arrow"
                  aria-hidden="true"
                >
                  <ArrowRight size={25} />
                </span>
              </motion.button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
