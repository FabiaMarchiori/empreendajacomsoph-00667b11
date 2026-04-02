import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Calculator, Store, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/gestao/precificacao", label: "Visão Geral", icon: LayoutDashboard, end: true },
  { to: "/gestao/precificacao/simulador", label: "Simulador", icon: Calculator, end: false },
  { to: "/gestao/precificacao/canais", label: "Canais e Taxas", icon: Store, end: false },
  { to: "/gestao/precificacao/configuracoes", label: "Configurações", icon: Settings, end: false },
];

export default function PricingLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar interna */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border/40 bg-[#041329] py-6 px-3 gap-1">
        <button
          onClick={() => navigate("/gestao")}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-5 px-3"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar para Gestão
        </button>

        <p
          className="px-3 mb-4 text-xs font-extrabold uppercase tracking-widest bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}
        >
          Precificação
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-gradient-to-r from-[#F2FBFF] via-[#9EEBFF] to-[#00EFFF] text-[#062638] shadow-[0_0_20px_rgba(0,239,255,0.25)]"
                  : "text-foreground/80 hover:bg-muted/30 hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#041329] border-t border-border/40 flex justify-around py-2 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all",
                isActive
                  ? "text-[#00EFFF]"
                  : "text-foreground/60"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Mobile back button */}
      <div className="lg:hidden absolute top-4 left-4 z-30">
        <button
          onClick={() => navigate("/gestao")}
          className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Gestão
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
