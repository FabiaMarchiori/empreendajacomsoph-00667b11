import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";
const ORIGIN = "https://app.empreendajacomsoph.com.br";
const id = "00000000-0000-0000-0000-000000000001";
const secret = "SECRET_ERP_SENTINEL_NEVER_LOG";
const personal = "fictional-private@example.test";
const dangerous = `${personal} ${secret} Bearer SECRET_JWT_SENTINEL`;
const fixed = "2030-01-01T00:00:00.000Z";
class Clock extends Date {
  constructor(v) {
    super(v === undefined ? fixed : v);
  }
  static now() {
    return Date.parse(fixed);
  }
}
let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log("PASS", name);
}
function environment(slug, options = {}) {
  const user = {
    id,
    email: personal,
    email_confirmed_at: options.unconfirmed ? null : fixed,
  };
  const db = {
    assinaturas: structuredClone(options.rows || []),
    profiles: [
      { id, email: personal, first_name: "Private", last_name: "Person" },
    ],
    clientes_autorizados: [],
    comunicacoes_transacionais: [],
    webhook_logs: [],
    soph_access_codes: structuredClone(options.codes || []),
  };
  const calls = [],
    logs = [],
    upstream = [];
  let handler,
    counter = 0;
  const client = {
    auth: {
      getUser: async () => {
        if (options.authDelay)
          await new Promise((r) => setTimeout(r, options.authDelay));
        if (options.throwAuth) throw new Error(dangerous);
        return {
          data: { user: options.unauthenticated ? null : user },
          error: options.unauthenticated ? { message: dangerous } : null,
        };
      },
      admin: { getUserById: async () => ({ data: { user }, error: null }) },
    },
    rpc: async (name, args) => {
      calls.push({ rpc: name, args });
      return {
        data: options.access !== false,
        error: options.accessError
          ? { code: "PGRST500", message: dangerous }
          : null,
      };
    },
    from(table) {
      let op = "select",
        value,
        filters = [],
        limit;
      const q = {
        select() {
          return q;
        },
        eq(k, v) {
          filters.push([k, v]);
          return q;
        },
        is(k, v) {
          filters.push([k, v]);
          return q;
        },
        or() {
          return q;
        },
        gt() {
          return q;
        },
        order() {
          return q;
        },
        limit(n) {
          limit = n;
          return q;
        },
        maybeSingle: async () => run(true),
        single: async () => run(true),
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
        update(v) {
          op = "update";
          value = v;
          return q;
        },
        then(a, b) {
          return Promise.resolve(run(false)).then(a, b);
        },
      };
      function run(single) {
        calls.push({
          table,
          op,
          value: structuredClone(value),
          filters: structuredClone(filters),
        });
        if (options.queryError && table === "assinaturas")
          return { data: null, error: { code: "23505", message: dangerous } };
        let found = db[table].filter((r) =>
          filters.every(([k, v]) => r[k] === v),
        );
        if (op === "update") found.forEach((r) => Object.assign(r, value));
        if (op === "insert" || op === "upsert") {
          if (
            table === "comunicacoes_transacionais" &&
            db[table].some(
              (r) => r.kiwify_subscription_id === value.kiwify_subscription_id,
            )
          )
            return { data: null, error: { code: "23505" } };
          let existing =
            op === "upsert" &&
            db[table].find(
              (r) => r.kiwify_subscription_id === value.kiwify_subscription_id,
            );
          if (existing) {
            Object.assign(existing, value);
            found = [existing];
          } else {
            const r = {
              id: `fictional-row-${++counter}`,
              user_id: null,
              ...value,
            };
            db[table].push(r);
            found = [r];
          }
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
  const capture = {
    log: (...args) => logs.push(args),
    warn: (...args) => logs.push(args),
    error: (...args) => logs.push(args),
  };
  const deno = {
    serve: (h) => (handler = h),
    env: {
      get: (k) =>
        ({
          SUPABASE_URL: "https://fictional.test",
          SUPABASE_ANON_KEY: "fixture-anon",
          SUPABASE_SERVICE_ROLE_KEY: "fixture-service",
          KIWIFY_WEBHOOK_TOKEN: "fixture-webhook",
          ECOSYSTEM_SHARED_SECRET: secret,
          LOVABLE_API_KEY: "fixture-ai",
          BREVO_API_KEY: "fixture-brevo",
          ...options.env,
        })[k],
    },
  };
  const fetcher = async (url, init) => {
    upstream.push({ url, init });
    if (options.throwUpstream) throw new Error(dangerous);
    if (String(url).includes("ai.gateway"))
      return new Response(
        options.upstreamStatus
          ? JSON.stringify({ message: dangerous, code: dangerous })
          : "data: [DONE]\n\n",
        { status: options.upstreamStatus || 200 },
      );
    if (String(url).includes("ecosystem-receive-user"))
      return new Response(
        JSON.stringify(
          options.upstreamStatus
            ? { error: options.upstreamCode || dangerous, message: dangerous }
            : {
                is_new_user: false,
                erp_user_id: "erp-fixture",
                entry_url: "https://erp.example.test/?token=PRIVATE_SSO",
                email: personal,
              },
        ),
        { status: options.upstreamStatus || 200 },
      );
    if (String(url).includes("api.brevo.com"))
      return new Response(
        JSON.stringify(
          options.upstreamStatus
            ? { message: dangerous }
            : { messageId: "fictional-receipt" },
        ),
        { status: options.upstreamStatus || 201 },
      );
    throw new Error("External calls prohibited");
  };
  const cache = new Map();
  function load(file, override) {
    const module = { exports: {} };
    cache.set(file, module);
    const source = override ?? readFileSync(file, "utf8");
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const require = (name) => {
      if (name.startsWith("https://deno.land/"))
        return { serve: (h) => (handler = h) };
      if (name.startsWith("https://esm.sh/"))
        return { createClient: () => client };
      const path = resolve(dirname(file), name);
      if (cache.has(path)) return cache.get(path).exports;
      return load(path);
    };
    new Function(
      "require",
      "module",
      "exports",
      "Deno",
      "fetch",
      "console",
      "Date",
      code,
    )(require, module, module.exports, deno, fetcher, capture, Clock);
    return module.exports;
  }
  const file = resolve(`supabase/functions/${slug}/index.ts`);
  const baseline = options.baseline
    ? execFileSync(
        "git",
        ["show", `4fdd39f:supabase/functions/${slug}/index.ts`],
        { encoding: "utf8" },
      )
    : undefined;
  const exports = load(file, baseline);
  return {
    db,
    calls,
    logs,
    upstream,
    exports,
    load,
    user,
    invoke: async (
      body = { messages: [{ role: "user", content: "Teste fictício" }] },
      {
        origin = ORIGIN,
        method = "POST",
        token = "fixture-token",
        headers = {},
        raw,
      } = {},
    ) => {
      return handler(
        new Request("https://fictional.test", {
          method,
          headers: {
            Origin: origin,
            Authorization: `Bearer ${token}`,
            "x-webhook-token": "fixture-webhook",
            "Content-Type": "application/json",
            ...headers,
          },
          ...(method === "POST"
            ? { body: raw === undefined ? JSON.stringify(body) : raw }
            : {}),
        }),
      );
    },
  };
}
const validOrigins = [
  ORIGIN,
  "https://appempreendajacomsoph.netlify.app",
  "https://deploy-preview-7--appempreendajacomsoph.netlify.app",
  "https://project.lovable.app",
  "https://project.lovableproject.com",
  "https://project.lovableproject-dev.com",
  "https://project.gpt-eng.com",
  "http://localhost:8080",
  "http://127.0.0.1:4179",
];
for (const slug of ["soph-chat", "erp-entry", "lookup-subscription"]) {
  for (const origin of validOrigins)
    await test(`${slug}: authorized preflight ${origin}`, async () => {
      const e = environment(slug);
      const r = await e.invoke({}, { origin, method: "OPTIONS" });
      assert.equal(r.status, 200);
      assert.equal(r.headers.get("access-control-allow-origin"), origin);
      assert.equal(r.headers.get("vary"), "Origin");
      assert.match(
        r.headers.get("access-control-allow-headers"),
        /x-supabase-client-platform/,
      );
      assert.equal(e.calls.length, 0);
      assert.equal(e.upstream.length, 0);
    });
  for (const origin of [
    "https://attacker.example",
    "https://app.empreendajacomsoph.com.br.attacker.test",
    "https://deploy-preview-4--other-site.netlify.app",
  ])
    await test(`${slug}: never reflects unrelated origin`, async () => {
      const r = await environment(slug).invoke(
        {},
        { origin, method: "OPTIONS" },
      );
      assert.equal(r.headers.get("access-control-allow-origin"), null);
    });
  await test(`${slug}: invalid session stays unauthorized`, async () => {
    const e = environment(slug, { unauthenticated: true });
    const r = await e.invoke();
    assert.equal(r.status, 401);
    assert.equal(e.upstream.length, 0);
    assert.ok(!JSON.stringify(e.logs).includes(personal));
  });
  await test(`${slug}: method validation requires no DB operation`, async () => {
    const e = environment(slug);
    assert.equal((await e.invoke({}, { method: "GET" })).status, 405);
    assert.equal(e.calls.length, 0);
  });
  await test(`${slug}: exceptions expose neither message nor tokens`, async () => {
    const e = environment(slug, { throwAuth: true });
    const r = await e.invoke();
    assert.equal(r.status, 500);
    assert.ok(!JSON.stringify(e.logs).includes(dangerous));
    assert.ok(!(await r.text()).includes(personal));
  });
}
await test("lookup: concurrent origins do not share mutable CORS headers", async () => {
  const e = environment("lookup-subscription", { authDelay: 5 });
  const origins = [ORIGIN, validOrigins[2]];
  const responses = await Promise.all(
    origins.map((origin) => e.invoke({}, { origin })),
  );
  for (let i = 0; i < responses.length; i++)
    assert.equal(
      responses[i].headers.get("access-control-allow-origin"),
      origins[i],
    );
});
await test("lookup: verified owner only, client email ignored, no writes", async () => {
  const e = environment("lookup-subscription", {
    rows: [
      {
        id: "own",
        user_id: id,
        email: personal,
        status: "ativa",
        plano: "Anual",
      },
    ],
  });
  const r = await e.invoke({ email: "victim@example.test" });
  assert.deepEqual(await r.json(), { plano: "Anual" });
  assert.ok(e.calls.every((c) => !c.op || c.op === "select"));
  assert.ok(!JSON.stringify(e.calls).includes("victim@example.test"));
});
await test("lookup: unconfirmed account remains blocked", async () => {
  assert.equal(
    (await environment("lookup-subscription", { unconfirmed: true }).invoke())
      .status,
    401,
  );
});
await test("lookup: safe query error preserves technical DB code", async () => {
  const e = environment("lookup-subscription", { queryError: true });
  assert.equal((await e.invoke()).status, 500);
  const s = JSON.stringify(e.logs);
  assert.ok(s.includes("23505"));
  assert.ok(!s.includes(personal));
});
await test("ERP: authorized user keeps complete SSO response and original RPC", async () => {
  const e = environment("erp-entry");
  const r = await e.invoke();
  assert.equal(r.status, 200);
  assert.equal(
    (await r.json()).entry_url,
    "https://erp.example.test/?token=PRIVATE_SSO",
  );
  assert.deepEqual(
    e.calls.find((c) => c.rpc),
    { rpc: "has_erp_access", args: { check_user_id: id } },
  );
  assert.equal(e.upstream[0].init.headers["x-ecosystem-secret"], secret);
  const logs = JSON.stringify(e.logs);
  for (const forbidden of [
    secret,
    secret.slice(0, 4),
    personal,
    "PRIVATE_SSO",
    "Private Person",
  ])
    assert.ok(!logs.includes(forbidden));
  assert.ok(logs.includes(id));
});
await test("ERP: unauthorized product never calls external ERP", async () => {
  const e = environment("erp-entry", { access: false });
  assert.equal((await e.invoke()).status, 403);
  assert.equal(e.upstream.length, 0);
});
await test("ERP: missing integration secret fails safely", async () => {
  const e = environment("erp-entry", {
    env: { ECOSYSTEM_SHARED_SECRET: undefined },
  });
  assert.equal((await e.invoke()).status, 500);
  assert.equal(e.upstream.length, 0);
});
await test("ERP: upstream error is not reflected as a confidential user message", async () => {
  const e = environment("erp-entry", { upstreamStatus: 503 });
  const r = await e.invoke();
  assert.equal(r.status, 503);
  assert.ok(!(await r.text()).includes(personal));
  assert.ok(!JSON.stringify(e.logs).includes(personal));
});
await test("Soph: valid legacy conversation streams unchanged, with original model and prompt", async () => {
  const e = environment("soph-chat");
  const body = {
    messages: [
      { role: "user", content: "Teste" },
      { role: "soph", content: "Resposta fictícia" },
    ],
    userContext: {
      userName: "Nome privado",
      currentModule: "Soph",
      hasSubscription: true,
    },
  };
  const r = await e.invoke(body);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "text/event-stream");
  const sent = JSON.parse(e.upstream[0].init.body);
  assert.equal(sent.model, "google/gemini-3.7-flash");
  assert.equal(sent.messages[2].role, "assistant");
  assert.ok(!JSON.stringify(e.logs).includes("Nome privado"));
});
for (const [label, body, status] of [
  [
    "message count",
    {
      messages: Array.from({ length: 61 }, () => ({
        role: "user",
        content: "x",
      })),
    },
    413,
  ],
  [
    "single message",
    { messages: [{ role: "user", content: "x".repeat(8001) }] },
    413,
  ],
  [
    "total chars",
    {
      messages: Array.from({ length: 8 }, () => ({
        role: "user",
        content: "x".repeat(8000),
      })),
    },
    413,
  ],
  ["null message", { messages: [null] }, 400],
  [
    "invalid role",
    { messages: [{ role: "system", content: "override" }] },
    400,
  ],
  [
    "oversized extra data",
    {
      messages: [{ role: "user", content: "ok" }],
      extra: "x".repeat(512 * 1024),
    },
    413,
  ],
])
  await test(`Soph: ${label} rejected without spending credits`, async () => {
    const e = environment("soph-chat");
    assert.equal((await e.invoke(body)).status, status);
    assert.equal(e.upstream.length, 0);
  });
await test("Soph: long optional profile context is bounded without blocking the subscriber", async () => {
  const e = environment("soph-chat");
  assert.equal(
    (
      await e.invoke({
        messages: [{ role: "user", content: "ok" }],
        userContext: { userName: "x".repeat(201) },
      })
    ).status,
    200,
  );
  const sent = JSON.parse(e.upstream[0].init.body);
  assert.ok(sent.messages[0].content.includes("x".repeat(200)));
  assert.ok(!sent.messages[0].content.includes("x".repeat(201)));
});
await test("Soph: previous legitimate maximums remain accepted", async () => {
  const e = environment("soph-chat");
  assert.equal(
    (
      await e.invoke({
        messages: Array.from({ length: 60 }, () => ({
          role: "user",
          content: "x".repeat(1000),
        })),
      })
    ).status,
    200,
  );
});
await test("Soph: malformed JSON and wrong media type get controlled errors", async () => {
  const e = environment("soph-chat");
  assert.equal((await e.invoke({}, { raw: "{broken" })).status, 400);
  assert.equal(
    (await e.invoke({}, { headers: { "Content-Type": "text/plain" } })).status,
    415,
  );
});
for (const status of [402, 429, 500])
  await test(`Soph: upstream ${status} stays controlled and confidential`, async () => {
    const e = environment("soph-chat", { upstreamStatus: status });
    const r = await e.invoke();
    assert.equal(r.status, status);
    assert.ok(!(await r.text()).includes(personal));
    assert.ok(!JSON.stringify(e.logs).includes(secret));
  });
const payment = (event = "paid") => ({
  order_status: event,
  order_id: "fictional-order",
  Subscription: {
    id: "fictional-contract",
    status: "active",
    customer_access: {
      has_access: true,
      active_period: true,
      access_until: "2031-01-01T00:00:00Z",
    },
    charges: {
      completed: [
        {
          order_id: "fictional-order",
          status: "paid",
          created_at: "2030-01-01T00:00:00Z",
          card_last_digits: "1234",
        },
      ],
    },
  },
  Customer: {
    id: "fictional-customer",
    email: personal,
    full_name: "Private Person",
    CPF: "99999999999",
    mobile: "11999999999",
  },
  Product: { id: "fictional-product", name: "Ecossistema" },
  access_url: `https://login.example.test/?token=${secret}`,
  token: secret,
});
const business = (e) => ({
  subscriptions: e.db.assinaturas,
  clients: e.db.clientes_autorizados,
  emails: e.upstream
    .filter((x) => String(x.url).includes("brevo"))
    .map((x) => JSON.parse(x.init.body)),
});
for (const scenario of [
  "paid",
  "refunded",
  "chargeback",
  "subscription_cancelled",
  "ignored",
])
  await test(`Kiwify: ${scenario} business effects match current Lovable baseline`, async () => {
    const row = {
      id: "old",
      kiwify_subscription_id: "fictional-contract",
      user_id: id,
      email: personal,
      status: "ativa",
    };
    const options = scenario === "paid" ? {} : { rows: [row] };
    const before = environment("kiwify-webhook", {
        ...options,
        baseline: true,
      }),
      after = environment("kiwify-webhook", options);
    const body = payment(scenario);
    const a = await before.invoke(body),
      b = await after.invoke(body);
    assert.equal(b.status, a.status);
    assert.deepEqual(await b.json(), await a.json());
    assert.deepEqual(business(after), business(before));
    const logs = JSON.stringify(after.logs),
      audits = JSON.stringify(after.db.webhook_logs);
    for (const word of [
      personal,
      "Private Person",
      "99999999999",
      "11999999999",
      secret,
      "card_last_digits",
    ]) {
      assert.ok(!logs.includes(word));
      assert.ok(!audits.includes(word));
    }
    assert.ok(audits.includes("fictional-contract"));
    assert.ok(audits.includes("fictional-order"));
  });
await test("Kiwify: duplicate purchase/email handling is preserved without new restrictions", async () => {
  const e = environment("kiwify-webhook");
  await e.invoke(payment());
  await e.invoke(payment());
  assert.equal(e.db.assinaturas.length, 1);
  assert.equal(e.upstream.length, 1);
  assert.equal(e.db.webhook_logs.at(-1).status, "duplicate");
});
await test("Kiwify: unconfirmed profile remains unlinked, unchanged from deployed behavior", async () => {
  const e = environment("kiwify-webhook", { unconfirmed: true });
  await e.invoke(payment());
  assert.equal(e.db.assinaturas[0].user_id, null);
});
await test("Kiwify: server-to-server preflight keeps wildcard CORS", async () => {
  const e = environment("kiwify-webhook");
  const r = await e.invoke(
    {},
    { method: "OPTIONS", origin: "https://kiwify.example.test" },
  );
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
  assert.equal(r.status, 200);
});
await test("Kiwify: invalid token never mutates purchases or reveals the token", async () => {
  const e = environment("kiwify-webhook");
  const r = await e.invoke(payment(), {
    headers: { "x-webhook-token": secret },
  });
  assert.equal(r.status, 401);
  assert.equal(e.db.assinaturas.length, 0);
  assert.ok(!JSON.stringify(e.logs).includes(secret));
});
await test("Kiwify: communication failure keeps template 5/status and removes provider body from diagnostics", async () => {
  const e = environment("kiwify-webhook", { upstreamStatus: 400 });
  assert.equal((await e.invoke(payment())).status, 200);
  assert.equal(JSON.parse(e.upstream[0].init.body).templateId, 5);
  assert.equal(e.db.comunicacoes_transacionais[0].status, "failed");
  assert.ok(!JSON.stringify(e.db.comunicacoes_transacionais).includes(secret));
});
await test("Legacy code endpoint returns existing access code without printing it", async () => {
  const token = "PRIVATE_ACCESS_CODE_FIXTURE";
  const e = environment("generate-soph-token", {
    rows: [{ id: "paid", status: "ativa", user_id: id, email: personal }],
    codes: [
      {
        id: "code",
        user_id: id,
        code: token,
        is_active: true,
        expires_at: "2035-01-01T00:00:00Z",
      },
    ],
  });
  const r = await e.invoke();
  assert.equal(r.status, 200);
  assert.equal((await r.json()).token, token);
  assert.ok(!JSON.stringify(e.logs).includes(token));
});
await test("Legacy code endpoint generates code with unchanged storage/response and no credential logs", async () => {
  const e = environment("generate-soph-token", {
    rows: [{ id: "paid", status: "ativa", user_id: id, email: personal }],
  });
  const r = await e.invoke();
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.match(body.token, /^SOPH-/);
  assert.equal(e.db.soph_access_codes[0].code, body.token);
  assert.ok(!JSON.stringify(e.logs).includes(body.token));
});
await test("ERP: recognized error codes retain their existing friendly frontend mapping", async () => {
  const e = environment("erp-entry", {
    upstreamStatus: 403,
    upstreamCode: "NO_ACCESS",
  });
  const r = await e.invoke();
  assert.equal(r.status, 403);
  const body = await r.json();
  assert.equal(body.error, "NO_ACCESS");
  assert.ok(!JSON.stringify(body).includes(personal));
});
console.log(`${passed} final security handler/regression tests passed`);
