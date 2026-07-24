import { useMemo } from "react";
import { Banknote, Building2, CalendarClock, CheckCircle2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { paidForLoan, useDataStore } from "@/store/data-store";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

export function ClientStatement({ userName }: { userName?: string }) {
  const { user } = useAuth();
  const loans = useDataStore((s) => s.loans);
  const payments = useDataStore((s) => s.payments);

  const loan = useMemo(
    () => (user?.clientId ? loans.find((l) => l.clientId === user.clientId) : undefined),
    [loans, user],
  );
  const clientPayments = useMemo(
    () => (loan ? payments.filter((p) => p.loanId === loan.id) : []),
    [payments, loan],
  );

  if (!loan) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hay un préstamo asociado a tu cuenta. Contacta a tu líder.
      </div>
    );
  }

  const paid = paidForLoan(payments, loan.id);
  const balance = Math.max(0, loan.total - paid);
  const paidDays = Math.floor(paid / loan.dailyPayment);
  const progress = Math.min(100, Math.round((paidDays / loan.termDays) * 100));
  const remainingDays = Math.max(0, loan.termDays - paidDays);
  const start = new Date(loan.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + loan.termDays);

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
            {paidDays} de {loan.termDays} cuotas pagadas · faltan {remainingDays} días
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-primary">{progress}%</span>
              <span className="text-xs text-muted-foreground">
                {fmtDate(start.toISOString())} → {fmtDate(end.toISOString())}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatBox icon={<Wallet className="h-4 w-4" />} label="Saldo actual" value={currency(balance)} tone="text-primary" />
            <StatBox icon={<CheckCircle2 className="h-4 w-4" />} label="Ya pagado" value={currency(paid)} tone="text-emerald-600 dark:text-emerald-400" />
            <StatBox icon={<CalendarClock className="h-4 w-4" />} label="Cuota diaria" value={currency(loan.dailyPayment)} />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Capital prestado</span>
              <span className="font-medium">{currency(loan.capital)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total a pagar</span>
              <span className="font-medium">{currency(loan.total)}</span>
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
          {clientPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay pagos registrados.</p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border pl-5">
              {clientPayments.map((p) => (
                <li key={p.id} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg border bg-card p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{currency(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(p.date)}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 gap-1">
                      {p.method === "efectivo" ? <Banknote className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                      {p.method === "efectivo" ? "Efectivo" : "Depósito"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          )}
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
