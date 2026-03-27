import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Instagram, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { suppliers } from "@/data/importadoras25";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export default function ImportadorasFornecedor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isFavorite } = useFavorites();

  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto text-center py-20">
        <p className="text-white/50">Fornecedor não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm hover:underline">Voltar</button>
      </div>
    );
  }

  const initials = supplier.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fav = isFavorite(supplier.id);

  const actions = [
    supplier.whatsapp && {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "WhatsApp",
      color: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
      href: `https://wa.me/${supplier.whatsapp}`,
    },
    supplier.instagram && {
      icon: <Instagram className="h-5 w-5" />,
      label: "Instagram",
      color: "bg-[#E4405F]/15 text-[#E4405F] border-[#E4405F]/20",
      href: `https://instagram.com/${supplier.instagram}`,
    },
    supplier.address && {
      icon: <MapPin className="h-5 w-5" />,
      label: "Endereço",
      color: "bg-primary/10 text-primary border-primary/20",
      href: supplier.mapUrl || "#",
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
          <div className="h-28 w-28 rounded-full border-2 border-primary/30 bg-card flex items-center justify-center overflow-hidden shadow-glow">
            {supplier.logo ? (
              <img src={supplier.logo} alt={supplier.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              <span className="text-3xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <button
            onClick={() => toggle(supplier.id)}
            className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-card border-2 border-border/60 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <Heart className={cn("h-4 w-4 transition-colors", fav ? "fill-[#00EFFF] text-[#00EFFF]" : "text-white/40")} />
          </button>
        </div>

        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">{supplier.name}</h1>
          <p className="text-xs text-primary font-semibold mt-1">{supplier.category}</p>
        </div>

        {supplier.description && (
          <p className="text-sm text-white/70 max-w-md leading-relaxed">{supplier.description}</p>
        )}
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
      {supplier.address && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
          <h3 className="font-display font-bold text-white text-sm mb-2">Endereço</h3>
          <p className="text-white/70 text-sm">{supplier.address}</p>
        </motion.div>
      )}

      {/* Instagram preview placeholder */}
      {supplier.instagram && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border/60 bg-gradient-card p-5 text-center">
          <h3 className="font-display font-bold text-white text-sm mb-3">Instagram</h3>
          <a
            href={`https://instagram.com/${supplier.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            @{supplier.instagram}
          </a>
        </motion.div>
      )}
    </div>
  );
}
