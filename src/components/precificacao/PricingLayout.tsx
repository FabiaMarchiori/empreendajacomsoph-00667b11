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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Top horizontal nav */}
      <div className="sticky top-0 z-30 border-b border-border/40" style={{ background: "#041329" }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => navigate("/gestao")}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#00EFFF] transition-colors mr-4 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Gestão
            </button>

            <div className="h-5 w-px bg-white/10 mr-3" />

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold whitespace-nowrap transition-all",
                      isActive
                        ? "text-[#062638] shadow-[0_0_16px_rgba(0,239,255,0.25)]"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 50%, #00EFFF 100%)" }
                      : undefined
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-8">
        <Outlet />
      </main>
    </div>
  );
}
