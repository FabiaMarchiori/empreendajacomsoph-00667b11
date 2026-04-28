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
}

export function useBolsasSuppliers() {
  return useQuery({
    queryKey: ["bolsas-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("categoria", NICHO_CATEGORIA)
        .not("nome_loja", "is", null)
        .order("nome_loja");
      if (error) throw error;

      // Deduplica por nome (caso existam linhas repetidas)
      const map = new Map<string, BolsasSupplier & { allIds: number[] }>();
      for (const s of (data || []) as any[]) {
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
            allIds: [s.id],
          });
        }
      }
      return Array.from(map.values()).sort((a, b) => a.nome_loja.localeCompare(b.nome_loja, "pt-BR"));
    },
  });
}
