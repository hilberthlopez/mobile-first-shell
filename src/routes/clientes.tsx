import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientRegistrationStepper } from "@/components/client-registration-stepper";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — CarteraApp" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <AppLayout allowedRoles={["Administrador", "Líder", "Cobrador"]}>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra tu cartera y registra nuevos clientes.
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
            </Button>
          )}
        </div>

        {showForm ? (
          <ClientRegistrationStepper onDone={() => setShowForm(false)} />
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay clientes registrados. Presiona{" "}
              <span className="font-medium text-foreground">Nuevo cliente</span> para comenzar.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
