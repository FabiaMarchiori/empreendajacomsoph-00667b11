import { motion } from "framer-motion";
import { ArrowLeft, Heart, Phone, Instagram, MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DeviceFramePreview } from "@/components/DeviceFramePreview";
import { useSupabaseSupplierById } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { cn } from "@/lib/utils";

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

  const actionButtonClassName =
    "supplier-action-button group flex min-h-[124px] flex-col items-center justify-center gap-1.5 rounded-[1.4rem] px-4 py-4 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

      {/* Action buttons — gradient premium */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {supplier.Whatsapp && (
          <a
            href={`https://wa.me/${supplier.Whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClassName}
          >
            <Phone className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-sm font-extrabold tracking-[-0.01em]">Abrir Conversa</span>
            <span className="text-[11px] font-medium text-primary-foreground/72">WhatsApp</span>
          </a>
        )}

        {instagramHandle && (
          <a
            href={supplier.Instagram_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClassName}
          >
            <Instagram className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
            <span className="max-w-full truncate text-sm font-extrabold tracking-[-0.01em]">@{instagramHandle}</span>
            <span className="text-[11px] font-medium text-primary-foreground/72">Ver Página</span>
          </a>
        )}

        {supplier.Endereco && (
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent(supplier.Endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClassName}
          >
            <MapPin className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-sm font-extrabold tracking-[-0.01em]">Abrir Mapa</span>
            <span className="max-w-full truncate text-[11px] font-medium text-primary-foreground/72">{supplier.Endereco}</span>
          </a>
        )}
      </motion.div>

      {/* Tablet preview */}
      {supplier.mockup_url ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center pt-3 sm:pt-4">
          <DeviceFramePreview imageSrc={supplier.mockup_url} imageAlt={`Instagram de ${name}`} />
        </motion.div>
      ) : instagramHandle ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center pt-3 sm:pt-4">
          <DeviceFramePreview
            imageAlt={`Prévia de ${name}`}
            fallback={
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background text-center text-foreground/30">
                <Instagram className="h-10 w-10" />
                <span className="text-xs font-medium">Mockup indisponível</span>
              </div>
            }
          />
        </motion.div>
      ) : null}
    </div>
  );
}
