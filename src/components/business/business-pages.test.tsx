import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import EstruturePage from "@/pages/Estruture";
import VendasPage from "@/pages/Vendas";
import GestaoPage from "@/pages/Gestao";

const mocks = vi.hoisted(() => ({
  hasErpAccess: false,
  accessLoading: false,
  erpLoading: false,
  enterErp: vi.fn(),
  error: vi.fn(),
  simulations: [] as {
    preco_sugerido: number;
    custo_total: number;
    lucro_liquido: number;
    margem_final: number;
  }[],
  fixedCosts: [] as { valor: number }[],
}));
vi.mock("@/hooks/useErpAccess", () => ({
  useErpAccess: () => ({
    hasErpAccess: mocks.hasErpAccess,
    isLoading: mocks.accessLoading,
  }),
}));
vi.mock("@/hooks/useErpEntry", () => ({
  useErpEntry: () => ({
    enterErp: mocks.enterErp,
    isLoading: mocks.erpLoading,
  }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({
    data:
      queryKey[0] === "pricing_simulations_dashboard"
        ? mocks.simulations
        : mocks.fixedCosts,
  }),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}
function page(component: React.ReactNode) {
  return render(
    <MemoryRouter>
      {component}
      <Location />
    </MemoryRouter>,
  );
}
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks, {
    hasErpAccess: false,
    accessLoading: false,
    erpLoading: false,
    simulations: [],
    fixedCosts: [],
  });
});

describe("Estruture — checklist e progresso existentes", () => {
  it("começa sem dados de protótipo e usa os três destinos existentes", () => {
    page(<EstruturePage />);
    expect(screen.getByText("0 de 16 etapas")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Progresso geral" }),
    ).toHaveAttribute("aria-valuenow", "0");
    const nav = within(
      screen.getByRole("navigation", { name: "Ferramentas de estruturação" }),
    );
    expect(nav.getAllByRole("link").map((e) => e.getAttribute("href"))).toEqual(
      [
        "/estrutura/abrir-mei",
        "/estrutura/logo-marca",
        "/estrutura/registrar-marca",
      ],
    );
    expect(screen.queryByText("38%")).not.toBeInTheDocument();
    expect(
      document.querySelector(".business-advice img")?.getAttribute("src"),
    ).toContain("09-soph-ia.png");
  });
  it("mantém marcação, desmarcação e contagens ao alternar os guias", () => {
    page(<EstruturePage />);
    const first = screen.getByRole("button", {
      name: "Separar documentos necessários (CPF, RG, comprovante de endereço)",
    });
    expect(first).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(first);
    expect(screen.getByText("1 de 16 etapas")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "6",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Criar Logotipo e Identidade/ }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Definir o conceito e valores da marca",
      }),
    );
    expect(screen.getByText("2 de 16 etapas")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Abrir CNPJ \/ MEI/ }));
    const reopened = screen.getByRole("button", {
      name: "Separar documentos necessários (CPF, RG, comprovante de endereço)",
    });
    expect(reopened).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(reopened);
    expect(screen.getByText("1 de 16 etapas")).toBeVisible();
    expect(screen.getByRole("link", { name: /Começar MEI/ })).toHaveAttribute(
      "href",
      "/estrutura/abrir-mei",
    );
  });
  it("mostra conclusão somente depois das seis etapas reais do primeiro guia", () => {
    page(<EstruturePage />);
    const details = document.getElementById("business-guide-0")!;
    for (const button of within(details).getAllByRole("button"))
      fireEvent.click(button);
    expect(screen.getByText("6 de 16 etapas")).toBeVisible();
    expect(screen.getByText("Concluído")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "38",
    );
  });
});

describe("Vendas — conteúdos e destinos", () => {
  it("mantém etapas e dicas, com acesso simples à Soph", () => {
    page(<VendasPage />);
    expect(
      screen.getByRole("link", { name: /Iniciar Jornada Digital/ }),
    ).toHaveAttribute("href", "/vendas/dominio-site");
    expect(
      screen.getByRole("link", { name: /Escalar em Marketplaces/ }),
    ).toHaveAttribute("href", "/vendas/marketplaces");
    expect(
      screen.getByRole("link", { name: /Conversar com a Soph/ }),
    ).toHaveAttribute("href", "/soph");
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    for (const title of [
      "Fotos que Vendem",
      "Prova Social",
      "Anúncios Estratégicos",
    ])
      expect(screen.getByRole("heading", { name: title })).toBeVisible();
    expect(screen.queryByText("Não iniciado")).not.toBeInTheDocument();
  });
  it("navega para o domínio/site sem criar uma nova rota", () => {
    page(<VendasPage />);
    fireEvent.click(
      screen.getByRole("link", { name: /Iniciar Jornada Digital/ }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/vendas/dominio-site",
    );
  });
});

describe("Gestão — indicadores reais e acesso ao ERP", () => {
  it("preserva estados vazios sem vendas, alertas ou percentuais demonstrativos", () => {
    page(<GestaoPage />);
    expect(
      screen.queryByRole("heading", { name: "Resumo Financeiro" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Saúde da Gestão" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Consulte no ERP")).toHaveLength(3);
    for (const fake of ["R$ 1.240", "3 itens", "2 pendentes", "85%", "32%"])
      expect(screen.queryByText(fake)).not.toBeInTheDocument();
    expect(screen.getByText("Sem simulações")).toBeVisible();
  });
  it("apresenta os dados das consultas existentes, sem copiar números do protótipo", () => {
    mocks.simulations = [
      {
        preco_sugerido: 100,
        custo_total: 60,
        lucro_liquido: 40,
        margem_final: 40,
      },
    ];
    mocks.fixedCosts = [{ valor: 20 }];
    page(<GestaoPage />);
    expect(screen.getByText("40,0%")).toBeVisible();
    expect(screen.getByText("Markup médio")).toBeVisible();
    expect(screen.queryByText("85%")).not.toBeInTheDocument();
    expect(screen.queryByText("32%")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Resumo Financeiro" }),
    ).not.toBeInTheDocument();
  });
  it("apresenta quatro ferramentas informativas sem criar destinos ou ações inexistentes", () => {
    page(<GestaoPage />);
    const tools = screen.getByRole("region", { name: "Ferramentas da Gestão" });
    const contents = within(tools);
    for (const name of [
      "Controle de Estoque",
      "Fluxo de Caixa",
      "Contas a Pagar",
      "DRE Simplificado",
    ])
      expect(contents.getByRole("heading", { name })).toBeVisible();
    expect(contents.queryAllByRole("link")).toHaveLength(0);
    expect(contents.queryAllByRole("button")).toHaveLength(0);
    expect(
      contents.getByText(
        "Não há acesso direto a estas ferramentas neste aplicativo.",
      ),
    ).toBeVisible();
    expect(tools.querySelectorAll("img")).toHaveLength(4);
    expect(tools.querySelectorAll("img")[3].getAttribute("src")).toContain(
      "dre-relatorio-financeiro.png",
    );
  });
  it("mantém bloqueio do ERP e a mensagem existente sem conceder acesso", () => {
    page(<GestaoPage />);
    fireEvent.click(screen.getByRole("button", { name: /Ativar Módulo ERP/ }));
    expect(mocks.enterErp).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith(
      expect.stringContaining("O ERP Soph é um módulo premium"),
      { duration: 6000 },
    );
  });
  it("abre o ERP apenas pelo handler existente quando autorizado", () => {
    mocks.hasErpAccess = true;
    page(<GestaoPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /Acessar Sistema Completo/ }),
    );
    expect(mocks.enterErp).toHaveBeenCalledTimes(1);
  });
  it("mantém carregamento e bloqueia cliques duplicados durante a conexão", () => {
    mocks.erpLoading = true;
    page(<GestaoPage />);
    expect(
      screen.getByRole("button", { name: /Conectando ao ERP/ }),
    ).toBeDisabled();
  });
  it("preserva a ação de precificação e o conteúdo expansível das perguntas frequentes", () => {
    page(<GestaoPage />);
    const question = screen.getByRole("button", {
      name: "Como calcular impostos no preço?",
    });
    expect(question).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(question);
    expect(
      screen.getByText(/Inclua a alíquota do seu regime tributário/),
    ).toBeInTheDocument();
    fireEvent.click(question);
    expect(
      screen.queryByText(/Inclua a alíquota do seu regime tributário/),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Novo Cálculo de Preço/ }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/gestao/precificacao",
    );
  });
});
