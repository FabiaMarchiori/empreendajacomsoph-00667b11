import { describe, expect, it, vi } from "vitest";
import { createErpBackend, type ErpBackendDependencies, type VerifiedSession } from "./erp-backend";

import type { ErpCompanyReader, ErpIdentity } from "./erp-data";

const issuer = "https://empreendaja.test/auth/v1";
const companyA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const companies = [
  { id: companyA, name: "Empresa A", owner: "owner-a" },
  { id: companyB, name: "Empresa B", owner: "owner-b" },
];

function fixture() {
  const a = { issuer, userId: "owner-a", audience: "authenticated", expiresAtMs: 500 };
  const b = { ...a, userId: "owner-b" };
  const benefit = (userId: string) => ({
    userId, product: "soph-gestao-2", startsAtMs: 0, expiresAtMs: 200, revokedAtMs: null,
  });
  const deps = {
    issuer,
    audience: "authenticated",
    nowMs: vi.fn(() => 100),
    verifySession: vi.fn(async (token: string): Promise<VerifiedSession | null> =>
      token === "fake-a" ? a : token === "fake-b" ? b : null),
    findBenefit: vi.fn<ErpBackendDependencies["findBenefit"]>(async ({ userId }) => benefit(userId)),
    data: {
      async withCompanyScope<T>(
        identity: ErpIdentity,
        id: string,
        read: (reader: ErpCompanyReader) => Promise<T>,
      ) {
        const company = companies.find((item) => item.id === id && item.owner === identity.userId);
        return read({ findOwnership: () => findOwnership(company), readCompany: () => readCompany(company) });
      },
    },
  };
  const findOwnership = vi.fn(async (company?: typeof companies[number]) => company
    ? { companyId: company.id, ownerUserId: company.owner, active: true }
    : null);
  const readCompany = vi.fn(async (company?: typeof companies[number]) => company ?? null);
  return { ...deps, backend: createErpBackend(deps), a, benefit, findOwnership, readCompany };
}

describe("isolated Soph Gestão backend", () => {
  it.each([
    ["fake-a", companyA, companyB, "Empresa A"],
    ["fake-b", companyB, companyA, "Empresa B"],
  ])("isolates company ownership for %s", async (token, own, other, name) => {
    const { backend, readCompany } = fixture();
    const authorization = `Bearer ${token}`;
    expect(await backend.readCompany({ authorization, companyId: own })).toEqual({
      status: 200, company: { id: own, name },
    });
    expect(await backend.readCompany({ authorization, companyId: other })).toEqual({ status: 403 });
    expect(await backend.readCompany({
      authorization, companyId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    })).toEqual({ status: 403 });
    expect(readCompany).toHaveBeenCalledTimes(1);
  });

  it.each([null, "Bearer", "Bearer invalid", "Basic fake-a", "Bearer fake-a,fake-b"])(
    "rejects an invalid or missing session (%s)",
    async (authorization) => {
      const { backend, findBenefit, findOwnership } = fixture();
      expect(await backend.readCompany({ authorization, companyId: companyA })).toEqual({ status: 401 });
      expect(findBenefit).not.toHaveBeenCalled();
      expect(findOwnership).not.toHaveBeenCalled();
    },
  );

  it.each([{ issuer: "https://erp.test/auth/v1" }, { audience: "other" }, { expiresAtMs: 100 }])(
    "rejects mismatched verified claims (%j)",
    async (claims) => {
      const { backend, verifySession, a, findBenefit } = fixture();
      verifySession.mockResolvedValueOnce({ ...a, ...claims });
      expect(await backend.readCompany({ authorization: "Bearer fake-a", companyId: companyA })).toEqual({ status: 401 });
      expect(findBenefit).not.toHaveBeenCalled();
    },
  );

  it("denies an expired or revoked benefit on subsequent requests", async () => {
    const { backend, benefit, findBenefit, nowMs, readCompany } = fixture();
    const request = { authorization: "Bearer fake-a", companyId: companyA };
    expect((await backend.readCompany(request)).status).toBe(200);
    nowMs.mockReturnValue(200);
    expect(await backend.readCompany(request)).toEqual({ status: 403 });
    nowMs.mockReturnValue(100);
    findBenefit.mockResolvedValueOnce({ ...benefit("owner-a"), revokedAtMs: 99 });
    expect(await backend.readCompany(request)).toEqual({ status: 403 });
    expect(readCompany).toHaveBeenCalledTimes(1);
  });

  it("ignores identity and entitlement supplied by the caller", async () => {
    const { backend, findBenefit, readCompany } = fixture();
    findBenefit.mockResolvedValueOnce(null);
    const request = { authorization: "Bearer fake-a", companyId: companyA, userId: "owner-b", plan: "ERP" };
    expect(await backend.readCompany(request)).toEqual({ status: 403 });
    expect(findBenefit).toHaveBeenCalledWith({ issuer, userId: "owner-a" });
    expect(readCompany).not.toHaveBeenCalled();
  });

  it("does not read data for an inactive ownership", async () => {
    const { backend, findOwnership, readCompany } = fixture();
    findOwnership.mockResolvedValueOnce({ companyId: companyA, ownerUserId: "owner-a", active: false });
    expect(await backend.readCompany({ authorization: "Bearer fake-a", companyId: companyA })).toEqual({ status: 403 });
    expect(readCompany).not.toHaveBeenCalled();
  });

  it.each(["verifySession", "findBenefit", "findOwnership", "readCompany"] as const)(
    "remains closed and hides details when %s fails",
    async (dependency) => {
      const f = fixture();
      f[dependency].mockRejectedValueOnce(new Error("internal endpoint details"));
      expect(await f.backend.readCompany({ authorization: "Bearer fake-a", companyId: companyA })).toEqual({ status: 503 });
      if (dependency !== "readCompany") expect(f.readCompany).not.toHaveBeenCalled();
    },
  );

  it("rejects a malformed company identifier before consulting data", async () => {
    const { backend, findBenefit, findOwnership } = fixture();
    expect(await backend.readCompany({ authorization: "Bearer fake-a", companyId: "invalid" })).toEqual({ status: 400 });
    expect(findBenefit).not.toHaveBeenCalled();
    expect(findOwnership).not.toHaveBeenCalled();
  });

  it("rejects a session that expires during authorization", async () => {
    const { backend, nowMs, readCompany } = fixture();
    nowMs.mockReturnValueOnce(100).mockReturnValueOnce(500);
    expect(await backend.readCompany({ authorization: "Bearer fake-a", companyId: companyA })).toEqual({ status: 401 });
    expect(readCompany).not.toHaveBeenCalled();
  });

  it("rejects a mismatched scope returned by the reader", async () => {
    const { backend, readCompany } = fixture();
    readCompany.mockResolvedValueOnce(companies[1]);
    expect(await backend.readCompany({ authorization: "Bearer fake-a", companyId: companyA })).toEqual({ status: 403 });
  });
});
