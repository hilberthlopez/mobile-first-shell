import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore } from "@/store/data-store";
import { useMemo } from "react";

export const Route = createFileRoute("/lideres")({
  head: () => ({ meta: [{ title: "Todos los Líderes — CarteraApp" }] }),
  component: LideresPage,
});

function LideresPage() {
  const users = useDataStore((s) => s.users);
  const clients = useDataStore((s) => s.clients);
  const loans = useDataStore((s) => s.loans);

  const leaders = useMemo(() => users.filter((u) => u.role === "Líder"), [users]);

  return (
    <AppLayout allowedRoles={["Administrador"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Todos los Líderes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vista exclusiva de administrador para supervisar a todos los líderes y su equipo.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipos por líder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto rounded-md border">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Líder</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead className="text-right">Cobradores</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Capital colocado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((l) => {
                    const colls = users.filter((u) => u.role === "Cobrador" && u.leaderId === l.id);
                    const cls = clients.filter((c) => c.leaderId === l.id);
                    const capital = loans
                      .filter((ln) => cls.some((c) => c.id === ln.clientId))
                      .reduce((s, ln) => s + ln.capital, 0);
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-muted-foreground">{l.email}</TableCell>
                        <TableCell className="text-right">{colls.length}</TableCell>
                        <TableCell className="text-right">{cls.length}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(capital)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {leaders.map((l) => {
          const colls = users.filter((u) => u.role === "Cobrador" && u.leaderId === l.id);
          return (
            <Card key={l.id}>
              <CardHeader>
                <CardTitle className="text-base">{l.name} — Cobradores</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {colls.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin cobradores asignados.</p>
                )}
                {colls.map((c) => (
                  <Badge key={c.id} variant="outline" className="gap-2">
                    {c.name} · {c.route}
                    <span className={c.isActive ? "text-emerald-600" : "text-muted-foreground"}>
                      {c.isActive ? "activo" : "inactivo"}
                    </span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
