import assert from "node:assert/strict";
import ts from "typescript";
import { readFile } from "node:fs/promises";
let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log("PASS", name);
}
async function webhook({
  confirmed = true,
  duplicate = false,
  profileMismatch = false,
  linked = false,
  failLink = false,
  invalidToken = false,
  emailState = "sent",
  providerStatus = 201,
  timeout = false,
  terminal = false,
} = {}) {
  const rows = {
    assinaturas: duplicate
      ? [
          {
            id: "purchase",
            email: "buyer@example.test",
            kiwify_subscription_id: "order",
            status: terminal ? "cancelada" : "ativa",
            user_id: linked ? "original" : null,
          },
        ]
      : [],
    profiles: [{ id: "buyer", email: "buyer@example.test" }],
    clientes_autorizados: [{ id: "client", email: "buyer@example.test" }],
    comunicacoes_transacionais: [],
    webhook_logs: [],
  };
  let updates = 0,
    providerCalls = 0,
    finishes = [];
  const client = {
    rpc: async (name, args) => {
      if (name === "kiwify_event_context") return { data: { pending: false, recurring: false }, error: null };
      if (name === "authorize_kiwify_purchase") return { data: true, error: null };
      if (name === "reserve_access_email")
        return {
          data: {
            state: emailState,
            id: "communication",
            token: "fenced",
            email: "buyer@example.test",
          },
          error: null,
        };
      if (name === "finish_access_email") finishes.push(args);
      return { data: true, error: null };
    },
    auth: {
      admin: {
        getUserById: async () => ({
          data: {
            user: {
              id: "buyer",
              email: profileMismatch
                ? "other@example.test"
                : "buyer@example.test",
              email_confirmed_at: confirmed ? "2026-01-01" : null,
            },
          },
        }),
      },
    },
    from(table) {
      let filters = [],
        op = "select",
        value;
      const q = {
        select() {
          return q;
        },
        in(k, values) { filters.push(r => values.includes(r[k])); return q; },
        eq(k, v) {
          filters.push((r) => r[k] === v);
          return q;
        },
        is(k, v) {
          filters.push((r) => r[k] === v);
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
        maybeSingle: async () => finish(true),
        single: async () => finish(true),
        then(resolve, reject) {
          return Promise.resolve(finish(false)).then(resolve, reject);
        },
      };
      function finish(single) {
        let found = rows[table].filter((r) => filters.every((f) => f(r)));
        if (op === "update") {
          if (table === "assinaturas" && failLink)
            return { data: null, error: { message: "simulated failure" } };
          for (const r of found) {
            Object.assign(r, value);
            if (table === "assinaturas") updates++;
          }
        } else if (op === "insert" || op === "upsert") {
          if (table === "comunicacoes_transacionais")
            return { data: null, error: { code: "23505" } };
          const key =
            table === "webhook_logs" ? "event_key" : table === "clientes_autorizados"
              ? "email"
              : "kiwify_subscription_id";
          if (op === "upsert" && rows[table].some((r) => r[key] === value[key]))
            return { data: null, error: null };
          const r = { id: "purchase", user_id: null, ...value };
          rows[table].push(r);
          found = [r];
        }
        return { data: single ? found[0] || null : found, error: null };
      }
      return q;
    },
  };
  let handler;
  const source = await readFile(
    "supabase/functions/kiwify-webhook/index.ts",
    "utf8",
  );
  const js = ts.transpileModule(source.replace(/^import .*;\n/m, ""), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  new Function("createClient", "Deno", "fetch", js)(
    () => client,
    {
      serve: (h) => (handler = h),
      env: {
        get: (k) => (k === "KIWIFY_WEBHOOK_TOKEN" ? "test-token" : "isolated"),
      },
    },
    async (_url, options) => {
      providerCalls++;
      assert.equal(JSON.parse(options.body).templateId, 5);
      if (timeout) throw new Error("fictional timeout");
      return new Response(JSON.stringify({ messageId: "fictional-receipt" }), {
        status: providerStatus,
      });
    },
  );
  const response = await handler(
    new Request("https://isolated.test/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-token": invalidToken ? "wrong" : "test-token",
      },
      body: JSON.stringify({
        order_status: "paid",
        order_id: "order",
        Customer: { email: "buyer@example.test" },
        Product: { name: "existing-plan" },
      }),
    }),
  );
  return { response, rows, updates, providerCalls, finishes };
}
await test("purchase after confirmed signup links owner", async () => {
  const r = await webhook();
  assert.equal(r.response.status, 200);
  assert.equal(r.rows.assinaturas[0].user_id, "buyer");
});
await test("purchase before confirmation stays unlinked", async () => {
  const r = await webhook({ confirmed: false });
  assert.equal(r.response.status, 200);
  assert.equal(r.rows.assinaturas[0].user_id, null);
});
await test("editable profile email cannot override authoritative identity", async () => {
  const r = await webhook({ profileMismatch: true });
  assert.equal(r.rows.assinaturas[0].user_id, null);
});
await test("duplicate webhook completes verified pending link without duplicate purchase", async () => {
  const r = await webhook({ duplicate: true });
  assert.equal(r.rows.assinaturas.length, 1);
  assert.equal(r.rows.assinaturas[0].user_id, "buyer");
});
await test("duplicate webhook preserves existing owner", async () => {
  const r = await webhook({ duplicate: true, linked: true });
  assert.equal(r.rows.assinaturas[0].user_id, "original");
  assert.equal(r.updates, 0);
});
await test("duplicate does not link unconfirmed buyer", async () => {
  const r = await webhook({ duplicate: true, confirmed: false });
  assert.equal(r.rows.assinaturas[0].user_id, null);
});
await test("link write failure returns retryable error", async () => {
  const r = await webhook({ failLink: true });
  assert.equal(r.response.status, 500);
});
await test("invalid webhook token never creates a purchase", async () => {
  const r = await webhook({ invalidToken: true });
  assert.equal(r.response.status, 401);
  assert.equal(r.rows.assinaturas.length, 0);
});
console.log(
  `${passed} Edge handler tests passed (Auth/API fakes; no external requests)`,
);

async function legacy({ confirmed = false, linked = false } = {}) {
  let handler,
    claims = 0,
    emailFallback = false;
  const client = {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "buyer",
            email: "buyer@example.test",
            email_confirmed_at: confirmed ? "2026-01-01" : null,
          },
        },
        error: null,
      }),
    },
    rpc: async (name) => {
      if (name === "is_admin") return { data: false, error: null };
      claims++;
      if (confirmed) linked = true;
      return { error: null };
    },
    from(table) {
      const q = {
        select() {
          return q;
        },
        eq() {
          return q;
        },
        or(filter) {
          emailFallback = filter.includes("email.eq");
          return q;
        },
        gt() {
          return q;
        },
        order() {
          return q;
        },
        limit() {
          return q;
        },
        maybeSingle: async () => ({
          data:
            table === "assinaturas"
              ? linked
                ? { id: "existing", status: "ativa" }
                : null
              : table === "profiles"
                ? { is_admin: false }
                : table === "soph_access_codes"
                  ? { code: "FICTIONAL-CODE", expires_at: "2027-01-01" }
                  : null,
          error: null,
        }),
      };
      return q;
    },
  };
  const source = await readFile(
    "supabase/functions/generate-soph-token/index.ts",
    "utf8",
  );
  const js = ts.transpileModule(source.replace(/^import .*;\n/gm, ""), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  new Function("createClient", "serve", "Deno", js)(
    () => client,
    (h) => (handler = h),
    { env: { get: () => "isolated" } },
  );
  const response = await handler(
    new Request("https://isolated.test/legacy", {
      headers: { Authorization: "Bearer fictional" },
    }),
  );
  return { response, claims, emailFallback };
}
await test("legacy unconfirmed email-only buyer cannot mint access code", async () => {
  const r = await legacy();
  assert.equal(r.response.status, 403);
  assert.equal(r.claims, 0);
  assert.equal(r.emailFallback, false);
});
await test("legacy pre-existing linked customer keeps code access", async () => {
  const r = await legacy({ linked: true });
  assert.equal(r.response.status, 200);
});
await test("legacy confirmed customer uses guarded claim RPC", async () => {
  const r = await legacy({ confirmed: true, linked: false });
  assert.equal(r.response.status, 200);
  assert.equal(r.claims, 1);
  assert.equal(r.emailFallback, false);
});
console.log(`${passed} total Edge handler tests passed`);
const hookSource = await readFile("src/hooks/useSubscription.ts", "utf8");
const hookJs = ts.transpileModule(
  hookSource
    .replace(/^import .*;\n/gm, "")
    .replace("export function useSubscription", "function useSubscription"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  },
).outputText;
await test("failed purchase recovery does not interrupt existing access checks", async () => {
  let calls = 0;
  const recover = new Function(
    "supabase",
    hookJs + "\nreturn recoverVerifiedPurchase;",
  )({
    rpc: async () => {
      calls++;
      throw new Error("fictional outage");
    },
  });
  await recover();
  assert.equal(calls, 1);
});
console.log(`${passed} total handler/recovery tests passed`);

await test("duplicate webhook retries failed Brevo email with original association", async () => {
  const r = await webhook({ duplicate: true, emailState: "reserved" });
  assert.equal(r.response.status, 200);
  assert.equal(r.providerCalls, 1);
  assert.equal(r.finishes[0].p_success, true);
  assert.equal(r.rows.assinaturas.length, 1);
  assert.equal(r.rows.clientes_autorizados.length, 1);
});
await test("already sent and concurrent busy communications are never resent", async () => {
  for (const emailState of ["sent", "busy"]) {
    const r = await webhook({ duplicate: true, emailState });
    assert.equal(r.providerCalls, 0);
  }
});
await test("Brevo rejection is marked failed and webhook remains retryable", async () => {
  const r = await webhook({
    duplicate: true,
    emailState: "reserved",
    providerStatus: 400,
  });
  assert.equal(r.response.status, 503);
  assert.equal(r.finishes[0].p_success, false);
  assert.equal(r.finishes[0].p_uncertain, false);
});
await test("Brevo network timeout requires receipt reconciliation", async () => {
  const r = await webhook({
    duplicate: true,
    emailState: "reserved",
    timeout: true,
  });
  assert.equal(r.response.status, 503);
  assert.equal(r.finishes[0].p_uncertain, true);
});
await test("ambiguous delivery is not resent", async () => {
  const r = await webhook({ duplicate: true, emailState: "reconcile" });
  assert.equal(r.response.status, 503);
  assert.equal(r.providerCalls, 0);
});
await test("approval after cancellation cannot reactivate a terminal purchase", async () => {
  const r = await webhook({ duplicate: true, terminal: true });
  assert.equal(r.response.status, 200);
  assert.equal((await r.response.json()).status, "review_required");
  assert.equal(r.rows.assinaturas[0].status, "cancelada");
  assert.equal(r.providerCalls, 0);
});
console.log(`${passed} webhook/legacy/recovery tests passed`);
