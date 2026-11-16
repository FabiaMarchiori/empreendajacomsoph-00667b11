import "@/styles/header-artwork.css";
import { motion } from "framer-motion";
import { Search, Lock, X } from "lucide-react";
import { SupplierArtwork } from "@/components/suppliers/SupplierArtwork";
import "@/components/suppliers/suppliers-central.css";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanAccess } from "@/hooks/usePlanAccess";

const categories = [
  { label: "Todos", key: "Todos" },
  { label: "25 de Março", key: "Importadoras 25 de Março" },
  { label: "Bolsas, Mochilas e Malas", key: "Bolsas, Mochilas e Malas" },
  { label: "Moda Brás", key: "Moda Brás" },
  { label: "Calçados", key: "Calçados Atacadistas" },
  { label: "Semi-jóias", key: "Semi-jóias de Limeira" },
  { label: "Fabricantes Nacionais", key: "Fabricantes Nacionais" },
];

const suppliers = [
  // Importadoras
  {
    title: "Importadoras 25 de Março",
    desc: "Produtos importados direto das melhores importadoras de SP",
    status: "liberado" as const,
    cat: "Importadoras 25 de Março",
    icon: <SupplierArtwork kind="importadoras" />,
    isPremium: true,
    route: "/fornecedores/importadoras-25",
  },
  // Nicho Bolsas, Mochilas e Malas
  {
    title: "Bolsas, Mochilas e Malas",
    desc: "Fornecedores curados do nicho de bolsas, mochilas e malas",
    status: "liberado" as const,
    cat: "Bolsas, Mochilas e Malas",
    icon: <SupplierArtwork kind="bolsas" />,
    isPremium: true,
    route: "/fornecedores/bolsas-mochilas-malas",
  },
  // Moda Brás subcards
  {
    title: "Moda Feminina",
    desc: "Fornecedores de moda feminina no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <SupplierArtwork kind="feminina" />,
    isPremium: false,
  },
  {
    title: "Moda Masculina",
    desc: "Fornecedores de moda masculina no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <SupplierArtwork kind="masculina" />,
    isPremium: false,
  },
  {
    title: "Moda Infantil",
    desc: "Fornecedores de moda infantil no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <SupplierArtwork kind="infantil" />,
    isPremium: false,
  },
  {
    title: "Moda Íntima",
    desc: "Fornecedores de moda íntima no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <SupplierArtwork kind="intima" />,
    isPremium: false,
  },
  {
    title: "Moda Fitness",
    desc: "Fornecedores de moda fitness no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <SupplierArtwork kind="fitness" />,
    isPremium: false,
  },
  // Calçados subcards
  {
    title: "Jaú",
    desc: "Polo calçadista de Jaú — SP",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <SupplierArtwork kind="localizacao" />,
    isPremium: false,
  },
  {
    title: "Nova Serrana",
    desc: "Polo calçadista de Nova Serrana — MG",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <SupplierArtwork kind="localizacao" />,
    isPremium: false,
  },
  {
    title: "Birigui",
    desc: "Polo calçadista de Birigui — SP",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <SupplierArtwork kind="localizacao" />,
    isPremium: false,
  },
  {
    title: "Região Sul",
    desc: "Polo calçadista da Região Sul do Brasil",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <SupplierArtwork kind="sul" />,
    isPremium: false,
  },
  // Semi-jóias
  {
    title: "Semi-jóias de Limeira",
    desc: "Fabricantes de semi-jóias direto do polo de Limeira",
    status: "em_breve" as const,
    cat: "Semi-jóias de Limeira",
    icon: <SupplierArtwork kind="semijoias" />,
    isPremium: false,
  },
  // Fabricantes Nacionais
  {
    title: "Fabricantes Nacionais",
    desc: "Brinquedos, Decoração, Eletrônicos e outros nichos nacionais",
    status: "em_breve" as const,
    cat: "Fabricantes Nacionais",
    icon: <SupplierArtwork kind="fabricantes" />,
    isPremium: false,
  },
];

export default function FornecedoresPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { hasBolsasOnly } = usePlanAccess();

  const filtered = suppliers.filter(
    (s) =>
      (activeCategory === "Todos" || s.cat === activeCategory) &&
      s.title.toLowerCase().includes(search.toLowerCase()),
  );

  const available = filtered.filter((supplier) => supplier.route);
  const upcoming = filtered.filter((supplier) => !supplier.route);

  const renderCard = (supplier: (typeof suppliers)[number]) => {
    const lockedForBolsasOnly =
      hasBolsasOnly && supplier.cat === "Importadoras 25 de Março";
    const effectiveStatus = lockedForBolsasOnly
      ? ("upgrade" as const)
      : supplier.status;
    const handleClick = supplier.route
      ? () => navigate(supplier.route!)
      : undefined;
    return (
      <ProductCard
        compact
        key={supplier.title}
        title={supplier.title}
        description={
          lockedForBolsasOnly
            ? "Disponível no Ecossistema Completo — faça upgrade para liberar."
            : supplier.desc
        }
        status={effectiveStatus}
        icon={
          lockedForBolsasOnly ? <Lock className="h-8 w-8" /> : supplier.icon
        }
        isPremium={supplier.isPremium}
        onClick={handleClick}
        className={`supplier-product-card ${supplier.route ? "supplier-product-card--featured" : "supplier-product-card--upcoming"} ${supplier.cat === "Bolsas, Mochilas e Malas" ? "supplier-product-card--bolsas" : ""}`}
      />
    );
  };

  return (
    <div className="suppliers-central">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="suppliers-central-header"
      >
        <div className="suppliers-central-heading-copy">
          <h1>
            Central de <span>Fornecedores</span>
          </h1>
          <p>Encontre fornecedores e novas oportunidades para o seu negócio.</p>
        </div>
        <div className="suppliers-central-banner-art">
          <SupplierArtwork kind="banner" />
        </div>
      </motion.header>

      <div className="suppliers-central-search">
        <Search aria-hidden="true" size={20} />
        <input
          type="search"
          aria-label="Buscar fornecedores"
          placeholder="Buscar fornecedores..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav
        className="suppliers-central-filters"
        aria-label="Filtrar categorias de fornecedores"
      >
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            aria-pressed={activeCategory === category.key}
            onClick={() => setActiveCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="suppliers-central-empty" role="status">
          <p>
            Nenhuma importadora encontrada
            {search ? ` para “${search}”` : " nesta categoria"}.
          </p>
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <>
          {available.length > 0 && (
            <section aria-labelledby="suppliers-available-title">
              <h2
                id="suppliers-available-title"
                className="suppliers-central-section-title"
              >
                Categorias disponíveis
              </h2>
              <div className="suppliers-central-available">
                {available.map(renderCard)}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section aria-labelledby="suppliers-upcoming-title">
              <h2
                id="suppliers-upcoming-title"
                className="suppliers-central-section-title"
              >
                Próximas categorias
              </h2>
              <div className="suppliers-central-upcoming">
                {upcoming.map(renderCard)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
