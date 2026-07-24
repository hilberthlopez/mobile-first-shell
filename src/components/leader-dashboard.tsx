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
import { COLLECTORS, DAILY_COLLECTIONS, DASHBOARD_TOTALS } from "@/services/mockData";
import { useDataStore } from "@/store/data-store";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const compact = (n: number) =>
  new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const chartConfig = {
  monto: { label: "Recaudo", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const PAGE_SIZE = 5;

export function LeaderDashboard({ userName, role }: { userName?: string; role?: string }) {
  const [page, setPage] = useState(0);
  const payments = useDataStore((s) => s.payments);
  const clients = useDataStore((s) => s.clients);
  const totalPages = Math.ceil(COLLECTORS.length / PAGE_SIZE);
  const pageRows = useMemo(
    () => COLLECTORS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [page],
  );

  const liveCollectedToday = useMemo(() => {
    const today = new Date().toDateString();
    return payments
      .filter((p) => new Date(p.date).toDateString() === today)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const dailyCollected = DASHBOARD_TOTALS.baseDailyCollected + liveCollectedToday;
  const goalPct = Math.round((dailyCollected / DASHBOARD_TOTALS.goalDaily) * 100);
  const overdueLive = clients.filter((c) => c.status === "atrasado").length;

  const summary = [
    { title: "Monto Total Prestado", value: DASHBOARD_TOTALS.totalLent, hint: `${DASHBOARD_TOTALS.activeLoans} préstamos activos`, icon: Wallet, tone: "text-primary" },
    { title: "Recaudo Diario", value: dailyCollected, hint: `Hoy · ${goalPct}% de la meta${payments.length ? ` · ${payments.length} pagos hoy` : ""}`, icon: TrendingUp, tone: "text-emerald-600 dark:text-emerald-400" },
    { title: "Capital en Riesgo", value: DASHBOARD_TOTALS.capitalAtRisk, hint: `${DASHBOARD_TOTALS.overdueAccounts + overdueLive} cuentas atrasadas`, icon: AlertTriangle, tone: "text-rose-600 dark:text-rose-400" },
  ];

  const chartData = useMemo(() => {
    const base = DAILY_COLLECTIONS.map((d) => ({ ...d }));
    if (base.length && liveCollectedToday) {
      base[base.length - 1] = {
        ...base[base.length - 1],
        monto: base[base.length - 1].monto + liveCollectedToday,
      };
    }
    return base;
  }, [liveCollectedToday]);

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
                <BarChart data={DAILY_COLLECTIONS} margin={{ left: 4, right: 8, top: 8 }}>
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
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cobrador</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead className="text-right">Préstamos</TableHead>
                  <TableHead className="text-right">Recaudado</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                  <TableHead className="text-right">% Meta</TableHead>
                  <TableHead className="text-right">Atrasos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((c) => {
                  const pct = Math.round((c.collected / c.goal) * 100);
                  const tone =
                    pct >= 90 ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                    : pct >= 70 ? "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400"
                    : "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.route}</TableCell>
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
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {page + 1} de {totalPages} · {COLLECTORS.length} cobradores
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
