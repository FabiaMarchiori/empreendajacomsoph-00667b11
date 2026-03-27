import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSubscription() {
  const { user } = useAuth();

  const { data: hasActive, isLoading: checkingActive } = useQuery({
    queryKey: ["has-active-subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_active_subscription", {
        user_uuid: user!.id,
      });
      if (error) throw error;
      return data as boolean;
    },
  });

  const { data: subscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("user_id", user!.id)
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return {
    hasActive: hasActive ?? false,
    subscriptions: subscriptions || [],
    isLoading: checkingActive || loadingSubs,
  };
}
