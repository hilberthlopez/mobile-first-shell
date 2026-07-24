import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/store/data-store";
import { useAuth } from "@/context/auth-context";
import { useMemo } from "react";

export const Route = createFileRoute("/cobradores")({
  head: () => ({ meta: [{ title: "Mis Cobradores — CarteraApp" }] }),
  component: CobradoresPage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

function CobradoresPage() {
  const { user } = useAuth();
  const users = useDataStore((s) => s.users);
  const clients = useDataStore((s) => s.clients);
  const toggleCollectorActive = useDataStore((s) => s.toggleCollectorActive);
  const assignClientToCollector = useDataStore((s) => s.assignClientToCollector);

  const myCollectors = useMemo(
    () => users.filter((u) => u.role === "Cobrador" && u.leaderId === user?.id),
    [users, user],
  );
  const myClients = useMemo(
    () => clients.filter((c) => c.leaderId === user?.id),
    [clients, user],
  );

  return (
    <AppLayout allowedRoles={["Líder"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mis Cobradores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activa o desactiva cobradores y reasigna a tus clientes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {myCollectors.map((c) => {
            const assigned = myClients.filter((cl) => cl.assignedCollectorId === c.id);
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <CardDescription>{c.route ?? "Sin ruta"} · Meta {currency(c.goal ?? 0)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`sw-${c.id}`} className="text-xs text-muted-foreground">
                        {c.isActive ? "Activo" : "Inactivo"}
                      </Label>
                      <Switch id={`sw-${c.id}`} checked={c.isActive} onCheckedChange={() => toggleCollectorActive(c.id)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Clientes asignados ({assigned.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assigned.map((cl) => (
                      <Badge key={cl.id} variant="outline">{cl.name}</Badge>
                    ))}
                    {assigned.length === 0 && (
                      <p className="text-sm text-muted-foreground">Ningún cliente asignado aún.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {myCollectors.length === 0 && (
            <p className="text-sm text-muted-foreground">No tienes cobradores asignados.</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reasignar clientes</CardTitle>
            <CardDescription>
              El líder es el dueño del cliente y puede asignarlo a cualquier cobrador de su equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {myClients.map((cl) => (
              <div key={cl.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{cl.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{cl.business}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={cl.assignedCollectorId ?? ""}
                    onValueChange={(v) => assignClientToCollector(cl.id, v)}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      {myCollectors.map((c) => (
                        <SelectItem key={c.id} value={c.id} disabled={!c.isActive}>
                          {c.name} {!c.isActive && "(inactivo)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {myClients.length === 0 && (
              <p className="text-sm text-muted-foreground">No tienes clientes en tu cartera.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
