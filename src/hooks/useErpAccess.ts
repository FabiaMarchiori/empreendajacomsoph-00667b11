import { usePlanAccess } from "@/hooks/usePlanAccess";
export function useErpAccess() {
  const { hasErpAccess, isLoading } = usePlanAccess();
  return { hasErpAccess, isLoading };
}
