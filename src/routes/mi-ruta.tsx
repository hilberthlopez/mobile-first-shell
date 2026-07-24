import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/mi-ruta")({
  head: () => ({ meta: [{ title: "Mi Ruta — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Cobrador"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mi Ruta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tus visitas y cobros del día.</p>
      </div>
    </AppLayout>
  ),
});
