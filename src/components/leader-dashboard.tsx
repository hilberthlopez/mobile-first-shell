import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, Wallet, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DAILY_COLLECTIONS } from "@/services/mockData";
import { buildRouteList, paidForLoan, useDataStore } from "@/store/data-store";
import { useAuth } from "@/context/auth-context";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const compact = (n: number) =>
  new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const chartConfig = {
  monto: { label: "Recaudo", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const PAGE_SIZE = 5;

export function LeaderDashboard({ userName, role }: { userName?: string; role?: string }) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const users = useDataStore((s) => s.users);
  const clients = useDataStore((s) => s.clients);
  const loans = useDataStore((s) => s.loans);
  const payments = useDataStore((s) => s.payments);

  // Alcance: Admin ve todo; Líder ve solo su equipo.
  const scopedCollectors = useMemo(() => {
    const all = users.filter((u) => u.role === "Cobrador");
    return user?.role === "Líder" ? all.filter((c) => c.leaderId === user.id) : all;
  }, [users, user]);

  const scopedClients = useMemo(() => {
    return user?.role === "Líder"
      ? clients.filter((c) => c.leaderId === user.id)
      : clients;
  }, [clients, user]);

  const scopedLoans = useMemo(
    () => loans.filter((l) => scopedClients.some((c) => c.id === l.clientId)),
    [loans, scopedClients],
  );

  const scopedPayments = useMemo(
    () => payments.filter((p) => scopedLoans.some((l) => l.id === p.loanId)),
    [payments, scopedLoans],
  );

  const routeView = useMemo(
    () => buildRouteList(scopedClients, scopedLoans, scopedPayments),
    [scopedClients, scopedLoans, scopedPayments],
  );

  const totalLent = scopedLoans.reduce((s, l) => s + l.capital, 0);
  const outstanding = scopedLoans.reduce(
    (s, l) => s + Math.max(0, l.total - paidForLoan(scopedPayments, l.id)),
    0,
  );
  const capitalAtRisk = routeView
    .filter((c) => c.status === "atrasado")
    .reduce((s, c) => s + c.totalDebt, 0);
  const overdueCount = routeView.filter((c) => c.status === "atrasado").length;
  const activeLoans = scopedLoans.filter(
    (l) => paidForLoan(scopedPayments, l.id) < l.total,
  ).length;

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const dailyCollected = scopedPayments
    .filter((p) => isToday(p.date))
    .reduce((s, p) => s + p.amount, 0);
  const goalDaily = scopedCollectors.reduce((s, c) => s + (c.goal ?? 0), 0);
  const goalPct = goalDaily ? Math.round((dailyCollected / goalDaily) * 100) : 0;

  const summary = [
    { title: "Monto Total Prestado", value: totalLent, hint: `${activeLoans} préstamos activos · saldo ${currency(outstanding)}`, icon: Wallet, tone: "text-primary" },
    { title: "Recaudo Diario", value: dailyCollected, hint: goalDaily ? `Hoy · ${goalPct}% de la meta (${currency(goalDaily)})` : "Sin meta configurada", icon: TrendingUp, tone: "text-emerald-600 dark:text-emerald-400" },
    { title: "Capital en Riesgo", value: capitalAtRisk, hint: `${overdueCount} cuentas atrasadas`, icon: AlertTriangle, tone: "text-rose-600 dark:text-rose-400" },
  ];

  const chartData = useMemo(() => {
    const base = DAILY_COLLECTIONS.map((d) => ({ ...d }));
    if (base.length && dailyCollected) {
      base[base.length - 1] = {
        ...base[base.length - 1],
        monto: base[base.length - 1].monto + dailyCollected,
      };
    }
    return base;
  }, [dailyCollected]);

  // Filas del leaderboard: derivadas por cobrador
  const rows = useMemo(() => {
    return scopedCollectors.map((col) => {
      const colClients = scopedClients.filter((c) => c.assignedCollectorId === col.id);
      const colLoans = scopedLoans.filter((l) => colClients.some((c) => c.id === l.clientId));
      const collectedToday = scopedPayments
        .filter((p) => p.collectorId === col.id && isToday(p.date))
        .reduce((s, p) => s + p.amount, 0);
      const overdue = routeView.filter(
        (r) => r.assignedCollectorId === col.id && r.status === "atrasado",
      ).length;
      return {
        id: col.id,
        name: col.name,
        route: col.route ?? "—",
        isActive: col.isActive,
        activeLoans: colLoans.length,
        collected: collectedToday,
        goal: col.goal ?? 0,
        overdue,
      };
    });
  }, [scopedCollectors, scopedClients, scopedLoans, scopedPayments, routeView]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [rows, page],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          ¡Bienvenido, {userName}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de actividad para tu rol de <span className="font-medium">{role}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((m) => (
          <Card key={m.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <m.icon className={`h-4 w-4 ${m.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency(m.value)}</div>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recaudo semanal</CardTitle>
          <CardDescription>Monto cobrado por día en la última semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[420px]">
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v) => compact(Number(v))}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => currency(Number(v))} />} />
                  <Bar dataKey="monto" fill="var(--color-monto)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rendimiento de cobradores</CardTitle>
          <CardDescription>Comparativa de recaudo vs. meta diaria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cobrador</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Préstamos</TableHead>
                  <TableHead className="text-right">Recaudo hoy</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                  <TableHead className="text-right">% Meta</TableHead>
                  <TableHead className="text-right">Atrasos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((c) => {
                  const pct = c.goal ? Math.round((c.collected / c.goal) * 100) : 0;
                  const tone =
                    pct >= 90 ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                    : pct >= 50 ? "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400"
                    : "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.route}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={c.isActive ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}>
                          {c.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{c.activeLoans}</TableCell>
                      <TableCell className="text-right">{currency(c.collected)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency(c.goal)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={tone}>{pct}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">{c.overdue}</TableCell>
                    </TableRow>
                  );
                })}
                {!pageRows.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      No hay cobradores en tu alcance.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {page + 1} de {totalPages} · {rows.length} cobradores
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
