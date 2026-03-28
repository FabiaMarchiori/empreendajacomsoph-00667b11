import { motion } from "framer-motion";
import { ArrowLeft, Heart, Phone, Instagram, MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupabaseSupplierById } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { cn } from "@/lib/utils";
import tabletFrame from "@/assets/tablet-mockup.png";
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
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fav = isFavorite(supplier.id);
  const numId = supplier.id;

  const instagramHandle = supplier.Instagram_url
    ? supplier.Instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
    : null;

  const actions = [
    supplier.Whatsapp && {
      icon: <Phone className="h-5 w-5 text-[#D9FFF2]" />,
      label: "Abrir Conversa",
      sublabel: "WhatsApp",
      className: "bg-[#0F3D2E] border-[#1E5A45] hover:bg-[#14523D] hover:border-[#2A7257] hover:shadow-[0_0_16px_rgba(37,211,102,0.12)]",
      href: `https://wa.me/${supplier.Whatsapp}`,
    },
    instagramHandle && {
      icon: <Instagram className="h-5 w-5 text-[#FFD9F7]" />,
      label: `@${instagramHandle}`,
      sublabel: "Ver Página",
      className: "bg-[#3A1638] border-[#5A2A57] hover:bg-[#4A1D47] hover:border-[#6E3570] hover:shadow-[0_0_16px_rgba(228,64,95,0.12)]",
      href: supplier.Instagram_url!,
    },
    supplier.Endereco && {
      icon: <MapPin className="h-5 w-5 text-[#9BE8FF]" />,
      label: "Abrir Mapa",
      sublabel: supplier.Endereco.length > 30 ? supplier.Endereco.slice(0, 30) + "…" : supplier.Endereco,
      className: "bg-[#112B3C] border-[#1E445C] hover:bg-[#16374D] hover:border-[#2A5875] hover:shadow-[0_0_16px_rgba(0,239,255,0.1)]",
      href: `https://maps.google.com/maps?q=${encodeURIComponent(supplier.Endereco)}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; sublabel: string; className: string; href: string }[];
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

      {/* Action buttons — premium styled */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <a
            key={action.sublabel}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] text-center shadow-sm",
              action.className
            )}
          >
            {action.icon}
            <span className="text-[#F8FAFC] text-xs font-medium leading-tight">{action.label}</span>
            <span className="text-[10px] font-semibold text-[#F8FAFC]/70 bg-white/5 rounded-lg px-3 py-1">{action.sublabel}</span>
          </a>
        ))}
      </motion.div>

      {/* Tablet Mockup with Instagram image */}
      {supplier.mockup_url ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center pt-2">
          <div className="relative mx-auto" style={{ width: 280 }}>
            {/* Tablet frame image */}
            <img src={tabletFrame} alt="" className="w-full h-auto relative z-10 pointer-events-none" />
            {/* Instagram content inside the screen */}
            <div className="absolute z-0 overflow-hidden" style={{ top: '10.5%', left: '7%', right: '7%', bottom: '14%', borderRadius: 4 }}>
              <img
                src={supplier.mockup_url}
                alt={`Instagram de ${name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Glow */}
            <div className="absolute -inset-8 bg-primary/5 rounded-[2rem] blur-3xl -z-10" />
          </div>
        </motion.div>
      ) : instagramHandle ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center pt-2">
          <div className="relative mx-auto" style={{ width: 280 }}>
            <img src={tabletFrame} alt="" className="w-full h-auto relative z-10 pointer-events-none" />
            <div className="absolute z-0 flex flex-col items-center justify-center gap-3 bg-black/40" style={{ top: '10.5%', left: '7%', right: '7%', bottom: '14%', borderRadius: 4 }}>
              <Instagram className="h-10 w-10 text-white/15" />
              <span className="text-white/25 text-xs">Mockup indisponível</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
