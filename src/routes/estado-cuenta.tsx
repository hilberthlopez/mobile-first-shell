import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/estado-cuenta")({
  head: () => ({ meta: [{ title: "Mi Estado de Cuenta — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Cliente"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mi Estado de Cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Consulta tus saldos y pagos.</p>
      </div>
    </AppLayout>
  ),
});
