import { cn } from "@/lib/utils";

type AccessStatus = "adquirido" | "liberado" | "bonus" | "brinde" | "disponivel" | "em_breve" | "upgrade";

const statusConfig: Record<AccessStatus, { label: string; classes: string }> = {
  adquirido: { label: "Adquirido", classes: "text-[#0A192F] font-bold border-primary/40 shadow-glow-sm", },
  liberado: { label: "Liberado", classes: "bg-gradient-primary-btn text-primary-foreground border-primary/40 shadow-glow-sm" },
  bonus: { label: "Bônus", classes: "bg-accent/20 text-foreground border-accent/40" },
  brinde: { label: "Brinde", classes: "bg-accent/20 text-white border-primary/30" },
  disponivel: { label: "Disponível", classes: "bg-muted/40 text-foreground/60 border-border" },
  em_breve: { label: "Em Breve", classes: "bg-muted/60 text-white/70 border-border/60" },
  upgrade: { label: "Premium", classes: "text-[#0A192F] font-bold border-primary/40 shadow-glow-sm" },
};

export function StatusBadge({ status }: { status: AccessStatus }) {
  const config = statusConfig[status];
  const isAdquirido = status === "adquirido";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border",
        config.classes
      )}
      style={isAdquirido ? { backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" } : undefined}
    >
      {config.label}
    </span>
  );
}
