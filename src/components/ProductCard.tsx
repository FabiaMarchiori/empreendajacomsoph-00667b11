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
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border p-5 cursor-pointer transition-all duration-200",
        isPremium
          ? "bg-gradient-card border-primary/20 hover:border-primary/40 shadow-glow-sm hover:shadow-glow"
          : "bg-card border-border hover:border-primary/20",
      )}
    >
      {isPremium && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          isPremium ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        <StatusBadge status={status} />
      </div>
      <h3 className="font-display font-semibold text-sm text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-xs font-medium">
        {isAccessible ? (
          <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Acessar <ArrowRight className="h-3 w-3" />
          </span>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" /> Ativar acesso
          </span>
        )}
      </div>
    </motion.div>
  );
}
