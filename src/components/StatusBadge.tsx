import { cn } from "@/lib/utils";

type AccessStatus = "liberado" | "bonus" | "disponivel" | "em_breve";

const statusConfig: Record<AccessStatus, { label: string; classes: string }> = {
  liberado: { label: "Liberado", classes: "bg-gradient-primary-btn text-primary-foreground border-primary/40 shadow-glow-sm" },
  bonus: { label: "Bônus", classes: "bg-accent/20 text-foreground border-accent/40" },
  disponivel: { label: "Disponível", classes: "bg-muted/40 text-foreground/60 border-border" },
  em_breve: { label: "Em Breve", classes: "bg-gradient-primary-soft text-white border-primary/30" },
};

export function StatusBadge({ status }: { status: AccessStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border", config.classes)}>
      {config.label}
    </span>
  );
}
