import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — CarteraApp" }] }),
  component: () => (
    <AppLayout allowedRoles={["Administrador", "Líder", "Cobrador"]}>
      <PlaceholderPage title="Clientes" description="Administra tu cartera de clientes." />
    </AppLayout>
  ),
});

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
