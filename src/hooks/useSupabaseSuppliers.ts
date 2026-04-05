import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseSupplier {
  id: number;
  nome_loja: string;
  categoria: string;
  categorySlug: string;
  Whatsapp: string | null;
  Instagram_url: string | null;
  Endereco: string | null;
  logo_url: string | null;
  mockup_url: string | null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function useSupabaseSuppliers(categorySlug?: string) {
  return useQuery({
    queryKey: ["supabase-suppliers", categorySlug],
    queryFn: async () => {
      // Query the table directly to get ALL rows (each row = supplier+category pair)
      const query = supabase
        .from("fornecedores")
        .select("*")
        .not("nome_loja", "is", null)
        .order("nome_loja");

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        nome_loja: s.nome_loja || "Sem nome",
        categoria: s.categoria || "",
        categorySlug: toSlug(s.categoria || ""),
        Whatsapp: s.Whatsapp,
        Instagram_url: s.Instagram_url,
        Endereco: s.Endereco,
        logo_url: s.logo_url,
        mockup_url: s.mockup_url,
      })) as SupabaseSupplier[];

      if (categorySlug) {
        return mapped.filter((s) => s.categorySlug === categorySlug);
      }
      return mapped;
    },
  });
}

export function useSupabaseSupplierById(id: string | number | undefined) {
  return useQuery({
    queryKey: ["supabase-supplier", id],
    enabled: !!id,
    queryFn: async () => {
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("id", numId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
