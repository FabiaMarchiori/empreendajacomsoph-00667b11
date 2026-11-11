import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

// Real PostgreSQL storage/constraints behind a small Supabase-shaped adapter.
// No Supabase URL, production credential, HTTP request or customer data is used.
const db = new PGlite();
await db.exec(`CREATE TABLE public.webhook_logs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),evento text NOT NULL,payload jsonb NOT NULL,
 status text NOT NULL,error_message text,created_at timestamptz NOT NULL DEFAULT now());
 INSERT INTO webhook_logs(evento,payload,status) VALUES('legacy','{}','ignored'),('legacy','{}','ignored');`);
await db.exec(
  await readFile(
    "supabase/migrations/20261111141651_durable_webhook_reviews.sql",
    "utf8",
  ),
);
assert.equal(
  (
    await db.query(
      "SELECT count(*)::int n FROM webhook_logs WHERE event_key IS NULL",
    )
  ).rows[0].n,
  2,
);
const source = await readFile(
  "supabase/functions/kiwify-webhook/index.ts",
  "utf8",
);
const js = ts.transpileModule(source.replace(/^import .*;\n/gm, ""), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.None,
  },
}).outputText;
const subscription = {
  id: "local",
  kiwify_subscription_id: "contract",
  email: "fictional@example.test",
  status: "ativa",
  data_expiracao: "2035-01-01T00:00:00Z",
  user_id: "confirmed-owner",
  plano: "Anual",
  valor: 97,
};
const payload = (type = "subscription_canceled") => ({
  webhook_event_type: type,
  order_status: "paid",
  subscription_id: "contract",
  order_id: "charge",
  updated_at: "2030-01-01 10:00",
  Customer: { email: "fictional@example.test" },
  Subscription: {
    status: "canceled",
    customer_access: {
      has_access: true,
      active_period: true,
      access_until: "2035-01-01T00:00:00Z",
    },
  },
});
function env(options = {}) {
  let handler,
    writes = 0,
    reads = 0,
    businessWrites = 0,
    providerCalls = 0;
  const business = structuredClone(subscription);
  const client = {
    rpc: () => {
      providerCalls++;
      throw new Error("Provider calls prohibited");
    },
    auth: {
      admin: {
        getUserById: () => {
          providerCalls++;
          throw new Error("Auth writes prohibited");
        },
      },
    },
    from(table) {
      let operation = "select",
        entry,
        filters = [];
      const q = {
        select() {
          return q;
        },
        eq(key, value) {
          filters.push([key, value]);
          return q;
        },
        in() {
          return q;
        },
        is() {
          return q;
        },
        limit() {
          return q;
        },
        insert(value) {
          operation = "insert";
          entry = value;
          return q;
        },
        upsert(value) {
          operation = "upsert";
          entry = value;
          return q;
        },
        update() {
          businessWrites++;
          throw new Error("Business writes prohibited");
        },
        single: () => run(true),
        maybeSingle: () => run(true),
        then(resolve, reject) {
          return run(false).then(resolve, reject);
        },
      };
      async function run(single) {
        if (table !== "webhook_logs") {
          if (operation !== "select") {
            businessWrites++;
            throw new Error("Business writes prohibited");
          }
          return {
            data: single
              ? structuredClone(business)
              : [structuredClone(business)],
            error: null,
          };
        }
        if (operation === "select") {
          reads++;
          if (options.failRead || (options.failConflictRead && reads > 1))
            return {
              data: null,
              error: { message: "fictional select failure" },
            };
          if (options.staleInitialRead && reads === 1)
            return { data: null, error: null };
          const allowed = new Set(["event_key", "status", "evento"]);
          assert.ok(filters.every(([key]) => allowed.has(key)));
          const where = filters
            .map(([key], i) => `${key}=$${i + 1}`)
            .join(" AND ");
          const result = await db.query(
            `SELECT id FROM webhook_logs${where ? " WHERE " + where : ""}`,
            filters.map(([, value]) => value),
          );
          return {
            data: single ? result.rows[0] || null : result.rows,
            error: null,
          };
        }
        writes++;
        if (options.beforeWrite) await options.beforeWrite(entry);
        if (options.throwWrites) throw new Error("fictional transport failure");
        if (options.failWrites || options.failStatus === entry.status)
          return {
            data: null,
            error: { message: "fictional returned Supabase error" },
          };
        if (options.emptyWrite) return { data: null, error: null };
        const fields = [
          "evento",
          "payload",
          "status",
          "error_message",
          ...(entry.event_key ? ["event_key"] : []),
        ];
        const values = fields.map((key) =>
          key === "payload" ? JSON.stringify(entry[key]) : entry[key],
        );
        const conflict =
          operation === "upsert" ? " ON CONFLICT(event_key) DO NOTHING" : "";
        try {
          const result = await db.query(
            `INSERT INTO webhook_logs(${fields.join(",")}) VALUES(${fields.map((_, i) => "$" + (i + 1)).join(",")})${conflict} RETURNING id`,
            values,
          );
          return {
            data: single ? result.rows[0] || null : result.rows,
            error: null,
          };
        } catch (error) {
          return { data: null, error: { message: error.message } };
        }
      }
      return q;
    },
  };
  const helpers = new Function(
    "createClient",
    "Deno",
    "fetch",
    js + "\nreturn {reviewEventKey,logWebhook};",
  )(
    () => client,
    {
      serve: (h) => (handler = h),
      env: {
        get: (key) =>
          key === "KIWIFY_WEBHOOK_TOKEN" ? "test-token" : "isolated",
      },
    },
    () => {
      providerCalls++;
      throw new Error("External network prohibited");
    },
  );
  return {
    business,
    helpers,
    invoke: (body) =>
      handler(
        new Request("https://isolated.test", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-webhook-token": "test-token",
          },
          body: JSON.stringify(body),
        }),
      ),
    get counters() {
      return { writes, reads, businessWrites, providerCalls };
    },
  };
}
async function assertReceipt(response) {
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.received, true);
  assert.equal(body.status, "review_required");
  assert.equal(body.access_changed, false);
  assert.equal(body.success, undefined);
  assert.ok(body.event_id);
  return body;
}
const count = async () =>
  (
    await db.query(
      "SELECT count(*)::int n FROM webhook_logs WHERE status='review_required'",
    )
  ).rows[0].n;
let passed = 0;
async function test(name, fn) {
  await db.exec("DELETE FROM webhook_logs");
  await fn();
  passed++;
  console.log("PASS", name);
}
await test("pending event is durable before HTTP 200", async () => {
  let reached, release;
  const blocked = new Promise((resolve) => (release = resolve));
  const gate = new Promise((resolve) => (reached = resolve));
  const e = env({
    beforeWrite: async () => {
      reached();
      await blocked;
    },
  });
  let finished = false;
  const response = e.invoke(payload()).then((r) => {
    finished = true;
    return r;
  });
  await gate;
  assert.equal(finished, false);
  assert.equal(await count(), 0);
  release();
  await assertReceipt(await response);
  assert.equal(await count(), 1);
  assert.deepEqual(e.business, subscription);
});
await test("Supabase returned write error produces controlled 5xx even if diagnostic also fails", async () => {
  const e = env({ failWrites: true });
  const response = await e.invoke(payload());
  assert.equal(response.status, 500);
  assert.equal(await count(), 0);
  assert.ok(e.counters.writes >= 2);
  assert.deepEqual(e.business, subscription);
});
await test("transport exception produces 5xx without an unhandled rejection", async () => {
  const e = env({ throwWrites: true });
  assert.equal((await e.invoke(payload())).status, 500);
  assert.equal(await count(), 0);
});
await test("ordinary logWebhook propagates Supabase error rather than reporting success", async () => {
  const e = env({ failStatus: "ignored" });
  const p = payload("unconfirmed_type");
  assert.equal((await e.invoke(p)).status, 500);
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM webhook_logs WHERE status='error'",
      )
    ).rows[0].n,
    1,
  );
});
await test("repeated event returns the same receipt and one pending record", async () => {
  const e = env();
  const first = await assertReceipt(await e.invoke(payload()));
  const second = await assertReceipt(await e.invoke(payload()));
  assert.equal(second.event_id, first.event_id);
  assert.equal(second.duplicate, true);
  assert.equal(await count(), 1);
  assert.equal(e.counters.businessWrites, 0);
});
await test("JSON object key reordering does not duplicate a pending event", async () => {
  const e = env();
  const p = payload();
  await assertReceipt(await e.invoke(p));
  const reverse = Object.fromEntries(Object.entries(p).reverse());
  reverse.Customer = { ...p.Customer };
  await assertReceipt(await e.invoke(reverse));
  assert.equal(await count(), 1);
});
await test("simultaneous stale reads still yield one durable pending record", async () => {
  const first = env({ staleInitialRead: true }),
    second = env({ staleInitialRead: true });
  const responses = await Promise.all([
    first.invoke(payload()),
    second.invoke(payload()),
  ]);
  const receipts = await Promise.all(responses.map(assertReceipt));
  assert.equal(receipts[0].event_id, receipts[1].event_id);
  assert.equal(await count(), 1);
  assert.ok(receipts.some((r) => r.duplicate));
});
await test("empty successful write without persisted receipt cannot produce 2xx", async () => {
  const e = env({ emptyWrite: true });
  assert.equal((await e.invoke(payload())).status, 500);
  assert.equal(await count(), 0);
});
await test("deduplication conflict must have a readable committed receipt", async () => {
  const first = env();
  await assertReceipt(await first.invoke(payload()));
  const retry = env({ staleInitialRead: true, failConflictRead: true });
  assert.equal((await retry.invoke(payload())).status, 500);
  assert.equal(await count(), 1);
});
for (const type of [
  "subscription_canceled",
  "subscription_late",
  "order_refunded",
  "chargeback",
])
  await test(`${type} is pending, not payment approval or revocation`, async () => {
    const e = env();
    await assertReceipt(await e.invoke(payload(type)));
    assert.deepEqual(e.business, subscription);
    assert.equal(e.counters.businessWrites, 0);
    assert.equal(e.counters.providerCalls, 0);
    const row = (await db.query("SELECT * FROM webhook_logs")).rows[0];
    assert.equal(row.evento, type);
    assert.equal(row.payload.order_status, "paid");
    assert.equal(row.status, "review_required");
  });
await test("contract/order/event type and provider snapshot distinguish separate observations", async () => {
  const e = env();
  const original = payload();
  await assertReceipt(await e.invoke(original));
  for (const p of [
    { ...original, order_id: "next-charge" },
    { ...original, subscription_id: "other-contract" },
    { ...original, webhook_event_type: "subscription_late" },
    { ...original, updated_at: "2030-01-02 10:00" },
  ])
    await assertReceipt(await e.invoke(p));
  assert.equal(await count(), 5);
});
await test("previously pending approval remains pending after local state changes", async () => {
  const e = env();
  e.business.status = "cancelada";
  const p = payload("order_approved");
  await assertReceipt(await e.invoke(p));
  e.business.status = "ativa";
  const receipt = await assertReceipt(await e.invoke(p));
  assert.equal(receipt.duplicate, true);
  assert.equal(e.counters.businessWrites, 0);
  assert.equal(e.counters.providerCalls, 0);
  assert.equal(e.business.data_expiracao, subscription.data_expiracao);
});
await test("pending receipt cannot be relabelled as recognized payment in storage", async () => {
  const e = env();
  await assertReceipt(await e.invoke(payload()));
  await assert.rejects(
    db.exec(
      "UPDATE webhook_logs SET status='renewal_recognized' WHERE event_key IS NOT NULL",
    ),
    /webhook_review_event_status/,
  );
});
await test("pending read failure fails closed before business processing", async () => {
  const e = env({ failRead: true });
  assert.equal((await e.invoke(payload("order_approved"))).status, 500);
  assert.equal(e.counters.businessWrites, 0);
  assert.equal(e.counters.providerCalls, 0);
});
await test("storage recovery allows a later retry to receive its durable receipt", async () => {
  const failing = env({ failWrites: true });
  assert.equal((await failing.invoke(payload())).status, 500);
  const healthy = env();
  await assertReceipt(await healthy.invoke(payload()));
  assert.equal(await count(), 1);
});
await db.close();
console.log(`${passed} durable review receipt/storage tests passed`);
