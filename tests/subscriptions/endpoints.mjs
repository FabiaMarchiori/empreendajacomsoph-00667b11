import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
let passed = 0;
const test = async (n, f) => {
  await f();
  passed++;
  console.log("PASS", n);
};
async function invoke(
  slug,
  { authenticated = true, allowed = false, error = false } = {},
) {
  let handler,
    providerCalls = 0,
    rpcArgs;
  const client = {
    auth: {
      getUser: async () => ({
        data: {
          user: authenticated
            ? { id: "self", email: "fictional@example.test" }
            : null,
        },
        error: null,
      }),
    },
    rpc: async (name, args) => {
      rpcArgs = { name, args };
      return {
        data: allowed,
        error: error ? { message: "unavailable" } : null,
      };
    },
    from: () => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      single: async () => ({
        data: { first_name: "Fictional", last_name: "Buyer" },
      }),
    }),
  };
  const source = await readFile(`supabase/functions/${slug}/index.ts`, "utf8");
  const js = ts.transpileModule(source.replace(/^import .*;\n/gm, ""), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  new Function("createClient", "Deno", "fetch", js)(
    () => client,
    { serve: (h) => (handler = h), env: { get: () => "fictional-secret" } },
    async () => {
      providerCalls++;
      return new Response(
        JSON.stringify(
          slug === "erp-entry"
            ? { success: true, entry_url: "https://erp.test/entry" }
            : { message: "fictional stream" },
        ),
        { status: 200 },
      );
    },
  );
  const response = await handler(
    new Request("https://isolated.test", {
      method: "POST",
      headers: {
        Authorization: "Bearer fictional",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "fictional question" }],
        userContext: { hasSubscription: true },
        check_user_id: "other-user",
      }),
    }),
  );
  return { response, providerCalls, rpcArgs };
}
for (const plan of ["Ecossistema", "Anual", "Mensal", "Bolsas"]) {
  await test(`${plan}: Soph endpoint accepts only server authorization`, async () => {
    const r = await invoke("soph-chat", { allowed: true });
    assert.equal(r.response.status, 200);
    assert.equal(r.rpcArgs.name, "has_product_access");
    assert.equal(r.rpcArgs.args.requested_product, "soph");
    assert.equal(r.providerCalls, 1);
  });
  await test(`${plan}: ERP endpoint enforces plan eligibility`, async () => {
    const allowed = plan !== "Bolsas";
    const r = await invoke("erp-entry", { allowed });
    assert.equal(r.response.status, allowed ? 200 : 403);
    assert.equal(r.providerCalls, allowed ? 1 : 0);
    assert.equal(r.rpcArgs.args.check_user_id, "self");
  });
}
for (const kind of ["no subscription", "expired", "cancelled"])
  for (const slug of ["soph-chat", "erp-entry"])
    await test(`${kind}: direct ${slug} request denied despite client claims`, async () => {
      const r = await invoke(slug);
      assert.equal(r.response.status, 403);
      assert.equal(r.providerCalls, 0);
    });
for (const slug of ["soph-chat", "erp-entry"]) {
  await test(`unauthenticated ${slug} denied`, async () => {
    const r = await invoke(slug, { authenticated: false, allowed: true });
    assert.equal(r.response.status, 401);
    assert.equal(r.providerCalls, 0);
  });
  await test(`authorization unavailable ${slug} fails closed`, async () => {
    const r = await invoke(slug, { allowed: true, error: true });
    assert.ok(r.response.status >= 500);
    assert.equal(r.providerCalls, 0);
  });
  await test(`administrator ${slug} uses trusted server grant`, async () => {
    assert.equal((await invoke(slug, { allowed: true })).response.status, 200);
  });
}
await test("individually authorized ERP promotion reaches ERP", async () => {
  assert.equal(
    (await invoke("erp-entry", { allowed: true })).response.status,
    200,
  );
});
console.log(`${passed} direct endpoint authorization tests passed`);
