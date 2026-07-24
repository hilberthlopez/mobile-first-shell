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

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const compact = (n: number) =>
  new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const SUMMARY = [
  { title: "Monto Total Prestado", value: 285_400_000, hint: "42 préstamos activos", icon: Wallet, tone: "text-primary" },
  { title: "Recaudo Diario", value: 14_780_000, hint: "Hoy · 78% de la meta", icon: TrendingUp, tone: "text-emerald-600 dark:text-emerald-400" },
  { title: "Capital en Riesgo", value: 18_950_000, hint: "6 cuentas atrasadas", icon: AlertTriangle, tone: "text-rose-600 dark:text-rose-400" },
];

const DAILY_COLLECTIONS = [
  { day: "Lun", monto: 12_400_000 },
  { day: "Mar", monto: 13_800_000 },
  { day: "Mié", monto: 11_900_000 },
  { day: "Jue", monto: 15_200_000 },
  { day: "Vie", monto: 14_780_000 },
  { day: "Sáb", monto: 16_500_000 },
  { day: "Dom", monto: 8_300_000 },
];

interface Collector {
  id: string;
  name: string;
  route: string;
  activeLoans: number;
  collected: number;
  goal: number;
  overdue: number;
}

const COLLECTORS: Collector[] = [
  { id: "1", name: "Andrés Molina", route: "Ruta Norte", activeLoans: 22, collected: 4_200_000, goal: 5_000_000, overdue: 1 },
  { id: "2", name: "Diana Rojas", route: "Ruta Centro", activeLoans: 18, collected: 3_850_000, goal: 4_000_000, overdue: 0 },
  { id: "3", name: "Felipe Cano", route: "Ruta Sur", activeLoans: 25, collected: 3_100_000, goal: 5_500_000, overdue: 3 },
  { id: "4", name: "Marcela Díaz", route: "Ruta Occidente", activeLoans: 15, collected: 2_900_000, goal: 3_200_000, overdue: 1 },
  { id: "5", name: "Julián Pardo", route: "Ruta Oriente", activeLoans: 20, collected: 3_600_000, goal: 4_500_000, overdue: 2 },
  { id: "6", name: "Camila Vega", route: "Ruta Norte 2", activeLoans: 17, collected: 3_050_000, goal: 3_800_000, overdue: 0 },
  { id: "7", name: "Óscar Bermúdez", route: "Ruta Centro 2", activeLoans: 19, collected: 2_700_000, goal: 4_100_000, overdue: 2 },
  { id: "8", name: "Paola Suárez", route: "Ruta Sur 2", activeLoans: 21, collected: 4_050_000, goal: 4_800_000, overdue: 1 },
  { id: "9", name: "Ricardo Peña", route: "Ruta Occidente 2", activeLoans: 16, collected: 2_400_000, goal: 3_500_000, overdue: 1 },
  { id: "10", name: "Sara Ortiz", route: "Ruta Oriente 2", activeLoans: 14, collected: 2_800_000, goal: 3_000_000, overdue: 0 },
  { id: "11", name: "Tomás Herrera", route: "Ruta Norte 3", activeLoans: 23, collected: 3_900_000, goal: 5_200_000, overdue: 2 },
  { id: "12", name: "Valentina Cruz", route: "Ruta Centro 3", activeLoans: 18, collected: 3_400_000, goal: 4_000_000, overdue: 1 },
];

const chartConfig = {
  monto: { label: "Recaudo", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const PAGE_SIZE = 5;

export function LeaderDashboard({ userName, role }: { userName?: string; role?: string }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(COLLECTORS.length / PAGE_SIZE);
  const pageRows = useMemo(
    () => COLLECTORS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [page],
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
        {SUMMARY.map((m) => (
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
