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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {navCards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => navigate(card.route)}
            className="group relative rounded-xl border border-border/50 hover:border-primary/50 bg-gradient-card px-5 py-4 text-left transition-all duration-200 hover:shadow-glow-sm"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {card.icon}
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm leading-tight">{card.title}</h3>
                <p className="text-xs text-white mt-0.5">{card.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
