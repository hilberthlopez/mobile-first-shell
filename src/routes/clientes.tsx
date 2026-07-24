import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — CarteraApp" },
      { name: "description", content: "Gestión de clientes en CarteraApp." },
      { property: "og:title", content: "Clientes — CarteraApp" },
      { property: "og:description", content: "Gestión de clientes en CarteraApp." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aquí podrás administrar tu cartera de clientes.
        </p>
      </div>
    </AppLayout>
  );
}
