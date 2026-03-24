import { motion } from "framer-motion";
import { Search, MessageCircle, Package, Filter } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";

const categories = ["Todos", "Importados", "Moda", "Calçados", "Semi-jóias", "Fabricantes Nacionais"];

const suppliers = [
  { title: "Importadoras 25 de Março", desc: "Produtos importados direto das melhores importadoras de SP", status: "liberado" as const, cat: "Importados" },
  { title: "Semi-jóias de Limeira", desc: "Fabricantes de semi-jóias direto do polo de Limeira", status: "disponivel" as const, cat: "Semi-jóias" },
  { title: "Calçados dos Polos", desc: "Fábricas de calçados dos principais polos do Brasil", status: "disponivel" as const, cat: "Calçados" },
  { title: "Moda Feminina", desc: "Fornecedores de moda feminina atacado e varejo", status: "liberado" as const, cat: "Moda" },
  { title: "Moda Masculina", desc: "Fornecedores especializados em moda masculina", status: "disponivel" as const, cat: "Moda" },
  { title: "Moda Infantil", desc: "Fornecedores de roupas e acessórios infantis", status: "disponivel" as const, cat: "Moda" },
  { title: "Moda Íntima", desc: "Fornecedores de lingerie e moda íntima", status: "bonus" as const, cat: "Moda" },
  { title: "Moda Fitness", desc: "Fornecedores de roupas fitness e esportivas", status: "disponivel" as const, cat: "Moda" },
  { title: "Fabricantes Nacionais", desc: "Brinquedos, Decoração, Eletrônicos e outros nichos", status: "disponivel" as const, cat: "Fabricantes Nacionais" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function FornecedoresPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      (activeCategory === "Todos" || s.cat === activeCategory) &&
      s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Central de Fornecedores</h1>
        <p className="text-sm text-muted-foreground">Encontre os melhores fornecedores por categoria, nicho ou região.</p>
      </motion.div>

      {/* Soph contextual */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-card rounded-xl border border-primary/15 p-4 flex items-start gap-3 shadow-glow-sm">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-foreground/80 mb-1 font-medium">Soph diz:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">"Posso te ajudar a escolher o melhor nicho para começar. Quer saber qual categoria combina mais com seu objetivo?"</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <motion.div key={s.title} variants={item}>
            <ProductCard title={s.title} description={s.desc} status={s.status} icon={<Package className="h-5 w-5" />} isPremium={s.status === "liberado"} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
