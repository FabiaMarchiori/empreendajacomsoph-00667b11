import { cn } from "@/lib/utils";

type AccessStatus = "liberado" | "bonus" | "disponivel";

const statusConfig: Record<AccessStatus, { label: string; classes: string }> = {
  liberado: { label: "Liberado", classes: "bg-primary/15 text-primary border-primary/30" },
  bonus: { label: "Bônus", classes: "bg-accent/20 text-accent-foreground border-accent/30" },
  disponivel: { label: "Disponível", classes: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: AccessStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border", config.classes)}>
      {config.label}
    </span>
  );
}
