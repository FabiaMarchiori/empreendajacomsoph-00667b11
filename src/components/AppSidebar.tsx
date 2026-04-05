import {
  Home,
  Package,
  Briefcase,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Key,
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
import { SidebarAccountBlock } from "@/components/SidebarAccountBlock";

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
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderItem = (item: typeof mainItems[0]) => {
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            onClick={handleNavClick}
            className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm transition-all ${
              active
                ? "text-[#062638] font-bold border border-[#00EFFF]/40 shadow-[0_0_20px_-4px_rgba(0,239,255,0.35)]"
                : "text-white font-semibold hover:bg-white/5"
            }`}
            style={active ? { background: 'linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)' } : undefined}
            activeClassName=""
          >
            <item.icon className={`h-12 w-12 flex-shrink-0 ${active ? "text-[#062638]" : "text-white"}`} strokeWidth={2.2} />
            {!collapsed && <span className={`text-[15px] ${active ? "text-[#062638]" : "text-white"}`}>{item.title}</span>}
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
        background: 'linear-gradient(180deg, #041329 0%, #030E1F 100%)',
      }}
    >
      <SidebarHeader className="p-5">
        {!collapsed ? (
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-2xl text-white tracking-tight leading-tight">
              EmpreendaJá
            </span>
            <span className="text-base font-bold text-gradient-primary">com Soph</span>
          </div>
        ) : (
          <span className="font-display font-extrabold text-xs text-white text-center w-full">EJ</span>
        )}
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
        <SidebarAccountBlock collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
