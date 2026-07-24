import { Banknote, Building2, CalendarClock, CheckCircle2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const LOAN = {
  capital: 10_000_000,
  total: 12_500_000,
  dailyPayment: 500_000,
  termDays: 25,
  paidDays: 12,
  startDate: "05 nov 2026",
  endDate: "30 nov 2026",
};

type PayMethod = "efectivo" | "deposito";
const PAYMENTS: { id: string; date: string; amount: number; method: PayMethod }[] = [
  { id: "p12", date: "24 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p11", date: "23 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p10", date: "22 nov 2026", amount: 500_000, method: "deposito" },
  { id: "p9", date: "21 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p8", date: "20 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p7", date: "19 nov 2026", amount: 500_000, method: "deposito" },
  { id: "p6", date: "18 nov 2026", amount: 500_000, method: "efectivo" },
];

export function ClientStatement({ userName }: { userName?: string }) {
  const paid = LOAN.paidDays * LOAN.dailyPayment;
  const balance = LOAN.total - paid;
  const progress = Math.round((LOAN.paidDays / LOAN.termDays) * 100);
  const remainingDays = LOAN.termDays - LOAN.paidDays;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hola, {userName ?? "cliente"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este es el estado actual de tu préstamo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso de tu préstamo</CardTitle>
          <CardDescription>
            {LOAN.paidDays} de {LOAN.termDays} cuotas pagadas · faltan {remainingDays} días
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-primary">{progress}%</span>
              <span className="text-xs text-muted-foreground">
                {LOAN.startDate} → {LOAN.endDate}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatBox icon={<Wallet className="h-4 w-4" />} label="Saldo actual" value={currency(balance)} tone="text-primary" />
            <StatBox icon={<CheckCircle2 className="h-4 w-4" />} label="Ya pagado" value={currency(paid)} tone="text-emerald-600 dark:text-emerald-400" />
            <StatBox icon={<CalendarClock className="h-4 w-4" />} label="Cuota diaria" value={currency(LOAN.dailyPayment)} />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Capital prestado</span>
              <span className="font-medium">{currency(LOAN.capital)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total a pagar</span>
              <span className="font-medium">{currency(LOAN.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de pagos</CardTitle>
          <CardDescription>Tus últimos abonos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l-2 border-border pl-5">
            {PAYMENTS.map((p) => (
              <li key={p.id} className="relative">
                <span className="absolute -left-[27px] top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg border bg-card p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{currency(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1">
                    {p.method === "efectivo" ? <Banknote className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                    {p.method === "efectivo" ? "Efectivo" : "Depósito"}
                  </Badge>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`mt-1 text-lg font-semibold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
