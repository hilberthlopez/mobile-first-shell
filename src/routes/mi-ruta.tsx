import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { DailyRouteList } from "@/components/daily-route-list";

export const Route = createFileRoute("/mi-ruta")({
  head: () => ({
    meta: [
      { title: "Mi Ruta — CarteraApp" },
      { name: "description", content: "Visitas y cobros del día para el cobrador." },
      { property: "og:title", content: "Mi Ruta — CarteraApp" },
      { property: "og:description", content: "Visitas y cobros del día para el cobrador." },
    ],
  }),
  component: () => (
    <AppLayout allowedRoles={["Cobrador"]}>
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mi Ruta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Clientes a visitar hoy, en orden secuencial.</p>
        <div className="mt-4">
          <DailyRouteList />
        </div>
      </div>
    </AppLayout>
  ),
});
