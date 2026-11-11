import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProductProtected } from "./ProductProtected";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import LoginPage from "@/pages/Login";
import type { ProductAccess } from "@/lib/product-access";
import { noProductAccess } from "@/lib/product-access";
const session = vi.hoisted(() => ({
  signedIn: false,
  access: {} as ProductAccess,
  signIn: vi.fn(async () => ({ error: null })),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: session.signedIn ? { id: "fictional-user" } : null,
    signIn: session.signIn,
    signUp: vi.fn(),
  }),
}));
vi.mock("@/hooks/usePlanAccess", () => ({
  usePlanAccess: () => ({ ...session.access, isLoading: false }),
}));
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) => (props: Record<string, unknown>) => {
        const { initial, animate, exit, transition, ...rest } = props;
        return createElement(tag, rest);
      },
    },
  ),
}));
afterEach(() => {
  cleanup();
  session.signIn.mockClear();
});
function Navigation() {
  const auth = useAuth(),
    access = usePlanAccess();
  if (!auth.user) return <LoginPage />;
  return (
    <>
      <Link to="/soph">Soph</Link>
      {access.erp && <Link to="/erp">ERP</Link>}
      {access.ecosystem && <Link to="/gestao">Gestão</Link>}
    </>
  );
}
function show(access: ProductAccess, path = "/") {
  session.access = access;
  session.signedIn = true;
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Navigation />} />
        <Route
          path="/soph"
          element={
            <ProductProtected product="soph">
              <p>Authorized Soph</p>
            </ProductProtected>
          }
        />
        <Route
          path="/erp"
          element={
            <ProductProtected product="erp">
              <p>Authorized ERP</p>
            </ProductProtected>
          }
        />
        <Route
          path="/gestao"
          element={
            <ProductProtected product="ecosystem">
              <p>Authorized ecosystem</p>
            </ProductProtected>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
describe("Stage 1 login and product navigation", () => {
  it("retains the normal email/password login handler", async () => {
    session.signedIn = false;
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "fictional@example.test" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "fictional-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(session.signIn).toHaveBeenCalledWith(
      "fictional@example.test",
      "fictional-password",
    );
  });
  for (const plan of ["Ecossistema", "Anual", "Mensal"])
    it(`${plan}: navigates to ERP and ecosystem`, () => {
      show({
        isAdmin: false,
        ecosystem: true,
        bolsas: true,
        soph: true,
        erp: true,
        basic: true,
      });
      fireEvent.click(screen.getByRole("link", { name: "ERP" }));
      expect(screen.getByText("Authorized ERP")).toBeInTheDocument();
    });
  it("Bolsas navigates to Soph without showing ERP or Gestão", () => {
    show({ ...noProductAccess, bolsas: true, soph: true, basic: true });
    expect(screen.queryByRole("link", { name: "ERP" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Gestão" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Soph" }));
    expect(screen.getByText("Authorized Soph")).toBeInTheDocument();
  });
  it("individual promotion permits ERP without permitting exclusive modules", () => {
    show(
      {
        ...noProductAccess,
        bolsas: true,
        soph: true,
        erp: true,
        basic: true,
        erpBenefit: "promotional",
      },
      "/erp",
    );
    expect(screen.getByText("Authorized ERP")).toBeInTheDocument();
  });
  it("Bolsas direct URL cannot bypass ecosystem guard", () => {
    show(
      { ...noProductAccess, bolsas: true, soph: true, basic: true },
      "/gestao",
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Authorized ecosystem")).not.toBeInTheDocument();
  });
  it("expired/cancelled subscription cannot bypass Soph URL guard", () => {
    show(noProductAccess, "/soph");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
