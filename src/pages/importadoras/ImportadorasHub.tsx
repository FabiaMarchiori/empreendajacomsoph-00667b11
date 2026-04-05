import { motion } from "framer-motion";
import { Grid3X3, Search, Heart, ArrowLeft, Store, LayoutGrid, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseSuppliers } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";

const navCards = [
  {
    icon: <Grid3X3 className="h-6 w-6" />,
    title: "Explorar Categorias",
    desc: "Navegue por nichos de produtos e descubra oportunidades",
    route: "/fornecedores/importadoras-25/categorias",
    accent: true,
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Buscar Fornecedores",
    desc: "Encontre pelo nome e acesse contato direto",
    route: "/fornecedores/importadoras-25/busca",
    accent: false,
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Meus Favoritos",
    desc: "Acesse rapidamente os fornecedores que você salvou",
    route: "/fornecedores/importadoras-25/favoritos",
    accent: false,
  },
  {
    icon: <ArrowLeft className="h-6 w-6" />,
    title: "Voltar para Central",
    desc: "Retorne à Central de Fornecedores",
    route: "/fornecedores",
    accent: false,
  },
];

const steps = [
  { num: "1", icon: <LayoutGrid className="h-4 w-4" />, text: "Explore categorias de produtos" },
  { num: "2", icon: <Store className="h-4 w-4" />, text: "Encontre fornecedores ideais" },
  { num: "3", icon: <Bookmark className="h-4 w-4" />, text: "Salve seus favoritos" },
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
    { label: "Categorias", value: catCount },
    { label: "Fornecedores", value: supCount },
    { label: "Favoritos salvos", value: favCount },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header fortalecido */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary/80">
          Central de Fornecedores
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight">
          <span className="text-white">Importadoras </span>
          <span className="text-gradient-primary inline-block">25 de Março</span>
        </h1>
        <p className="text-sm lg:text-base text-white/80 leading-relaxed max-w-2xl">
          Sua central completa de fornecedores do maior polo de importados do Brasil.
          Explore categorias, encontre contatos e monte sua carteira de fornecedores.
        </p>
      </motion.div>

      {/* Bloco de status/contexto */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-3"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-3.5 text-center"
          >
            <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {s.value}
            </p>
            <p className="text-[11px] font-medium text-white/60 mt-0.5 uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Bloco "Comece por aqui" */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-xl border border-primary/10 bg-primary/[0.03] px-5 py-4"
      >
        <p className="text-xs font-bold text-primary/90 uppercase tracking-wider mb-3">
          Comece por aqui
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0">
                {s.num}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/80">
                {s.icon}
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navCards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 + i * 0.06 }}
            onClick={() => navigate(card.route)}
            className="group relative rounded-xl border border-border/50 hover:border-primary/50 bg-card px-5 py-5 text-left transition-all duration-200 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.25)] hover:bg-card/90"
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary shrink-0 transition-colors">
                {card.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-white text-[15px] leading-tight group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-snug">{card.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
