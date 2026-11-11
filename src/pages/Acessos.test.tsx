import { createElement, type ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { noProductAccess, type ProductAccess } from "@/lib/product-access";
const state = vi.hoisted(() => ({ access: {} as Record<string, boolean> }));
vi.mock("@/hooks/usePlanAccess", () => ({
  usePlanAccess: () => ({ ...state.access, isLoading: false }),
}));
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) => (props: Record<string, unknown>) => {
        const {
          initial,
          animate,
          variants,
          whileHover,
          whileTap,
          transition,
          ...rest
        } = props;
        return createElement(tag, rest);
      },
    },
  ),
}));
import AcessosPage from "./Acessos";
afterEach(cleanup);
function show(access: ProductAccess) {
  state.access = { ...access };
  render(
    <MemoryRouter>
      <AcessosPage />
    </MemoryRouter>,
  );
}
describe("Meus Acessos reflects server entitlements", () => {
  for (const plan of ["Ecossistema", "Anual", "Mensal"])
    it(`${plan}: includes ERP, Soph and pricing`, () => {
      show({
        isAdmin: false,
        ecosystem: true,
        bolsas: true,
        soph: true,
        erp: true,
        basic: true,
      });
      expect(screen.getByText("ERP – Soph Gestão")).toBeInTheDocument();
      expect(screen.getByText("Sistema de Precificação")).toBeInTheDocument();
      expect(screen.getByText("Soph, sua Sócia Digital")).toBeInTheDocument();
    });
  it("Bolsas includes Soph and the niche, without automatic ERP or pricing", () => {
    show({ ...noProductAccess, bolsas: true, soph: true, basic: true });
    expect(screen.getByText("Bolsas, Mochilas e Malas")).toBeInTheDocument();
    expect(screen.getByText("Soph, sua Sócia Digital")).toBeInTheDocument();
    expect(screen.queryByText("ERP – Soph Gestão")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Sistema de Precificação"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Importadoras 25 de Março"),
    ).not.toBeInTheDocument();
  });
  it("individual ERP promotion does not grant ecosystem pricing", () => {
    show({
      ...noProductAccess,
      bolsas: true,
      soph: true,
      erp: true,
      basic: true,
    });
    expect(screen.getByText("ERP – Soph Gestão")).toBeInTheDocument();
    expect(
      screen.queryByText("Sistema de Precificação"),
    ).not.toBeInTheDocument();
  });
  it("no signature or expired/cancelled access shows no acquired benefits", () => {
    show(noProductAccess);
    expect(screen.queryByText("ERP – Soph Gestão")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Soph, sua Sócia Digital"),
    ).not.toBeInTheDocument();
  });
});

import { SophFloatingButton } from '@/components/SophFloatingButton';
describe('Soph entry follows the server entitlement',()=>{
 it('ERP-only or unsubscribed client is not offered a Soph entry',()=>{
  state.access={...noProductAccess,erp:true};render(<MemoryRouter><SophFloatingButton /></MemoryRouter>);
  expect(screen.queryByRole('button',{name:'Abrir Soph'})).not.toBeInTheDocument();
 });
 it('Bolsas client can open Soph',()=>{
  state.access={...noProductAccess,bolsas:true,soph:true};render(<MemoryRouter><SophFloatingButton /></MemoryRouter>);
  expect(screen.getByRole('button',{name:'Abrir Soph'})).toBeInTheDocument();
 });
});
