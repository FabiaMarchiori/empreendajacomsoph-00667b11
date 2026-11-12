import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const fixture = JSON.parse(
  await readFile("tests/security/fixtures/privileged-live.json", "utf8"),
);
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.role',true),'')$$;
CREATE FUNCTION auth.email() RETURNS text LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.email',true),'')$$;
CREATE TYPE public.user_role AS ENUM('admin','user');
CREATE TABLE profiles(id uuid PRIMARY KEY,email text,is_admin boolean);
CREATE TABLE user_roles(user_id uuid,role public.user_role);
CREATE TABLE assinaturas(user_id uuid,email text,status text,data_expiracao timestamptz,updated_at timestamptz);
CREATE TABLE soph_access_codes(user_id uuid,is_active boolean,expires_at timestamptz);
CREATE TABLE clientes_autorizados(email text,status_assinatura text);
CREATE TABLE fornecedores(id int);
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
`);
for (const f of fixture) {
  await db.exec(f.definition);
  await db.exec(
    `REVOKE ALL ON FUNCTION public.${f.signature} FROM PUBLIC,anon,authenticated,service_role`,
  );
  for (const [role, key] of [
    ["anon", "anon_execute"],
    ["authenticated", "authenticated_execute"],
    ["service_role", "service_execute"],
  ])
    if (f[key])
      await db.exec(
        `GRANT EXECUTE ON FUNCTION public.${f.signature} TO ${role}`,
      );
  // Preserve PUBLIC EXECUTE only where observed in the deployed ACL.
  if (f.proacl.includes("{=X/") || f.proacl.includes(",=X/"))
    await db.exec(`GRANT EXECUTE ON FUNCTION public.${f.signature} TO PUBLIC`);
}
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
await db.query(
  `INSERT INTO profiles VALUES($1,'a@example.test',false),($2,'b@example.test',false),($3,'admin@example.test',true),($4,'expired@example.test',false),($5,'code@example.test',false),($6,'legacy@example.test',false),($7,'plan@example.test',false)`,
  [1, 2, 3, 4, 5, 6, 7].map(id),
);
await db.query(`INSERT INTO user_roles VALUES($1,'admin'),($2,'user')`, [
  id(3),
  id(1),
]);
await db.query(
  `INSERT INTO assinaturas(user_id,email,status,data_expiracao) VALUES($1,'b@example.test','ativa',NULL),($2,'expired@example.test','ativa','2000-01-01'),($3,'plan@example.test','ativa','2099-01-01')`,
  [id(2), id(4), id(7)],
);
// Preserve the deployed ERP plan eligibility predicate exactly.
await db.exec(
  `ALTER TABLE assinaturas ADD COLUMN plano text; UPDATE assinaturas SET plano='premium';`,
);
await db.query(`INSERT INTO soph_access_codes VALUES($1,true,'2099-01-01')`, [
  id(5),
]);
await db.exec(`INSERT INTO clientes_autorizados VALUES('legacy@example.test','ativa'); INSERT INTO fornecedores VALUES(1);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
GRANT SELECT,UPDATE ON profiles TO authenticated; GRANT SELECT ON fornecedores TO anon,authenticated;
CREATE POLICY own_profile_read ON profiles FOR SELECT TO authenticated USING(auth.uid()=id);
CREATE POLICY admin_profile_read ON profiles FOR SELECT TO authenticated USING(is_admin());
CREATE POLICY own_profile_update ON profiles FOR UPDATE TO authenticated USING(auth.uid()=id) WITH CHECK(auth.uid()=id AND NOT(is_admin IS DISTINCT FROM get_is_admin(auth.uid())));
CREATE POLICY admin_profile_update ON profiles FOR UPDATE TO authenticated USING(is_admin()) WITH CHECK(is_admin());
CREATE POLICY suppliers_subscription ON fornecedores FOR SELECT TO public USING(is_admin() OR has_active_subscription(auth.uid()));`);
const ctx = async (role, uid = null, jwtRole = role) => {
  await db.exec("RESET ROLE");
  await db.query(
    "SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",
    [uid || "", jwtRole || ""],
  );
  await db.exec(`SET ROLE ${role}`);
};
const call = async (fn, target) =>
  (
    await db.query(
      `SELECT public.${fn}(${target ? "$1::uuid" : ""}) AS value`,
      target ? [target] : [],
    )
  ).rows[0].value;
let passed = 0;
async function test(name, f) {
  await f();
  passed++;
  console.log("PASS", name);
}
await test("baseline reproduces anonymous subscription enumeration", async () => {
  await ctx("anon");
  assert.equal(await call("has_active_subscription", id(2)), true);
});
await test("baseline reproduces cross-user admin and ERP inspection", async () => {
  await ctx("authenticated", id(1));
  assert.equal(await call("get_is_admin", id(3)), true);
  assert.equal(await call("has_erp_access", id(2)), true);
});
await ctx("postgres", null, null);
const dataSnapshot = async () => {
  await ctx("postgres", null, null);
  return (
    await db.query(
      `SELECT * FROM (SELECT 'profiles' t,to_jsonb(p) data FROM profiles p UNION ALL SELECT 'subscriptions',to_jsonb(a) FROM assinaturas a UNION ALL SELECT 'roles',to_jsonb(r) FROM user_roles r) snapshot ORDER BY t,data::text`,
    )
  ).rows;
};
const before = await dataSnapshot();
const aclBefore = (
  await db.query(
    `SELECT proname,proacl::text FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' ORDER BY proname`,
  )
).rows;
const policiesBefore = (
  await db.query(
    "SELECT tablename,policyname,qual,with_check FROM pg_policies ORDER BY tablename,policyname",
  )
).rows;
const untouchedNames = [
  "is_admin",
  "has_role",
  "claim_subscriptions_for_current_user",
];
const untouched = async () =>
  (
    await db.query(
      `SELECT proname,pg_get_functiondef(p.oid) definition FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND proname=ANY($1) ORDER BY proname`,
      [untouchedNames],
    )
  ).rows;
const unchangedBefore = await untouched();
await db.exec(
  await readFile("release/security-definer/restrict-targets.sql", "utf8"),
);
await test("anonymous target lookup returns false without exposing subscription", async () => {
  await ctx("anon");
  assert.equal(await call("has_active_subscription", id(2)), false);
  assert.equal(await call("has_active_subscription"), false);
});
await test("anonymous policy helpers still execute and suppliers remain empty", async () => {
  await ctx("anon");
  assert.equal(await call("is_admin"), false);
  assert.deepEqual((await db.query("SELECT * FROM fornecedores")).rows, []);
});
await test("anonymous cannot call ERP/admin-profile helpers", async () => {
  await ctx("anon");
  for (const fn of ["has_erp_access", "get_is_admin"])
    await assert.rejects(call(fn, id(2)), /permission denied/);
});
await test("ordinary authenticated user cannot inspect another subscription", async () => {
  await ctx("authenticated", id(1));
  assert.equal(await call("has_active_subscription", id(2)), false);
});
await test("ordinary user cannot inspect admin flag or ERP of another user", async () => {
  await ctx("authenticated", id(1));
  assert.equal(await call("get_is_admin", id(3)), false);
  assert.equal(await call("has_erp_access", id(2)), false);
});
for (const [n, active, erp] of [
  [1, false, false],
  [2, true, true],
  [3, false, true],
  [4, false, false],
  [5, false, true],
  [6, false, true],
  [7, true, true],
])
  await test(`own subscription and ERP rights preserved for fixture ${n}`, async () => {
    await ctx("authenticated", id(n));
    assert.equal(await call("has_active_subscription", id(n)), active);
    assert.equal(await call("has_erp_access", id(n)), erp);
    assert.equal(await call("get_is_admin", id(n)), n === 3);
  });
await test("administrator can legitimately inspect other users", async () => {
  await ctx("authenticated", id(3));
  assert.equal(await call("is_admin"), true);
  assert.equal(await call("has_active_subscription", id(2)), true);
  assert.equal(await call("has_erp_access", id(2)), true);
  assert.equal(await call("get_is_admin", id(1)), false);
});
await test("service backend can inspect targets without a user JWT subject", async () => {
  await ctx("service_role");
  assert.equal(await call("has_active_subscription", id(2)), true);
  assert.equal(await call("has_erp_access", id(2)), true);
  assert.equal(await call("get_is_admin", id(3)), true);
});
await test("empty identity fails closed even if authenticated role is selected", async () => {
  await ctx("authenticated", null, null);
  for (const fn of [
    "has_active_subscription",
    "has_erp_access",
    "get_is_admin",
  ])
    assert.equal(await call(fn, id(2)), false);
});
await test("anonymous role with subject still cannot enumerate", async () => {
  await ctx("anon", id(2));
  assert.equal(await call("has_active_subscription", id(2)), false);
});
await test("profile RLS still prevents self-promotion", async () => {
  await ctx("authenticated", id(1));
  await assert.rejects(
    db.query("UPDATE profiles SET is_admin=true WHERE id=$1", [id(1)]),
    /row-level security/,
  );
});
await test("profile self-update and existing administrator visibility are preserved", async () => {
  await ctx("authenticated", id(1));
  await db.query("UPDATE profiles SET is_admin=false WHERE id=$1", [id(1)]);
  await ctx("authenticated", id(3));
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM profiles")).rows[0].n,
    7,
  );
});
await test("subscription supplier policy preserves subscriber access", async () => {
  await ctx("authenticated", id(2));
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM fornecedores")).rows[0].n,
    1,
  );
});
await test("no grants, policies, claim logic, admin logic or commercial records changed", async () => {
  assert.deepEqual(await dataSnapshot(), before);
  assert.deepEqual(
    (
      await db.query(
        `SELECT proname,proacl::text FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' ORDER BY proname`,
      )
    ).rows,
    aclBefore,
  );
  assert.deepEqual(
    (
      await db.query(
        "SELECT tablename,policyname,qual,with_check FROM pg_policies ORDER BY tablename,policyname",
      )
    ).rows,
    policiesBefore,
  );
  assert.deepEqual(await untouched(), unchangedBefore);
});
await test("repeat application detects definition drift and rolls back", async () => {
  await assert.rejects(
    db.exec(
      await readFile("release/security-definer/restrict-targets.sql", "utf8"),
    ),
    /Definition drift/,
  );
  await db.exec("ROLLBACK");
});
await test("prepared rollback restores definitions without changing records", async () => {
  await db.exec(
    await readFile("release/security-definer/rollback-targets.sql", "utf8"),
  );
  assert.deepEqual(await dataSnapshot(), before);
  await ctx("anon");
  assert.equal(await call("has_active_subscription", id(2)), true);
});
await test("existing PR7 rollback SQL has valid statement delimiters and no record changes", async () => {
  await ctx("postgres", null, null);
  await db.exec(
    "CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb)",
  );
  await db.exec(
    await readFile("release/integration/rollback-claims.sql", "utf8"),
  );
  assert.deepEqual(await dataSnapshot(), before);
});
await db.close();
console.log(`${passed} privileged function checks passed`);
