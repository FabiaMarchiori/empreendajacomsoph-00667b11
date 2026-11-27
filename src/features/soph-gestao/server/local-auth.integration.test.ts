import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool, type PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createErpBackend, type ErpBackendDependencies, type VerifiedSession } from "./erp-backend";
import type { ErpDataAdapter, ErpIdentity } from "./erp-data";
import { createErpCatalogBackend } from "./erp-catalog-backend";
import { createErpCatalogDataAdapter, type ErpCatalogScope } from "./erp-catalog-data";

const companyA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const audience = "authenticated";

function env(name: string, pattern: RegExp): string {
  const value = process.env[name];
  if (!value || !pattern.test(value)) throw new Error(`Unsafe or missing local configuration: ${name}`);
  return value;
}

function authRequest(url: string, path: string, body?: object, token?: string) {
  return fetch(`${url}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
}

type Account = { email: string; password: string; id: string };
type AuthTokens = { access_token: string; refresh_token: string };

async function createAccount(url: string, label: string): Promise<Account> {
  const email = `${label}@example.com`;
  const password = randomBytes(24).toString("hex");
  const response = await authRequest(url, "signup", { email, password });
  expect(response.status).toBe(200);
  const { user } = await response.json();
  return { email, password, id: user.id };
}

async function tokensFor(url: string, account: Account): Promise<AuthTokens> {
  const response = await authRequest(url, "token?grant_type=password", {
    email: account.email, password: account.password,
  });
  expect(response.status).toBe(200);
  return response.json();
}

// Only for the disposable GoTrue instances configured to issue HS256 tokens.
// A deployed verifier must follow the real issuer's signing configuration.
function localVerifier(secret: string, issuer: string) {
  return async (token: string): Promise<VerifiedSession | null> => {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
    const [header, payload, signature] = parts;
    try {
      if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") return null;
      const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
      const actual = Buffer.from(signature, "base64url");
      if (actual.length !== expected.length || !timingSafeEqual(expected, actual)) return null;
      const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
      if (
        claims.iss !== issuer || !(claims.aud === audience || (Array.isArray(claims.aud) && claims.aud.includes(audience))) || claims.role !== "authenticated" ||
        typeof claims.sub !== "string" || !Number.isFinite(claims.exp) ||
        claims.exp * 1000 <= Date.now()
      ) return null;
      return { userId: claims.sub, issuer, audience: claims.aud, expiresAtMs: claims.exp * 1000 };
    } catch {
      return null;
    }
  };
}

describe.skipIf(process.env.SOPH_RUN_LOCAL_AUTH !== "1")("Soph Gestão with disposable GoTrue and PostgreSQL", () => {
  let appUrl: string;
  let erpUrl: string;
  let issuer: string;
  let erpIssuer: string;
  let app: Pool;
  let erp: Pool;
  let reader: Pool;
  let benefitReader: Pool;
  let a: Account;
  let b: Account;
  let foreign: Account;
  let backend: ReturnType<typeof createErpBackend>;
  let verifySession: ReturnType<typeof localVerifier>;
  let verifyForeign: ReturnType<typeof localVerifier>;
  let catalog: ReturnType<typeof createErpCatalogBackend>;

  beforeAll(async () => {
    const loopback = /^http:\/\/127\.0\.0\.1:\d{1,5}$/;
    const localIssuer = /^https:\/\/soph-1c-[a-f0-9]{10}-(app|erp)\.invalid\/auth\/v1$/;
    const randomSecret = /^[a-f0-9]{64}$/;
    appUrl = env("SOPH_LOCAL_APP_URL", loopback);
    erpUrl = env("SOPH_LOCAL_ERP_URL", loopback);
    issuer = env("SOPH_LOCAL_APP_ISSUER", localIssuer);
    erpIssuer = env("SOPH_LOCAL_ERP_ISSUER", localIssuer);
    const appSecret = env("SOPH_LOCAL_APP_SECRET", randomSecret);
    const erpSecret = env("SOPH_LOCAL_ERP_SECRET", randomSecret);
    if (appUrl === erpUrl || appSecret === erpSecret || issuer === erpIssuer) throw new Error("Expected independent Auth instances");

    const database = { host: "127.0.0.1", database: "postgres", connectionTimeoutMillis: 3000 };
    const port = Number(env("SOPH_LOCAL_DB_PORT", /^\d{1,5}$/));
    const appPort = Number(env("SOPH_LOCAL_APP_DB_PORT", /^\d{1,5}$/));
    if (port === appPort) throw new Error("Expected independent PostgreSQL instances");
    app = new Pool({
      ...database, port: appPort, user: "postgres",
      password: env("SOPH_LOCAL_APP_DB_PASSWORD", /^[a-f0-9]{48}$/),
    });
    erp = new Pool({
      ...database, port, user: "postgres",
      password: env("SOPH_LOCAL_DB_PASSWORD", /^[a-f0-9]{48}$/),
    });

    [a, b, foreign] = await Promise.all([
      createAccount(appUrl, "owner-a"), createAccount(appUrl, "owner-b"), createAccount(erpUrl, "foreign"),
    ]);
    const readerPassword = randomBytes(24).toString("hex");
    // Synthetic provisioning only. The request path opens its own restricted login.
    await erp.query(`create role soph_local_reader login nobypassrls password '${readerPassword}'`);
    await erp.query(readFileSync(new URL("../../../../tests/soph-gestao/integration/erp-fixture.sql", import.meta.url), "utf8"));
    await erp.query(readFileSync(new URL("../../../../tests/soph-gestao/integration/catalog-fixture.sql", import.meta.url), "utf8"));
    await erp.query("insert into soph_fixture.companies values ($1, 'Empresa A'), ($2, 'Empresa B')", [companyA, companyB]);
    await erp.query("insert into soph_fixture.ownership values ($1, $3, $4, true), ($2, $3, $5, true)", [companyA, companyB, issuer, a.id, b.id]);
    reader = new Pool({ ...database, port, user: "soph_local_reader", password: readerPassword, max: 1 });

    const benefitPassword = randomBytes(24).toString("hex");
    await app.query(`create role soph_benefit_reader login nobypassrls password '${benefitPassword}'`);
    await app.query(`create table public.soph_local_benefits (
      user_id uuid primary key, expires_at timestamptz not null, revoked_at timestamptz
    )`);
    await app.query("insert into public.soph_local_benefits values ($1, now() + interval '10 minutes', null), ($2, now() + interval '10 minutes', null)", [a.id, b.id]);
    await app.query("grant select on public.soph_local_benefits to soph_benefit_reader");
    benefitReader = new Pool({ ...database, port: appPort, user: "soph_benefit_reader", password: benefitPassword });
    verifySession = localVerifier(appSecret, issuer);
    verifyForeign = localVerifier(erpSecret, erpIssuer);
    const data: ErpDataAdapter<ErpCatalogScope> = {
      async withCompanyScope(identity, companyId, read) {
        return scoped(identity, companyId, async (client) => read({
          async query<Row>(sql: string, parameters: readonly (string | null)[]) {
            const result = await client.query(sql, [...parameters]);
            return { rows: result.rows as Row[] };
          },
          async findOwnership() {
            const { rows } = await client.query(`select company_id as "companyId", owner_user_id as "ownerUserId", active
               from soph_fixture.ownership where company_id = $1`, [companyId]);
            return rows[0] ?? null;
          },
          async readCompany() {
            const { rows } = await client.query("select id, name from soph_fixture.companies where id = $1", [companyId]);
            return rows[0] ?? null;
          },
        }), true);
      },
    };

    const dependencies: ErpBackendDependencies<ErpCatalogScope> = {
      issuer, audience, nowMs: Date.now, verifySession, data,
      async findBenefit({ userId }) {
        const { rows } = await benefitReader.query("select expires_at, revoked_at from public.soph_local_benefits where user_id = $1", [userId]);
        const row = rows[0];
        return row ? {
          userId, product: "soph-gestao-2", startsAtMs: 0, expiresAtMs: row.expires_at.getTime(),
          revokedAtMs: row.revoked_at?.getTime() ?? null,
        } : null;
      },
    };
    backend = createErpBackend(dependencies);
    catalog = createErpCatalogBackend({ ...dependencies, data: createErpCatalogDataAdapter(data) });
  }, 20000);

  afterAll(async () => {
    await Promise.all([reader?.end(), benefitReader?.end(), app?.end(), erp?.end()]);
  });

  async function scoped<T>(identity: ErpIdentity, company: string, use: (client: PoolClient) => Promise<T>, write = false) {
    const client = await reader.connect();
    try {
      await client.query(write ? "begin" : "begin read only");
      await client.query("select set_config('soph.issuer', $1, true), set_config('soph.subject', $2, true), set_config('soph.company', $3, true)", [identity.issuer, identity.userId, company]);
      const result = await use(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  const request = (token: string, companyId: string) => ({ authorization: `Bearer ${token}`, companyId });

  it("reuses each EmpreendaJá token, with real RLS isolation in both directions", async () => {
    const role = await reader.query("select current_user as login, rolsuper, rolbypassrls from pg_roles where rolname = current_user");
    expect(role.rows).toEqual([{ login: "soph_local_reader", rolsuper: false, rolbypassrls: false }]);
    for (const [owner, own, other] of [[a, companyA, companyB], [b, companyB, companyA]] as const) {
      const { access_token } = await tokensFor(appUrl, owner);
      expect((await verifySession(access_token))?.userId).toBe(owner.id);
      expect((await backend.readCompany(request(access_token, own))).status).toBe(200);
      expect(await backend.readCompany(request(access_token, other))).toEqual({ status: 403 });
      const ids = await scoped({ issuer, userId: owner.id }, own, async (client) =>
        (await client.query("select id from soph_fixture.companies order by id")).rows);
      expect(ids).toEqual([{ id: own }]);
    }
    expect((await reader.query("select id from soph_fixture.companies")).rows).toEqual([]);
    await expect(reader.query("update soph_fixture.companies set name = 'blocked'")).rejects.toMatchObject({ code: "42501" });
  });

  it("rejects a valid JWT from the ERP issuer and a tampered JWT", async () => {
    const foreignToken = (await tokensFor(erpUrl, foreign)).access_token;
    expect((await verifyForeign(foreignToken))?.userId).toBe(foreign.id);
    expect(await backend.readCompany(request(foreignToken, companyA))).toEqual({ status: 401 });
    const [header, claims, sig] = (await tokensFor(appUrl, a)).access_token.split(".");
    const altered = `${header}.${claims}.${sig[0] === "A" ? "B" : "A"}${sig.slice(1)}`;
    expect(await backend.readCompany(request(altered, companyA))).toEqual({ status: 401 });
  });

  it("ignores request identity and uses current benefits on replays", async () => {
    const token = (await tokensFor(appUrl, a)).access_token;
    const forgedRequest = { ...request(token, companyB), userId: b.id, issuer: erpIssuer, plan: "ERP" };
    expect(await backend.readCompany(forgedRequest)).toEqual({ status: 403 });
    const own = request(token, companyA);
    expect((await backend.readCompany(own)).status).toBe(200);
    try {
      await app.query("update public.soph_local_benefits set expires_at = now() where user_id = $1", [a.id]);
      expect(await backend.readCompany(own)).toEqual({ status: 403 });
      await app.query("update public.soph_local_benefits set expires_at = now() + interval '10 minutes', revoked_at = now() where user_id = $1", [a.id]);
      expect(await backend.readCompany(own)).toEqual({ status: 403 });
      expect((await verifySession(token))?.userId).toBe(a.id);
    } finally {
      await app.query("update public.soph_local_benefits set expires_at = now() + interval '10 minutes', revoked_at = null where user_id = $1", [a.id]);
    }
  });

  it("returns a closed response when the scoped database lookup fails", async () => {
    const token = (await tokensFor(appUrl, b)).access_token;
    await erp.query("revoke select on soph_fixture.ownership from soph_local_reader");
    try {
      expect(await backend.readCompany(request(token, companyB))).toEqual({ status: 503 });
    } finally {
      await erp.query("grant select on soph_fixture.ownership to soph_local_reader");
    }
    expect((await backend.readCompany(request(token, companyB))).status).toBe(200);
  });

  it("reads, creates and edits contacts and products in both companies without exposing or changing foreign rows", async () => {
    const tokenA = (await tokensFor(appUrl, a)).access_token;
    const tokenB = (await tokensFor(appUrl, b)).access_token;
    const contact = { nome: "Contato fictício", tipo: "cliente", email: "teste@example.com" };
    const product = { nome: "Produto fictício", categoria: "Teste", custo: "10.10", preco: "20.25" };
    for (const [resource, input, table] of [[catalog.contacts, contact, "contatos"], [catalog.products, product, "produtos"]] as const) {
      const createdA = await resource.create({ ...request(tokenA, companyA), input: { ...input, empresa_id: companyB, quantidade: 500 } });
      const createdB = await resource.create({ ...request(tokenB, companyB), input: { ...input, empresa_id: companyA } });
      expect(createdA).toMatchObject({ status: 201, record: { empresa_id: companyA } });
      expect(createdB).toMatchObject({ status: 201, record: { empresa_id: companyB } });
      if (!("record" in createdA) || !("record" in createdB)) throw new Error("Missing fixture records");
      if (table === "produtos") expect(createdA.record).toMatchObject({ quantidade: 0, custo: "10.10" });

      for (const [token, own, foreignCompany, ownRow, foreignRow] of [
        [tokenA, companyA, companyB, createdA.record, createdB.record],
        [tokenB, companyB, companyA, createdB.record, createdA.record],
      ] as const) {
        expect(await resource.list(request(token, own))).toEqual({ status: 200, records: [ownRow], next: null });
        expect(await resource.list(request(token, foreignCompany))).toEqual({ status: 403 });
        expect(await resource.create({ ...request(token, foreignCompany), input })).toEqual({ status: 403 });
        expect(await resource.update({ ...request(token, own), id: foreignRow.id, input })).toEqual({ status: 404 });
        expect(await resource.update({ ...request(token, own), id: "dddddddd-dddd-dddd-dddd-dddddddddddd", input })).toEqual({ status: 404 });
        expect(await resource.update({ ...request(token, own), id: ownRow.id, input: { ...input, nome: "Editado", empresa_id: foreignCompany, quantidade: 500 } }))
          .toMatchObject({ status: 200, record: { id: ownRow.id, empresa_id: own, nome: "Editado" } });
      }
      expect(await resource.list({ ...request(tokenA, companyA), after: createdA.record.id })).toEqual({ status: 200, records: [], next: null });
      expect((await erp.query(`select empresa_id, nome from public.${table} order by empresa_id`)).rows)
        .toEqual([{ empresa_id: companyA, nome: "Editado" }, { empresa_id: companyB, nome: "Editado" }]);
    }
  });

  it("enforces both policies even for direct SQL using the restricted test role", async () => {
    for (const [table, insert, values] of [
      ["contatos", "insert into public.contatos (empresa_id, tipo, nome) values ($1, 'cliente', 'bloqueado')", [companyB]],
      ["produtos", "insert into public.produtos (empresa_id, nome) values ($1, 'bloqueado')", [companyB]],
    ] as const) {
      const scope = (query: (client: PoolClient) => Promise<unknown>) => scoped({ issuer, userId: a.id }, companyA, query, true);
      await expect(scope((client) => client.query(insert, [...values]))).rejects.toMatchObject({ code: "42501" });
      expect(await scope(async (client) => (await client.query(`select id from public.${table} where empresa_id=$1`, [companyB])).rows)).toEqual([]);
      expect(await scope(async (client) => (await client.query(`update public.${table} set nome='bloqueado' where empresa_id=$1`, [companyB])).rowCount)).toBe(0);
      await expect(scope((client) => client.query(`update public.${table} set empresa_id=$1 where empresa_id=$2`, [companyB, companyA]))).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("blocks catalog operations for invalid sessions, invalid input, and expired ERP benefits", async () => {
    const token = (await tokensFor(appUrl, a)).access_token;
    const own = request(token, companyA);
    const input = { nome: "Teste", categoria: "Teste", custo: "0", preco: "1.30" };
    expect(await catalog.products.create({ ...request("invalid", companyA), input })).toEqual({ status: 401 });
    expect(await catalog.products.create({ ...own, input: { ...input, preco: 1.30 } })).toEqual({ status: 400 });
    expect(await catalog.contacts.list({ ...own, after: "invalid" })).toEqual({ status: 400 });
    await app.query("update public.soph_local_benefits set expires_at=now() where user_id=$1", [a.id]);
    try {
      expect(await catalog.contacts.list(own)).toEqual({ status: 403 });
      expect(await catalog.products.create({ ...own, input })).toEqual({ status: 403 });
      expect(await catalog.contacts.update({ ...own, id: companyA, input: { nome: "Teste", tipo: "cliente" } })).toEqual({ status: 403 });
    } finally {
      await app.query("update public.soph_local_benefits set expires_at=now()+interval '10 minutes' where user_id=$1", [a.id]);
    }
  });

  it("revokes refresh on logout and rejects the access token once it expires", async () => {
    const { access_token, refresh_token } = await tokensFor(appUrl, a);
    const valid = await verifySession(access_token);
    expect(valid?.userId).toBe(a.id);
    expect((await backend.readCompany(request(access_token, companyA))).status).toBe(200);
    expect((await authRequest(appUrl, "logout", undefined, access_token)).status).toBe(204);
    const refresh = await authRequest(appUrl, "token?grant_type=refresh_token", { refresh_token });
    expect(refresh.ok).toBe(false);
    // A stateless signature check accepts an already issued bearer until exp.
    expect(await backend.readCompany(request(access_token, companyA))).toMatchObject({ status: 200 });
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, valid!.expiresAtMs - Date.now() + 25)));
    expect(await backend.readCompany(request(access_token, companyA))).toEqual({ status: 401 });
  }, 20000);
});
