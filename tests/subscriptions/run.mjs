import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}');
CREATE TABLE public.profiles(id uuid PRIMARY KEY,email text,first_name text,last_name text,is_admin boolean DEFAULT false);
CREATE TABLE public.user_roles(user_id uuid,role text);
CREATE TABLE public.assinaturas(id text PRIMARY KEY,user_id uuid,email text,status text DEFAULT 'ativa',plano text DEFAULT 'original',data_expiracao timestamptz,updated_at timestamptz DEFAULT now());`);
const migration = await readFile(
  "supabase/migrations/20261110110000_verified_claims_only.sql",
  "utf8",
);
// Fixtures predate the migration, including legitimate accounts with changed email.
const a = "00000000-0000-0000-0000-000000000001",
  b = "00000000-0000-0000-0000-000000000002";
await db.exec(`INSERT INTO auth.users(id,email,email_confirmed_at) VALUES ('${a}','buyer@example.test',null),('${b}','changed@example.test',now());
INSERT INTO assinaturas(id,user_id,email) VALUES ('existing','${b}','old@example.test'),('pending',null,' BUYER@example.test ');
`);
const before = (await db.query("SELECT * FROM assinaturas WHERE id='existing'"))
  .rows;
await db.exec(migration);
await db.exec(migration); // Objects are safely replaceable, no duplicate triggers.
await db.exec(
  `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user(); SET request.jwt.claim.sub='${a}';`,
);
let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log("PASS", name);
}
const owner = async (id) =>
  (await db.query("SELECT user_id FROM assinaturas WHERE id=$1", [id])).rows[0]
    .user_id;
await test("unconfirmed RPC does not claim previous purchase", async () => {
  assert.equal(
    (await db.query("SELECT claim_subscriptions_for_current_user() n")).rows[0]
      .n,
    0,
  );
  assert.equal(await owner("pending"), null);
});
await test("legacy/service-role assignment to unconfirmed owner is rejected", async () => {
  await assert.rejects(
    db.query("UPDATE assinaturas SET user_id=$1 WHERE id='pending'", [a]),
    /Confirmed/,
  );
});
await test("existing changed-email subscription remains byte-for-byte unchanged", async () =>
  assert.deepEqual(
    (await db.query("SELECT * FROM assinaturas WHERE id='existing'")).rows,
    before,
  ));
await test("confirmation links previous purchase using authoritative normalized email", async () => {
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [
    a,
  ]);
  assert.equal(await owner("pending"), a);
});
await test("duplicate confirmation and claim are idempotent", async () => {
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [
    a,
  ]);
  assert.equal(
    (await db.query("SELECT claim_subscriptions_for_current_user() n")).rows[0]
      .n,
    0,
  );
});
await test("existing owner cannot be reassigned or unlinked", async () => {
  await assert.rejects(
    db.query("UPDATE assinaturas SET user_id=$1 WHERE id='existing'", [a]),
    /reassigned/,
  );
  await assert.rejects(
    db.exec("UPDATE assinaturas SET user_id=null WHERE id='existing'"),
    /reassigned/,
  );
});
await test("purchase after confirmation can link and duplicate assignment preserves access", async () => {
  await db.query(
    "INSERT INTO assinaturas(id,email,user_id) VALUES ('later','buyer@example.test',$1)",
    [a],
  );
  await db.query("UPDATE assinaturas SET user_id=$1 WHERE id='later'", [a]);
  assert.equal(await owner("later"), a);
});
await test("confirmed identity cannot claim a different email", async () => {
  await assert.rejects(
    db.query(
      "INSERT INTO assinaturas(id,email,user_id) VALUES ('wrong','victim@example.test',$1)",
      [a],
    ),
    /Confirmed/,
  );
});
await test("unconfirmed signup remains unlinked until existing confirmation", async () => {
  const c = "00000000-0000-0000-0000-000000000003";
  await db.exec(
    "INSERT INTO assinaturas(id,email) VALUES ('signup','signup@example.test')",
  );
  await db.query(
    "INSERT INTO auth.users(id,email) VALUES ($1,'signup@example.test')",
    [c],
  );
  assert.equal(await owner("signup"), null);
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [
    c,
  ]);
  assert.equal(await owner("signup"), c);
});
await test("confirmed signup links purchase without an extra confirmation", async () => {
  const c = "00000000-0000-0000-0000-000000000004";
  await db.exec(
    "INSERT INTO assinaturas(id,email) VALUES ('oauth','oauth@example.test')",
  );
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES ($1,'oauth@example.test',now())",
    [c],
  );
  assert.equal(await owner("oauth"), c);
});
await test("anonymous caller cannot execute claim function", async () => {
  await db.exec("SET ROLE anon");
  await assert.rejects(
    db.exec("SELECT public.claim_subscriptions_for_current_user()"),
    /permission denied/,
  );
  await db.exec("RESET ROLE");
});
await test("legacy linked unconfirmed client keeps existing access", async () => {
  await db.query("UPDATE auth.users SET email_confirmed_at=null WHERE id=$1", [
    b,
  ]);
  await db.exec("UPDATE assinaturas SET plano=plano WHERE id='existing'");
  assert.equal(await owner("existing"), b);
});
console.log(`${passed} PostgreSQL integration tests passed`);
await db.close();
