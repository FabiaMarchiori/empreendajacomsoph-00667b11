import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SophFloatingButton } from "@/components/SophFloatingButton";
import { Footer } from "@/components/Footer";
import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function LayoutHeader() {
  const { isMobile } = useSidebar();
  
  return (
    <header className="h-14 flex items-center border-b border-border px-4 sticky top-0 z-20" style={{ background: '#041329' }}>
      {!isMobile && <SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      {isMobile && <SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
    </header>
  );
}

export function AppLayout() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <LayoutHeader />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
            <Footer />
          </div>
          <SophFloatingButton />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
