import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/lideres")({
  head: () => ({ meta: [{ title: "Todos los Líderes — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Administrador"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Todos los Líderes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vista exclusiva de administrador para supervisar a todos los líderes.
        </p>
      </div>
    </AppLayout>
  ),
});
