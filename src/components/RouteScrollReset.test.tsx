import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RouteScrollReset } from "./RouteScrollReset";

function Navigation() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <button onClick={() => navigate("/gestao")}>Gestão</button>
      <button onClick={() => navigate("/gestao?filtro=novo")}>Filtro</button>
      <button onClick={() => navigate("/gestao#secao")}>Âncora</button>
      <button onClick={() => navigate(-1)}>Voltar</button>
      <button onClick={() => navigate(1)}>Avançar</button>
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Recolher" : "Expandir"}
      </button>
    </>
  );
}

function setup() {
  const appScroll = vi.fn();
  const pricingScroll = vi.fn();
  const chatScroll = vi.fn();
  const fixture = document.createElement("div");
  fixture.innerHTML =
    '<main data-route-scroll-container><main data-route-scroll-container></main><div class="soph-messages"></div></main>';
  fixture.querySelectorAll("main")[0].scrollTo = appScroll;
  fixture.querySelectorAll("main")[1].scrollTo = pricingScroll;
  const chat = fixture.querySelector<HTMLElement>(".soph-messages")!;
  chat.scrollTo = chatScroll;
  chat.scrollTop = 240;
  document.body.append(fixture);
  const view = render(
    <MemoryRouter initialEntries={["/estruture"]}>
      <RouteScrollReset />
      <Navigation />
    </MemoryRouter>,
  );
  return { ...view, fixture, appScroll, pricingScroll, chatScroll, chat };
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.scrollRestoration = "auto";
});
afterEach(() => {
  cleanup();
  document.querySelectorAll("body > div").forEach((e) => e.remove());
  vi.restoreAllMocks();
});

describe("RouteScrollReset", () => {
  it("inicia a página e os containers declarados no topo, sem rolagem suave", () => {
    const { appScroll, pricingScroll, chatScroll, chat } = setup();
    const position = { top: 0, left: 0, behavior: "instant" };
    expect(window.scrollTo).toHaveBeenCalledWith(position);
    expect(appScroll).toHaveBeenCalledWith(position);
    expect(pricingScroll).toHaveBeenCalledWith(position);
    expect(chatScroll).not.toHaveBeenCalled();
    expect(chat.scrollTop).toBe(240);
    fireEvent.click(screen.getByText("Gestão"));
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(appScroll).toHaveBeenCalledTimes(2);
    expect(pricingScroll).toHaveBeenCalledTimes(2);
    expect(chatScroll).not.toHaveBeenCalled();
  });

  it("não reinicia ao expandir conteúdo ou alterar query/hash na mesma página", () => {
    setup();
    fireEvent.click(screen.getByText("Gestão"));
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByText("Expandir"));
    fireEvent.click(screen.getByText("Filtro"));
    fireEvent.click(screen.getByText("Âncora"));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("reinicia também no histórico ao voltar ou avançar entre páginas", () => {
    const { appScroll } = setup();
    fireEvent.click(screen.getByText("Gestão"));
    fireEvent.click(screen.getByText("Voltar"));
    fireEvent.click(screen.getByText("Avançar"));
    expect(window.scrollTo).toHaveBeenCalledTimes(4);
    expect(appScroll).toHaveBeenCalledTimes(4);
  });

  it("desativa a restauração automática enquanto montado e restaura ao sair", () => {
    const { unmount } = setup();
    expect(window.history.scrollRestoration).toBe("manual");
    unmount();
    expect(window.history.scrollRestoration).toBe("auto");
  });
});
