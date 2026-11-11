import { test, expect, type Page } from "@playwright/test";
const docs = [
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Política de Privacidade e LGPD"],
  ["/cookies", "Política de Cookies e Armazenamento Local"],
  ["/cancelamento-reembolso", "Cancelamento, Reembolso e Renovação"],
  ["/aviso-soph-ia", "Aviso de Uso da Soph IA"],
] as const;
const fictionalUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "fictional@example.test",
  role: "authenticated",
  aud: "authenticated",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { first_name: "Teste" },
  created_at: "2026-01-01T00:00:00Z",
};
async function fakeSession(page: Page) {
  await page.addInitScript((user) => {
    const part = btoa(
      JSON.stringify({
        sub: user.id,
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
    localStorage.setItem(
      "sb-ospnuclymrxjoqwyolfn-auth-token",
      JSON.stringify({
        access_token: `eyJhbGciOiJIUzI1NiJ9.${part}.fictional`,
        refresh_token: "fictional-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: "bearer",
        user,
      }),
    );
  }, fictionalUser);
}
async function isolate(page: Page, origin: string, subscribed = false) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin) {
      // Preview files are fetched by Playwright's HTTPS client, which inherits
      // the environment CA. TLS validation stays enabled; no persistent browser
      // trust change or ignoreHTTPSErrors is used. Local tests use normal I/O.
      if (process.env.LEGAL_BASE_URL)
        return route.fulfill({ response: await route.fetch() });
      return route.continue();
    }
    if (url.hostname.endsWith(".supabase.co")) {
      let body: unknown = [];
      if (url.pathname.includes("/auth/")) body = fictionalUser;
      else if (url.pathname.includes("/rpc/")) body = subscribed;
      else if (url.pathname.includes("/assinaturas"))
        body = subscribed
          ? [
              {
                id: "fictional-purchase",
                user_id: fictionalUser.id,
                email: fictionalUser.email,
                status: "ativa",
                plano: "Anual",
                data_expiracao: "2035-01-01T00:00:00Z",
              },
            ]
          : [];
      else if (url.pathname.includes("/profiles"))
        body = {
          id: fictionalUser.id,
          first_name: "Teste",
          email: fictionalUser.email,
          is_admin: false,
        };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    }
    return route.abort();
  });
}
test.beforeEach(async ({ page, baseURL }) =>
  isolate(page, new URL(baseURL!).origin),
);
test.afterEach(async ({ page }) => {
  // Finish verified HTTPS fetches before the disposable context is closed.
  await page.unrouteAll({ behavior: "wait" });
});
for (const [path, title] of docs)
  test(`${path} is public, readable and accessible without login`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    expect(await page.locator("h1").count()).toBe(1);
    await expect(page.getByRole("main")).toHaveAttribute(
      "id",
      "documento-juridico",
    );
    await expect(page.locator("[data-sidebar]")).toHaveCount(0);
    await expect(
      page
        .getByRole("navigation", { name: "Documentos jurídicos", exact: true })
        .getByRole("link"),
    ).toHaveCount(5);
    expect(await page.locator("html").getAttribute("lang")).toBe("pt-BR");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("contentinfo").getByRole("link", {
        name: "acesso@empreendajacomsoph.com.br",
        exact: true,
      }),
    ).toHaveAttribute("href", "mailto:acesso@empreendajacomsoph.com.br");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: /WhatsApp/ }),
    ).toHaveAttribute("href", "https://wa.me/5511983348749");
    expect(
      await page
        .locator("article p")
        .first()
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
    ).toBeGreaterThanOrEqual(14);
    await page.keyboard.press("Tab");
    await page.getByRole("link", { name: "Pular para o documento" }).focus();
    expect(
      await page
        .getByRole("link", { name: "Pular para o documento" })
        .evaluate((e) => e.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });
for (const [path, title] of docs)
  test(`${path} also renders for a logged-in account without a subscription`, async ({
    page,
  }) => {
    await fakeSession(page);
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  });
test("all documents navigate directly without login and return links are available", async ({
  page,
}) => {
  await page.goto("/aviso-soph-ia");
  for (const [path, title] of docs) {
    await page
      .getByRole("navigation", { name: "Documentos jurídicos", exact: true })
      .locator(`a[href="${path}"]`)
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page).toHaveTitle(`${title} | EmpreendaJá com Soph`);
  }
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Voltar ao login", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Acesse sua conta" }),
  ).toBeVisible();
});
test("login/signup legal links and the existing password recovery navigation remain available", async ({
  page,
}) => {
  await page.goto("/login");
  const nav = page.getByRole("navigation", {
    name: "Documentos jurídicos no login e cadastro",
  });
  await expect(nav.getByRole("link")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Não tem conta? Criar agora" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Crie sua conta" }),
  ).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Já tem conta? Entrar" }).click();
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});
test("existing protected Soph and management routes still redirect visitors to login", async ({
  page,
}) => {
  for (const path of ["/soph", "/gestao"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Acesse sua conta" }),
    ).toBeVisible();
  }
});
test("existing paid app, Soph screen and management/ERP entry still render with fictional providers", async ({
  page,
  baseURL,
}) => {
  await page.unroute("**/*");
  await isolate(page, new URL(baseURL!).origin, true);
  await fakeSession(page);
  await page.goto("/");
  await expect(
    page.getByRole("contentinfo").getByRole("navigation").getByRole("link"),
  ).toHaveCount(5);
  await page.goto("/soph");
  await expect(page.getByPlaceholder("Escreva sua dúvida...")).toBeVisible();
  await page.goto("/gestao");
  await expect(page).toHaveURL(/\/gestao$/);
  await expect(page.getByRole("main")).toBeVisible();
});
test("legal text reflows at 320px and provides readable contrast and keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/privacidade");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const contrast = await page
    .locator("article p")
    .nth(1)
    .evaluate((e) => {
      const parse = (s: string) =>
        s
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
      const luminance = (rgb: number[]) =>
        rgb
          .map((x) => {
            const c = x / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          })
          .reduce((a, x, i) => a + x * [0.2126, 0.7152, 0.0722][i], 0);
      const fg = luminance(parse(getComputedStyle(e).color));
      const bg = luminance(
        parse(
          getComputedStyle(document.querySelector("main")!).backgroundColor,
        ),
      );
      return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  const link = page
    .getByRole("navigation", { name: "Documentos jurídicos", exact: true })
    .getByRole("link")
    .first();
  await page.keyboard.press("Tab");
  await link.focus();
  expect(await link.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe(
    "none",
  );
  await page.screenshot({
    path: `/workspace/work/legal-browser-results/legal-privacy-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `/workspace/work/legal-browser-results/legal-privacy-${test.info().project.name}-viewport.png`,
    fullPage: false,
  });
});
