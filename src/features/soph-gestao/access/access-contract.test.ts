import { describe, expect, it } from "vitest";
import { decideErpAccess, type VerifiedErpContext } from "./access-contract";

const benefit = {
  userId: "owner-a",
  product: "soph-gestao-2",
  startsAtMs: 100,
  expiresAtMs: 200,
  revokedAtMs: null,
};
const ownership = { companyId: "company-a", ownerUserId: "owner-a", active: true };
const verified: VerifiedErpContext = {
  userId: "owner-a", nowMs: 150, benefit, ownership,
};
const request = { companyId: "company-a", action: "read" };

describe("Soph Gestão authorization contract", () => {
  it.each(["read", "write"])("permits %s for the authorized owner", (action) => {
    expect(decideErpAccess({ ...request, action }, verified)).toEqual({ allowed: true });
  });

  it.each([100, 199])("allows access at time %i within validity", (nowMs) => {
    expect(decideErpAccess(request, { ...verified, nowMs })).toEqual({ allowed: true });
  });

  it.each([99, 200, 201, NaN, Infinity])("denies outside validity at time %i", (nowMs) => {
    expect(decideErpAccess(request, { ...verified, nowMs })).toEqual({
      allowed: false, reason: "benefit_unavailable",
    });
  });

  it.each([
    null, { ...benefit, revokedAtMs: 120 }, { ...benefit, product: "annual" },
    { ...benefit, userId: "owner-b" }, { ...benefit, expiresAtMs: NaN },
  ])("requires a valid explicit benefit for the verified identity (%j)", (candidate) => {
    const forgedRequest = { ...request, plan: "premium", hasErpAccess: true };
    expect(decideErpAccess(forgedRequest, { ...verified, benefit: candidate })).toEqual({
      allowed: false, reason: "benefit_unavailable",
    });
  });

  it("denies when identity verification or authorization loading fails", () => {
    expect(decideErpAccess(request, null)).toEqual({ allowed: false, reason: "unauthenticated" });
    expect(decideErpAccess(request, { ...verified, userId: "" }).allowed).toBe(false);
  });

  it("uses the same public decision for a missing or foreign company", () => {
    const foreign = { ...ownership, ownerUserId: "owner-b" };
    const globalAdmin = { ...verified, ownership: foreign, isAdmin: true };
    const denied = { allowed: false, reason: "denied" };
    expect(decideErpAccess(request, { ...verified, ownership: null })).toEqual(denied);
    expect(decideErpAccess(request, globalAdmin)).toEqual(denied);
    expect(decideErpAccess({ ...request, companyId: "company-b" }, verified)).toEqual(denied);
  });

  it("denies an inactive ownership and an unknown action", () => {
    expect(decideErpAccess(request, { ...verified, ownership: { ...ownership, active: false } }).allowed).toBe(false);
    expect(decideErpAccess({ ...request, action: "manage_members" }, verified).allowed).toBe(false);
  });
});
