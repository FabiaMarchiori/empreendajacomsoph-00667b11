import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseCategory {
  id: number;
  categoria: string;
  imagem_url: string | null;
  slug: string;
  count: number;
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

export function useSupabaseCategories() {
  return useQuery({
    queryKey: ["supabase-categories"],
    queryFn: async () => {
      // Fetch categories
      const { data: cats, error: catError } = await supabase
        .from("categorias")
        .select("*")
        .order("categoria");

      if (catError) throw catError;

      // Fetch supplier counts per category
      const { data: suppliers, error: supError } = await supabase
        .rpc("get_distinct_fornecedores");

      if (supError) throw supError;

      // Count suppliers per category
      const countMap: Record<string, number> = {};
      (suppliers || []).forEach((s: any) => {
        const cat = s.categoria || "";
        countMap[cat] = (countMap[cat] || 0) + 1;
      });

      return (cats || []).map((c) => ({
        id: c.id,
        categoria: c.categoria,
        imagem_url: c.imagem_url,
        slug: toSlug(c.categoria),
        count: countMap[c.categoria] || 0,
      })) as SupabaseCategory[];
    },
  });
}
