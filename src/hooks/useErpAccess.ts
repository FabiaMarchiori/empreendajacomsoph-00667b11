import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useErpAccess() {
  const { user } = useAuth();

  const { data: hasAccess, isLoading, isError } = useQuery({
    queryKey: ["erp-access", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_erp_access");
      if (error) throw error;
      return data === true;
    },
  });

  return {
    hasErpAccess: hasAccess ?? false,
    isLoading,
    isError,
  };
}
