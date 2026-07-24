import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/context/auth-context";
import { LeaderDashboard } from "@/components/leader-dashboard";

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

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cobrador y Cliente no tienen acceso al dashboard general — se redirigen.
  useEffect(() => {
    if (user?.role === "Cobrador") navigate({ to: "/mi-ruta", replace: true });
    else if (user?.role === "Cliente") navigate({ to: "/estado-cuenta", replace: true });
  }, [user, navigate]);

  return (
    <AppLayout allowedRoles={["Administrador", "Líder"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LeaderDashboard userName={user?.name} role={user?.role} />
      </div>
    </AppLayout>
  );
}

