import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateLeaderDialog } from "@/components/create-leader-dialog";
import { useDataStore } from "@/store/data-store";

export const Route = createFileRoute("/lideres")({
  head: () => ({ meta: [{ title: "Todos los Líderes — CarteraApp" }] }),
  component: LideresPage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

function LideresPage() {
  const users = useDataStore((s) => s.users);
  const clients = useDataStore((s) => s.clients);
  const loans = useDataStore((s) => s.loans);
  const [expanded, setExpanded] = useState<string | null>(null);

  const leaders = useMemo(() => users.filter((u) => u.role === "Líder"), [users]);

  return (
    <AppLayout allowedRoles={["Administrador"]}>
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Todos los Líderes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista exclusiva de administrador para supervisar equipos completos.
            </p>
          </div>
          <CreateLeaderDialog
            trigger={
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Crear Líder
              </Button>
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipos por líder</CardTitle>
            <CardDescription>Haz clic en una fila para ver los cobradores del líder.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto rounded-md border">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
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
                    const isOpen = expanded === l.id;
                    return (
                      <Fragment key={l.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpanded(isOpen ? null : l.id)}
                        >
                          <TableCell>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium">{l.name}</TableCell>
                          <TableCell className="text-muted-foreground">{l.email}</TableCell>
                          <TableCell className="text-right">{colls.length}</TableCell>
                          <TableCell className="text-right">{cls.length}</TableCell>
                          <TableCell className="text-right">{currency(capital)}</TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 space-y-3">
                                <p className="text-sm font-medium">
                                  Cobradores de {l.name} ({colls.length})
                                </p>
                                {colls.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Este líder aún no tiene cobradores.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-md border bg-background">
                                    <Table className="min-w-[560px]">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nombre</TableHead>
                                          <TableHead>Cédula</TableHead>
                                          <TableHead>Ruta</TableHead>
                                          <TableHead>Teléfono</TableHead>
                                          <TableHead>Estado</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {colls.map((c) => (
                                          <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.cedula ?? "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.route ?? "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                                            <TableCell>
                                              <Badge
                                                variant="outline"
                                                className={
                                                  c.isActive
                                                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                                                    : "bg-muted text-muted-foreground"
                                                }
                                              >
                                                {c.isActive ? "Activo" : "Inactivo"}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                  {leaders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        Aún no hay líderes creados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
