import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Route as RouteIcon,
  Wallet,
  UserCog,
  UsersRound,
  MapPin,
  FileText,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, type Role } from "@/context/auth-context";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const MENUS: Record<Role, NavItem[]> = {
  Administrador: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Todos los Líderes", url: "/lideres", icon: UserCog },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Préstamos", url: "/prestamos", icon: HandCoins },
    { title: "Gestión de Ruta", url: "/rutas", icon: RouteIcon },
  ],
  Líder: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Mis Cobradores", url: "/cobradores", icon: UsersRound },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Préstamos", url: "/prestamos", icon: HandCoins },
    { title: "Gestión de Ruta", url: "/rutas", icon: RouteIcon },
  ],
  // Cobrador: acceso restringido — solo Mi Ruta.
  Cobrador: [
    { title: "Mi Ruta", url: "/mi-ruta", icon: MapPin },
  ],
  Cliente: [
    { title: "Mi Estado de Cuenta", url: "/estado-cuenta", icon: FileText },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const items = user ? MENUS[user.role] : [];

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
            CarteraApp
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role ?? "Navegación"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
