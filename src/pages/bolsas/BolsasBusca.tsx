import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useBolsasSuppliers } from "@/hooks/useBolsasSuppliers";
import { matchesSupplier } from "@/lib/supplierSearch";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { BolsasListingLayout } from "@/components/bolsas/BolsasListingLayout";

export default function BolsasBusca() {
  const [search, setSearch] = useState("");
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: allSuppliers, isLoading, error } = useBolsasSuppliers();

  const filtered =
    search.trim().length >= 2 || /^f?\d+$/i.test(search.trim())
      ? (allSuppliers || []).filter((s) => matchesSupplier(s, search))
      : allSuppliers || [];

  return (
    <BolsasListingLayout
      title="Buscar Fornecedor"
      subtitle="Digite pelo menos 2 letras para filtrar"
      search={
        <input
          type="text"
          aria-label="Nome da loja ou código"
          placeholder="Nome da loja ou código (ex.: F012)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
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
          <p className="text-white/70 text-sm">
            Nenhum fornecedor encontrado para "{search}".
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bolsas-listing-grid"
        >
          {filtered.map((s) => (
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
