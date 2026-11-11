import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TYPE public.user_role AS ENUM('admin','user');
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
CREATE TABLE profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),email text,is_admin boolean DEFAULT false);
CREATE TABLE user_roles(user_id uuid,role public.user_role);
CREATE TABLE assinaturas(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,email text,status text,plano text,data_expiracao timestamptz);
CREATE TABLE soph_access_codes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,is_active boolean,expires_at timestamptz);
CREATE TABLE clientes_autorizados(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text UNIQUE,status_assinatura text);
CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin) $$;
CREATE FUNCTION public.has_role(requested_role public.user_role) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
CREATE FUNCTION public.claim_subscriptions_for_current_user() RETURNS integer LANGUAGE sql AS $$ SELECT 0 $$;
CREATE TABLE fornecedores(id bigint PRIMARY KEY);
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY unchanged_supplier_policy ON fornecedores FOR SELECT USING(true);
CREATE TABLE pricing_settings(id uuid PRIMARY KEY,user_id uuid);
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY unchanged_pricing_policy ON pricing_settings FOR SELECT USING(user_id=auth.uid());
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;`);
await db.exec(
  await readFile("tests/subscriptions/fixtures/stage1-live-erp.sql", "utf8"),
);
const id = (n) => "00000000-0000-0000-0000-" + String(n).padStart(12, "0");
const cases = [
  ["Ecossistema EmpreendaJá", "ativa", null],
  ["Anual", "ativa", null],
  ["Mensal", "ativa", null],
  ["bolsas_1999", "ativa", null],
  ["none", null, null],
  ["Anual", "ativa", "2000-01-01"],
  ["Mensal", "cancelada", null],
  ["admin", null, null],
  ["bolsas_1999", "ativa", null],
  ["legacy-code", null, null],
  ["legacy-customer", null, null],
  ["Starter", "ativa", null],
  ["ERP legado", "ativa", null],
  ["role-admin", null, null],
  ["bolsas", "ativa", null],
];
for (let i = 1; i <= cases.length; i++) {
  const [plan, status, expiry] = cases[i - 1];
  await db.query("INSERT INTO auth.users VALUES($1,$2)", [
    id(i),
    `user${i}@example.test`,
  ]);
  await db.query("INSERT INTO profiles VALUES($1,$2,$3)", [
    id(i),
    `user${i}@example.test`,
    i === 8,
  ]);
  await db.query("INSERT INTO user_roles VALUES($1,$2)", [
    id(i),
    [8, 14].includes(i) ? "admin" : "user",
  ]);
  if (status)
    await db.query(
      "INSERT INTO assinaturas(user_id,email,status,plano,data_expiracao) VALUES($1,$2,$3,$4,$5)",
      [id(i), `user${i}@example.test`, status, plan, expiry],
    );
}
await db.query(
  "INSERT INTO soph_access_codes(user_id,is_active,expires_at) VALUES($1,true,'2099-01-01')",
  [id(10)],
);
await db.query(
  "INSERT INTO clientes_autorizados(email,status_assinatura) VALUES('user11@example.test','ativa')",
);
const beforeRows = (await db.query("SELECT * FROM assinaturas ORDER BY id"))
  .rows;
const snapshot = async () =>
  (
    await db.query(
      "SELECT proname,pg_get_functiondef(p.oid) definition FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname IN ('is_admin','has_role','handle_new_user','claim_subscriptions_for_current_user') ORDER BY proname",
    )
  ).rows;
const policies = async () =>
  (
    await db.query(
      "SELECT tablename,policyname,cmd,qual,with_check FROM pg_policies WHERE tablename IN('fornecedores','pricing_settings') ORDER BY tablename",
    )
  ).rows;
const beforeFunctions = await snapshot(),
  beforePolicies = await policies();
await db.exec(
  await readFile(
    "supabase/migrations/20261111152724_stage1_plan_benefits.sql",
    "utf8",
  ),
);
let passed = 0;
const test = async (n, f) => {
  await f();
  passed++;
  console.log("PASS", n);
};
const asUser = async (n) => {
  await db.exec("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
    id(n),
  ]);
  await db.exec("SET ROLE authenticated");
};
const benefits = async () =>
  (await db.query("SELECT current_product_access() a")).rows[0].a;
await test("standalone Stage 1 migration preserves signatures and unrelated functions/policies", async () => {
  assert.deepEqual(
    (await db.query("SELECT * FROM assinaturas ORDER BY id")).rows,
    beforeRows,
  );
  assert.deepEqual(await snapshot(), beforeFunctions);
  assert.deepEqual(await policies(), beforePolicies);
  assert.equal(
    (await db.query("SELECT to_regclass('public.product_access_grants') AS t"))
      .rows[0].t,
    null,
  );
});
for (let i = 1; i <= cases.length; i++)
  await test(`${cases[i - 1][0]}: scoped benefits without broad migrations`, async () => {
    await asUser(i);
    const b = await benefits();
    const eco = [1, 2, 3, 8, 12, 14].includes(i),
      bags = eco || [4, 9, 15].includes(i),
      erp = [1, 2, 3, 8, 10, 11, 13, 14].includes(i);
    assert.equal(b.ecosystem, eco);
    assert.equal(b.bolsas, bags);
    assert.equal(b.soph, bags);
    assert.equal(b.erp, erp);
    assert.equal(
      (await db.query("SELECT has_soph_access() a")).rows[0].a,
      b.soph,
    );
    assert.equal(
      (await db.query("SELECT has_erp_access($1) a", [id(i)])).rows[0].a,
      b.erp,
    );
    assert.equal(
      (await db.query("SELECT has_erp_access($1) a", [id(i === 1 ? 2 : 1)]))
        .rows[0].a,
      false,
    );
  });
await test("admin can explicitly grant a Bolsas user promotional ERP only", async () => {
  await asUser(8);
  await db.query(
    "INSERT INTO erp_access_grants(user_id,source,reason,authorized_by,expires_at) VALUES($1,'promotion','Fictional explicit authorization',$2,'2099-01-01')",
    [id(9), id(8)],
  );
  await asUser(9);
  const b = await benefits();
  assert.equal(b.erp, true);
  assert.equal(b.erpBenefit, "promotional");
  assert.equal(b.ecosystem, false);
});
await test("ordinary subscriber cannot create or revoke grants", async () => {
  await asUser(4);
  await assert.rejects(
    db.query(
      "INSERT INTO erp_access_grants(user_id,source,reason,authorized_by) VALUES($1,'forged','fake',$1)",
      [id(4)],
    ),
    /row-level security/,
  );
  const result = await db.query(
    "UPDATE erp_access_grants SET revoked_at=now() RETURNING id",
  );
  assert.equal(result.rows.length, 0);
});
await test("expired and revoked promotions do not grant ERP", async () => {
  await db.exec("RESET ROLE");
  await db.exec(
    "UPDATE erp_access_grants SET expires_at='2000-01-01' WHERE source='promotion'",
  );
  await asUser(9);
  assert.equal((await benefits()).erp, false);
  await db.exec("RESET ROLE");
  await db.exec(
    "UPDATE erp_access_grants SET expires_at=NULL,revoked_at=now() WHERE source='promotion'",
  );
  await asUser(9);
  assert.equal((await benefits()).erp, false);
});
await test("existing code grant follows original expiry/status and remains revocable", async () => {
  await asUser(10);
  assert.equal((await benefits()).erpBenefit, "legacy");
  await db.exec("RESET ROLE");
  await db.query(
    "UPDATE soph_access_codes SET is_active=false WHERE user_id=$1",
    [id(10)],
  );
  await asUser(10);
  assert.equal((await benefits()).erp, false);
  await db.exec("RESET ROLE");
  await db.query(
    "UPDATE soph_access_codes SET is_active=true,expires_at='2000-01-01' WHERE user_id=$1",
    [id(10)],
  );
  await asUser(10);
  assert.equal((await benefits()).erp, false);
});
await test("existing authorized-customer grant survives profile email change but follows source revocation", async () => {
  await db.exec("RESET ROLE");
  await db.query(
    "UPDATE profiles SET email='changed@example.test' WHERE id=$1",
    [id(11)],
  );
  await asUser(11);
  assert.equal((await benefits()).erp, true);
  assert.equal((await benefits()).erpBenefit, "legacy");
  await db.exec("RESET ROLE");
  await db.exec("UPDATE clientes_autorizados SET status_assinatura='inativa'");
  await asUser(11);
  assert.equal((await benefits()).erp, false);
});
await test("future customer authorization/code does not automatically turn Bolsas into ERP", async () => {
  await db.exec("RESET ROLE");
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura) VALUES('user15@example.test','ativa')",
  );
  await db.query(
    "INSERT INTO soph_access_codes(user_id,is_active,expires_at) VALUES($1,true,'2099-01-01')",
    [id(15)],
  );
  await asUser(15);
  assert.equal((await benefits()).erp, false);
  assert.equal((await benefits()).soph, true);
});
await test("new Starter does not create a commercial product", async () => {
  await db.exec("RESET ROLE");
  await db.query(
    "INSERT INTO assinaturas(user_id,email,status,plano) VALUES($1,'user5@example.test','ativa','Starter')",
    [id(5)],
  );
  await asUser(5);
  assert.equal((await benefits()).ecosystem, false);
  assert.equal((await benefits()).soph, false);
});
await test("anonymous endpoint access is denied", async () => {
  await db.exec("RESET ROLE; SET request.jwt.claim.sub=''; SET ROLE anon");
  await assert.rejects(
    db.exec("SELECT current_product_access()"),
    /permission denied/,
  );
  await assert.rejects(
    db.exec("SELECT has_soph_access()"),
    /permission denied/,
  );
});
await db.exec("RESET ROLE");
await test("legacy source preservation never changes original subscriptions", async () => {
  assert.deepEqual(
    (
      await db.query(
        "SELECT * FROM assinaturas WHERE user_id<>$1 ORDER BY id",
        [id(5)],
      )
    ).rows,
    beforeRows.filter((r) => r.user_id !== id(5)),
  );
});
await db.close();
console.log(`${passed} standalone Stage 1 plan/ERP preservation tests passed`);
