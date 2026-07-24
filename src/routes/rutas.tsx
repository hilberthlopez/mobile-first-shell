import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { DailyRouteList } from "@/components/daily-route-list";

export const Route = createFileRoute("/rutas")({
  head: () => ({
    meta: [
      { title: "Gestión de Ruta — CarteraApp" },
      { name: "description", content: "Ruta diaria de cobros y visitas." },
      { property: "og:title", content: "Gestión de Ruta — CarteraApp" },
      { property: "og:description", content: "Ruta diaria de cobros y visitas." },
    ],
  }),
  component: () => (
    <AppLayout allowedRoles={["Administrador", "Líder", "Cobrador"]}>
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gestión de Ruta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Clientes a visitar hoy, en orden secuencial.</p>
        <div className="mt-4">
          <DailyRouteList />
        </div>
      </div>
    </AppLayout>
  ),
});
