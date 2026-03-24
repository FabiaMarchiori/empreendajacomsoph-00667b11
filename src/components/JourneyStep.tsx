import { cn } from "@/lib/utils";
import { Check, Circle, Loader2 } from "lucide-react";

type StepStatus = "concluido" | "em_andamento" | "nao_iniciado";

interface JourneyStepProps {
  title: string;
  status: StepStatus;
  stepNumber: number;
  isLast?: boolean;
}

const statusIcons: Record<StepStatus, React.ReactNode> = {
  concluido: <Check className="h-3.5 w-3.5" />,
  em_andamento: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  nao_iniciado: <Circle className="h-3.5 w-3.5" />,
};

export function JourneyStep({ title, status, stepNumber, isLast }: JourneyStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center border text-xs font-medium",
            status === "concluido" && "bg-primary/20 border-primary/40 text-primary",
            status === "em_andamento" && "bg-accent/20 border-accent/40 text-accent-foreground",
            status === "nao_iniciado" && "bg-muted border-border text-muted-foreground"
          )}
        >
          {statusIcons[status]}
        </div>
        {!isLast && (
          <div className={cn("w-px h-8", status === "concluido" ? "bg-primary/30" : "bg-border")} />
        )}
      </div>
      <div className="pt-1">
        <p className={cn(
          "text-sm font-medium",
          status === "concluido" && "text-primary",
          status === "em_andamento" && "text-foreground",
          status === "nao_iniciado" && "text-muted-foreground"
        )}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {status === "concluido" ? "Concluído" : status === "em_andamento" ? "Em andamento" : "Não iniciado"}
        </p>
      </div>
    </div>
  );
}
