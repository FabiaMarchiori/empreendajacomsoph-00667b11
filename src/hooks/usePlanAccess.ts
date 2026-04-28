import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const ADMIN_EMAILS = ["fasilva73@hotmail.com"];

const ECOSYSTEM_KEYWORDS = [
  "ecossistema",
  "completo",
  "premium",
  "mensal",
  "anual",
  "starter", // exceto starter_bolsas (tratado abaixo)
];

const BOLSAS_KEYWORDS = ["bolsas_1999", "bolsas", "starter_bolsas", "nicho_bolsas"];

/**
 * Identifica o tipo de acesso do usuário:
 * - isAdmin: e-mail listado como admin -> acesso total
 * - hasEcosystem: assinante do Ecossistema (mensal R$47 ou anual R$97 / planos premium/completo)
 * - hasBolsasOnly: apenas plano Bolsas R$19,99 (sem Ecossistema)
 * - hasBolsasAccess: pode acessar o nicho Bolsas (admin OR bolsas OR ecossistema)
 * - hasEcosystemAccess: pode acessar o resto do ecossistema (admin OR ecossistema)
 */
export function usePlanAccess() {
  const { user } = useAuth();
  const { subscriptions, isLoading } = useSubscription();

  const email = (user?.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(email);

  const activeSubs = (subscriptions || []).filter((s: any) => {
    if (s.status !== "ativa") return false;
    if (s.data_expiracao && new Date(s.data_expiracao) < new Date()) return false;
    return true;
  });

  const hasEcosystem = activeSubs.some((s: any) => {
    const plano = (s.plano || "").toLowerCase();
    // starter_bolsas / bolsas_1999 NÃO contam como Ecossistema
    if (plano.includes("bolsas")) return false;
    return ECOSYSTEM_KEYWORDS.some((k) => plano.includes(k));
  });

  const hasBolsasPlan = activeSubs.some((s: any) => {
    const plano = (s.plano || "").toLowerCase();
    return BOLSAS_KEYWORDS.some((k) => plano.includes(k));
  });

  const hasBolsasOnly = !isAdmin && !hasEcosystem && hasBolsasPlan;

  return {
    isAdmin,
    hasEcosystem,
    hasBolsasPlan,
    hasBolsasOnly,
    hasBolsasAccess: isAdmin || hasEcosystem || hasBolsasPlan,
    hasEcosystemAccess: isAdmin || hasEcosystem,
    isLoading,
  };
}
