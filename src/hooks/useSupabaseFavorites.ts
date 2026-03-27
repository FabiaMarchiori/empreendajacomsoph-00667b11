import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";
import { toast } from "sonner";

export function useSupabaseFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["supabase-favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favoritos")
        .select("fornecedor_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((f) => f.fornecedor_id);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (fornecedorId: number) => {
      const { error } = await supabase
        .from("favoritos")
        .insert({ user_id: user!.id, fornecedor_id: fornecedorId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supabase-favorites"] }),
    onError: () => toast.error("Erro ao adicionar favorito"),
  });

  const removeMutation = useMutation({
    mutationFn: async (fornecedorId: number) => {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("user_id", user!.id)
        .eq("fornecedor_id", fornecedorId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supabase-favorites"] }),
    onError: () => toast.error("Erro ao remover favorito"),
  });

  const toggle = useCallback(
    (id: number | string) => {
      if (!user) return;
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      if (favorites.includes(numId)) {
        removeMutation.mutate(numId);
      } else {
        addMutation.mutate(numId);
      }
    },
    [user, favorites, addMutation, removeMutation]
  );

  const isFavorite = useCallback(
    (id: number | string) => {
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      return favorites.includes(numId);
    },
    [favorites]
  );

  return { favorites, toggle, isFavorite, isLoading };
}
