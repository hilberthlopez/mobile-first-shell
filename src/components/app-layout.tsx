import { type ReactNode, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { registerServiceWorker } from "@/lib/register-sw";
import type { Role } from "@/context/auth-context";

export function AppLayout({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/30">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
