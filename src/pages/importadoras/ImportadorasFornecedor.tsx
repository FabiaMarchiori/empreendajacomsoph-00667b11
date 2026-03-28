import { motion } from "framer-motion";
import { ArrowLeft, Heart, Phone, Instagram, MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupabaseSupplierById } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { cn } from "@/lib/utils";
import tabletFrame from "@/assets/tablet-frame.png";

export default function ImportadorasFornecedor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: supplier, isLoading, error } = useSupabaseSupplierById(id);

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!supplier || error) {
    return (
      <div className="p-4 max-w-3xl mx-auto text-center py-20">
        <p className="text-white/50">Fornecedor não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm hover:underline">Voltar</button>
      </div>
    );
  }

  const name = supplier.nome_loja || "Sem nome";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const fav = isFavorite(supplier.id);
  const numId = supplier.id;

  const instagramHandle = supplier.Instagram_url
    ? supplier.Instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
    : null;

  return (
    <div className="px-4 pt-3 pb-6 lg:px-10 lg:pt-4 max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-3">
        <div className="relative">
          <div className="h-36 w-36 rounded-full border-[3px] border-primary/40 bg-card flex items-center justify-center overflow-hidden shadow-glow">
            {supplier.logo_url ? (
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src={supplier.logo_url} alt={name} className="h-full w-full object-cover rounded-full" />
              </div>
            ) : (
              <span className="text-4xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <button
            onClick={() => toggle(numId)}
            className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-card border-2 border-border/60 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <Heart className={cn("h-4 w-4 transition-colors", fav ? "fill-[#00EFFF] text-[#00EFFF]" : "text-white/40")} />
          </button>
        </div>

        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">{name}</h1>
          <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-wider">{supplier.categoria}</p>
        </div>
      </motion.div>

      {/* Action buttons — premium solid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* WhatsApp */}
        {supplier.Whatsapp && (
          <a
            href={`https://wa.me/${supplier.Whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border transition-all duration-200 text-center bg-[#0E3B2F] border-[#1B5B49] hover:bg-[#14503F] hover:border-[#2B7A61] shadow-[0_4px_20px_-4px_rgba(30,90,69,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(43,122,97,0.5)]"
          >
            <Phone className="h-5 w-5 text-[#7CFFC8]" />
            <span className="text-sm font-semibold text-white">Abrir Conversa</span>
            <span className="text-xs text-[#D7FBEF]">WhatsApp</span>
          </a>
        )}

        {/* Instagram */}
        {instagramHandle && (
          <a
            href={supplier.Instagram_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border transition-all duration-200 text-center bg-[#34182F] border-[#5A2A52] hover:bg-[#46203F] hover:border-[#724068] shadow-[0_4px_20px_-4px_rgba(90,42,82,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(114,64,104,0.5)]"
          >
            <Instagram className="h-5 w-5 text-[#FF79C8]" />
            <span className="text-sm font-semibold text-white">@{instagramHandle}</span>
            <span className="text-xs text-[#F5D9EF]">Ver Página</span>
          </a>
        )}

        {/* Mapa */}
        {supplier.Endereco && (
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent(supplier.Endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border transition-all duration-200 text-center bg-[#102E42] border-[#1F4D68] hover:bg-[#16415B] hover:border-[#2D6C8E] shadow-[0_4px_20px_-4px_rgba(31,77,104,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(45,108,142,0.5)]"
          >
            <MapPin className="h-5 w-5 text-[#4FD8FF]" />
            <span className="text-sm font-semibold text-white">Abrir Mapa</span>
            <span className="text-xs text-[#D8F4FF] max-w-full truncate">{supplier.Endereco}</span>
          </a>
        )}
      </motion.div>

      {/* Tablet Mockup — layered composition */}
      {supplier.mockup_url ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center pt-4">
          <div className="relative mx-auto" style={{ width: "340px" }}>
            {/* Instagram image layer — positioned inside tablet screen area */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: "11.5%",
                left: "7.8%",
                width: "84.4%",
                height: "76%",
                borderRadius: "4px",
              }}
            >
              <img
                src={supplier.mockup_url}
                alt={`Instagram de ${name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Tablet frame layer — on top */}
            <img
              src={tabletFrame}
              alt="Tablet frame"
              className="relative z-10 w-full h-auto pointer-events-none"
            />
            {/* Glow effect */}
            <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-3xl -z-10" />
          </div>
        </motion.div>
      ) : instagramHandle ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center pt-4">
          <div className="relative mx-auto" style={{ width: "340px" }}>
            <div
              className="absolute flex flex-col items-center justify-center gap-3"
              style={{
                top: "11.5%",
                left: "7.8%",
                width: "84.4%",
                height: "76%",
                borderRadius: "4px",
                backgroundColor: "rgba(15,25,47,0.8)",
              }}
            >
              <Instagram className="h-10 w-10 text-white/15" />
              <span className="text-white/25 text-xs">Mockup indisponível</span>
            </div>
            <img
              src={tabletFrame}
              alt="Tablet frame"
              className="relative z-10 w-full h-auto pointer-events-none"
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
