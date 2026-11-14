import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { getFirstName } from "@/components/home/firstName";
import HomePage from "@/pages/Home";
import { MobileNavigation } from "@/components/MobileNavigation";

const profile = vi.hoisted(() => ({ first_name: "Lia" }));
vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({ data: profile }),
}));
const access = vi.hoisted(() => ({
  ecosystem: true,
  erp: true,
  loading: false,
  erpLoading: false,
}));
vi.mock("@/hooks/usePlanAccess", () => ({
  usePlanAccess: () => ({
    hasEcosystemAccess: access.ecosystem,
    isLoading: access.loading,
  }),
}));
vi.mock("@/hooks/useErpAccess", () => ({
  useErpAccess: () => ({
    hasErpAccess: access.erp,
    isLoading: access.erpLoading,
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  Object.assign(access, {
    ecosystem: true,
    erp: true,
    loading: false,
    erpLoading: false,
  });
});

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}
function Location() {
  const { pathname } = useLocation();
  return <p data-testid="location">{pathname}</p>;
}

describe("Home premium — navegação e estados reais dos hooks", () => {
  it("mantém os nove destinos, sem botão na Hero, e cinco âncoras locais", () => {
    renderHome();
    expect(
      screen.getByRole("region", { name: /Olá/ }).querySelector("button"),
    ).toBeNull();
    const tools = within(
      screen.getByRole("region", { name: "Ferramentas para empreender" }),
    );
    expect(tools.getAllByRole("link")).toHaveLength(9);
    expect(tools.getByRole("link", { name: /Abrir CNPJ/ })).toHaveAttribute(
      "href",
      "/estrutura/abrir-mei",
    );
    expect(tools.getByRole("link", { name: /ERP/ })).toHaveAttribute(
      "href",
      "/gestao",
    );
    expect(
      tools.getByRole("link", { name: /Sistema de Precificação/ }),
    ).toHaveAttribute("href", "/gestao/precificacao");
    for (const link of within(
      screen.getByRole("navigation", { name: "Seções da Home" }),
    ).getAllByRole("link")) {
      expect(
        document.getElementById(link.getAttribute("href")!.slice(1)),
      ).not.toBeNull();
    }
    expect(screen.queryByText("Ecossistema Completo")).not.toBeInTheDocument();
  });
  it("não anuncia liberação enquanto verifica acesso", () => {
    access.loading = true;
    renderHome();
    expect(screen.getAllByText("Verificando acesso")).toHaveLength(8);
    expect(screen.queryByText("Ecossistema Completo")).not.toBeInTheDocument();
  });
  it("indica restrições do ecossistema, preservando links para as rotas protegidas", () => {
    access.ecosystem = false;
    renderHome();
    expect(screen.getAllByText("Ecossistema Completo")).toHaveLength(8);
    expect(
      screen.getByRole("link", { name: /Conversar com a Soph IA/ }),
    ).toHaveAttribute("href", "/soph");
  });
  it("diferencia o módulo ERP sem conceder acesso por ter plano do ecossistema", () => {
    access.erp = false;
    renderHome();
    expect(screen.getByText("Módulo adicional")).toBeVisible();
    expect(screen.queryByText("Ecossistema Completo")).not.toBeInTheDocument();
  });
  it("mantém a verificação independente de acesso ao ERP", () => {
    access.erpLoading = true;
    renderHome();
    expect(screen.getAllByText("Verificando acesso")).toHaveLength(1);
  });
});

describe("Navegação mobile", () => {
  it("abre Mais com as áreas existentes e fecha ao navegar", async () => {
    render(
      <MemoryRouter>
        <MobileNavigation />
        <Routes>
          <Route path="*" element={<Location />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.click(screen.getByRole("button", { name: "Mais" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(
        screen.getByRole("navigation", { name: "Mais áreas" }),
      ).getAllByRole("link"),
    ).toHaveLength(4);
    expect(
      within(
        screen.getByRole("navigation", { name: "Ações rápidas no menu Mais" }),
      ).getByRole("link", { name: "Histórico" }),
    ).toHaveAttribute("href", "/gestao/precificacao/simulador");
    fireEvent.click(
      within(dialog).getByRole("link", { name: "Conta / Plano" }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/conta");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mais" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });
  it("marca Vendas ativa em uma ferramenta interna", () => {
    render(
      <MemoryRouter initialEntries={["/vendas/marketplaces"]}>
        <MobileNavigation />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Vendas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("Saudação mobile com perfil existente", () => {
  it.each([
    ["  Maria Clara  ", "Maria"],
    ["João", "João"],
    ["Ana-Maria", "Ana-Maria"],
    ["", null],
    ["   ", null],
    ["cliente@example.test", null],
    ["123", null],
    ["<script>", null],
    [null, null],
    [123, null],
    ["A".repeat(41), null],
  ])("valida %s sem usar e-mail como nome", (input, expected) => {
    expect(getFirstName(input)).toBe(expected);
  });
  it("apresenta o primeiro nome e a mensagem curta", () => {
    profile.first_name = "Maria Clara";
    renderHome();
    expect(document.querySelector("h1 .premium-hero-mobile")!.textContent).toBe(
      "Olá, Maria! 👋",
    );
    expect(
      document.querySelector("h1 .premium-hero-desktop")!.textContent,
    ).toBe("Olá, Maria! 👋");
    expect(
      screen.getAllByText("Tudo para fazer seu negócio crescer."),
    ).toHaveLength(2);
    expect(
      screen.queryByText("Explorar novas soluções"),
    ).not.toBeInTheDocument();
  });
  it("usa a saudação genérica para valor inválido", () => {
    profile.first_name = "cliente@example.test";
    renderHome();
    expect(document.querySelector(".premium-hero-mobile")!.textContent).toBe(
      "Olá! 👋",
    );
    expect(screen.queryByText("cliente@example.test")).not.toBeInTheDocument();
  });
});

describe("Atalhos reais no menu Mais", () => {
  it("navega para o último acesso salvo e fecha Mais", async () => {
    localStorage.setItem("empreendaja_last_page", "/estrutura/abrir-mei");
    render(
      <MemoryRouter>
        <MobileNavigation />
        <Routes>
          <Route path="*" element={<Location />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mais" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Último acesso" }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/estrutura/abrir-mei",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    localStorage.removeItem("empreendaja_last_page");
  });
});
