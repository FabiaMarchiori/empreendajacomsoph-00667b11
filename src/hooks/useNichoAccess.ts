import { useSubscription } from "@/hooks/useSubscription";

/**
 * Verifica se o usuário tem acesso a um nicho específico.
 * Acesso liberado se:
 *  - plano contém qualquer keyword passada (ex: "bolsas", "starter_bolsas")
 *  - OU plano é do Ecossistema completo (premium / completo / ecossistema)
 */
export function useNichoAccess(keywords: string[]) {
  const { subscriptions, isLoading } = useSubscription();

  const ecosystemKeywords = ["ecossistema", "completo", "premium"];
  const allKeywords = [...keywords, ...ecosystemKeywords].map((k) => k.toLowerCase());

  const hasAccess = (subscriptions || []).some((s: any) => {
    if (s.status !== "ativa") return false;
    if (s.data_expiracao && new Date(s.data_expiracao) < new Date()) return false;
    const plano = (s.plano || "").toLowerCase();
    return allKeywords.some((k) => plano.includes(k));
  });

  return { hasAccess, isLoading };
}
