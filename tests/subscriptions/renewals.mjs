import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
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
const instant = "2030-01-15T00:00:00.000Z";
class Clock extends Date {
  static now() {
    return Date.parse(instant);
  }
}
const baseRow = {
  id: "original-row",
  kiwify_subscription_id: "contract",
  email: "fictional@example.test",
  nome_cliente: "Fictional",
  status: "ativa",
  data_expiracao: "2030-01-01T00:00:00.000Z",
  user_id: "confirmed-owner",
  kiwify_customer_id: "original-customer",
  plano: "Anual",
  valor: 97,
  data_inicio: "2029-01-01T00:00:00Z",
};
const payload = () => ({
  webhook_event_type: "subscription_renewed",
  order_status: "paid",
  subscription_id: "contract",
  order_id: "charge-2",
  created_at: "2029-01-01 10:00",
  updated_at: "2030-01-01 10:00",
  Customer: { email: "fictional@example.test" },
  Product: { product_name: "Anual" },
  Subscription: {
    status: "active",
    next_payment: "2030-02-01T00:00:00Z",
    customer_access: {
      has_access: true,
      active_period: true,
      access_until: "2030-02-01T00:00:00Z",
    },
    charges: {
      completed: [
        {
          order_id: "first-charge",
          status: "paid",
          created_at: "2029-01-01T00:00:00Z",
        },
        {
          order_id: "charge-2",
          status: "paid",
          created_at: "2030-01-01T00:00:00Z",
        },
      ],
      future: [{ charge_date: "2030-02-01T00:00:00Z" }],
    },
  },
});
async function environment(rows = [{ ...baseRow }], race = false) {
  const db = {
    assinaturas: structuredClone(rows),
    webhook_logs: [],
    clientes_autorizados: [],
    profiles: [{ id: "confirmed-owner", email: "fictional@example.test" }],
  };
  let handler,
    emails = 0,
    authCalls = 0,
    raced = false;
  const client = {
    rpc: async () => {
      emails++;
      return { data: { state: "sent" }, error: null };
    },
    auth: {
      admin: {
        getUserById: async () => {
          authCalls++;
          return {
            data: {
              user: {
                id: "confirmed-owner",
                email: "fictional@example.test",
                email_confirmed_at: instant,
              },
            },
          };
        },
      },
    },
    from(table) {
      let filters = [],
        op = "select",
        value,
        limit;
      const q = {
        select() {
          return q;
        },
        eq(k, v) {
          filters.push(
            (r) =>
              (k === "payload->>order_id" ? r.payload?.order_id : r[k]) === v,
          );
          return q;
        },
        in(k, values) {
          filters.push((r) => values.includes(r[k]));
          return q;
        },
        is(k, v) {
          return q.eq(k, v);
        },
        limit(n) {
          limit = n;
          return q;
        },
        update(v) {
          op = "update";
          value = v;
          return q;
        },
        insert(v) {
          op = "insert";
          value = v;
          return q;
        },
        upsert(v) {
          op = "upsert";
          value = v;
          return q;
        },
        single: async () => done(true),
        maybeSingle: async () => done(true),
        then(resolve, reject) {
          return Promise.resolve(done(false)).then(resolve, reject);
        },
      };
      function done(single) {
        if (race && op === "update" && table === "assinaturas" && !raced) {
          raced = true;
          db.assinaturas[0].status = "reembolsada";
        }
        let found = db[table].filter((r) => filters.every((f) => f(r)));
        if (op === "update") for (const r of found) Object.assign(r, value);
        if (op === "insert" || op === "upsert") {
          const key =
            table === "webhook_logs" ? "event_key" : table === "assinaturas" ? "kiwify_subscription_id" : "email";
          const exists =
            op === "upsert" && db[table].some((r) => r[key] === value[key]);
          if (!exists) {
            const r = { id: "new-row", user_id: null, ...value };
            db[table].push(r);
            found = [r];
          } else found = [];
        }
        if (limit) found = found.slice(0, limit);
        return {
          data: structuredClone(single ? found[0] || null : found),
          error: null,
        };
      }
      return q;
    },
  };
  new Function("createClient", "Deno", "Date", "fetch", js)(
    () => client,
    {
      serve: (h) => (handler = h),
      env: {
        get: (k) => (k === "KIWIFY_WEBHOOK_TOKEN" ? "test-token" : "fictional"),
      },
    },
    Clock,
    () => {
      throw new Error("Real provider calls prohibited");
    },
  );
  return {
    db,
    invoke: async (body) =>
      handler(
        new Request("https://isolated.test", {
          method: "POST",
          headers: {
            "x-webhook-token": "test-token",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      ),
    get emails() {
      return emails;
    },
    get authCalls() {
      return authCalls;
    },
  };
}
async function expectPending(response) {
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "review_required");
  assert.equal(body.received, true);
  assert.equal(body.access_changed, false);
  assert.equal(body.success, undefined);
}
let passed = 0;
const test = async (n, f) => {
  await f();
  passed++;
  console.log("PASS", n);
};
await test("official top-level subscription_id renews the existing finite term only", async () => {
  const e = await environment();
  assert.equal((await e.invoke(payload())).status, 200);
  assert.deepEqual(e.db.assinaturas, [
    { ...baseRow, data_expiracao: "2030-02-01T00:00:00.000Z" },
  ]);
  assert.equal(e.emails, 0);
  assert.equal(e.authCalls, 0);
  assert.equal(e.db.webhook_logs[0].status, "renewal_recognized");
});
await test("same charge retry is distinct from another renewal and never duplicates purchase or email", async () => {
  const e = await environment();
  await e.invoke(payload());
  assert.equal((await e.invoke(payload())).status, 200);
  assert.equal(e.db.assinaturas.length, 1);
  assert.equal(e.db.webhook_logs.at(-1).status, "renewal_duplicate");
  assert.equal(e.emails, 0);
});
await test("subsequent distinct paid charge extends only to explicit Kiwify access_until", async () => {
  const e = await environment();
  await e.invoke(payload());
  const p = payload();
  p.order_id = "charge-3";
  p.Subscription.charges.completed.push({
    order_id: "charge-3",
    status: "paid",
    created_at: "2030-02-01T00:00:00Z",
  });
  p.Subscription.customer_access.access_until = "2030-03-01T00:00:00Z";
  assert.equal((await e.invoke(p)).status, 200);
  assert.equal(e.db.assinaturas[0].data_expiracao, "2030-03-01T00:00:00.000Z");
});
await test("null historical expiry remains null and never becomes a guessed month/year", async () => {
  const e = await environment([{ ...baseRow, data_expiracao: null }]);
  assert.equal((await e.invoke(payload())).status, 200);
  assert.equal(e.db.assinaturas[0].data_expiracao, null);
});
await test("late older renewal cannot shorten an already later term", async () => {
  const e = await environment([
    { ...baseRow, data_expiracao: "2031-01-01T00:00:00Z" },
  ]);
  assert.equal((await e.invoke(payload())).status, 200);
  assert.equal(e.db.assinaturas[0].data_expiracao, "2031-01-01T00:00:00Z");
});
await test("unique legacy order key is preserved using documented completed charge association", async () => {
  const e = await environment([
    { ...baseRow, kiwify_subscription_id: "first-charge" },
  ]);
  assert.equal((await e.invoke(payload())).status, 200);
  assert.equal(e.db.assinaturas[0].kiwify_subscription_id, "first-charge");
  assert.equal(e.db.assinaturas.length, 1);
});
await test("several legacy rows are not merged, transferred or recreated", async () => {
  const rows = [
    { ...baseRow, kiwify_subscription_id: "first-charge" },
    { ...baseRow, id: "other-row", kiwify_subscription_id: "charge-2" },
  ];
  const e = await environment(rows);
  await expectPending(await e.invoke(payload()));
  assert.deepEqual(e.db.assinaturas, rows);
});
await test("renewal without local contract never creates an additional subscription", async () => {
  const e = await environment([]);
  await expectPending(await e.invoke(payload()));
  assert.equal(e.db.assinaturas.length, 0);
});
for (const status of ["cancelada", "reembolsada", "inativa", "expirada"])
  await test(`${status} record is never reactivated by renewal`, async () => {
    const row = { ...baseRow, status };
    const e = await environment([row]);
    await expectPending(await e.invoke(payload()));
    assert.deepEqual(e.db.assinaturas, [row]);
  });
await test("refund racing with renewal cannot be overwritten", async () => {
  const e = await environment(undefined, true);
  await expectPending(await e.invoke(payload()));
  assert.equal(e.db.assinaturas[0].status, "reembolsada");
  assert.equal(e.db.assinaturas[0].data_expiracao, baseRow.data_expiracao);
});
for (const type of [
  "subscription_canceled",
  "subscription_late",
  "order_refunded",
])
  await test(`${type} plus paid cannot masquerade as purchase approval`, async () => {
    const e = await environment();
    const p = payload();
    p.webhook_event_type = type;
    await expectPending(await e.invoke(p));
    assert.deepEqual(e.db.assinaturas, [baseRow]);
    assert.equal(e.emails, 0);
    assert.equal(e.db.webhook_logs[0].evento, type);
  });
await test("unrecognized explicit event cannot fall back to paid", async () => {
  const e = await environment();
  const p = payload();
  p.webhook_event_type = "new_unconfirmed_event";
  assert.equal((await e.invoke(p)).status, 200);
  assert.equal(e.db.webhook_logs[0].status, "ignored");
  assert.deepEqual(e.db.assinaturas, [baseRow]);
});
await test("conflicting root and nested IDs fail before any write", async () => {
  const e = await environment();
  const p = payload();
  p.Subscription.id = "another-contract";
  assert.equal((await e.invoke(p)).status, 422);
  assert.deepEqual(e.db.assinaturas, [baseRow]);
  assert.equal(e.db.webhook_logs.length, 0);
});
await test("matching root/nested IDs and nested-only compatibility are accepted", async () => {
  for (const nestedOnly of [false, true]) {
    const e = await environment();
    const p = payload();
    p.Subscription.id = "contract";
    if (nestedOnly) delete p.subscription_id;
    assert.equal((await e.invoke(p)).status, 200);
  }
});
for (const missing of ["access_until", "has_access", "active_period"])
  await test(`missing ${missing} requires confirmation, not invented validity`, async () => {
    const e = await environment();
    const p = payload();
    delete p.Subscription.customer_access[missing];
    await expectPending(await e.invoke(p));
    assert.deepEqual(e.db.assinaturas, [baseRow]);
  });
await test("timezone-free access date is not guessed from order timestamps or next_payment", async () => {
  const e = await environment();
  const p = payload();
  p.Subscription.customer_access.access_until = "2030-02-01 00:00";
  await expectPending(await e.invoke(p));
});
await test("charge not paid or not associated with current order cannot grant renewal", async () => {
  const e = await environment();
  const p = payload();
  p.order_id = "unknown-charge";
  await expectPending(await e.invoke(p));
  assert.deepEqual(e.db.assinaturas, [baseRow]);
});
await test("expired historical renewal is not treated as current access", async () => {
  const e = await environment();
  const p = payload();
  p.Subscription.customer_access.access_until = "2030-01-02T00:00:00Z";
  await expectPending(await e.invoke(p));
});
await test("first recurring purchase uses official contract ID and product_name", async () => {
  const e = await environment([]);
  const p = payload();
  p.webhook_event_type = "order_approved";
  assert.equal((await e.invoke(p)).status, 200);
  assert.equal(e.db.assinaturas[0].kiwify_subscription_id, "contract");
  assert.equal(e.db.assinaturas[0].plano, "Anual");
  assert.equal(e.emails, 1);
});
await test("recurring initial purchase without a contract ID does not fall back to charge", async () => {
  const e = await environment([]);
  const p = payload();
  p.webhook_event_type = "order_approved";
  delete p.subscription_id;
  assert.equal((await e.invoke(p)).status, 422);
  assert.equal(e.db.assinaturas.length, 0);
});
await test("invalid calendar date is rejected rather than normalized into access", async () => {
  const e = await environment();
  const p = payload();
  p.Subscription.customer_access.access_until = "2030-02-30T00:00:00Z";
  await expectPending(await e.invoke(p));
  assert.deepEqual(e.db.assinaturas, [baseRow]);
});
console.log(`${passed} Kiwify identity/renewal regression tests passed`);
