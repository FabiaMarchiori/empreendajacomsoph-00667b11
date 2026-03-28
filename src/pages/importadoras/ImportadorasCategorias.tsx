import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";

// Fallback local images for categories
import catAcessorios from "@/assets/categories/acessorios-lacos.png";
import catBijuterias from "@/assets/categories/bijuterias-semijoias.png";
import catCosmeticos from "@/assets/categories/cosmeticos-perfumes.png";
import catEletronicos from "@/assets/categories/eletronicos.png";
import catEmbalagens from "@/assets/categories/embalagens-personalizadas.png";
import catGames from "@/assets/categories/games-acessorios.png";
import catGarrafas from "@/assets/categories/garrafas-marmitas.png";
import catMaquiagem from "@/assets/categories/maquiagem.png";
import catMochilas from "@/assets/categories/mochilas-malas.png";
import catPapelaria from "@/assets/categories/papelaria-fofa.png";
import catPeliculas from "@/assets/categories/peliculas-capinhas.png";
import catPerucas from "@/assets/categories/perucas-cabelos.png";
import catPresentes from "@/assets/categories/presentes-pelucias.png";
import catUnhas from "@/assets/categories/unhas-cilios.png";
import catUtilidades from "@/assets/categories/utilidades-domesticas.png";

const localImages: Record<string, string> = {
  "acessorios-e-lacos": catAcessorios,
  "bijouterias-e-semijoias": catBijuterias,
  "cosmeticos-e-perfumes": catCosmeticos,
  "eletronicos": catEletronicos,
  "embalagens-personalizadas": catEmbalagens,
  "games-e-acessorios": catGames,
  "garrafas-e-marmitas": catGarrafas,
  "maquiagem": catMaquiagem,
  "mochilas-e-malas": catMochilas,
  "papelaria-fofa": catPapelaria,
  "peliculas-e-capinhas": catPeliculas,
  "perucas-e-cabelos": catPerucas,
  "presentes-e-pelucias": catPresentes,
  "unhas-e-cilios": catUnhas,
  "utilidades-domesticas": catUtilidades,
};

export default function ImportadorasCategorias() {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useSupabaseCategories();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/fornecedores/importadoras-25")} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white hover:text-[#00EFFF] hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Categorias</h1>
          <p className="text-sm text-white mt-0.5">Escolha um nicho para explorar os fornecedores</p>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-white/50 text-sm">Erro ao carregar categorias. Tente novamente.</p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8">
          {categories.map((cat, i) => {
            const imgSrc = cat.imagem_url || localImages[cat.slug] || "";
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/fornecedores/importadoras-25/categoria/${cat.slug}`)}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full border-[3px] border-primary/30 group-hover:border-primary/60 bg-card flex items-center justify-center transition-all duration-200 group-hover:shadow-glow-sm group-hover:scale-105 overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={cat.categoria}
                      className="h-full w-full object-cover rounded-full"
                      loading="lazy"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {cat.categoria.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-white block leading-tight">{cat.categoria}</span>
                  <span className="text-[10px] text-white/70">{cat.count} fornecedores</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
