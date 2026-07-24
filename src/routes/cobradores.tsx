import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/cobradores")({
  head: () => ({ meta: [{ title: "Mis Cobradores — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Líder"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mis Cobradores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cobradores asignados a tu equipo.
        </p>
      </div>
    </AppLayout>
  ),
});
