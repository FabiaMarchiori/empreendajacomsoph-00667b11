import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useBolsasSuppliers } from "@/hooks/useBolsasSuppliers";
import { matchesSupplier } from "@/lib/supplierSearch";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { BolsasListingLayout } from "@/components/bolsas/BolsasListingLayout";

export default function BolsasLista() {
  const [search, setSearch] = useState("");
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: suppliers, isLoading, error } = useBolsasSuppliers();

  const filtered = (suppliers || []).filter((s) => matchesSupplier(s, search));

  return (
    <BolsasListingLayout
      title="Bolsas, Mochilas e Malas"
      subtitle={`${filtered.length} fornecedores`}
      search={
        <input
          type="text"
          aria-label="Buscar fornecedor"
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
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
      {!isLoading && !error && filtered.length === 0 && (
        <div className="bolsas-listing-state">
          <p className="text-white/70 text-sm">Nenhum fornecedor encontrado.</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bolsas-listing-grid"
        >
          {filtered.map((s, i) => (
            <motion.div
              className="bolsas-listing-supplier"
              key={s.allIds.join("-")}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <SupplierCircle
                id={String(s.id)}
                name={s.nome_loja}
                code={s.codigo_fornecedor || undefined}
                logo={s.logo_url || undefined}
                isFavorite={s.allIds.some((id) => isFavorite(id))}
                onToggleFavorite={() => toggle(s.id)}
                basePath="/fornecedores/bolsas-mochilas-malas"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </BolsasListingLayout>
  );
}
