import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { ROLES, useAuth, type Role } from "@/context/auth-context";

export function Topbar() {
  const { user, logout, setRole } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0 flex-1" />

      <Button variant="ghost" size="icon" className="hidden shrink-0 sm:inline-flex">
        <Bell className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto gap-2 px-2">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium leading-tight">{user?.name ?? "Invitado"}</p>
              <p className="truncate text-xs text-muted-foreground leading-tight">
                {user?.role ?? "Sin rol"}
              </p>
            </div>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Cambiar rol (demo)
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={user?.role}
            onValueChange={(v) => setRole(v as Role)}
          >
            {ROLES.map((r) => (
              <DropdownMenuRadioItem key={r} value={r}>
                {r}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
