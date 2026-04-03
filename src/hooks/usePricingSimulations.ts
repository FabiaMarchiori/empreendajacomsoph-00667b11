import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SimulationRow {
  id: string;
  nome_produto: string | null;
  canal_nome: string;
  custo_compra: number;
  margem_desejada: number;
  preco_sugerido: number;
  lucro_liquido: number;
  margem_final: number;
  custo_total: number;
  created_at: string;
}

export function usePricingSimulations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pricing-simulations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_simulations" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as SimulationRow[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: {
      nome_produto?: string;
      canal_nome: string;
      custo_compra: number;
      margem_desejada: number;
      preco_sugerido: number;
      lucro_liquido: number;
      margem_final: number;
      custo_total: number;
    }) => {
      const { error } = await supabase
        .from("pricing_simulations" as any)
        .insert({ ...values, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-simulations"] });
      toast.success("Simulação salva!");
    },
    onError: () => toast.error("Erro ao salvar simulação"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pricing_simulations" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-simulations"] });
    },
    onError: () => toast.error("Erro ao excluir simulação"),
  });

  return {
    simulations: query.data ?? [],
    isLoading: query.isLoading,
    save,
    remove,
  };
}
