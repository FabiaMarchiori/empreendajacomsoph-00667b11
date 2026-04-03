import { Clock, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Simulation {
  id: string;
  nome_produto: string | null;
  canal_nome: string;
  preco_sugerido: number;
  margem_final: number;
  lucro_liquido: number;
  custo_compra: number;
  margem_desejada: number;
  created_at: string;
}

interface Props {
  simulations: Simulation[];
  isLoading: boolean;
  onReuse: (sim: Simulation) => void;
  onDelete: (id: string) => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function RecentSimulations({ simulations, isLoading, onReuse, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: "Manrope, sans-serif" }}>
          Simulações recentes
        </h3>
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  if (simulations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-white/40" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: "Manrope, sans-serif" }}>
          Simulações recentes
        </h3>
      </div>

      <div className="space-y-2">
        {simulations.slice(0, 5).map((sim) => (
          <div
            key={sim.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 group hover:border-[#00EFFF]/20 transition-colors"
            style={{ background: "#102A43" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {sim.nome_produto || "Produto sem nome"}
                </p>
                <span className="text-[10px] text-white/40 font-medium shrink-0">
                  {sim.canal_nome}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-[#00EFFF] font-bold">{fmt(sim.preco_sugerido)}</span>
                <span className={`text-[11px] font-semibold ${sim.margem_final >= 10 ? "text-green-400" : "text-amber-400"}`}>
                  {sim.margem_final.toFixed(1)}% margem
                </span>
                <span className="text-[10px] text-white/30">
                  {formatDistanceToNow(new Date(sim.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white/50 hover:text-[#00EFFF] hover:bg-[#00EFFF]/10"
                onClick={() => onReuse(sim)}
                title="Reutilizar simulação"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white/50 hover:text-red-400 hover:bg-red-400/10"
                onClick={() => onDelete(sim.id)}
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
