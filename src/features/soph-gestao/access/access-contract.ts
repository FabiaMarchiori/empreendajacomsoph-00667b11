// All context fields must come from server-side verification and lookups.
// This decision contract does not authenticate a token or query a database.
export type VerifiedErpContext = {
  userId: string;
  nowMs: number;
  benefit: {
    userId: string;
    product: string;
    startsAtMs: number;
    expiresAtMs: number;
    revokedAtMs: number | null;
  } | null;
  ownership: {
    companyId: string;
    ownerUserId: string;
    active: boolean;
  } | null;
};

export type ErpAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "unauthenticated" | "benefit_unavailable" | "denied" };

export function decideErpAccess(
  request: { companyId: string; action: string },
  context: VerifiedErpContext | null,
): ErpAccessDecision {
  // Failed verification or lookups must not reuse an earlier decision.
  if (!context?.userId) return { allowed: false, reason: "unauthenticated" };

  const { userId, nowMs, benefit, ownership } = context;
  if (
    !benefit ||
    benefit.userId !== userId ||
    benefit.product !== "soph-gestao-2" ||
    benefit.revokedAtMs !== null ||
    ![nowMs, benefit.startsAtMs, benefit.expiresAtMs].every(Number.isFinite) ||
    benefit.startsAtMs > nowMs ||
    nowMs >= benefit.expiresAtMs
  ) {
    return { allowed: false, reason: "benefit_unavailable" };
  }

  if (
    (request.action !== "read" && request.action !== "write") ||
    !request.companyId ||
    ownership?.active !== true ||
    ownership.companyId !== request.companyId ||
    ownership.ownerUserId !== userId
  ) {
    return { allowed: false, reason: "denied" };
  }

  return { allowed: true };
}
