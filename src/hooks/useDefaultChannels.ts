import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DefaultChannel {
  id: string;
  canal_nome: string;
  tipo_canal: string;
  comissao_pct_default: number;
  taxa_cartao_pct_default: number;
  taxa_fixa_default: number;
  imposto_pct_sugerido: number;
  usa_faixa_preco: boolean;
  usa_categoria: boolean;
  usa_parcelamento: boolean;
  observacoes: string | null;
  data_referencia: string | null;
  ativo: boolean;
}

export function useDefaultChannels() {
  const query = useQuery({
    queryKey: ["pricing-default-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_default_channels" as any)
        .select("*")
        .eq("ativo", true)
        .order("canal_nome");
      if (error) throw error;
      return (data ?? []) as unknown as DefaultChannel[];
    },
  });

  return { defaultChannels: query.data ?? [], isLoading: query.isLoading };
}
