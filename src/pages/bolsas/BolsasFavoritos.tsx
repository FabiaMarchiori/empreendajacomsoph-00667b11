import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useBolsasSuppliers } from "@/hooks/useBolsasSuppliers";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { BolsasListingLayout } from "@/components/bolsas/BolsasListingLayout";

export default function BolsasFavoritos() {
  const {
    favorites,
    toggle,
    isFavorite,
    isLoading: loadingFavs,
  } = useSupabaseFavorites();
  const {
    data: allSuppliers,
    isLoading: loadingSuppliers,
    error,
  } = useBolsasSuppliers();

  const isLoading = loadingFavs || loadingSuppliers;
  const favSuppliers = (allSuppliers || []).filter((s) =>
    s.allIds.some((id) => favorites.includes(id)),
  );

  return (
    <BolsasListingLayout
      title="Meus Favoritos"
      subtitle={`${favSuppliers.length} fornecedores salvos`}
    >
      {isLoading && (
        <div className="bolsas-listing-state" role="status">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <span>Carregando fornecedores...</span>
        </div>
      )}

      {!isLoading && error && (
        <p className="bolsas-listing-state" role="alert">
          Erro ao carregar fornecedores. Tente novamente.
        </p>
      )}
      {!isLoading && !error && favSuppliers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bolsas-listing-state bolsas-listing-empty"
        >
          <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/70 text-sm mb-2">
            Nenhum favorito salvo ainda.
          </p>
          <p className="text-white/60 text-xs">
            Clique no coração nos fornecedores para salvar aqui.
          </p>
        </motion.div>
      )}

      {!isLoading && favSuppliers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bolsas-listing-grid"
        >
          {favSuppliers.map((s) => (
            <div className="bolsas-listing-supplier" key={s.allIds.join("-")}>
              <SupplierCircle
                id={String(s.id)}
                name={s.nome_loja}
                code={s.codigo_fornecedor || undefined}
                logo={s.logo_url || undefined}
                isFavorite={s.allIds.some((id) => isFavorite(id))}
                onToggleFavorite={() => toggle(s.id)}
                basePath="/fornecedores/bolsas-mochilas-malas"
              />
            </div>
          ))}
        </motion.div>
      )}
    </BolsasListingLayout>
  );
}
