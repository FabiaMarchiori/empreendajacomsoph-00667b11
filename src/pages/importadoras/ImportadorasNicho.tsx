import { motion } from "framer-motion";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseSuppliers } from "@/hooks/useSupabaseSuppliers";
import { SupplierCircle } from "@/components/SupplierCircle";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { getCategoryHeader } from "@/components/importadoras/category-header-assets";
import "./importadoras-nicho.css";

export default function ImportadorasNicho() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: categories } = useSupabaseCategories();
  const { data: suppliers, isLoading, error } = useSupabaseSuppliers(slug);

  const category = categories?.find((c) => c.slug === slug);
  const filtered = (suppliers || []).filter((s) =>
    s.nome_loja.toLowerCase().includes(search.toLowerCase()),
  );
  const header = getCategoryHeader(slug);
  const title = ["games-e-acessorios", "eletronicos"].includes(slug ?? "")
    ? category?.categoria || "Categoria"
    : header?.title || category?.categoria || "Categoria";
  const words = title.split(" ");
  const highlight = words.pop();

  return (
    <div className="importadoras-nicho">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="importadoras-nicho-header"
      >
        <button
          type="button"
          onClick={() => navigate("/fornecedores/importadoras-25/categorias")}
          className="importadoras-nicho-back"
          aria-label="Voltar para Categorias"
        >
          <ArrowLeft size={23} />
        </button>
        <div className="importadoras-nicho-heading">
          <p className="importadoras-nicho-eyebrow">Importadoras 25 de Março</p>
          <h1>
            {words.length > 0 && `${words.join(" ")} `}
            <span>{highlight}</span>
          </h1>
          <p className="importadoras-nicho-count" aria-live="polite">
            {filtered.length} importadoras encontradas
          </p>
        </div>
        {header && (
          <img
            className="importadoras-nicho-header-art"
            src={header.image}
            width={header.width}
            height={header.height}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        )}
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="importadoras-nicho-search"
      >
        <Search size={22} aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar nesta categoria"
          placeholder="Buscar nesta categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {isLoading && (
        <div className="importadoras-nicho-state" role="status">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <span>Carregando importadoras...</span>
        </div>
      )}
      {!isLoading && error && (
        <p className="importadoras-nicho-state" role="alert">
          Erro ao carregar importadoras. Tente novamente.
        </p>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <p className="importadoras-nicho-state">
          Nenhuma importadora encontrada nesta categoria.
        </p>
      )}
      {!isLoading && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="importadoras-nicho-grid"
        >
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="importadoras-nicho-supplier"
            >
              <SupplierCircle
                id={String(s.id)}
                name={s.nome_loja}
                code={s.codigo_fornecedor || undefined}
                logo={s.logo_url || undefined}
                isFavorite={isFavorite(s.id)}
                onToggleFavorite={() => toggle(s.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
