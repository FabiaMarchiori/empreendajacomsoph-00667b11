import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import BolsasHub from "./BolsasHub";
import BolsasLista from "./BolsasLista";
import BolsasBusca from "./BolsasBusca";
import BolsasFavoritos from "./BolsasFavoritos";
import BolsasProtected from "./BolsasProtected";

const fixture = vi.hoisted(() => ({
  suppliers: undefined as
    | Array<{
        id: number;
        nome_loja: string;
        allIds: number[];
        codigo_fornecedor: string;
        logo_url: string;
      }>
    | undefined,
  favorites: [] as number[],
  loading: false,
  error: null as Error | null,
  toggle: vi.fn(),
  access: {
    isAdmin: false,
    hasEcosystem: false,
    hasBolsasPlan: true,
    isLoading: false,
  },
}));
vi.mock("@/hooks/useBolsasSuppliers", () => ({
  useBolsasSuppliers: () => ({
    data: fixture.suppliers,
    isLoading: fixture.loading,
    error: fixture.error,
  }),
}));
vi.mock("@/hooks/useSupabaseFavorites", () => ({
  useSupabaseFavorites: () => ({
    favorites: fixture.favorites,
    isFavorite: (id: number) => fixture.favorites.includes(id),
    toggle: fixture.toggle,
    isLoading: false,
  }),
}));
vi.mock("@/hooks/usePlanAccess", () => ({
  usePlanAccess: () => fixture.access,
}));
const rows = () => [
  {
    id: 101,
    nome_loja: "Loja Alfa",
    allIds: [101, 102],
    codigo_fornecedor: "F001",
    logo_url: "https://example.test/alfa.png",
  },
  {
    id: 103,
    nome_loja: "Loja Beta",
    allIds: [103],
    codigo_fornecedor: "F012",
    logo_url: "https://example.test/beta.png",
  },
];
function CurrentPath() {
  return <div aria-label="Rota atual">{useLocation().pathname}</div>;
}
function setup(child: React.ReactNode) {
  return render(
    <MemoryRouter>
      {child}
      <CurrentPath />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  fixture.suppliers = undefined;
  fixture.favorites = [];
  fixture.loading = false;
  fixture.error = null;
  fixture.access = {
    isAdmin: false,
    hasEcosystem: false,
    hasBolsasPlan: true,
    isLoading: false,
  };
  vi.clearAllMocks();
});

describe("Bolsas premium — preservação funcional", () => {
  it("usa os registros deduplicados e conta favoritos de qualquer ID associado somente no nicho", () => {
    fixture.suppliers = rows();
    fixture.favorites = [102, 999];
    setup(<BolsasHub />);
    expect(
      screen.getByRole("definition", { name: "Fornecedores" }),
    ).toHaveTextContent(/^2$/);
    expect(
      screen.getByRole("definition", { name: "Favoritos salvos" }),
    ).toHaveTextContent(/^1$/);
    expect(screen.getByRole("definition", { name: "Nicho" })).toHaveTextContent(
      "Premium",
    );
  });
  it("mantém zero no carregamento inicial sem copiar números do protótipo", () => {
    setup(<BolsasHub />);
    expect(
      screen.getByRole("definition", { name: "Fornecedores" }),
    ).toHaveTextContent(/^0$/);
    expect(
      screen.getByRole("definition", { name: "Favoritos salvos" }),
    ).toHaveTextContent(/^0$/);
  });
  it.each([
    ["Ver Todos os Fornecedores", "/fornecedores/bolsas-mochilas-malas/lista"],
    ["Buscar Fornecedor", "/fornecedores/bolsas-mochilas-malas/busca"],
    ["Meus Favoritos", "/fornecedores/bolsas-mochilas-malas/favoritos"],
    ["Voltar para Central", "/fornecedores"],
  ])("preserva o destino de %s", (name, path) => {
    setup(<BolsasHub />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(path);
  });
  it("mantém a busca da lista por nome e código e os arquivos originais das logos", () => {
    fixture.suppliers = rows();
    setup(<BolsasLista />);
    const input = screen.getByRole("textbox", { name: "Buscar fornecedor" });
    expect(screen.getByRole("img", { name: "Loja Alfa" })).toHaveAttribute(
      "src",
      rows()[0].logo_url,
    );
    fireEvent.change(input, { target: { value: "beta" } });
    expect(screen.getByAltText("Loja Beta")).toBeInTheDocument();
    expect(screen.queryByAltText("Loja Alfa")).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: "f1" } });
    expect(screen.getByAltText("Loja Alfa")).toBeInTheDocument();
    expect(screen.queryByAltText("Loja Beta")).not.toBeInTheDocument();
  });
  it("mantém duas letras para busca textual e permite código numérico de um dígito", () => {
    fixture.suppliers = rows();
    setup(<BolsasBusca />);
    const input = screen.getByRole("textbox", {
      name: "Nome da loja ou código",
    });
    fireEvent.change(input, { target: { value: "a" } });
    expect(screen.getAllByRole("img", { name: /Loja/ })).toHaveLength(2);
    fireEvent.change(input, { target: { value: "2" } });
    expect(screen.getAllByRole("img", { name: /Loja/ })).toHaveLength(1);
    expect(screen.getByAltText("Loja Beta")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "ausente" } });
    expect(
      screen.getByText(/Nenhum fornecedor encontrado para/),
    ).toBeInTheDocument();
  });
  it("mantém favoritos agrupados, callback canônico e rota do perfil de Bolsas", () => {
    fixture.suppliers = rows();
    fixture.favorites = [102, 999];
    const view = setup(<BolsasFavoritos />);
    expect(screen.getAllByRole("img", { name: /Loja/ })).toHaveLength(1);
    expect(screen.getByText("1 fornecedores salvos")).toBeInTheDocument();
    const buttons = view.container.querySelectorAll(
      ".bolsas-listing-supplier button",
    );
    fireEvent.click(buttons[0]);
    expect(fixture.toggle).toHaveBeenCalledExactlyOnceWith(101);
    fireEvent.click(buttons[1]);
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
      "/fornecedores/bolsas-mochilas-malas/fornecedor/101",
    );
  });
  it("mantém loading, erro e vazio sem criar fornecedores", () => {
    fixture.loading = true;
    setup(<BolsasLista />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando fornecedores",
    );
    cleanup();
    fixture.loading = false;
    fixture.error = new Error("Teste");
    setup(<BolsasBusca />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Erro ao carregar fornecedores",
    );
    cleanup();
    fixture.error = null;
    fixture.suppliers = [];
    setup(<BolsasFavoritos />);
    expect(
      screen.getByText("Nenhum favorito salvo ainda."),
    ).toBeInTheDocument();
  });
  it("mantém o retorno das telas internas para o hub", () => {
    setup(<BolsasLista />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Voltar para Bolsas, Mochilas e Malas",
      }),
    );
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
      "/fornecedores/bolsas-mochilas-malas",
    );
  });
});

describe("Regras existentes de acesso a Bolsas", () => {
  it.each([true, false])("preserva admin (%s) e plano Bolsas", (admin) => {
    fixture.access.isAdmin = admin;
    fixture.access.hasBolsasPlan = !admin;
    setup(
      <BolsasProtected>
        <div>Hub autorizado</div>
      </BolsasProtected>,
    );
    expect(screen.getByText("Hub autorizado")).toBeInTheDocument();
  });
  it("mantém a orientação existente para assinante do Ecossistema", () => {
    fixture.access.hasBolsasPlan = false;
    fixture.access.hasEcosystem = true;
    setup(
      <BolsasProtected>
        <div>Hub autorizado</div>
      </BolsasProtected>,
    );
    expect(screen.queryByText("Hub autorizado")).not.toBeInTheDocument();
    expect(screen.getByText("Já incluído no seu plano")).toBeInTheDocument();
  });
  it("mantém o bloqueio de plano sem acesso", () => {
    fixture.access.hasBolsasPlan = false;
    setup(
      <BolsasProtected>
        <div>Hub autorizado</div>
      </BolsasProtected>,
    );
    expect(screen.queryByText("Hub autorizado")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Comprar acesso/ }),
    ).toBeInTheDocument();
  });
});
