import { useMemo, useState } from "react";
import { Banknote, Calculator, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const TERM_DAYS = 25;
const INTEREST_RATE = 0.25;

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0,
  );

export function calculateLoan(capital: number) {
  const interest = capital * INTEREST_RATE;
  const total = capital + interest;
  const dailyPayment = total / TERM_DAYS;
  return { capital, interest, total, dailyPayment, termDays: TERM_DAYS, rate: INTEREST_RATE };
}

export function LoanDisbursement() {
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [capitalStr, setCapitalStr] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const capital = Number(capitalStr.replace(/[^\d]/g, "")) || 0;
  const loan = useMemo(() => calculateLoan(capital), [capital]);

  const canSubmit = clientName.trim() && clientId.trim() && capital > 0;

  const schedule = useMemo(
    () =>
      Array.from({ length: TERM_DAYS }, (_, i) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (i + 1));
        return {
          day: i + 1,
          date: dueDate.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
          amount: loan.dailyPayment,
          balance: loan.total - loan.dailyPayment * (i + 1),
        };
      }),
    [loan.dailyPayment, loan.total],
  );

  const handleApprove = () => {
    setConfirmOpen(false);
    toast.success("Desembolso aprobado", {
      description: `${currency(capital)} entregados a ${clientName}.`,
    });
    setClientName("");
    setClientId("");
    setCapitalStr("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-4 w-4" /> Nuevo desembolso
          </CardTitle>
          <CardDescription>Plazo fijo de {TERM_DAYS} días · Interés {INTEREST_RATE * 100}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Cliente</Label>
            <Input
              id="clientName"
              placeholder="Nombre completo"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Cédula</Label>
            <Input
              id="clientId"
              placeholder="1.234.567.890"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capital">Capital a desembolsar</Label>
            <Input
              id="capital"
              placeholder="10.000.000"
              value={capitalStr ? Number(capitalStr.replace(/[^\d]/g, "")).toLocaleString("es-CO") : ""}
              onChange={(e) => setCapitalStr(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Capital</span>
              <span className="font-medium">{currency(loan.capital)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Interés (25%)</span>
              <span className="font-medium">{currency(loan.interest)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-2">
              <span className="font-semibold">Total a pagar</span>
              <span className="font-semibold text-primary">{currency(loan.total)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Cuota diaria</span>
              <span className="font-medium">{currency(loan.dailyPayment)}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            disabled={!canSubmit}
            onClick={() => setConfirmOpen(true)}
          >
            <Banknote className="h-5 w-5" />
            Aprobar y Desembolsar en Efectivo
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-4 w-4" /> Pre-visualización del préstamo
          </CardTitle>
          <CardDescription>
            {TERM_DAYS} cuotas diarias de <span className="font-medium text-foreground">{currency(loan.dailyPayment)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-16">Día</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Cuota</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((r) => (
                  <TableRow key={r.day}>
                    <TableCell className="font-medium">{r.day}</TableCell>
                    <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    <TableCell className="text-right">{currency(r.amount)}</TableCell>
                    <TableCell className="text-right">{currency(Math.max(0, r.balance))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Confirmar desembolso
            </DialogTitle>
            <DialogDescription>
              Esta acción registrará el préstamo y entregará el efectivo. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{clientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cédula</span><span className="font-medium">{clientId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Capital</span><span className="font-medium">{currency(loan.capital)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total a pagar</span><span className="font-semibold text-primary">{currency(loan.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cuota diaria × {TERM_DAYS}</span><span className="font-medium">{currency(loan.dailyPayment)}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleApprove} className="gap-2">
              <Banknote className="h-4 w-4" /> Confirmar desembolso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
