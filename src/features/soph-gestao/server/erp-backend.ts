import { decideErpAccess, type VerifiedErpContext } from "../access/access-contract";
import type { ErpCompany, ErpDataAdapter, ErpIdentity } from "./erp-data";

export type VerifiedSession = ErpIdentity & {
  audience: string | readonly string[];
  expiresAtMs: number;
};

export type ErpBackendDependencies = {
  issuer: string;
  audience: string;
  nowMs(): number;
  // The implementation must verify the signature against the configured Auth
  // project and reject invalid tokens. Decoding JWT claims is insufficient.
  verifySession(token: string): Promise<VerifiedSession | null>;
  findBenefit(identity: ErpIdentity): Promise<VerifiedErpContext["benefit"]>;
  data: ErpDataAdapter;
};

type CompanyResult =
  | { status: 200; company: ErpCompany }
  | { status: 400 | 401 | 403 | 503 };

const companyUuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function createErpBackend(dependencies: ErpBackendDependencies) {
  return {
    async readCompany(request: {
      authorization: string | null;
      companyId: string;
    }): Promise<CompanyResult> {
      const token = /^Bearer +([^\s,]+)$/i.exec(request.authorization ?? "")?.[1];
      if (!token) return { status: 401 };
      try {
        const session = await dependencies.verifySession(token);
        const nowMs = dependencies.nowMs();
        if (
          !session?.userId ||
          session.issuer !== dependencies.issuer ||
          ![session.audience].flat().includes(dependencies.audience) ||
          !Number.isFinite(nowMs) ||
          !Number.isFinite(session.expiresAtMs) ||
          nowMs >= session.expiresAtMs
        ) {
          return { status: 401 };
        }
        if (!companyUuid.test(request.companyId)) return { status: 400 };

        const companyId = request.companyId.toLowerCase();
        const identity = { issuer: session.issuer, userId: session.userId };
        const benefit = await dependencies.findBenefit(identity);

        return await dependencies.data.withCompanyScope(identity, companyId, async (reader) => {
          const ownership = await reader.findOwnership();
          const nowMs = dependencies.nowMs();
          if (!Number.isFinite(nowMs) || nowMs >= session.expiresAtMs) return { status: 401 };
          const decision = decideErpAccess(
            { companyId, action: "read" },
            { userId: identity.userId, nowMs, benefit, ownership },
          );
          if (!decision.allowed) return { status: 403 };
          const company = await reader.readCompany();
          if (company?.id !== companyId) return { status: 403 };
          return { status: 200, company: { id: company.id, name: company.name } };
        });
      } catch {
        return { status: 503 };
      }
    },
  };
}
