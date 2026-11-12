import { test, expect, type Page } from "@playwright/test";
const user = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "security-fixture@example.test",
  aud: "authenticated",
  role: "authenticated",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { first_name: "Teste" },
  created_at: "2026-01-01T00:00:00Z",
};
const part = Buffer.from(
  JSON.stringify({
    sub: user.id,
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
  }),
).toString("base64url");
const session = {
  access_token: `eyJhbGciOiJIUzI1NiJ9.${part}.fixture`,
  refresh_token: "PRIVATE_RESET_FIXTURE",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user,
};
async function signedIn(page: Page) {
  await page.addInitScript(
    (s) =>
      localStorage.setItem(
        "sb-ospnuclymrxjoqwyolfn-auth-token",
        JSON.stringify(s),
      ),
    session,
  );
}
async function mockServices(page: Page, origin: string) {
  const logs: string[] = [],
    calls: { path: string; body: Record<string, unknown> | null }[] = [];
  page.on("console", (m) => logs.push(m.text()));
  await page.route("**/*", async (route) => {
    const r = route.request(),
      url = new URL(r.url());
    if (url.origin === origin) {
      if (process.env.SECURITY_BASE_URL)
        return route.fulfill({ response: await route.fetch() });
      return route.continue();
    }
    if (!url.hostname.endsWith(".supabase.co")) return route.abort();
    let requestBody: Record<string, unknown> | null = null;
    try {
      requestBody = r.postDataJSON();
    } catch {
      /* GET */
    }
    calls.push({ path: url.pathname, body: requestBody });
    if (url.pathname.endsWith("/soph-chat"))
      return route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: 'data: {"choices":[{"delta":{"content":"Resposta fictícia da Soph para o teste."}}]}\n\ndata: [DONE]\n\n',
      });
    let body: unknown = [];
    if (url.pathname.includes("/auth/v1/token")) body = session;
    else if (url.pathname.includes("/auth/v1/recover")) body = {};
    else if (url.pathname.includes("/auth/")) body = user;
    else if (url.pathname.includes("/rpc/"))
      body = url.pathname.endsWith("claim_subscriptions_for_current_user")
        ? 0
        : !url.pathname.endsWith("is_admin");
    else if (url.pathname.endsWith("/erp-entry"))
      body = {
        success: true,
        is_new_user: false,
        erp_user_id: "fake-erp-id",
        entry_url: "https://erp.example.test/sso?ticket=PRIVATE_ERP_TICKET",
      };
    else if (url.pathname.endsWith("/lookup-subscription"))
      body = { plano: "bolsas_1999" };
    else if (url.pathname.includes("/assinaturas"))
      body = [
        {
          id: "fake-purchase",
          user_id: user.id,
          email: user.email,
          status: "ativa",
          plano: "Anual",
          data_expiracao: "2035-01-01T00:00:00Z",
        },
      ];
    else if (url.pathname.includes("/profiles"))
      body = r.headers().accept?.includes("object")
        ? {
            id: user.id,
            email: user.email,
            first_name: "Teste",
            is_admin: false,
          }
        : [
            {
              id: user.id,
              email: user.email,
              first_name: "Teste",
              is_admin: false,
            },
          ];
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  return { logs, calls };
}
test.afterEach(async ({ page }) => page.unrouteAll({ behavior: "wait" }));
test("login keeps existing Auth flow and loads the subscribed app", async ({
  page,
  baseURL,
}) => {
  const e = await mockServices(page, new URL(baseURL!).origin);
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(user.email);
  await page.getByPlaceholder("••••••••").fill("FICTIONAL_PASSWORD");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(new RegExp("/$"));
  await expect(page.getByRole("main")).toBeVisible();
  expect(
    e.calls.some(
      (c) => c.path.includes("/auth/v1/token") && c.body?.email === user.email,
    ),
  ).toBe(true);
  expect(e.logs.join("\n")).not.toContain("FICTIONAL_PASSWORD");
});
test("Soph still streams an answer with simulated provider and no content logs", async ({
  page,
  baseURL,
}) => {
  const e = await mockServices(page, new URL(baseURL!).origin);
  await signedIn(page);
  await page.goto("/soph");
  await page
    .getByPlaceholder("Escreva sua dúvida...")
    .fill("Pergunta fictícia de teste");
  await page.getByPlaceholder("Escreva sua dúvida...").press("Enter");
  await expect(
    page.getByText("Resposta fictícia da Soph para o teste.", { exact: true }),
  ).toBeVisible();
  expect(e.calls.some((c) => c.path.endsWith("/soph-chat"))).toBe(true);
  expect(e.logs.join("\n")).not.toContain("Pergunta fictícia de teste");
});
test("ERP entry preserves its URL behavior without logging the SSO ticket", async ({
  page,
  baseURL,
}) => {
  const e = await mockServices(page, new URL(baseURL!).origin);
  await signedIn(page);
  await page.addInitScript(() => {
    const w = window as Window & { securityOpened?: string[] };
    w.securityOpened = [];
    window.open = (url) => {
      w.securityOpened?.push(String(url));
      return null;
    };
  });
  await page.goto("/gestao");
  await page.getByRole("button", { name: "Acessar Sistema Completo" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { securityOpened?: string[] })
            .securityOpened?.[0],
      ),
    )
    .toBe("https://erp.example.test/sso?ticket=PRIVATE_ERP_TICKET");
  expect(e.logs.join("\n")).not.toContain("PRIVATE_ERP_TICKET");
  expect(e.calls.some((c) => c.path.endsWith("/erp-entry"))).toBe(true);
});
test("subscription lookup is authenticated and ignores URL email in the existing thank-you page", async ({
  page,
  baseURL,
}) => {
  const e = await mockServices(page, new URL(baseURL!).origin);
  await signedIn(page);
  await page.goto("/obrigado?email=another-fixture@example.test");
  await expect
    .poll(
      () =>
        e.calls.filter((c) => c.path.endsWith("/lookup-subscription")).length,
    )
    .toBeGreaterThan(0);
  expect(
    e.calls.find((c) => c.path.endsWith("/lookup-subscription"))?.body,
  ).toEqual({});
});
test("password recovery sends the same official redirect without logging email", async ({
  page,
  baseURL,
}) => {
  const e = await mockServices(page, new URL(baseURL!).origin);
  await page.goto("/forgot-password");
  await page.getByPlaceholder("seu@email.com").fill(user.email);
  await page
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect
    .poll(() => e.calls.filter((c) => c.path.endsWith("/recover")).length)
    .toBe(1);
  expect(e.logs.join("\n")).not.toContain(user.email);
  await expect(
    page.getByText("Enviamos um link para", { exact: false }),
  ).toBeVisible();
});
test("visitors retain the same protected boundaries and legal pages remain public", async ({
  page,
  baseURL,
}) => {
  await mockServices(page, new URL(baseURL!).origin);
  for (const path of ["/soph", "/gestao"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
  await page.goto("/termos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Termos de Uso", exact: true }),
  ).toBeVisible();
});
