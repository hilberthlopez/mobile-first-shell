import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/rutas")({
  head: () => ({ meta: [{ title: "Gestión de Ruta — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Administrador", "Líder"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gestión de Ruta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Planifica y organiza las rutas.</p>
      </div>
    </AppLayout>
  ),
});
