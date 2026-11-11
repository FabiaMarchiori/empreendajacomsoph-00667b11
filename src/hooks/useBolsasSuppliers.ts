import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NICHO_CATEGORIA = "BOLSAS, MOCHILAS E MALAS";

export interface BolsasSupplier {
  id: number;
  nome_loja: string;
  categoria: string;
  Whatsapp: string | null;
  Instagram_url: string | null;
  Endereco: string | null;
  logo_url: string | null;
  mockup_url: string | null;
  codigo_fornecedor: string | null;
}

export function useBolsasSuppliers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bolsas-suppliers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: shared, error: sharedError } = await supabase
        .from("supplier_shared_access")
        .select("fornecedor_id");
      if (sharedError) throw sharedError;
      const sharedIds = (shared || [])
        .map((s) => s.fornecedor_id)
        .filter(Number.isSafeInteger);
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .or(
          `categoria.eq."${NICHO_CATEGORIA}",id.in.(${sharedIds.length ? sharedIds.join(",") : "-1"})`,
        )
        .not("nome_loja", "is", null)
        .order("nome_loja");
      if (error) throw error;

      // Deduplica por nome (caso existam linhas repetidas)
      const map = new Map<string, BolsasSupplier & { allIds: number[] }>();
      for (const s of (data || []) as (BolsasSupplier & { id: number })[]) {
        const key = (s.nome_loja || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        const existing = map.get(key);
        if (existing) {
          if (!existing.allIds.includes(s.id)) existing.allIds.push(s.id);
        } else {
          map.set(key, {
            id: s.id,
            nome_loja: s.nome_loja || "Sem nome",
            categoria: s.categoria,
            Whatsapp: s.Whatsapp,
            Instagram_url: s.Instagram_url,
            Endereco: s.Endereco,
            logo_url: s.logo_url,
            mockup_url: s.mockup_url,
            codigo_fornecedor: s.codigo_fornecedor ?? null,
            allIds: [s.id],
          });
        }
      }
      return Array.from(map.values()).sort((a, b) =>
        a.nome_loja.localeCompare(b.nome_loja, "pt-BR"),
      );
    },
  });
}
