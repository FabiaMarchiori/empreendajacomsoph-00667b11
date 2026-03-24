import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  description: string;
  status: "liberado" | "bonus" | "disponivel";
  icon: React.ReactNode;
  isPremium?: boolean;
  onClick?: () => void;
}

export function ProductCard({ title, description, status, icon, isPremium, onClick }: ProductCardProps) {
  const isAccessible = status !== "disponivel";
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={cn(
        "group relative rounded-2xl border p-6 cursor-pointer transition-all duration-200",
        isPremium
          ? "bg-gradient-card border-primary/15 hover:border-primary/40 shadow-glow-sm hover:shadow-glow"
          : "bg-gradient-card border-border/60 hover:border-primary/20",
      )}
    >
      {isPremium && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center",
          isPremium ? "bg-primary/15 text-primary" : "bg-muted/50 text-foreground"
        )}>
          {icon}
        </div>
        <StatusBadge status={status} />
      </div>
      <h3 className="font-display font-semibold text-sm text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-foreground/70 leading-relaxed mb-5">{description}</p>
      <div className="flex items-center text-xs font-semibold">
        {isAccessible ? (
          <span className="text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            Acessar <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-foreground/50 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Ativar acesso
          </span>
        )}
      </div>
    </motion.div>
  );
}
