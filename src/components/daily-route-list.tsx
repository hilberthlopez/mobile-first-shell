import { useMemo, useState } from "react";
import { Banknote, Building2, CheckCircle2, Clock, MapPin, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription,
  DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { useDataStore } from "@/store/data-store";
import type { PaymentMethod, PaymentStatus, RouteClient } from "@/services/mockData";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(isFinite(n) ? n : 0);

const STATUS_META: Record<PaymentStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pagado: { label: "Pagado", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" /> },
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400", icon: <Clock className="h-3 w-3" /> },
  atrasado: { label: "Atrasado", className: "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400", icon: <Clock className="h-3 w-3" /> },
};

export function DailyRouteList() {
  const [clients, setClients] = useState<RouteClient[]>(INITIAL_CLIENTS);
  const [selected, setSelected] = useState<RouteClient | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("efectivo");

  const counts = useMemo(() => ({
    pagado: clients.filter((c) => c.status === "pagado").length,
    pendiente: clients.filter((c) => c.status === "pendiente").length,
    atrasado: clients.filter((c) => c.status === "atrasado").length,
  }), [clients]);

  const openSheet = (c: RouteClient) => {
    setSelected(c);
    setAmountStr(String(c.dailyPayment));
    setMethod("efectivo");
  };

  const closeSheet = () => setSelected(null);

  const registerPayment = (fullPayoff = false) => {
    if (!selected) return;
    const amount = fullPayoff ? selected.totalDebt : Number(amountStr.replace(/[^\d]/g, "")) || 0;
    if (amount <= 0) {
      toast.error("Ingresa un valor válido");
      return;
    }
    setClients((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "pagado" } : c)),
    );
    toast.success(fullPayoff ? "Pago anticipado registrado" : "Pago registrado", {
      description: `${currency(amount)} · ${method === "efectivo" ? "Efectivo" : "Depósito bancario"} · ${selected.name}`,
    });
    closeSheet();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Pagados" value={counts.pagado} tone="emerald" />
        <StatCard label="Pendientes" value={counts.pendiente} tone="amber" />
        <StatCard label="Atrasados" value={counts.atrasado} tone="rose" />
      </div>

      <ul className="space-y-3">
        {clients.map((c) => {
          const meta = STATUS_META[c.status];
          return (
            <li key={c.id}>
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {c.order}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold">{c.name}</h3>
                        <Badge variant="outline" className={`gap-1 ${meta.className}`}>
                          {meta.icon}{meta.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.business}</p>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" /> {c.address}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Cuota</p>
                      <p className="text-base font-semibold">{currency(c.dailyPayment)}</p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full gap-2"
                    size="lg"
                    disabled={c.status === "pagado"}
                    onClick={() => openSheet(c)}
                  >
                    <Wallet className="h-4 w-4" />
                    {c.status === "pagado" ? "Cobrado hoy" : "Registrar Pago"}
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <Drawer open={!!selected} onOpenChange={(o) => !o && closeSheet()}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="text-left">
              <DrawerTitle>Registrar pago</DrawerTitle>
              <DrawerDescription>
                {selected ? `${selected.name} · ${selected.business}` : ""}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 px-4 pb-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor recibido</Label>
                <Input
                  id="amount"
                  inputMode="numeric"
                  className="h-12 text-lg"
                  value={
                    amountStr
                      ? Number(amountStr.replace(/[^\d]/g, "")).toLocaleString("es-CO")
                      : ""
                  }
                  onChange={(e) => setAmountStr(e.target.value)}
                />
                {selected && (
                  <p className="text-xs text-muted-foreground">
                    Cuota del día: {currency(selected.dailyPayment)} · Deuda total: {currency(selected.totalDebt)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Método de pago</Label>
                <div className="grid grid-cols-2 gap-3">
                  <MethodButton
                    active={method === "efectivo"}
                    onClick={() => setMethod("efectivo")}
                    icon={<Banknote className="h-6 w-6" />}
                    label="Efectivo"
                  />
                  <MethodButton
                    active={method === "deposito"}
                    onClick={() => setMethod("deposito")}
                    icon={<Building2 className="h-6 w-6" />}
                    label="Depósito Bancario"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => registerPayment(true)}
              >
                <Zap className="h-4 w-4" />
                Pago Completo Anticipado
                {selected && (
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    {currency(selected.totalDebt)}
                  </span>
                )}
              </Button>
            </div>

            <DrawerFooter className="pt-4">
              <Button size="lg" className="gap-2" onClick={() => registerPayment(false)}>
                <CheckCircle2 className="h-5 w-5" /> Confirmar pago
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "rose" }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  } as const;
  return (
    <div className={`rounded-xl border p-3 text-center ${tones[tone]}`}>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs font-medium">{label}</p>
    </div>
  );
}

function MethodButton({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:border-primary/50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
