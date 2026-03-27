import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SupplierCircleProps {
  id: string;
  name: string;
  logo?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void | (() => void);
  basePath?: string;
}

export function SupplierCircle({ id, name, logo, isFavorite, onToggleFavorite, basePath = "/fornecedores/importadoras-25" }: SupplierCircleProps) {
  const navigate = useNavigate();
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(id); }}
          className="absolute -top-1 -right-1 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-colors"
        >
          <Heart className={cn("h-3.5 w-3.5 transition-colors", isFavorite ? "fill-[#00EFFF] text-[#00EFFF]" : "text-white/40 hover:text-white/70")} />
        </button>
      )}
      <button
        onClick={() => navigate(`${basePath}/fornecedor/${id}`)}
        className="h-20 w-20 rounded-full border-2 border-border/60 hover:border-primary/50 bg-card flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-glow-sm group-hover:scale-105"
      >
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-cover rounded-full" />
        ) : (
          <span className="text-lg font-bold text-primary">{initials}</span>
        )}
      </button>
      <span className="text-xs text-white text-center leading-tight max-w-[90px] truncate">{name}</span>
    </div>
  );
}
