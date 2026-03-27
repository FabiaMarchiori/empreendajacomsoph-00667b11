import { motion } from "framer-motion";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSupabaseSuppliers } from "@/hooks/useSupabaseSuppliers";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";

export default function ImportadorasBusca() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: allSuppliers, isLoading } = useSupabaseSuppliers();

  const filtered = search.length >= 2
    ? (allSuppliers || []).filter((s) => s.nome_loja.toLowerCase().includes(search.toLowerCase()))
    : (allSuppliers || []);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/fornecedores/importadoras-25")} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white/60 hover:text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Buscar Fornecedores</h1>
          <p className="text-xs text-white/60">Digite pelo menos 2 letras para buscar</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Nome do fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50 text-sm">Nenhum fornecedor encontrado para "{search}".</p>
        </div>
      )}

      {filtered.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {filtered.map((s) => (
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
