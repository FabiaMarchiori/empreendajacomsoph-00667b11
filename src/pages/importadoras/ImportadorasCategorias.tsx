import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/data/importadoras25";

export default function ImportadorasCategorias() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/fornecedores/importadoras-25")} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white/60 hover:text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Categorias</h1>
          <p className="text-xs text-white/60">Escolha um nicho para explorar os fornecedores</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/fornecedores/importadoras-25/categoria/${cat.slug}`)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full border-2 border-border/60 group-hover:border-primary/50 bg-card flex items-center justify-center transition-all duration-200 group-hover:shadow-glow-sm group-hover:scale-105">
              <span className="text-3xl lg:text-4xl">{cat.image}</span>
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-white block leading-tight">{cat.name}</span>
              <span className="text-[10px] text-white/40">{cat.count} fornecedores</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
