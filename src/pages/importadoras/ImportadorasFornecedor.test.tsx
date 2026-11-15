import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ImportadorasFornecedor from "./ImportadorasFornecedor";

const fixture = vi.hoisted(() => ({
  supplier: undefined as Record<string, unknown> | undefined,
  loading: false,
  error: null as Error | null,
  favorite: false,
  toggle: vi.fn(),
  byId: vi.fn(),
}));
vi.mock("@/hooks/useSupabaseSuppliers", () => ({
  useSupabaseSupplierById: (id: string) => {
    fixture.byId(id);
    return {
      data: fixture.supplier,
      isLoading: fixture.loading,
      error: fixture.error,
    };
  },
}));
vi.mock("@/hooks/useSupabaseFavorites", () => ({
  useSupabaseFavorites: () => ({
    toggle: fixture.toggle,
    isFavorite: () => fixture.favorite,
  }),
}));

function supplier() {
  return {
    id: 42,
    nome_loja: "Fornecedor de Teste",
    categoria: "CATEGORIA DE TESTE",
    logo_url: "https://example.test/logo-original.png",
    mockup_url: "https://example.test/imagem-original.png",
    Whatsapp: "5500000000000",
    Instagram_url: "https://www.instagram.com/perfil.teste/",
    Endereco: "Endereço de Teste, 123 — SP",
  };
}
function CurrentPath() {
  return <div aria-label="Rota atual">{useLocation().pathname}</div>;
}
function setup(base = "/fornecedores/importadoras-25") {
  return render(
    <MemoryRouter
      initialEntries={[
        base.endsWith("bolsas-mochilas-malas")
          ? `${base}/lista`
          : `${base}/categorias`,
        `${base}/fornecedor/42`,
      ]}
    >
      <Routes>
        <Route
          path={`${base}/fornecedor/:id`}
          element={<ImportadorasFornecedor />}
        />
        <Route path="*" element={<div>Página de origem</div>} />
      </Routes>
      <CurrentPath />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  fixture.supplier = undefined;
  fixture.loading = false;
  fixture.error = null;
  fixture.favorite = false;
  vi.clearAllMocks();
});

describe("Perfil compartilhado do fornecedor", () => {
  it.each([
    "/fornecedores/importadoras-25",
    "/fornecedores/bolsas-mochilas-malas",
  ])("carrega pelo ID e mantém os dados individuais na rota %s", (base) => {
    fixture.supplier = supplier();
    setup(base);
    expect(fixture.byId).toHaveBeenCalledWith("42");
    expect(
      screen.getByRole("heading", { name: "Fornecedor de Teste" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CATEGORIA DE TESTE")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Fornecedor de Teste" }),
    ).toHaveAttribute("src", supplier().logo_url);
    expect(screen.queryByText(/Charme 25 SP/i)).not.toBeInTheDocument();
  });
  it("preserva exatamente a geração dos três links e a abertura externa", () => {
    fixture.supplier = supplier();
    setup();
    const links = [
      [
        "WhatsApp de Fornecedor de Teste",
        `https://wa.me/${supplier().Whatsapp}`,
      ],
      ["Instagram de Fornecedor de Teste", supplier().Instagram_url],
      [
        "Mapa de Fornecedor de Teste",
        `https://maps.google.com/maps?q=${encodeURIComponent(supplier().Endereco)}`,
      ],
    ];
    for (const [name, href] of links) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
  it("oculta contatos ausentes e não inventa uma imagem", () => {
    fixture.supplier = {
      ...supplier(),
      Whatsapp: null,
      Instagram_url: null,
      Endereco: null,
      mockup_url: null,
    };
    setup();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(
      screen.getByText("Imagem do fornecedor indisponível."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /^Imagem de/ }),
    ).not.toBeInTheDocument();
  });
  it("renderiza o arquivo individual inteiro, sem criar outra moldura de celular", () => {
    fixture.supplier = supplier();
    setup();
    const image = screen.getByRole("img", {
      name: "Imagem de Fornecedor de Teste",
    });
    expect(image).toHaveAttribute("src", supplier().mockup_url);
    expect(image.parentElement?.tagName).toBe("FIGURE");
    expect(image.parentElement?.children).toHaveLength(1);
    expect(
      screen.queryByText("Imagem do fornecedor indisponível."),
    ).not.toBeInTheDocument();
  });
  it("usa o mesmo ID e callback para favorito ativo e inativo", () => {
    fixture.supplier = supplier();
    fixture.favorite = true;
    setup();
    const button = screen.getByRole("button", {
      name: "Remover dos favoritos",
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(fixture.toggle).toHaveBeenCalledExactlyOnceWith(42);
    cleanup();
    fixture.favorite = false;
    setup();
    expect(
      screen.getByRole("button", { name: "Adicionar aos favoritos" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
  it("preserva o retorno pelo histórico nas duas áreas", () => {
    fixture.supplier = supplier();
    setup("/fornecedores/bolsas-mochilas-malas");
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
      "/fornecedores/bolsas-mochilas-malas/lista",
    );
  });
  it("preserva carregamento, erro e fornecedor não encontrado", () => {
    fixture.loading = true;
    setup();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando fornecedor",
    );
    cleanup();
    fixture.loading = false;
    fixture.error = new Error("Erro simulado");
    setup();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Importadora não encontrada.",
    );
    cleanup();
    fixture.error = null;
    setup();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Importadora não encontrada.",
    );
  });
});
