import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import App from "@/App";
import { Footer } from "@/components/Footer";
import { legalDocuments } from "./documents";

const auth = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: null, loading: false, ...auth }),
}));
vi.mock("@/components/AppLayout", () => ({
  AppLayout: () => <p>Área privada preservada</p>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { signInWithOAuth: vi.fn() } },
}));
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  auth.signIn.mockResolvedValue({ error: null });
  auth.signUp.mockResolvedValue({ error: null });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("Rotas jurídicas reais do App sem autenticação ou assinatura", () => {
  for (const doc of legalDocuments)
    it(doc.path, async () => {
      window.history.replaceState({}, "", doc.path);
      render(<App />);
      const title = doc.markdown.split("\n")[0].slice(2);
      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(screen.getByRole("main")).toHaveAttribute(
        "id",
        "documento-juridico",
      );
      expect(
        screen.queryByText("Área privada preservada"),
      ).not.toBeInTheDocument();
      expect(window.location.pathname).toBe(doc.path);
      expect(document.title).toContain(title);
      expect(
        screen
          .getByRole("navigation", { name: "Documentos jurídicos" })
          .querySelectorAll("a"),
      ).toHaveLength(5);
      expect(screen.getByRole("link", { name: doc.label })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        screen.getAllByRole("link", {
          name: "acesso@empreendajacomsoph.com.br",
        })[0],
      ).toHaveAttribute("href", "mailto:acesso@empreendajacomsoph.com.br");
      expect(screen.getByRole("article")).toHaveAttribute(
        "aria-labelledby",
        "legal-title",
      );
    });
});
it("navigation between documents changes content, title and reading focus", async () => {
  window.history.replaceState({}, "", "/termos");
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Aviso Soph IA" }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Aviso de Uso da Soph IA",
      }),
    ).toBeVisible(),
  );
  expect(window.location.pathname).toBe("/aviso-soph-ia");
  expect(screen.getByRole("main")).toHaveFocus();
});
it("Footer exposes all five public documents", () => {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
  for (const doc of legalDocuments)
    expect(screen.getByRole("link", { name: doc.label })).toHaveAttribute(
      "href",
      doc.path,
    );
});
it("login and signup keep the same handlers and expose legal links without an acceptance checkbox", async () => {
  window.history.replaceState({}, "", "/login");
  render(<App />);
  for (const doc of legalDocuments)
    expect(screen.getByRole("link", { name: doc.label })).toHaveAttribute(
      "href",
      doc.path,
    );
  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
    target: { value: "fictional@example.test" },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "fictional-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  await waitFor(() =>
    expect(auth.signIn).toHaveBeenCalledWith(
      "fictional@example.test",
      "fictional-password",
    ),
  );
  cleanup();
  window.history.replaceState({}, "", "/login");
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: "Não tem conta? Criar agora" }),
  );
  fireEvent.change(screen.getByPlaceholderText("Maria"), {
    target: { value: "Nome" },
  });
  fireEvent.change(screen.getByPlaceholderText("Silva"), {
    target: { value: "Fictício" },
  });
  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
    target: { value: "signup@example.test" },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "fictional-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
  await waitFor(() =>
    expect(auth.signUp).toHaveBeenCalledWith(
      "signup@example.test",
      "fictional-password",
      "Nome",
      "Fictício",
    ),
  );
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});
it("protected application routes still use their existing boundary", () => {
  window.history.replaceState({}, "", "/soph");
  render(<App />);
  expect(screen.getByText("Área privada preservada")).toBeVisible();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
});
it("renders the canonical Markdown content rather than a separate legal text copy", () => {
  for (const doc of legalDocuments) {
    expect(doc.markdown).toContain("21.121.633/0001-28");
    expect(doc.markdown).toContain("acesso@empreendajacomsoph.com.br");
    expect(doc.markdown).toContain("11 de novembro de 2026");
    expect(doc.markdown).not.toContain("contato@empreendajacomsoph.com.br");
  }
});
