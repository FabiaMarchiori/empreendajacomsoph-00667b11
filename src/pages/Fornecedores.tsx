import { motion } from "framer-motion";
import { Search, Package, Gem, Factory, Shirt, Footprints } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";

const categories = [
  "Todos",
  "Importadoras 25 de Março",
  "Moda Brás",
  "Calçados Atacadistas",
  "Semi-jóias de Limeira",
  "Fabricantes Nacionais",
];

const suppliers = [
  {
    title: "Importadoras 25 de Março",
    desc: "Produtos importados direto das melhores importadoras de SP",
    status: "liberado" as const,
    cat: "Importadoras 25 de Março",
    icon: <Package className="h-5 w-5" />,
    isPremium: true,
  },
  {
    title: "Moda Brás",
    desc: "Fornecedores de moda no maior polo atacadista do Brasil",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <Shirt className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Calçados Atacadistas",
    desc: "Fábricas de calçados dos principais polos: Jaú, Nova Serrana, Birigui e Região Sul",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <Footprints className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Semi-jóias de Limeira",
    desc: "Fabricantes de semi-jóias direto do polo de Limeira",
    status: "em_breve" as const,
    cat: "Semi-jóias de Limeira",
    icon: <Gem className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Fabricantes Nacionais",
    desc: "Brinquedos, Decoração, Eletrônicos e outros nichos nacionais",
    status: "em_breve" as const,
    cat: "Fabricantes Nacionais",
    icon: <Factory className="h-5 w-5" />,
    isPremium: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FornecedoresPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      (activeCategory === "Todos" || s.cat === activeCategory) &&
      s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Central de Fornecedores
        </h1>
        <p className="text-sm lg:text-base text-white/80 leading-relaxed max-w-2xl">
          Acesse as maiores importadoras, fornecedores, e polos calçadistas para ampliar suas margens e encontrar novas oportunidades para o seu negócio.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2.5"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const isLast = cat === "Fabricantes Nacionais";
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? "text-primary-foreground border-[#007A7A]/60 shadow-glow-sm"
                  : isLast
                  ? "bg-card border-border text-white/70 hover:text-white hover:border-white/30"
                  : "text-primary-foreground border-[#007A7A]/40 hover:border-[#007A7A]/60 hover:shadow-glow-sm"
              }`}
              style={
                isActive
                  ? { background: "linear-gradient(90deg, #007A7A 0%, #00FFFF 100%)" }
                  : isLast
                  ? undefined
                  : { background: "linear-gradient(90deg, #007A7A 0%, #00CFCF 100%)" }
              }
            >
              {cat}
            </button>
          );
        })}
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filtered.map((s) => (
          <motion.div key={s.title} variants={item}>
            <ProductCard
              title={s.title}
              description={s.desc}
              status={s.status}
              icon={s.icon}
              isPremium={s.isPremium}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
