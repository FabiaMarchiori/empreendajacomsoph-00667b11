import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Settings ──────────────────────────────────────────
export function usePricingSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pricing-settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: { nome_empresa: string; regime_tributario: string; faturamento_avg: number | null }) => {
      const existing = query.data;
      if (existing) {
        const { error } = await supabase.from("pricing_settings").update(values).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pricing_settings").insert({ ...values, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-settings"] });
      toast.success("Configuração salva!");
    },
    onError: () => toast.error("Erro ao salvar configuração"),
  });

  return { settings: query.data, isLoading: query.isLoading, upsert };
}

// ── Channels ──────────────────────────────────────────
export function usePricingChannels() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pricing-channels", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_channels")
        .select("*")
        .eq("user_id", user!.id)
        .order("canal_nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (values: { canal_nome: string; comissao_pct: number; imposto_pct: number; taxa_cartao_pct: number }) => {
      const { error } = await supabase.from("pricing_channels").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-channels"] }); toast.success("Canal criado!"); },
    onError: () => toast.error("Erro ao criar canal"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; canal_nome?: string; comissao_pct?: number; imposto_pct?: number; taxa_cartao_pct?: number; ativo?: boolean }) => {
      const { error } = await supabase.from("pricing_channels").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-channels"] }); toast.success("Canal atualizado!"); },
    onError: () => toast.error("Erro ao atualizar canal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_channels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-channels"] }); toast.success("Canal removido!"); },
    onError: () => toast.error("Erro ao remover canal"),
  });

  return { channels: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

// ── Products ──────────────────────────────────────────
export function usePricingProducts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pricing-products", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_products")
        .select("*")
        .eq("user_id", user!.id)
        .order("nome_produto");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (values: { nome_produto: string; custo_compra: number; custo_variavel: number; fornecedor?: string; observacoes?: string }) => {
      const { error } = await supabase.from("pricing_products").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-products"] }); toast.success("Produto criado!"); },
    onError: () => toast.error("Erro ao criar produto"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; nome_produto?: string; custo_compra?: number; custo_variavel?: number; fornecedor?: string; observacoes?: string }) => {
      const { error } = await supabase.from("pricing_products").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-products"] }); toast.success("Produto atualizado!"); },
    onError: () => toast.error("Erro ao atualizar produto"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-products"] }); toast.success("Produto removido!"); },
    onError: () => toast.error("Erro ao remover produto"),
  });

  return { products: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

// ── Fixed Costs ───────────────────────────────────────
export function usePricingFixedCosts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pricing-fixed-costs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_fixed_costs")
        .select("*")
        .eq("user_id", user!.id)
        .order("nome_custo");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (values: { nome_custo: string; valor: number }) => {
      const { error } = await supabase.from("pricing_fixed_costs").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-fixed-costs"] }); toast.success("Custo fixo criado!"); },
    onError: () => toast.error("Erro ao criar custo fixo"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; nome_custo?: string; valor?: number }) => {
      const { error } = await supabase.from("pricing_fixed_costs").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-fixed-costs"] }); toast.success("Custo fixo atualizado!"); },
    onError: () => toast.error("Erro ao atualizar custo fixo"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_fixed_costs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricing-fixed-costs"] }); toast.success("Custo fixo removido!"); },
    onError: () => toast.error("Erro ao remover custo fixo"),
  });

  return { costs: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
