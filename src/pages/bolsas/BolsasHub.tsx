import { motion } from "framer-motion";
import { Search, Heart, ArrowLeft, Store, Bookmark, ShoppingBag, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBolsasSuppliers } from "@/hooks/useBolsasSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";

const navCards = [
  {
    icon: <Package className="h-6 w-6" />,
    title: "Ver Todos os Fornecedores",
    desc: "Lista completa de bolsas, mochilas e malas",
    route: "/fornecedores/bolsas-mochilas-malas/lista",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Buscar Fornecedor",
    desc: "Encontre pelo nome e acesse o contato direto",
    route: "/fornecedores/bolsas-mochilas-malas/busca",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Meus Favoritos",
    desc: "Acesse rapidamente os fornecedores que você salvou",
    route: "/fornecedores/bolsas-mochilas-malas/favoritos",
  },
  {
    icon: <ArrowLeft className="h-6 w-6" />,
    title: "Voltar para Central",
    desc: "Retorne à Central de Fornecedores",
    route: "/fornecedores",
  },
];

const steps = [
  { num: "1", icon: <ShoppingBag className="h-4 w-4" />, text: "Explore os fornecedores do nicho" },
  { num: "2", icon: <Store className="h-4 w-4" />, text: "Encontre seus parceiros ideais" },
  { num: "3", icon: <Bookmark className="h-4 w-4" />, text: "Salve seus favoritos" },
];

export default function BolsasHub() {
  const navigate = useNavigate();
  const { data: suppliers } = useBolsasSuppliers();
  const { favorites } = useSupabaseFavorites();

  const supCount = suppliers?.length ?? 0;
  const favCount = (suppliers || []).filter((s) => s.allIds.some((id) => favorites.includes(id))).length;

  const stats = [
    { label: "Fornecedores", value: supCount },
    { label: "Favoritos salvos", value: favCount },
    { label: "Nicho", value: "Premium" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary/80">
          Central de Fornecedores
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight">
          <span className="text-white">Bolsas, Mochilas </span>
          <span className="text-gradient-primary inline-block">e Malas</span>
        </h1>
        <p className="text-sm lg:text-base text-white/80 leading-relaxed max-w-2xl">
          Fornecedores curados especialmente para o nicho de bolsas, mochilas e malas.
          Acesse contatos diretos e monte sua carteira de parceiros.
        </p>
      </motion.div>

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
            <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
            <p className="text-[11px] font-medium text-white/60 mt-0.5 uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>

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
