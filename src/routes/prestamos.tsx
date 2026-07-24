import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { LoanDisbursement } from "@/components/loan-disbursement";

export const Route = createFileRoute("/prestamos")({
  head: () => ({
    meta: [
      { title: "Gestión de Préstamos — CarteraApp" },
      { name: "description", content: "Registra desembolsos con plazo de 25 días e interés fijo del 25%." },
      { property: "og:title", content: "Gestión de Préstamos — CarteraApp" },
      { property: "og:description", content: "Registra desembolsos con plazo de 25 días e interés fijo del 25%." },
    ],
  }),
  component: () => (
    <AppLayout allowedRoles={["Administrador", "Líder"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gestión de Préstamos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra un nuevo desembolso. Plazo 25 días · Interés fijo 25%.
          </p>
        </div>
        <LoanDisbursement />
      </div>
    </AppLayout>
  ),
});
