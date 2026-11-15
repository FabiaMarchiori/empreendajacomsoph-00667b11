import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import FornecedoresPage from "./Fornecedores";

const access = vi.hoisted(() => ({ hasBolsasOnly: false }));
vi.mock("@/hooks/usePlanAccess", () => ({ usePlanAccess: () => access }));

function CurrentPath() {
  return <div aria-label="Rota atual">{useLocation().pathname}</div>;
}
function setup() {
  return render(
    <MemoryRouter initialEntries={["/fornecedores"]}>
      <FornecedoresPage />
      <CurrentPath />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  access.hasBolsasOnly = false;
});

function cards() {
  return screen.getAllByRole("heading", { level: 3 });
}

describe("Central de Fornecedores", () => {
  it("preserva as duas categorias disponíveis e as onze futuras", () => {
    setup();
    expect(cards()).toHaveLength(13);
    expect(screen.getAllByText("Liberado", { exact: true })).toHaveLength(2);
    expect(screen.getAllByText("Em Breve", { exact: true })).toHaveLength(11);
    expect(
      within(screen.getByRole("region", { name: "Categorias disponíveis" }))
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["Importadoras 25 de Março", "Bolsas, Mochilas e Malas"]);
  });
  it("filtra cada segmento sem criar ou liberar categorias", () => {
    setup();
    const filters: [string, number][] = [
      ["25 de Março", 1],
      ["Bolsas, Mochilas e Malas", 1],
      ["Moda Brás", 5],
      ["Calçados", 4],
      ["Semi-jóias", 1],
      ["Fabricantes Nacionais", 1],
      ["Todos", 13],
    ];
    for (const [name, count] of filters) {
      const button = screen.getByRole("button", { name });
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(cards()).toHaveLength(count);
    }
  });
  it("combina busca sem distinção de maiúsculas com o filtro ativo", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Moda Brás" }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "FEMININA" },
    });
    expect(cards()).toHaveLength(1);
    expect(cards()[0]).toHaveTextContent("Moda Feminina");
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(cards()).toHaveLength(5);
  });
  it("exibe resultado vazio e permite limpar a busca", () => {
    setup();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "inexistente-teste" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nenhuma importadora encontrada",
    );
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    fireEvent.click(
      within(screen.getByRole("status")).getByRole("button", {
        name: "Limpar busca",
      }),
    );
    expect(cards()).toHaveLength(13);
  });
  it.each([
    ["Importadoras 25 de Março", "/fornecedores/importadoras-25"],
    ["Bolsas, Mochilas e Malas", "/fornecedores/bolsas-mochilas-malas"],
  ])("preserva o destino de %s", (title, path) => {
    setup();
    fireEvent.click(screen.getByRole("heading", { level: 3, name: title }));
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(path);
  });
  it("preserva o bloqueio de Importadoras para o plano somente Bolsas", () => {
    access.hasBolsasOnly = true;
    setup();
    const title = screen.getByRole("heading", {
      name: "Importadoras 25 de Março",
    });
    const card = title.closest("[data-status]")!;
    expect(card).toHaveAttribute("data-status", "upgrade");
    expect(
      within(card as HTMLElement).getByText("Fazer upgrade"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Liberado", { exact: true })).toHaveLength(1);
    fireEvent.click(title);
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
      "/fornecedores/importadoras-25",
    );
  });
  it("mantém o modal existente de Avise-me e não navega para categorias futuras", () => {
    setup();
    fireEvent.click(screen.getAllByRole("button", { name: "Avise-me" })[0]);
    expect(
      screen.getByRole("dialog", { name: "Moda Feminina" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
      /^\/fornecedores$/,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
