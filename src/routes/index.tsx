import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CarteraApp" },
      { name: "description", content: "Panel de control de CarteraApp." },
      { property: "og:title", content: "Dashboard — CarteraApp" },
      { property: "og:description", content: "Panel de control de CarteraApp." },
    ],
  }),
  component: Dashboard,
});

const metrics = [
  { title: "Ventas del día", icon: TrendingUp },
  { title: "Clientes visitados", icon: Users },
  { title: "Rutas completadas", icon: RouteIcon },
];

function Dashboard() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            ¡Bienvenido de nuevo! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí tienes un resumen de la actividad de hoy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.title} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.title}
                </CardTitle>
                <m.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="mt-1 text-xs text-muted-foreground">Sin datos aún</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
