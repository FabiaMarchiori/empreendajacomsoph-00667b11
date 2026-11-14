import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { homeAssets } from "@/components/home/assets";
import "@/components/home/home-premium.css";

const items = [
  { title: "Início", to: "/", icon: homeAssets.navigation[0] },
  {
    title: "Fornecedores",
    to: "/fornecedores",
    icon: homeAssets.navigation[1],
  },
  { title: "Vendas", to: "/vendas", icon: homeAssets.navigation[4] },
  { title: "Gestão", to: "/gestao", icon: homeAssets.navigation[2] },
];
const moreItems = [
  { title: "Estruture seu Negócio", to: "/estruture" },
  { title: "Soph — Sua Sócia Digital", to: "/soph" },
  { title: "Meus Acessos", to: "/acessos" },
  { title: "Conta / Plano", to: "/conta" },
];
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = (to: string) =>
    to === "/"
      ? pathname === "/"
      : pathname === to || pathname.startsWith(`${to}/`);
  const moreActive =
    open ||
    moreItems.some((item) => active(item.to)) ||
    pathname.startsWith("/estrutura/");
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <nav
        className="premium-mobile-nav"
        aria-label="Navegação principal mobile"
      >
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={!open && active(item.to) ? "page" : undefined}
          >
            <img
              loading="lazy"
              src={item.icon}
              alt=""
              width="1254"
              height="1254"
            />
            <span>{item.title}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          data-active={moreActive}
        >
          <img
            loading="lazy"
            src={homeAssets.navigation[3]}
            alt=""
            width="1254"
            height="1254"
          />
          <span>Mais</span>
        </button>
      </nav>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[85dvh] overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>Mais do seu EmpreendaJá</SheetTitle>
          <SheetDescription>
            Acesse as demais áreas da sua conta.
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Mais áreas"
          className="premium-more-links grid gap-3 mt-5"
        >
          {moreItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active(item.to) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
