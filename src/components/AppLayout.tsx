import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SophFloatingButton } from "@/components/SophFloatingButton";
import { Footer } from "@/components/Footer";
import { MobileNavigation } from "@/components/MobileNavigation";
import logoOficial from "@/assets/logo-oficial-cropped.png";
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function LayoutHeader() {
  return (
    <header className="h-14 flex items-center border-b border-border px-4 sticky top-0 z-20" style={{ background: '#041329' }}>
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <img src={logoOficial} alt="EmpreendaJá com Soph" className="absolute left-1/2 -translate-x-1/2 h-10 w-auto md:hidden" />
    </header>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      localStorage.setItem("empreendaja_last_page", previousPath.current);
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 pb-[calc(100px+env(safe-area-inset-bottom))] md:pb-0">
            <LayoutHeader />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
            <Footer />
          </div>
          <SophFloatingButton />
          <MobileNavigation />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
