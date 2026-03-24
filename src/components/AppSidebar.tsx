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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-gradient-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary-btn flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-foreground tracking-tight">
                EmpreendaJá
              </span>
              <span className="text-[10px] text-foreground/60 font-medium">com Soph</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-foreground/70 hover:text-foreground hover:bg-muted/40"
                      activeClassName="bg-primary/10 text-primary font-medium border border-primary/20 shadow-glow-sm"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-3 border-t border-foreground/10" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-foreground/70 hover:text-foreground hover:bg-muted/40 ${
                        item.url === "/soph" ? "text-primary/90" : ""
                      }`}
                      activeClassName="bg-primary/10 text-primary font-medium border border-primary/20 shadow-glow-sm"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="bg-gradient-highlight rounded-xl p-4 border border-accent/30 shadow-glow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Soph diz:</span>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              "Precisa de ajuda? Estou aqui para te orientar!"
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
