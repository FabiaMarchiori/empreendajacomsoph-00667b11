import { cn } from "@/lib/utils";

type AccessStatus = "liberado" | "bonus" | "disponivel" | "em_breve";

const statusConfig: Record<AccessStatus, { label: string; classes: string }> = {
  liberado: { label: "Liberado", classes: "bg-primary/15 text-primary border-primary/30" },
  bonus: { label: "Bônus", classes: "bg-accent/20 text-foreground border-accent/40" },
  disponivel: { label: "Disponível", classes: "bg-muted/40 text-foreground/60 border-border" },
  em_breve: { label: "Em Breve", classes: "bg-[#007A7A]/20 text-[#00EFFF]/80 border-[#007A7A]/40" },
};

export function StatusBadge({ status }: { status: AccessStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border", config.classes)}>
      {config.label}
    </span>
  );
}
