import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Instagram, MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
      <div className="p-6 lg:p-10 max-w-3xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!supplier || error) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto text-center py-20">
        <p className="text-white/50">Fornecedor não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm hover:underline">Voltar</button>
      </div>
    );
  }

  const name = supplier.nome_loja || "Sem nome";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fav = isFavorite(supplier.id);
  const numId = supplier.id;

  // Extract instagram handle from URL
  const instagramHandle = supplier.Instagram_url
    ? supplier.Instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
    : null;

  const actions = [
    supplier.Whatsapp && {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "WhatsApp",
      color: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
      href: `https://wa.me/${supplier.Whatsapp}`,
    },
    instagramHandle && {
      icon: <Instagram className="h-5 w-5" />,
      label: "Instagram",
      color: "bg-[#E4405F]/15 text-[#E4405F] border-[#E4405F]/20",
      href: supplier.Instagram_url!,
    },
    supplier.Endereco && {
      icon: <MapPin className="h-5 w-5" />,
      label: "Endereço",
      color: "bg-primary/10 text-primary border-primary/20",
      href: `https://maps.google.com/maps?q=${encodeURIComponent(supplier.Endereco)}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; color: string; href: string }[];

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-white/60 hover:text-white hover:border-primary/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="h-28 w-28 rounded-full border-[3px] border-primary/30 bg-card flex items-center justify-center overflow-hidden shadow-glow">
            {supplier.logo_url ? (
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center p-2">
                <img src={supplier.logo_url} alt={name} className="h-full w-full object-contain rounded-full" />
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">{initials}</span>
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
          <p className="text-xs text-primary font-semibold mt-1">{supplier.categoria}</p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all hover:scale-[1.02]",
              action.color
            )}
          >
            {action.icon}
            <span className="font-semibold text-sm text-white">{action.label}</span>
          </a>
        ))}
      </motion.div>

      {/* Address */}
      {supplier.Endereco && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
          <h3 className="font-display font-bold text-white text-sm mb-2">Endereço</h3>
          <p className="text-white/70 text-sm">{supplier.Endereco}</p>
        </motion.div>
      )}

      {/* Instagram Mockup */}
      {instagramHandle && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border/60 bg-gradient-card p-5 text-center space-y-4">
          <h3 className="font-display font-bold text-white text-sm flex items-center justify-center gap-2">
            <Instagram className="h-4 w-4 text-[#E4405F]" />
            Instagram
          </h3>
          <a
            href={supplier.Instagram_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            @{instagramHandle}
          </a>
          {supplier.mockup_url ? (
            <div className="mt-4 mx-auto max-w-[280px] relative">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border-[6px] border-white/10 bg-black shadow-2xl shadow-black/40 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
                {/* Screen */}
                <div className="pt-6">
                  <img
                    src={supplier.mockup_url}
                    alt={`Instagram de ${name}`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              {/* Reflection glow */}
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl -z-10" />
            </div>
          ) : (
            <div className="mt-4 mx-auto max-w-[280px] relative">
              <div className="relative rounded-[2.5rem] border-[6px] border-white/10 bg-black/80 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
                <div className="pt-6 py-16 flex flex-col items-center justify-center gap-3">
                  <Instagram className="h-10 w-10 text-white/15" />
                  <span className="text-white/25 text-xs">Mockup indisponível</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
