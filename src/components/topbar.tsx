import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0 flex-1" />
      <Button variant="ghost" size="icon" className="shrink-0">
        <Bell className="h-4 w-4" />
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium leading-tight">Usuario Activo</p>
          <p className="truncate text-xs text-muted-foreground leading-tight">
            usuario@carteraapp.com
          </p>
        </div>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">UA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
