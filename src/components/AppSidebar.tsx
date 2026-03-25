import {
  Home,
  Package,
  Briefcase,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Key,
  User,
  Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Fornecedores", url: "/fornecedores", icon: Package },
  { title: "Estruture seu Negócio", url: "/estruture", icon: Briefcase },
  { title: "Vendas e Presença", url: "/vendas", icon: TrendingUp },
  { title: "Gestão do Negócio", url: "/gestao", icon: BarChart3 },
];

const secondaryItems = [
  { title: "Soph, sua Sócia Digital", url: "/soph", icon: MessageCircle },
  { title: "Meus Acessos", url: "/acessos", icon: Key },
  { title: "Conta / Plano", url: "/conta", icon: User },
];

const GRAD = "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderItem = (item: typeof mainItems[0]) => {
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm transition-all ${
              active
                ? "text-[#0A192F] font-bold border-2 border-[#00EFFF] shadow-[0_0_16px_-3px_rgba(0,239,255,0.4)]"
                : "text-white font-semibold hover:bg-white/5"
            }`}
            activeClassName=""
            style={
              active
                ? { background: GRAD }
                : undefined
            }
          >
            <item.icon className="h-12 w-12 flex-shrink-0" strokeWidth={2.2} />
            {!collapsed && <span className="text-[15px]">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40"
      style={{
        background: 'linear-gradient(180deg, #102A43 0%, #0A192F 60%, #0A192F 100%)',
      }}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: GRAD }}
          >
            <Sparkles className="h-5 w-5 text-[#0A192F]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-white tracking-tight">
                EmpreendaJá
              </span>
              <span className="text-[10px] text-white/70 font-semibold">com Soph</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{mainItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-3 border-t border-white/10" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{secondaryItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div
            className="rounded-xl p-4 border border-[#00EFFF]/20"
            style={{ background: 'linear-gradient(135deg, #007A7A 0%, #102A43 100%)' }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: GRAD }}
              >
                <MessageCircle className="h-4 w-4 text-[#0A192F]" />
              </div>
              <span className="text-xs font-bold text-white">Soph diz:</span>
            </div>
            <p className="text-[11px] text-white/90 leading-relaxed font-medium">
              "Precisa de ajuda? Estou aqui para te orientar!"
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
