import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SophFloatingButton } from "@/components/SophFloatingButton";
import { Footer } from "@/components/Footer";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 sticky top-0 z-30" style={{ background: 'rgba(10, 25, 47, 0.85)', backdropFilter: 'blur(12px)' }}>
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
        <SophFloatingButton />
      </div>
    </SidebarProvider>
  );
}
