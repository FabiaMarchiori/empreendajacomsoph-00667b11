import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { suppliers } from "@/data/importadoras25";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useFavorites } from "@/hooks/useFavorites";

export default function ImportadorasFavoritos() {
  const navigate = useNavigate();
  const { favorites, toggle, isFavorite } = useFavorites();

  const favSuppliers = suppliers.filter((s) => favorites.includes(s.id));

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/fornecedores/importadoras-25")} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white/60 hover:text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Meus Favoritos</h1>
          <p className="text-xs text-white/60">{favSuppliers.length} fornecedores salvos</p>
        </div>
      </motion.div>

      {favSuppliers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-sm mb-2">Nenhum favorito salvo ainda.</p>
          <p className="text-white/30 text-xs">Clique no coração nos fornecedores para salvar aqui.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {favSuppliers.map((s) => (
            <SupplierCircle
              key={s.id}
              id={s.id}
              name={s.name}
              logo={s.logo || undefined}
              isFavorite={isFavorite(s.id)}
              onToggleFavorite={toggle}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
