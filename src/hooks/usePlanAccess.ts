import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseProductAccess } from "@/lib/product-access";

// All eligibility and administrator decisions come from the authenticated server RPC.
export function usePlanAccess() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["product-access", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("current_product_access");
      if (error) throw error;
      return parseProductAccess(data);
    },
  });
  const access = parseProductAccess(query.data);
  return {
    ...access,
    hasEcosystem: access.ecosystem,
    hasEcosystemAccess: access.ecosystem,
    hasBolsasPlan: access.bolsas && !access.ecosystem,
    hasBolsasOnly: access.bolsas && !access.ecosystem,
    hasBolsasAccess: access.bolsas,
    hasSophAccess: access.soph,
    hasErpAccess: access.erp,
    isLoading: query.isLoading,
    error: query.error,
  };
}
