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
            style={{ background: 'linear-gradient(135deg, #00FFFF 0%, #007A7A 100%)' }}
          >
            <Sparkles className="h-5 w-5 text-primary-foreground" />
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
              {mainItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                          active
                            ? ""
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                        }`}
                        activeClassName="text-primary font-semibold border border-primary/30 shadow-glow-sm"
                        style={active ? { background: 'linear-gradient(135deg, rgba(0,255,255,0.12) 0%, rgba(0,122,122,0.08) 100%)' } : undefined}
                      >
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-3 border-t border-foreground/10" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                    >
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                          active
                            ? ""
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                        } ${item.url === "/soph" && !active ? "text-primary/90" : ""}`}
                        activeClassName="text-primary font-semibold border border-primary/30 shadow-glow-sm"
                        style={active ? { background: 'linear-gradient(135deg, rgba(0,255,255,0.12) 0%, rgba(0,122,122,0.08) 100%)' } : undefined}
                      >
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div
            className="rounded-xl p-4 border border-primary/15"
            style={{ background: 'linear-gradient(135deg, #007A7A 0%, #102A43 100%)' }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Soph diz:</span>
            </div>
            <p className="text-[11px] text-foreground/90 leading-relaxed">
              "Precisa de ajuda? Estou aqui para te orientar!"
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
