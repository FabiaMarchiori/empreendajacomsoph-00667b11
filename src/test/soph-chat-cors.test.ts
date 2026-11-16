import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const preview = "https://deploy-preview-12--appempreendajacomsoph.netlify.app";
const production = "https://appempreendajacomsoph.netlify.app";
const source = readFileSync(new NodeURL("../../supabase/functions/soph-chat/index.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Execute the actual Edge handler locally; no live JWT, secrets, database or AI calls.
const getUser = vi.fn();
const gateway = vi.fn();
const createClient = vi.fn(() => ({ auth: { getUser } }));
let handler: (request: Request) => Promise<Response>;
function loadHandler() {
  runInNewContext(compiled, {
    exports: {},
    require: (name: string) => {
      if (name !== "https://esm.sh/@supabase/supabase-js@2") throw new Error(name);
      return { createClient };
    },
    Request, Response, Headers,
    console: { error: vi.fn(), warn: vi.fn() },
    fetch: gateway,
    Deno: {
      env: { get: (key: string) => ({
        SUPABASE_URL: "https://example.test", SUPABASE_ANON_KEY: "test-anon",
        LOVABLE_API_KEY: "test-ai",
      })[key] },
      serve: (callback: typeof handler) => { handler = callback; },
    },
  });
}
function request(origin: string, method = "POST", body: unknown = { messages: [{ role: "user", content: "Como organizar meu negócio?" }] }, authenticated = true) {
  return new Request("https://example.test/functions/v1/soph-chat", {
    method,
    headers: {
      Origin: origin,
      ...(method === "OPTIONS" ? {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      } : { "Content-Type": "application/json", ...(authenticated ? { Authorization: "Bearer test-only" } : {}) }),
    },
    ...(method === "OPTIONS" ? {} : { body: JSON.stringify(body) }),
  });
}
function expectCors(response: Response, origin: string) {
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe("*");
  expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
  expect(response.headers.get("Access-Control-Allow-Headers")).toContain("authorization");
  expect(response.headers.get("Access-Control-Allow-Headers")).toContain("content-type");
  expect(response.headers.get("Vary")).toBe("Origin");
}
beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
  gateway.mockImplementation(async () => new Response('data: {"choices":[{"delta":{"content":"Resposta de teste"}}]}\n\ndata: [DONE]\n\n', { headers: { "Content-Type": "text/event-stream" } }));
  loadHandler();
});

describe("soph-chat — autorização CORS específica", () => {
  it.each([
    preview, production, "https://empreendajacomsophi.netlify.app",
    "https://appempreendajacomsoph.lovable.app", "https://example.lovable.app",
    "https://example.lovableproject.com", "http://localhost:8080",
  ])("preserva preflight e POST para %s", async (origin) => {
    const preflight = await handler(request(origin, "OPTIONS"));
    expect(preflight.status).toBe(200);
    expectCors(preflight, origin);
    expect(createClient).not.toHaveBeenCalled();
    expect(gateway).not.toHaveBeenCalled();
    const response = await handler(request(origin));
    expectCors(response, origin);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await response.text()).toContain("data: [DONE]");
  });

  it.each([
    "https://untrusted.example", "https://deploy-preview-13--appempreendajacomsoph.netlify.app",
    "https://deploy-preview-12--appempreendajacomsoph.netlify.app.evil.test",
    "http://deploy-preview-12--appempreendajacomsoph.netlify.app",
  ])("não autoriza leitura pelo navegador para %s", async (origin) => {
    for (const method of ["OPTIONS", "POST"]) {
      const response = await handler(request(origin, method, {}, false));
      // Preserve the existing fallback: CORS blocks browsers, not authenticated server clients.
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(production);
      expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe(origin);
      expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe("*");
    }
    expect(gateway).not.toHaveBeenCalled();
  });

  it("preserva o contrato POST, autenticação e streaming", async () => {
    const response = await handler(request(preview));
    expectCors(response, preview);
    expect(createClient).toHaveBeenCalledWith("https://example.test", "test-anon", { global: { headers: { Authorization: "Bearer test-only" } } });
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(gateway).toHaveBeenCalledTimes(1);
    const [url, options] = gateway.mock.calls[0];
    expect(url).toBe("https://ai.gateway.lovable.dev/v1/chat/completions");
    expect(options.method).toBe("POST");
    const payload = JSON.parse(options.body);
    expect(payload.model).toBe("google/gemini-3.7-flash");
    expect(payload.stream).toBe(true);
    expect(payload.messages[1]).toEqual({ role: "user", content: "Como organizar meu negócio?" });
    expect(await response.text()).toContain("Resposta de teste");
  });

  it("mantém 401 sem JWT e permite que a prévia leia o erro real", async () => {
    const response = await handler(request(preview, "POST", {}, false));
    expectCors(response, preview);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Autenticação necessária." });
    expect(gateway).not.toHaveBeenCalled();
  });

  it("mantém a rejeição de JWT inválido", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid token" } });
    const response = await handler(request(preview));
    expectCors(response, preview);
    expect(response.status).toBe(401);
    expect(gateway).not.toHaveBeenCalled();
  });

  it.each([400, 413])("preserva erro de payload %s com CORS", async (status) => {
    const body = status === 400 ? { messages: [] } : { messages: [{ role: "user", content: "a".repeat(8001) }] };
    const response = await handler(request(preview, "POST", body));
    expect(response.status).toBe(status);
    expectCors(response, preview);
    expect(gateway).not.toHaveBeenCalled();
  });

  it.each([402, 429, 502])("preserva erro do gateway %s com CORS", async (status) => {
    gateway.mockResolvedValue(new Response("{}", { status }));
    const response = await handler(request(preview));
    expect(response.status).toBe(status);
    expectCors(response, preview);
  });

  it("inclui CORS no erro interno sem mascará-lo", async () => {
    gateway.mockRejectedValue(new Error("test connection failure"));
    const response = await handler(request(preview));
    expect(response.status).toBe(500);
    expectCors(response, preview);
    expect(await response.json()).toEqual({ error: "Erro interno. Tente novamente em instantes." });
  });
});
