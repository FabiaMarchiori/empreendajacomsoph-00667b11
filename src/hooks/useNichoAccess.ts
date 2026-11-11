import { usePlanAccess } from "@/hooks/usePlanAccess";
// Current niche is Bolsas. Unknown future niches require a server entitlement.
export function useNichoAccess(keywords: string[]) {
  const { hasBolsasAccess, hasEcosystemAccess, isLoading } = usePlanAccess();
  return {
    hasAccess:
      hasEcosystemAccess ||
      (keywords.some((k) => k.toLowerCase().includes("bolsas")) &&
        hasBolsasAccess),
    isLoading,
  };
}
