import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/data/importadoras25";

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

const categoryImages: Record<string, string> = {
  "acessorios-lacos": catAcessorios,
  "bijuterias-semijoias": catBijuterias,
  "cosmeticos-perfumes": catCosmeticos,
  "eletronicos": catEletronicos,
  "embalagens-personalizadas": catEmbalagens,
  "games-acessorios": catGames,
  "garrafas-marmitas": catGarrafas,
  "maquiagem": catMaquiagem,
  "mochilas-malas": catMochilas,
  "papelaria-fofa": catPapelaria,
  "peliculas-capinhas": catPeliculas,
  "perucas-cabelos": catPerucas,
  "presentes-pelucias": catPresentes,
  "unhas-cilios": catUnhas,
  "utilidades-domesticas": catUtilidades,
};

export default function ImportadorasCategorias() {
  const navigate = useNavigate();

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

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-7">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/fornecedores/importadoras-25/categoria/${cat.slug}`)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full border-2 border-border/60 group-hover:border-[#00EFFF]/50 bg-card flex items-center justify-center transition-all duration-200 group-hover:shadow-glow-sm group-hover:scale-105 overflow-hidden">
              <img
                src={categoryImages[cat.slug]}
                alt={cat.name}
                className="h-full w-full object-cover rounded-full"
                loading="lazy"
                width={96}
                height={96}
              />
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-white block leading-tight">{cat.name}</span>
              <span className="text-[10px] text-white/70">{cat.count} fornecedores</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
