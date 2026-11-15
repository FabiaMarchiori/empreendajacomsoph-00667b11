import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import ImportadorasHub from "./ImportadorasHub";

const fixture = vi.hoisted(() => ({
  categories: undefined as unknown[] | undefined,
  suppliers: undefined as unknown[] | undefined,
  favorites: [] as number[],
  toggle: vi.fn(),
}));
vi.mock("@/hooks/useSupabaseCategories", () => ({
  useSupabaseCategories: () => ({ data: fixture.categories }),
}));
vi.mock("@/hooks/useSupabaseSuppliers", () => ({
  useSupabaseSuppliers: () => ({ data: fixture.suppliers }),
}));
vi.mock("@/hooks/useSupabaseFavorites", () => ({
  useSupabaseFavorites: () => ({
    favorites: fixture.favorites,
    toggle: fixture.toggle,
  }),
}));

function CurrentPath() {
  return <div aria-label="Rota atual">{useLocation().pathname}</div>;
}
function setup() {
  return render(
    <MemoryRouter initialEntries={["/fornecedores/importadoras-25"]}>
      <ImportadorasHub />
      <CurrentPath />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  fixture.categories = undefined;
  fixture.suppliers = undefined;
  fixture.favorites = [];
  vi.clearAllMocks();
});

describe("Importadoras 25 de Março", () => {
  it("mantém o fallback zero enquanto os hooks ainda não retornaram dados", () => {
    setup();
    for (const name of ["Categorias", "Importadoras", "Favoritos salvos"])
      expect(screen.getByRole("definition", { name })).toHaveTextContent(/^0$/);
  });
  it("mostra os totais dos hooks sem deduplicar registros ou copiar números do protótipo", () => {
    fixture.categories = [{ id: 1 }, { id: 2 }];
    fixture.suppliers = [
      { id: 101, nome_loja: "Loja Teste", categoria: "A" },
      { id: 102, nome_loja: "Loja Teste", categoria: "B" },
      { id: 103, nome_loja: "Outra Loja Teste", categoria: "A" },
    ];
    fixture.favorites = [101, 103];
    setup();
    expect(
      screen.getByRole("definition", { name: "Categorias" }),
    ).toHaveTextContent(/^2$/);
    expect(
      screen.getByRole("definition", { name: "Importadoras" }),
    ).toHaveTextContent(/^3$/);
    expect(
      screen.getByRole("definition", { name: "Favoritos salvos" }),
    ).toHaveTextContent(/^2$/);
    expect(
      screen.getByText(/incluindo repetições entre categorias/),
    ).toBeInTheDocument();
    expect(fixture.toggle).not.toHaveBeenCalled();
  });
  it("acompanha atualizações dos hooks sem criar estado paralelo de favoritos", () => {
    fixture.categories = [];
    fixture.suppliers = [];
    const { rerender } = setup();
    fixture.categories = [{ id: 1 }];
    fixture.suppliers = [{ id: 1 }, { id: 2 }];
    fixture.favorites = [2];
    rerender(
      <MemoryRouter>
        <ImportadorasHub />
        <CurrentPath />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("definition", { name: "Categorias" }),
    ).toHaveTextContent(/^1$/);
    expect(
      screen.getByRole("definition", { name: "Importadoras" }),
    ).toHaveTextContent(/^2$/);
    expect(
      screen.getByRole("definition", { name: "Favoritos salvos" }),
    ).toHaveTextContent(/^1$/);
    expect(fixture.toggle).not.toHaveBeenCalled();
  });
  it.each([
    ["Explorar Categorias", "/fornecedores/importadoras-25/categorias"],
    ["Buscar Importadoras", "/fornecedores/importadoras-25/busca"],
    ["Meus Favoritos", "/fornecedores/importadoras-25/favoritos"],
    ["Voltar para Central", "/fornecedores"],
  ])("preserva o destino de %s", (title, destination) => {
    setup();
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(`^${title}`) }),
    );
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(destination);
    expect(fixture.toggle).not.toHaveBeenCalled();
  });
  it("mantém as três orientações e os quatro acessos como controles reais", () => {
    setup();
    expect(
      screen
        .getByRole("region", { name: "Comece por aqui" })
        .querySelectorAll("li"),
    ).toHaveLength(3);
    expect(
      screen
        .getByRole("navigation", { name: "Áreas de Importadoras 25 de Março" })
        .querySelectorAll("button"),
    ).toHaveLength(4);
  });
});
