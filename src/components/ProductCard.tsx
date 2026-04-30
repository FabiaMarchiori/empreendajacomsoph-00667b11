import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Lock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { InterestModal } from "./InterestModal";

interface ProductCardProps {
  title: string;
  description: string;
  status: "liberado" | "bonus" | "disponivel" | "em_breve" | "upgrade";
  icon: React.ReactNode;
  isPremium?: boolean;
  onClick?: () => void;
}

export function ProductCard({ title, description, status, icon, isPremium, onClick }: ProductCardProps) {
  const isAccessible = status === "liberado" || status === "bonus";
  const isComingSoon = status === "em_breve";
  const isUpgrade = status === "upgrade";
  const [interestOpen, setInterestOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        onClick={isComingSoon ? undefined : onClick}
        className={cn(
          "group relative rounded-2xl border p-6 transition-all duration-200 flex flex-col h-full min-h-[220px]",
          isComingSoon ? "cursor-default" : "cursor-pointer",
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
        <h3 className="font-display font-bold text-sm text-foreground mb-1.5 leading-snug">{title}</h3>
        <p className="text-xs text-white/80 leading-relaxed mb-5 flex-1">{description}</p>
        <div className="flex items-center text-xs font-semibold mt-auto">
          {isAccessible ? (
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[#0A192F] font-bold group-hover:gap-3 transition-all"
              style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
            >
              Acessar <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : isComingSoon ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setInterestOpen(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[#0A192F] font-bold transition-all hover:opacity-90 cursor-pointer"
              style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
            >
              <Bell className="h-3.5 w-3.5" /> Avise-me
            </button>
          ) : (
            <span className="text-foreground/50 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Ativar acesso
            </span>
          )}
        </div>
      </motion.div>
      {isComingSoon && (
        <InterestModal open={interestOpen} onOpenChange={setInterestOpen} moduleTitle={title} />
      )}
    </>
  );
}
