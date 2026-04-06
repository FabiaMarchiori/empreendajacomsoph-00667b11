import { motion } from "framer-motion";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseSuppliers } from "@/hooks/useSupabaseSuppliers";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";

export default function ImportadorasFavoritos() {
  const navigate = useNavigate();
  const { favorites, toggle, isFavorite, isLoading: loadingFavs } = useSupabaseFavorites();
  const { data: allSuppliers, isLoading: loadingSuppliers } = useSupabaseSuppliers();

  const isLoading = loadingFavs || loadingSuppliers;
  const favSuppliers = (allSuppliers || []).filter((s) => favorites.includes(s.id));

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/fornecedores/importadoras-25")} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white/60 hover:text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Meus Favoritos</h1>
          <p className="text-xs text-white/60">{favSuppliers.length} importadoras salvas</p>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && favSuppliers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-sm mb-2">Nenhum favorito salvo ainda.</p>
          <p className="text-white/30 text-xs">Clique no coração nas importadoras para salvar aqui.</p>
        </motion.div>
      )}

      {!isLoading && favSuppliers.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {favSuppliers.map((s) => (
            <SupplierCircle
              key={s.id}
              id={String(s.id)}
              name={s.nome_loja}
              logo={s.logo_url || undefined}
              isFavorite={isFavorite(s.id)}
              onToggleFavorite={() => toggle(s.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
