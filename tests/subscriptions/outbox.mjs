import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE TABLE public.assinaturas(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kiwify_subscription_id text UNIQUE,email text,status text);
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;`);
await db.exec(
  await readFile(
    "supabase/migrations/20260918163000_create_comunicacoes_transacionais.sql",
    "utf8",
  ),
);
await db.exec(
  await readFile(
    "supabase/migrations/20261111133107_transactional_email_recovery.sql",
    "utf8",
  ),
);
const purchase = (
  await db.query(
    "INSERT INTO assinaturas(kiwify_subscription_id,email,status) VALUES('order','buyer@example.test','ativa') RETURNING id",
  )
).rows[0].id;
const reserve = async () =>
  (await db.query("SELECT reserve_access_email('order',$1) r", [purchase]))
    .rows[0].r;
const finish = async (r, success, uncertain = false) =>
  (
    await db.query("SELECT finish_access_email($1,$2,$3,$4,$5,$6) r", [
      r.id,
      r.token,
      success,
      success ? "fictional-receipt" : null,
      success ? null : "fictional error",
      uncertain,
    ])
  ).rows[0].r;
const dispatch = async (r) =>
  (
    await db.query("SELECT begin_access_email_dispatch($1,$2) r", [
      r.id,
      r.token,
    ])
  ).rows[0].r;
let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log("PASS", name);
};
let first;
await test("one reservation wins concurrent duplicate events", async () => {
  const results = await Promise.all([reserve(), reserve(), reserve()]);
  assert.equal(results.filter((r) => r.state === "reserved").length, 1);
  assert.equal(results.filter((r) => r.state === "busy").length, 2);
  first = results.find((r) => r.state === "reserved");
  assert.equal(
    (await db.query("SELECT * FROM comunicacoes_transacionais")).rows.length,
    1,
  );
});
await test("confirmed failure is retryable with a new fenced token", async () => {
  await dispatch(first);
  assert.equal(await finish(first, false), true);
  const r = await reserve();
  assert.equal(r.state, "reserved");
  assert.notEqual(r.token, first.token);
  assert.equal(await finish(first, true), false);
  first = r;
});
await test("expired reservation before dispatch can safely recover", async () => {
  await db.query(
    "UPDATE comunicacoes_transacionais SET lease_until=now()-interval '1 minute' WHERE id=$1",
    [first.id],
  );
  const r = await reserve();
  assert.equal(r.state, "reserved");
  assert.equal(await dispatch(first), false);
  first = r;
});
await test("successful email is never reserved again", async () => {
  assert.equal(await dispatch(first), true);
  assert.equal(await finish(first, true), true);
  assert.equal((await reserve()).state, "sent");
  assert.equal(
    (await db.query("SELECT attempt_count FROM comunicacoes_transacionais"))
      .rows[0].attempt_count,
    3,
  );
});
await test("communication remains associated with the stored purchase and recipient", async () => {
  const row = (await db.query("SELECT * FROM comunicacoes_transacionais"))
    .rows[0];
  assert.equal(row.assinatura_id, purchase);
  assert.equal(row.email, "buyer@example.test");
  assert.equal(row.template_id, 5);
  await assert.rejects(
    db.query("SELECT reserve_access_email('other',$1)", [purchase]),
    /association/,
  );
});
await test("uncertain provider acceptance requires reconciliation, never blind resend", async () => {
  await db.exec(
    "UPDATE comunicacoes_transacionais SET status='failed',send_token=NULL,dispatch_started_at=NULL,requires_reconciliation=false",
  );
  const r = await reserve();
  await dispatch(r);
  await finish(r, false, true);
  assert.equal((await reserve()).state, "reconcile");
});
await test("expired dispatch reservation cannot duplicate an accepted email", async () => {
  await db.exec(
    "UPDATE comunicacoes_transacionais SET status='sending',requires_reconciliation=false,lease_until=now()-interval '3 minutes'",
  );
  assert.equal((await reserve()).state, "reconcile");
});
await test("ordinary API user cannot reserve or mark an email sent", async () => {
  await db.exec("SET ROLE authenticated");
  await assert.rejects(reserve(), /permission denied/);
  await db.exec("RESET ROLE");
});
await test("ambiguous pre-migration failure is not blindly resent",async()=>{await db.exec("UPDATE comunicacoes_transacionais SET status='failed',send_token=NULL,dispatch_started_at=NULL,lease_until=NULL,requires_reconciliation=false,error_message='Network failure'");assert.equal((await reserve()).state,'reconcile')});
await test("explicit pre-migration provider rejection can recover",async()=>{await db.exec("UPDATE comunicacoes_transacionais SET status='failed',send_token=NULL,dispatch_started_at=NULL,lease_until=NULL,requires_reconciliation=false,error_message='Brevo respondeu HTTP 400: invalid template'");assert.equal((await reserve()).state,'reserved')});
await db.close();
console.log(`${passed} outbox concurrency/recovery tests passed`);
