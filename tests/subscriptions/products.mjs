import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TYPE public.user_role AS ENUM('admin','user');
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}');
CREATE TABLE public.profiles(id uuid PRIMARY KEY,email text,first_name text,last_name text,is_admin boolean DEFAULT false);
CREATE TABLE public.user_roles(user_id uuid,role public.user_role);
CREATE TABLE public.assinaturas(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid,email text,status text,plano text,data_expiracao timestamptz,updated_at timestamptz DEFAULT now());
CREATE TABLE public.soph_access_codes(user_id uuid,is_active boolean,expires_at timestamptz);
CREATE TABLE public.clientes_autorizados(email text,status_assinatura text);
CREATE TABLE public.fornecedores(id bigint PRIMARY KEY,categoria text);
CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin) $$;
CREATE POLICY "Users with active subscription can view fornecedores" ON public.fornecedores FOR SELECT USING(true);
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA auth,public TO authenticated,anon;
GRANT SELECT ON public.fornecedores TO authenticated,anon;
INSERT INTO public.fornecedores VALUES(1,'BOLSAS, MOCHILAS E MALAS'),(2,'EXCLUSIVO'),(3,'COMUM');`);
for (const table of [
  "pricing_settings",
  "pricing_products",
  "pricing_channels",
  "pricing_fixed_costs",
  "pricing_simulations",
  "pricing_default_channels",
]) {
  await db.exec(
    `CREATE TABLE public.${table}(id int PRIMARY KEY,user_id uuid); ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY; CREATE POLICY ownership ON public.${table} FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid()); GRANT SELECT,INSERT,UPDATE,DELETE ON public.${table} TO authenticated;`,
  );
}
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
  ["Starter legado", "ativa", null],
];
for (let i = 0; i < cases.length; i++) {
  const [plan, status, expiry] = cases[i];
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,now())",
    [id(i + 1), `user${i}@example.test`],
  );
  await db.query("INSERT INTO profiles(id,email,is_admin) VALUES($1,$2,$3)", [
    id(i + 1),
    `user${i}@example.test`,
    i === 7,
  ]);
  await db.query("INSERT INTO user_roles VALUES($1,$2)", [
    id(i + 1),
    i === 7 ? "admin" : "user",
  ]);
  if (status)
    await db.query(
      "INSERT INTO assinaturas(user_id,email,status,plano,data_expiracao) VALUES($1,$2,$3,$4,$5)",
      [id(i + 1), `user${i}@example.test`, status, plan, expiry],
    );
  for (const table of [
    "pricing_settings",
    "pricing_products",
    "pricing_channels",
    "pricing_fixed_costs",
    "pricing_simulations",
    "pricing_default_channels",
  ])
    await db.query(`INSERT INTO ${table} VALUES($1,$2)`, [i + 1, id(i + 1)]);
}
await db.exec(
  await readFile(
    "supabase/migrations/20260331145716_9942d072-191b-47eb-9992-47f9122d8ca9.sql",
    "utf8",
  ),
);
await db.exec(
  await readFile(
    "supabase/migrations/20261110110000_verified_claims_only.sql",
    "utf8",
  ),
);
const before = (await db.query("SELECT * FROM assinaturas ORDER BY id")).rows;
await db.exec(
  await readFile(
    "supabase/migrations/20261111132917_approved_product_access.sql",
    "utf8",
  ),
);
assert.deepEqual(
  (await db.query("SELECT * FROM assinaturas ORDER BY id")).rows,
  before,
);
await db.query(
  "INSERT INTO product_access_grants(user_id,product,source,reason,authorized_by) VALUES($1,'erp','approved-promotion','Fictional explicit approval',$2)",
  [id(9), id(8)],
);
await db.query("INSERT INTO supplier_shared_access VALUES(3,$1,$2)", [
  "Fictional common content",
  id(8),
]);
await db.exec(`CREATE FUNCTION public.get_is_admin(uid uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT is_admin FROM public.profiles WHERE id=uid $$;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_read ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid());
CREATE POLICY profile_update ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid() AND is_admin IS NOT DISTINCT FROM public.get_is_admin(auth.uid()));
GRANT SELECT,UPDATE ON public.profiles TO authenticated;`);
let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log("PASS", name);
};
const asUser = async (n) => {
  await db.exec("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
    id(n),
  ]);
  await db.exec("SET ROLE authenticated");
};
for (let i = 1; i <= cases.length; i++)
  await test(`${cases[i - 1][0]}: API matrix and pricing RLS`, async () => {
    await asUser(i);
    const a = (await db.query("SELECT current_product_access() a")).rows[0].a;
    const eco = [1, 2, 3, 8, 10].includes(i),
      bag = eco || [4, 9].includes(i),
      erp = [1, 2, 3, 8, 9].includes(i);
    assert.equal(a.ecosystem, eco);
    assert.equal(a.bolsas, bag);
    assert.equal(a.soph, bag);
    assert.equal(a.erp, erp);
    assert.equal(
      (await db.query("SELECT has_erp_access($1) a", [id(i === 1 ? 2 : 1)]))
        .rows[0].a,
      false,
      "cannot inspect another user",
    );
    const suppliers = (
      await db.query("SELECT id FROM fornecedores ORDER BY id")
    ).rows.map((r) => r.id);
    assert.deepEqual(suppliers, eco ? [1, 2, 3] : bag ? [1, 3] : []);
    for (const table of [
      "pricing_settings",
      "pricing_products",
      "pricing_channels",
      "pricing_fixed_costs",
      "pricing_simulations",
      "pricing_default_channels",
    ]) {
      assert.equal(
        (await db.query(`SELECT * FROM ${table}`)).rows.length,
        eco ? 1 : 0,
      );
      if (!eco)
        await assert.rejects(
          db.query(`INSERT INTO ${table} VALUES($1,$2)`, [100 + i, id(i)]),
          /row-level security/,
        );
    }
  });
await test("subscriber cannot mint promotional grants or change admin status", async () => {
  await asUser(4);
  await assert.rejects(
    db.query(
      "INSERT INTO product_access_grants(user_id,product,source,reason,authorized_by) VALUES($1,'erp','forged','not authorized',$1)",
      [id(4)],
    ),
    /row-level security/,
  );
});
await test("new Starter is not a new commercial plan", async () => {
  await db.exec("RESET ROLE");
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,'new@example.test',now())",
    [id(11)],
  );
  await db.query(
    "INSERT INTO assinaturas(user_id,email,status,plano) VALUES($1,'new@example.test','ativa','Starter')",
    [id(11)],
  );
  await asUser(11);
  assert.equal(
    (await db.query("SELECT has_product_access('ecosystem') a")).rows[0].a,
    false,
  );
});
await test("revoked promotion never grants ERP automatically to Bolsas", async () => {
  await db.exec("RESET ROLE");
  await db.exec("UPDATE product_access_grants SET revoked_at=now()");
  await asUser(9);
  assert.equal(
    (await db.query("SELECT has_product_access('erp') a")).rows[0].a,
    false,
  );
  assert.equal(
    (await db.query("SELECT has_product_access('soph') a")).rows[0].a,
    true,
  );
});
await test("anonymous API cannot call entitlement RPC", async () => {
  await db.exec("RESET ROLE; SET request.jwt.claim.sub=''; SET ROLE anon");
  await assert.rejects(
    db.exec("SELECT current_product_access()"),
    /permission denied/,
  );
  assert.equal((await db.query("SELECT * FROM fornecedores")).rows.length, 0);
});
await db.exec("RESET ROLE");
await test("new signup never gains admin by email coincidence", async () => {
  await db.exec(
    "CREATE TRIGGER signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user()",
  );
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,'admin@admin.com',now())",
    [id(12)],
  );
  await asUser(12);
  assert.equal((await db.query("SELECT is_admin() a")).rows[0].a, false);
});
await test("user cannot elevate profiles.is_admin through the API",async()=>{await asUser(4);await assert.rejects(db.query('UPDATE profiles SET is_admin=true WHERE id=$1',[id(4)]),/row-level security/)});
await test("legitimate profile-only and role-only admins are both preserved",async()=>{
 await db.exec('RESET ROLE');await db.query('UPDATE profiles SET is_admin=false WHERE id=$1',[id(8)]);await asUser(8);assert.equal((await db.query('SELECT is_admin() a')).rows[0].a,true);
 await db.exec('RESET ROLE');await db.query('UPDATE profiles SET is_admin=true WHERE id=$1',[id(8)]);await db.query("DELETE FROM user_roles WHERE user_id=$1",[id(8)]);await asUser(8);assert.equal((await db.query('SELECT is_admin() a')).rows[0].a,true);
});
await test("expired individual promotion does not grant ERP",async()=>{await db.exec('RESET ROLE');await db.exec("UPDATE product_access_grants SET revoked_at=NULL,expires_at='2000-01-01'");await asUser(9);assert.equal((await db.query("SELECT has_product_access('erp') a")).rows[0].a,false)});
await db.close();
console.log(`${passed} product authorization integration tests passed`);
