/**
 * Soph Gestão 2.0 catalog API. Hosted by Supabase Edge Functions,
 * independent of the frontend host (Netlify, Vercel, etc.).
 * Server-only environment variables:
 * SUPABASE_ANON_KEY (automatically supplied by the EmpreendaJá Supabase project)
 * SOPH_ERP_CATALOG_DATABASE_URL (Postgres URL for soph_catalogo_transport, NOT postgres/service_role)
 * The transport role has NO password until provisioned separately.
 */
import { createClient } from "npm:@supabase/supabase-js@2.101.1";
import { Buffer } from "node:buffer";
import { Pool, type PoolClient } from "npm:pg@8.16.3";
import { createErpCatalogBackend } from "../../../src/features/soph-gestao/server/erp-catalog-backend.ts";
import { createErpCatalogDataAdapter, type ErpCatalogScope } from "../../../src/features/soph-gestao/server/erp-catalog-data.ts";
import type { ErpDataAdapter, ErpIdentity } from "../../../src/features/soph-gestao/server/erp-data.ts";
import { authorizeErpOperation, type VerifiedSession } from "../../../src/features/soph-gestao/server/erp-backend.ts";
import { createSalesFinanceBackend } from "../../../src/features/soph-gestao/server/erp-sales-finance.ts";

const APP_URL = "https://ospnuclymrxjoqwyolfn.supabase.co";
const ISSUER = APP_URL + "/auth/v1";
const AUDIENCE = "authenticated";
const ERP_PROJECT = "qdfjujkfclfoojjofgpq";
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const corsHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
};

function reply(statusCode: number, value: unknown): Response {
  return new Response(JSON.stringify(value), { status: statusCode, headers: corsHeaders });
}
function tokenFrom(req: Request): string | null {
  const authorization = req.headers.get("authorization") ?? "";
  return /^Bearer +([^\s,]+)$/i.exec(authorization)?.[1] ?? null;
}
function claimsForVerifiedToken(token: string, userId: string): VerifiedSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (payload.iss !== ISSUER || payload.role !== "authenticated" || payload.sub !== userId
      || !(payload.aud === AUDIENCE || (Array.isArray(payload.aud) && payload.aud.includes(AUDIENCE)))
      || !Number.isSafeInteger(payload.exp) || payload.exp * 1000 <= Date.now()) return null;
    // Claims are considered only AFTER Supabase Auth has authenticated this exact token.
    return { userId, issuer: ISSUER, audience: AUDIENCE, expiresAtMs: payload.exp * 1000 };
  } catch { return null; }
}
function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) return false;
    // The dedicated least-privilege login; never accept postgres/service_role credentials.
    const direct = parsed.hostname === `db.${ERP_PROJECT}.supabase.co` && parsed.username === "soph_catalogo_transport";
    const pooler = parsed.hostname.endsWith(".pooler.supabase.com")
      && parsed.username === `soph_catalogo_transport.${ERP_PROJECT}`;
    return parsed.pathname === "/postgres" && (direct || pooler);
  } catch { return false; }
}

let pool: Pool | null = null;
function getPool(): Pool {
  const url = Deno.env.get("SOPH_ERP_CATALOG_DATABASE_URL");
  if (!url || !validateDatabaseUrl(url)) throw new Error("ERP connection is not provisioned with the restricted role");
  if (!pool) pool = new Pool({
    connectionString: url, max: 3, idleTimeoutMillis: 8000,
    connectionTimeoutMillis: 4000, ssl: { rejectUnauthorized: true },
    application_name: "soph-gestao-2-catalog",
  });
  return pool;
}
async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query("set local statement_timeout = '5000ms'");
    await client.query("set local idle_in_transaction_session_timeout = '7000ms'");
    const who = await client.query<{ current_user: string }>("select current_user");
    if (who.rows[0]?.current_user !== "soph_catalogo_transport") throw new Error("Unexpected database login");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
async function setContext(client: PoolClient, identity: ErpIdentity, companyId: string, roleName: "soph_catalogo_discovery" | "soph_catalogo_backend") {
  // No role name comes from the request; the login can assume only these two restrictive roles.
  await client.query(roleName === "soph_catalogo_discovery"
    ? "set local role soph_catalogo_discovery" : "set local role soph_catalogo_backend");
  await client.query(
    "select set_config('soph.issuer',$1,true), set_config('soph.subject',$2,true), set_config('soph.company',$3,true)",
    [identity.issuer, identity.userId, companyId],
  );
}
async function resolveCompany(identity: ErpIdentity): Promise<string | null> {
  return transaction(async (client) => {
    await setContext(client, identity, "00000000-0000-0000-0000-000000000000", "soph_catalogo_discovery");
    // The discovery role has only SELECT on RLS-limited, active links for the verified identity.
    const result = await client.query<{ empresa_id: string }>(
      "select empresa_id from soph_catalogo_privado.vinculos where issuer=$1 and subject=$2::uuid limit 2",
      [identity.issuer, identity.userId],
    );
    return result.rows.length === 1 ? result.rows[0].empresa_id : null;
  });
}
function dataAdapter(): ErpDataAdapter<ErpCatalogScope> {
  return {
    async withCompanyScope<T>(identity: ErpIdentity, companyId: string, operation: (reader: ErpCatalogScope) => Promise<T>): Promise<T> {
      return transaction(async (client) => {
        await setContext(client, identity, companyId, "soph_catalogo_backend");
        const reader: ErpCatalogScope = {
          async findOwnership() {
            const data = await client.query<{ companyId: string; ownerUserId: string }>(
              `select empresa_id as "companyId", subject::text as "ownerUserId"
                 from soph_catalogo_privado.vinculos where empresa_id=$1::uuid limit 1`, [companyId]);
            const link = data.rows[0];
            return link ? { ...link, active: true } : null;
          },
          async readCompany() {
            const data = await client.query<{ id: string; name: string }>(
              `select id, nome as name from public.empresas where id=$1::uuid`, [companyId]);
            return data.rows[0] ?? null;
          },
          async query<Row>(sql: string, parameters: readonly (string | null)[]) {
            const result = await client.query(sql, [...parameters]);
            return { rows: result.rows as Row[] };
          },
        };
        return operation(reader);
      });
    },
  };
}
export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, {status:204,headers:corsHeaders});
  if (req.method !== "POST") return reply(405, {error:"METHOD_NOT_ALLOWED"});
  const token = tokenFrom(req);
  if (!token) return reply(401, { error: "UNAUTHORIZED" });
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 32768) return reply(413, {error:"BODY_TOO_LARGE"});
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply(400,{error:"INVALID_BODY"});
    body = parsed;
  } catch { return reply(400,{error:"INVALID_BODY"}); }
  const resource = body.resource;
  const action = body.action;
  if (resource !== "scope" && resource !== "contacts" && resource !== "products" && resource !== "sales" && resource !== "finance") return reply(400,{error:"INVALID_RESOURCE"});
  if (!["GET","POST","PATCH"].includes(String(action))) return reply(400,{error:"INVALID_ACTION"});
  if (resource === "scope" && action !== "GET") return reply(405,{error:"METHOD_NOT_ALLOWED"});

  const appKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!appKey || !Deno.env.get("SOPH_ERP_CATALOG_DATABASE_URL")) return reply(503, { error: "CATALOG_NOT_CONFIGURED" });
  try {
    const app = createClient(APP_URL, appKey, { auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } } });
    // Never authorize from browser session claims alone: validate with the issuer.
    const { data: { user }, error: userError } = await app.auth.getUser(token);
    if (userError || !user?.id || !user.email_confirmed_at) return reply(401, { error: "UNAUTHORIZED" });
    const verified = claimsForVerifiedToken(token, user.id);
    if (!verified || !uuid.test(verified.userId)) return reply(401, { error: "UNAUTHORIZED" });
    // The canonical, server-side ERP entitlement is checked afresh on every request.
    const { data: hasAccess, error: benefitError } = await app.rpc("has_erp_access", { check_user_id: verified.userId });
    if (benefitError) return reply(503, { error: "BENEFIT_UNAVAILABLE" });
    if (hasAccess !== true) return reply(403, { error: "ERP_ACCESS_DENIED" });

    const identity = { issuer: verified.issuer, userId: verified.userId };
    const companyId = await resolveCompany(identity);
    if (!companyId) return reply(409, { error: "COMPANY_LINK_PENDING_OR_AMBIGUOUS" });
    if (resource === "scope") {
      if (action !== "GET") return reply(405, { error: "METHOD_NOT_ALLOWED" });
      const company = await dataAdapter().withCompanyScope(identity, companyId, (reader) => reader.readCompany());
      return company ? reply(200, { company }) : reply(403, { error: "COMPANY_ACCESS_DENIED" });
    }

    const dependencies = {
      issuer: ISSUER, audience: AUDIENCE, nowMs: Date.now,
      verifySession: async (candidate: string) => candidate === token ? verified : null,
      findBenefit: async (candidate: ErpIdentity) => candidate.userId === verified.userId
        ? { userId: verified.userId, product: "soph-gestao-2", startsAtMs: 0,
            expiresAtMs: Math.min(verified.expiresAtMs, Date.now() + 5000), revokedAtMs: null }
        : null,
      data: createErpCatalogDataAdapter(dataAdapter()),
    };
    if (resource === "sales" || resource === "finance") {
      const operations = createSalesFinanceBackend();
      const run = authorizeErpOperation({ ...dependencies, data: dataAdapter() });
      const request = { authorization: `Bearer ${token}`, companyId };
      if (action === "GET") {
        const result = await run(request, "read", async reader =>
          resource === "sales"
            ? operations.salesList(reader, companyId, typeof body.after === "string" ? body.after : undefined)
            : operations.financeList(reader, companyId, typeof body.after === "string" ? body.after : undefined));
        return reply(result.status, result);
      }
      if (action === "POST") {
        if (!body.input || typeof body.input !== "object" || Array.isArray(body.input)) return reply(400, {error:"INVALID_INPUT"});
        const result = await run(request, "write", async reader =>
          resource === "sales"
            ? operations.salesCreate(reader, companyId, body.input)
            : operations.financeCreate(reader, companyId, body.input));
        return reply(result.status, result);
      }
      if (resource !== "finance") return reply(405, {error:"METHOD_NOT_ALLOWED"});
      const result = await run(request, "write", async reader =>
        operations.financeSettle(reader, companyId, body.id));
      return reply(result.status, result);
    }
    const catalog = createErpCatalogBackend(dependencies);
    const endpoint = resource === "contacts" ? catalog.contacts : catalog.products;
    const request = { authorization: `Bearer ${token}`, companyId };
    let result;
    if (action === "GET") {
      result = await endpoint.list({ ...request, after: typeof body.after === "string" ? body.after : undefined });
    } else {
      const input = body.input;
      if (!input || typeof input !== "object" || Array.isArray(input)) return reply(400, { error: "INVALID_INPUT" });
      if (action === "POST") {
        result = await endpoint.create({ ...request, input });
      } else {
        const id = body.id;
        if (typeof id !== "string" || !uuid.test(id)) return reply(400, { error: "INVALID_ID" });
        result = await endpoint.update({ ...request, id: id as string, input });
      }
    }
    return reply(result.status, result);
  } catch {
    // Do not leak SQL, credentials, or other tenants' metadata.
    return reply(503, { error: "CATALOG_UNAVAILABLE" });
  }
}

Deno.serve(handler);
