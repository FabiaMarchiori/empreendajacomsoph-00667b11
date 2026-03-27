import { motion } from "framer-motion";
import { Grid3X3, Search, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navCards = [
  { icon: <Grid3X3 className="h-6 w-6" />, title: "Explorar Categorias", desc: "Navegue por nichos de produtos", route: "/fornecedores/importadoras-25/categorias" },
  { icon: <Search className="h-6 w-6" />, title: "Buscar Fornecedores", desc: "Encontre pelo nome", route: "/fornecedores/importadoras-25/busca" },
  { icon: <Heart className="h-6 w-6" />, title: "Meus Favoritos", desc: "Fornecedores que você salvou", route: "/fornecedores/importadoras-25/favoritos" },
  { icon: <ArrowLeft className="h-6 w-6" />, title: "Voltar para Central", desc: "Central de Fornecedores", route: "/fornecedores" },
];

export default function ImportadorasHub() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
          <span className="text-white">Importadoras </span>
          <span className="text-gradient-primary inline-block">25 de Março</span>
        </h1>
        <p className="text-sm lg:text-base text-white/80 leading-relaxed max-w-2xl">
          Acesse categorias, busque fornecedores e salve seus favoritos em um só lugar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navCards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(card.route)}
            className="group relative rounded-2xl border border-border/60 hover:border-primary/40 bg-gradient-card p-6 text-left transition-all duration-200 hover:shadow-glow-sm"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              {card.icon}
            </div>
            <h3 className="font-display font-bold text-white text-base mb-1">{card.title}</h3>
            <p className="text-xs text-white/60">{card.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
