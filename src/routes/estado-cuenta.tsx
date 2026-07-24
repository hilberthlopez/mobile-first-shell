import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { ClientStatement } from "@/components/client-statement";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/estado-cuenta")({
  head: () => ({
    meta: [
      { title: "Mi Estado de Cuenta — CarteraApp" },
      { name: "description", content: "Consulta el progreso de tu préstamo, saldo e historial de pagos." },
      { property: "og:title", content: "Mi Estado de Cuenta — CarteraApp" },
      { property: "og:description", content: "Consulta el progreso de tu préstamo, saldo e historial de pagos." },
    ],
  }),
  component: StatementPage,
});

function StatementPage() {
  const { user } = useAuth();
  return (
    <AppLayout allowedRoles={["Cliente"]}>
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <ClientStatement userName={user?.name} />
      </div>
    </AppLayout>
  );
}
