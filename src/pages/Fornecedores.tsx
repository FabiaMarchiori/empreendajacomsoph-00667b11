import { motion } from "framer-motion";
import { Search, Package, Gem, Factory, Shirt, Footprints, ShoppingBag, Baby, Heart, Dumbbell, MapPin } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";

const categories = [
  { label: "Todos", key: "Todos" },
  { label: "25 de Março", key: "Importadoras 25 de Março" },
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
    icon: <Package className="h-5 w-5" />,
    isPremium: true,
  },
  // Moda Brás subcards
  {
    title: "Moda Feminina",
    desc: "Fornecedores de moda feminina no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <Shirt className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Moda Masculina",
    desc: "Fornecedores de moda masculina no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <ShoppingBag className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Moda Infantil",
    desc: "Fornecedores de moda infantil no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <Baby className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Moda Íntima",
    desc: "Fornecedores de moda íntima no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <Heart className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Moda Fitness",
    desc: "Fornecedores de moda fitness no Brás",
    status: "em_breve" as const,
    cat: "Moda Brás",
    icon: <Dumbbell className="h-5 w-5" />,
    isPremium: false,
  },
  // Calçados subcards
  {
    title: "Jaú",
    desc: "Polo calçadista de Jaú — SP",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <Footprints className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Nova Serrana",
    desc: "Polo calçadista de Nova Serrana — MG",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <Footprints className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Birigui",
    desc: "Polo calçadista de Birigui — SP",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <Footprints className="h-5 w-5" />,
    isPremium: false,
  },
  {
    title: "Região Sul",
    desc: "Polo calçadista da Região Sul do Brasil",
    status: "em_breve" as const,
    cat: "Calçados Atacadistas",
    icon: <MapPin className="h-5 w-5" />,
    isPremium: false,
  },
  // Semi-jóias
  {
    title: "Semi-jóias de Limeira",
    desc: "Fabricantes de semi-jóias direto do polo de Limeira",
    status: "em_breve" as const,
    cat: "Semi-jóias de Limeira",
    icon: <Gem className="h-5 w-5" />,
    isPremium: false,
  },
  // Fabricantes Nacionais
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
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
          <span className="text-white">Central de </span>
          <span style={{ color: "#00FFFF" }}>Fornecedores</span>
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
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "text-[#0A192F] shadow-[0_0_16px_-2px_rgba(0,255,255,0.5)]"
                  : "text-white border-2 border-[#1E3A5F] hover:border-[#007A7A]"
              }`}
              style={
                isActive
                  ? { background: "linear-gradient(90deg, #00FFFF 0%, #00CFCF 100%)", border: "2px solid #00FFFF" }
                  : { background: "#102A43" }
              }
            >
              {cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        key={activeCategory}
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
