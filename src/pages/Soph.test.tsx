import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import SophPage from "./Soph";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  refreshSession: vi.fn(),
  toast: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { email: "visual@example.test" } }),
}));
vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({ data: { first_name: "Lia" } }),
}));
vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({ hasActive: true }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      refreshSession: mocks.refreshSession,
    },
  },
}));
vi.mock("sonner", () => ({ toast: { error: mocks.toast } }));
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, ...props }: { children: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

function setup(initialMessage?: string) {
  return render(
    <div data-app-layout="">
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/soph",
            state: initialMessage ? { initialMessage } : undefined,
          },
        ]}
      >
        <SophPage />
      </MemoryRouter>
    </div>,
  );
}
function response(text: string) {
  const sse = `: heartbeat\n\ndata: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
  return new Response(
    new ReadableStream({
      start(controller) {
        const encoded = new TextEncoder().encode(sse);
        controller.enqueue(encoded.slice(0, 21));
        controller.enqueue(encoded.slice(21, 59));
        controller.enqueue(encoded.slice(59));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
function send(text: string) {
  fireEvent.change(
    screen.getByRole("textbox", { name: "Mensagem para a Soph" }),
    { target: { value: text } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    data: { session: { access_token: "test-token" } },
    error: null,
  });
  mocks.refreshSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  vi.stubGlobal("fetch", mocks.fetch);
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Soph premium: apresentação e contrato de chat preservado", () => {
  it("mostra apenas a saudação existente, sem conversa fictícia ou controles sem função", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Soph — Sua Sócia Digital" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Olá, Lia! Sou a Soph, sua sócia digital. Como posso te ajudar hoje?",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Atalhos rápidos")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".soph-message")).toHaveLength(1);
    expect(document.querySelector(".soph-page img")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Enviar mensagem" }),
    ).toBeDisabled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("preserva token, contexto, histórico enviado e parsing SSE/Markdown", async () => {
    mocks.fetch
      .mockResolvedValueOnce(response("Resposta **formatada**."))
      .mockResolvedValueOnce(response("Segunda resposta."));
    setup();
    send("  Primeira pergunta  ");
    expect(
      await screen.findByText("formatada", { selector: "strong" }),
    ).toBeInTheDocument();
    const first = mocks.fetch.mock.calls[0];
    expect(first[0]).toContain("/functions/v1/soph-chat");
    expect(first[1].headers.Authorization).toBe("Bearer test-token");
    expect(JSON.parse(first[1].body)).toEqual({
      messages: [{ role: "user", content: "Primeira pergunta" }],
      userContext: {
        userName: "Lia",
        currentModule: "Soph (Assistente)",
        hasSubscription: true,
      },
    });
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Segunda pergunta" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(await screen.findByText("Segunda resposta.")).toBeInTheDocument();
    expect(JSON.parse(mocks.fetch.mock.calls[1][1].body).messages).toEqual([
      { role: "user", content: "Primeira pergunta" },
      { role: "assistant", content: "Resposta **formatada**." },
      { role: "user", content: "Segunda pergunta" },
    ]);
    expect(mocks.refreshSession).not.toHaveBeenCalled();
  });
  it("mantém a sugestão ligada à pergunta real existente e ao histórico", async () => {
    mocks.fetch.mockResolvedValue(response("Resposta de teste."));
    setup();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Como calcular meu preço corretamente?",
      }),
    );
    await screen.findByText("Resposta de teste.");
    expect(
      JSON.parse(mocks.fetch.mock.calls[0][1].body).messages[0].content,
    ).toBe("Como calcular meu preço corretamente?");
    expect(
      screen.getByRole("button", {
        name: "Como calcular meu preço corretamente?",
      }),
    ).toBeEnabled();
  });
  it("preserva carregamento, evita envios duplicados e libera o campo após resposta", async () => {
    let finish!: (value: Response) => void;
    mocks.fetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
    setup();
    send("Pergunta de teste");
    expect(await screen.findByRole("status")).toHaveTextContent("Pensando...");
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Enviar mensagem" }),
    ).toBeDisabled();
    finish(response("Pronto."));
    await screen.findByText("Pronto.");
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
  it("preserva erro da API e a mensagem do usuário, sem criar resposta", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Limite de teste" }), {
        status: 429,
      }),
    );
    setup();
    send("Pergunta que falha");
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith("Limite de teste"),
    );
    expect(screen.getByText("Pergunta que falha")).toBeInTheDocument();
    expect(
      document.querySelectorAll('.soph-message[data-role="assistant"]'),
    ).toHaveLength(1);
    expect(screen.getByRole("textbox")).toBeEnabled();
  });
  it("preserva renovação de sessão e bloqueio se não existir token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    setup();
    send("Pergunta sem sessão");
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        "Sua sessão expirou. Faça login novamente para conversar com a Soph.",
      ),
    );
    expect(mocks.refreshSession).toHaveBeenCalledOnce();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("usa o token renovado pelo mecanismo existente quando necessário", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mocks.refreshSession.mockResolvedValue({
      data: { session: { access_token: "refreshed-test-token" } },
      error: null,
    });
    mocks.fetch.mockResolvedValue(response("Resposta com sessão renovada."));
    setup();
    send("Pergunta de teste");
    await screen.findByText("Resposta com sessão renovada.");
    expect(mocks.fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer refreshed-test-token",
    );
  });
  it("preserva mensagem inicial de navegação e não a reenvia ao digitar", async () => {
    mocks.fetch.mockResolvedValue(response("Resposta inicial."));
    setup("Mensagem inicial de teste");
    await screen.findByText("Resposta inicial.");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Rascunho" },
    });
    expect(mocks.fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).messages).toEqual([
      { role: "user", content: "Mensagem inicial de teste" },
    ]);
  });
  it("remove as restrições de viewport ao sair da página", () => {
    const view = setup();
    const layout = document.querySelector("[data-app-layout]") as HTMLElement;
    expect(layout).toHaveAttribute("data-soph-layout");
    view.unmount();
    expect(layout).not.toHaveAttribute("data-soph-layout");
    expect(layout.style.getPropertyValue("--soph-viewport-height")).toBe("");
  });
});
