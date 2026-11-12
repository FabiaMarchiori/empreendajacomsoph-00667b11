import { withDiagnostics } from "./handler-source.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(
  await readFile("tests/subscriptions/fixtures/stage2-live-schema.sql", "utf8"),
);
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
// Existing owner with changed email, unconfirmed owner and ordinary subscribers.
await db.query(
  "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,'changed@example.test',now()),($2,'pending@example.test',NULL),($3,'buyer@example.test',now())",
  [id(1), id(2), id(3)],
);
await db.exec(
  "INSERT INTO profiles SELECT id,email,NULL,NULL,false FROM auth.users",
);
await db.query(
  "INSERT INTO assinaturas(kiwify_subscription_id,email,user_id,status,plano,valor,data_expiracao) VALUES('existing','old@example.test',$1,'ativa','Anual',97,'2035-01-01'),('pending','pending@example.test',NULL,'ativa','Mensal',19,'2035-01-01')",
  [id(1)],
);
const snapshot = async () =>
  (await db.query("SELECT * FROM assinaturas ORDER BY id")).rows;
const untouched = async () =>
  (
    await db.query(
      "SELECT proname,pg_get_functiondef(p.oid) d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname IN ('is_admin','has_role','current_product_access','stage1_current_benefits','has_soph_access','has_erp_access') ORDER BY proname",
    )
  ).rows;
const policies = async () =>
  (
    await db.query(
      "SELECT tablename,policyname,qual,with_check FROM pg_policies ORDER BY tablename,policyname",
    )
  ).rows;
if (process.env.STAGE2_WITH_STAGE1 === "1") {
  await db.exec(
    "CREATE TABLE soph_access_codes(id uuid PRIMARY KEY,user_id uuid,is_active boolean,expires_at timestamptz)",
  );
  await db.exec(
    await readFile("tests/subscriptions/fixtures/stage1-live-erp.sql", "utf8"),
  );
  await db.exec(
    await readFile(
      "supabase/migrations/20261111152724_stage1_plan_benefits.sql",
      "utf8",
    ),
  );
}
const before = await snapshot(),
  functionsBefore = await untouched(),
  policiesBefore = await policies();
const migrations = [
  "20261110110000_verified_claims_only.sql",
  "20261111133107_transactional_email_recovery.sql",
  "20261111141651_durable_webhook_reviews.sql",
  "20261111160309_stage2_kiwify_event_guards.sql",
];
for (const m of migrations)
  await db.exec(await readFile(`supabase/migrations/${m}`, "utf8"));
await db.exec(
  "CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()",
);
let passed = 0;
async function test(n, f) {
  await f();
  passed++;
  console.log("PASS", n);
}
await test("Stage 2 ordered migrations preserve all commercial rows, Stage 1 RPCs, admin functions and unrelated RLS", async () => {
  assert.deepEqual(await snapshot(), before);
  assert.deepEqual(await untouched(), functionsBefore);
  assert.deepEqual(await policies(), policiesBefore);
});
const source = await readFile(
  "supabase/functions/kiwify-webhook/index.ts",
  "utf8",
);
const js = ts.transpileModule(await withDiagnostics(source), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.None,
  },
}).outputText;
let handler,
  providerCalls = 0,
  fault = null;
const providerBodies = [];
function paramQuery(sql, values) {
  return db.query(sql, values).catch((error) => ({ rows: null, error }));
}
const rpc = async (name, args) => {
  if (fault === name)
    return { data: null, error: { message: "fictional database failure" } };
  const names = Object.keys(args || {});
  const vals = names.map((k) => args[k]);
  const r = await paramQuery(
    `SELECT public.${name}(${names.map((k, i) => `${k}=>$${i + 1}`).join(",")}) result`,
    vals,
  );
  return { data: r.rows?.[0]?.result ?? null, error: r.error ?? null };
};
const client = {
  rpc,
  auth: {
    admin: {
      getUserById: async (uid) => ({
        data: {
          user: (await db.query("SELECT * FROM auth.users WHERE id=$1", [uid]))
            .rows[0],
        },
        error: null,
      }),
    },
  },
  from(table) {
    let operation = "select",
      entry,
      filters = [],
      max;
    const q = {
      select() {
        return q;
      },
      eq(k, v) {
        filters.push([k, "=", v]);
        return q;
      },
      is(k, v) {
        filters.push([k, "IS", v]);
        return q;
      },
      in(k, v) {
        filters.push([k, "IN", v]);
        return q;
      },
      limit(n) {
        max = n;
        return q;
      },
      insert(v) {
        operation = "insert";
        entry = v;
        return q;
      },
      upsert(v, options) {
        operation = "upsert";
        entry = v;
        q.conflict = options.onConflict;
        return q;
      },
      update(v) {
        operation = "update";
        entry = v;
        return q;
      },
      single() {
        return run(true);
      },
      maybeSingle() {
        return run(true);
      },
      then(resolve, reject) {
        return run(false).then(resolve, reject);
      },
    };
    async function run(single) {
      const values = [],
        p = (v) => {
          values.push(v);
          return `$${values.length}`;
        };
      const column = (k) =>
        k === "payload->>order_id" ? "payload->>'order_id'" : `"${k}"`;
      let sql;
      if (operation === "insert" || operation === "upsert") {
        const keys = Object.keys(entry);
        sql = `INSERT INTO ${table}(${keys.map(column)}) VALUES(${keys.map((k) => p(entry[k]))})`;
        if (operation === "upsert")
          sql += ` ON CONFLICT(${column(q.conflict)}) DO NOTHING`;
      } else {
        sql =
          operation === "update"
            ? `UPDATE ${table} SET ${Object.keys(entry)
                .map((k) => `${column(k)}=${p(entry[k])}`)
                .join(",")}`
            : `SELECT * FROM ${table}`;
        if (filters.length)
          sql +=
            " WHERE " +
            filters
              .map(([k, op, v]) =>
                op === "IS" && v === null
                  ? `${column(k)} IS NULL`
                  : op === "IN"
                    ? `${column(k)}=ANY(${p(v)})`
                    : `${column(k)}=${p(v)}`,
              )
              .join(" AND ");
      }
      sql +=
        operation === "select" ? (max ? ` LIMIT ${max}` : "") : " RETURNING *";
      const r = await paramQuery(sql, values);
      return {
        data: r.rows
          ? JSON.parse(JSON.stringify(single ? r.rows[0] || null : r.rows))
          : null,
        error: r.error || null,
      };
    }
    return q;
  },
};
new Function("createClient", "Deno", "fetch", js)(
  () => client,
  {
    serve: (h) => (handler = h),
    env: {
      get: (k) =>
        k === "KIWIFY_WEBHOOK_TOKEN" ? "fictional-token" : "isolated",
    },
  },
  async (_url, options) => {
    providerCalls++;
    const body = JSON.parse(options.body);
    providerBodies.push(body);
    assert.equal(body.templateId, 5);
    return new Response(JSON.stringify({ messageId: "fictional-receipt" }), {
      status: 201,
    });
  },
);
const invoke = async (body) => {
  const r = await handler(
    new Request("https://fictional.test", {
      method: "POST",
      headers: {
        "x-webhook-token": "fictional-token",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
  return { http: r.status, body: await r.json() };
};
const purchase = (key, email = "buyer@example.test") => ({
  webhook_event_type: "order_approved",
  order_status: "paid",
  order_id: key,
  Customer: { email, id: "provider-customer", full_name: "Fictional" },
  Product: { product_name: "Anual" },
});
const recurring = (key, type = "subscription_renewed") => ({
  ...purchase(`${key}-second`),
  webhook_event_type: type,
  subscription_id: key,
  Subscription: {
    status: "active",
    customer_access: {
      has_access: true,
      active_period: true,
      access_until: "2035-01-01T00:00:00Z",
    },
    charges: {
      completed: [
        {
          order_id: `${key}-first`,
          status: "paid",
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          order_id: `${key}-second`,
          status: "paid",
          created_at: "2026-02-01T00:00:00Z",
        },
      ],
    },
  },
});
async function seed(
  key,
  {
    status = "ativa",
    email = "buyer@example.test",
    until = "2030-01-01T00:00:00Z",
  } = {},
) {
  return (
    await db.query(
      "INSERT INTO assinaturas(kiwify_subscription_id,kiwify_customer_id,email,nome_cliente,user_id,status,plano,valor,data_inicio,data_expiracao) VALUES($1,'original-customer',$2,'Fictional',$3,$4,'Anual',97,'2026-01-01',$5) RETURNING *",
      [
        key,
        email,
        email === "buyer@example.test" ? id(3) : null,
        status,
        until,
      ],
    )
  ).rows[0];
}
const row = async (key) =>
  (
    await db.query(
      "SELECT * FROM assinaturas WHERE kiwify_subscription_id=$1",
      [key],
    )
  ).rows[0];
const pending = (r) => {
  assert.equal(r.http, 200);
  assert.equal(r.body.status, "review_required");
  assert.equal(r.body.success, undefined);
  assert.equal(r.body.access_changed, false);
};
await test("unconfirmed identity cannot claim, confirmation automatically links only null owners", async () => {
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
    id(2),
  ]);
  assert.equal(
    (await db.query("SELECT claim_subscriptions_for_current_user() n")).rows[0]
      .n,
    0,
  );
  await assert.rejects(
    db.query(
      "UPDATE assinaturas SET user_id=$1 WHERE kiwify_subscription_id='pending'",
      [id(2)],
    ),
    /Confirmed/,
  );
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [
    id(2),
  ]);
  assert.equal((await row("pending")).user_id, id(2));
  assert.deepEqual(
    await row("existing"),
    before.find((r) => r.kiwify_subscription_id === "existing"),
  );
  await assert.rejects(
    db.query(
      "UPDATE assinaturas SET user_id=NULL WHERE kiwify_subscription_id='existing'",
    ),
    /reassigned/,
  );
});
await test("first purchase and retry use one persisted purchase/confirmed owner and one existing Brevo welcome", async () => {
  const p = purchase("first-one");
  assert.equal((await invoke(p)).http, 200);
  const original = await row("first-one");
  assert.equal(original.user_id, id(3));
  assert.equal(providerCalls, 1);
  assert.equal((await invoke(p)).http, 200);
  assert.deepEqual(await row("first-one"), original);
  assert.equal(providerCalls, 1);
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM comunicacoes_transacionais WHERE kiwify_subscription_id='first-one'",
      )
    ).rows[0].n,
    1,
  );
});
await test("purchase before signup links on confirmation, without a second welcome or confirmation flow", async () => {
  const p = purchase("pre-signup", "new@example.test");
  assert.equal((await invoke(p)).http, 200);
  assert.equal((await row("pre-signup")).user_id, null);
  const calls = providerCalls;
  await db.query(
    "INSERT INTO auth.users(id,email) VALUES($1,'new@example.test')",
    [id(4)],
  );
  assert.equal((await row("pre-signup")).user_id, null);
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [
    id(4),
  ]);
  assert.equal((await row("pre-signup")).user_id, id(4));
  assert.equal(providerCalls, calls);
});
await test("confirmed signup retains existing admin creation behavior without changing any prior admin", async () => {
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,'admin@admin.com',now())",
    [id(5)],
  );
  assert.equal(
    (await db.query("SELECT is_admin FROM profiles WHERE id=$1", [id(5)]))
      .rows[0].is_admin,
    true,
  );
  assert.deepEqual(await untouched(), functionsBefore);
});
await test("renewal updates only explicit finite paid period; duplicate does not create/send/link", async () => {
  const original = await seed("renewal");
  const calls = providerCalls;
  const p = recurring("renewal");
  assert.equal((await invoke(p)).http, 200);
  const renewed = await row("renewal");
  assert.deepEqual(renewed, {
    ...original,
    data_expiracao: new Date("2035-01-01T00:00:00Z"),
  });
  assert.equal((await invoke(p)).http, 200);
  assert.deepEqual(await row("renewal"), renewed);
  assert.equal(providerCalls, calls);
});
await test("recurring first approval requires first paid charge; delayed approval cannot recreate missing renewal", async () => {
  const p = recurring("missing", "order_approved");
  pending(await invoke(p));
  assert.equal(await row("missing"), undefined);
  const first = recurring("new-contract", "order_approved");
  first.order_id = "new-contract-first";
  first.Subscription.charges.completed = [
    first.Subscription.charges.completed[0],
  ];
  assert.equal((await invoke(first)).http, 200);
  assert.equal((await row("new-contract")).user_id, id(3));
});
await test("three charge-keyed legacy records stay byte-for-byte intact and go to one durable review", async () => {
  const keys = ["three-first", "three-second", "three-third"];
  const originals = [];
  for (const k of keys) originals.push(await seed(k));
  const p = recurring("three");
  p.Subscription.charges.completed.push({
    order_id: "three-third",
    status: "paid",
    created_at: "2026-03-01T00:00:00Z",
  });
  const a = await invoke(p);
  pending(a);
  pending(await invoke(p));
  for (let i = 0; i < keys.length; i++)
    assert.deepEqual(await row(keys[i]), originals[i]);
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM webhook_logs WHERE event_key IS NOT NULL AND id=$1",
        [a.body.event_id],
      )
    ).rows[0].n,
    1,
  );
});
for (const type of [
  "subscription_canceled",
  "subscription_cancelled",
  "subscription_late",
  "order_refunded",
  "chargeback",
])
  await test(`${type} preserves paid period and blocks a changed approval/renewal until reconciliation`, async () => {
    const key = `lifecycle-${type}`,
      original = await seed(key),
      calls = providerCalls;
    const p = recurring(key, type);
    pending(await invoke(p));
    const approval = recurring(key, "order_approved");
    approval.updated_at = "later-observation";
    pending(await invoke(approval));
    pending(await invoke(recurring(key)));
    assert.deepEqual(await row(key), original);
    assert.equal(providerCalls, calls);
  });
await test("refund arriving before approval remains pending; later approval cannot create a refunded purchase", async () => {
  const p = {
    ...purchase("refund-before"),
    webhook_event_type: "order_refunded",
    order_status: "refunded",
  };
  pending(await invoke(p));
  pending(await invoke(purchase("refund-before")));
  assert.equal(await row("refund-before"), undefined);
});
await test("single purchase refund preserves other active products, owner, customer IDs and paid expiry", async () => {
  const refunded = await seed("single-refund"),
    other = await seed("other-product");
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura,customer_id,produto_id) VALUES('buyer@example.test','ativa','original-customer','single-refund') ON CONFLICT(email) DO UPDATE SET produto_id='single-refund',status_assinatura='ativa'",
  );
  const p = {
    ...purchase("single-refund"),
    webhook_event_type: "order_refunded",
    order_status: "refunded",
  };
  assert.equal((await invoke(p)).http, 200);
  assert.deepEqual(await row("single-refund"), {
    ...refunded,
    status: "reembolsada",
    updated_at: (await row("single-refund")).updated_at,
  });
  assert.deepEqual(await row("other-product"), other);
  assert.equal(
    (
      await db.query(
        "SELECT status_assinatura FROM clientes_autorizados WHERE email='buyer@example.test'",
      )
    ).rows[0].status_assinatura,
    "ativa",
  );
  pending(await invoke(purchase("single-refund")));
  assert.equal((await row("single-refund")).status, "reembolsada");
});
await test("single refund only deactivates the matching legacy source when no other active purchase exists", async () => {
  const original = await seed("only-refund", { email: "only@example.test" });
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura,produto_id) VALUES('only@example.test','ativa','only-refund')",
  );
  const p = {
    ...purchase("only-refund", "only@example.test"),
    webhook_event_type: "order_refunded",
    order_status: "refunded",
  };
  assert.equal((await invoke(p)).http, 200);
  assert.equal(
    (
      await db.query(
        "SELECT status_assinatura FROM clientes_autorizados WHERE email='only@example.test'",
      )
    ).rows[0].status_assinatura,
    "inativa",
  );
  assert.equal((await row("only-refund")).user_id, original.user_id);
  assert.equal(
    (await rpc("authorize_kiwify_purchase", { p_assinatura_id: original.id }))
      .data,
    false,
  );
});
await test("refund for wrong identity cannot affect a real purchase or its legacy authorization", async () => {
  const original = await seed("wrong-refund");
  pending(
    await invoke({
      ...purchase("wrong-refund", "attacker@example.test"),
      webhook_event_type: "order_refunded",
      order_status: "refunded",
    }),
  );
  assert.deepEqual(await row("wrong-refund"), original);
});
await test("known recurring charge without subscription fields still cannot be refunded as a single sale", async () => {
  const original = await seed("historical-second");
  const history = recurring("historical");
  await db.query(
    "INSERT INTO webhook_logs(evento,payload,status) VALUES('subscription_renewed',$1,'success')",
    [history],
  );
  pending(
    await invoke({
      ...purchase("historical-second"),
      webhook_event_type: "order_refunded",
      order_status: "refunded",
    }),
  );
  assert.deepEqual(await row("historical-second"), original);
});
await test("contradictory approval and conflicting charge history never grant access", async () => {
  pending(
    await invoke({ ...purchase("contradictory"), order_status: "refunded" }),
  );
  assert.equal(await row("contradictory"), undefined);
  const original = await seed("conflicting");
  const p = recurring("conflicting");
  p.Subscription.charges.completed.push({
    ...p.Subscription.charges.completed[1],
    status: "refunded",
  });
  pending(await invoke(p));
  assert.deepEqual(await row("conflicting"), original);
});
await test("context and refund storage failures are retryable 5xx, never approval or invented access", async () => {
  fault = "kiwify_event_context";
  const original = await seed("fault");
  assert.equal((await invoke(recurring("fault"))).http, 500);
  assert.deepEqual(await row("fault"), original);
  fault = null;
  fault = "refund_kiwify_single_purchase";
  assert.equal(
    (
      await invoke({
        ...purchase("fault"),
        webhook_event_type: "order_refunded",
        order_status: "refunded",
      })
    ).http,
    500,
  );
  assert.deepEqual(await row("fault"), original);
  fault = null;
});
await test("missing customer and conflicting contract IDs are durably reviewed without access changes", async () => {
  const p = recurring("missing-customer");
  p.Customer = null;
  pending(await invoke(p));
  const q = recurring("conflicting-ids");
  q.Subscription.id = "another-contract";
  pending(await invoke(q));
  assert.equal(await row("missing-customer"), undefined);
  assert.equal(await row("conflicting-ids"), undefined);
});
await test("approval of an expired historical purchase cannot reactivate its legacy source", async () => {
  const original = await seed("expired-approval", {
    email: "expired@example.test",
    until: "2000-01-01",
  });
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura,produto_id) VALUES('expired@example.test','inativa','expired-approval')",
  );
  pending(await invoke(purchase("expired-approval", "expired@example.test")));
  assert.deepEqual(await row("expired-approval"), original);
  assert.equal(
    (
      await db.query(
        "SELECT status_assinatura FROM clientes_autorizados WHERE email='expired@example.test'",
      )
    ).rows[0].status_assinatura,
    "inativa",
  );
});
await test("duplicate approval cannot replace the persisted customer ID or purchase identity", async () => {
  const original = await seed("customer-preservation", {
    email: "original@example.test",
  });
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura,customer_id,produto_id) VALUES('original@example.test','ativa','existing-client','original-product')",
  );
  const p = purchase("customer-preservation", "original@example.test");
  p.Customer.id = "changed-provider-id";
  assert.equal((await invoke(p)).http, 200);
  assert.deepEqual(await row("customer-preservation"), original);
  const c = (
    await db.query(
      "SELECT customer_id,produto_id FROM clientes_autorizados WHERE email='original@example.test'",
    )
  ).rows[0];
  assert.deepEqual(c, {
    customer_id: "existing-client",
    produto_id: "original-product",
  });
});
await test("simultaneous authorize/refund calls serialize on the purchase and finish without reactivation", async () => {
  for (const reverse of [false, true]) {
    const email = `race${reverse}@example.test`,
      original = await seed(`race-${reverse}`, { email });
    await db.query(
      "INSERT INTO clientes_autorizados(email,status_assinatura,produto_id) VALUES($1,'ativa',$2)",
      [email, original.kiwify_subscription_id],
    );
    const authorize = () =>
      rpc("authorize_kiwify_purchase", { p_assinatura_id: original.id });
    const refund = () =>
      rpc("refund_kiwify_single_purchase", {
        p_assinatura_id: original.id,
        p_email: email,
        p_status: "reembolsada",
      });
    const calls = reverse ? [refund, authorize] : [authorize, refund];
    const results = await Promise.all(calls.map((f) => f()));
    assert.ok(results.every((r) => !r.error));
    assert.equal(
      (await row(original.kiwify_subscription_id)).status,
      "reembolsada",
    );
    assert.equal(
      (
        await db.query(
          "SELECT status_assinatura FROM clientes_autorizados WHERE email=$1",
          [email],
        )
      ).rows[0].status_assinatura,
      "inativa",
    );
  }
});
await test("concurrent duplicate renewals keep one purchase and do not create a pending access block", async () => {
  const original = await seed("concurrent-renewal");
  const p = recurring("concurrent-renewal");
  const results = await Promise.all([invoke(p), invoke(p)]);
  assert.ok(results.every((r) => r.http === 200 && r.body.success === true));
  assert.equal(
    (await row("concurrent-renewal")).data_expiracao.toISOString(),
    "2035-01-01T00:00:00.000Z",
  );
  assert.equal(
    (
      await rpc("kiwify_event_context", {
        p_candidate_ids: ["concurrent-renewal"],
      })
    ).data.pending,
    false,
  );
  assert.equal((await row("concurrent-renewal")).user_id, original.user_id);
});
await test("approval never reactivates an unrelated revoked legacy ERP/product source", async () => {
  await seed("new-separate-purchase", { email: "revoked-source@example.test" });
  await db.query(
    "INSERT INTO clientes_autorizados(email,status_assinatura,produto_id,customer_id) VALUES('revoked-source@example.test','inativa','revoked-promotion','original-client')",
  );
  assert.equal(
    (
      await invoke(
        purchase("new-separate-purchase", "revoked-source@example.test"),
      )
    ).http,
    200,
  );
  const c = (
    await db.query(
      "SELECT status_assinatura,produto_id,customer_id FROM clientes_autorizados WHERE email='revoked-source@example.test'",
    )
  ).rows[0];
  assert.deepEqual(c, {
    status_assinatura: "inativa",
    produto_id: "revoked-promotion",
    customer_id: "original-client",
  });
});
await test("ordinary clients cannot inspect reconciliation identities or authorize/refund purchases", async () => {
  await db.exec("SET ROLE authenticated");
  for (const [name, args] of [
    ["kiwify_event_context", { p_candidate_ids: ["existing"] }],
    ["authorize_kiwify_purchase", { p_assinatura_id: id(1) }],
    [
      "refund_kiwify_single_purchase",
      {
        p_assinatura_id: id(1),
        p_email: "old@example.test",
        p_status: "reembolsada",
      },
    ],
  ]) {
    assert.ok(
      (await rpc(name, args)).error,
      "service-only RPC must reject ordinary clients",
    );
  }
  await db.exec("RESET ROLE");
});
await test("Stage 1, admin and unrelated RLS definitions remain unchanged after full lifecycle", async () => {
  assert.deepEqual(await untouched(), functionsBefore);
  assert.deepEqual(await policies(), policiesBefore);
  assert.deepEqual(
    await row("existing"),
    before.find((r) => r.kiwify_subscription_id === "existing"),
  );
  assert.ok(
    providerBodies.every(
      (x) => x.templateId === 5 && x.tags[0] === "acesso_liberado",
    ),
  );
});
await db.close();
console.log(`${passed} Stage 2 actual SQL/webhook integration tests passed`);
