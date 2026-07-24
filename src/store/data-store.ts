import { create } from "zustand";
import {
  CLIENTS,
  LOANS,
  SEED_PAYMENTS,
  USERS,
  type Client,
  type Loan,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
  type User,
} from "@/services/mockData";

export interface RouteClientView {
  id: string;               // client id
  loanId: string;
  order: number;
  name: string;
  business: string;
  address: string;
  dailyPayment: number;
  totalDebt: number;
  remainingDays: number;
  status: PaymentStatus;
  assignedCollectorId?: string;
  leaderId: string;
}

interface DataState {
  users: User[];
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  registerPayment: (
    loanId: string,
    amount: number,
    method: PaymentMethod,
    collectorId?: string,
    fullPayoff?: boolean,
  ) => void;
  toggleCollectorActive: (userId: string) => void;
  assignClientToCollector: (clientId: string, collectorId: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
  users: USERS,
  clients: CLIENTS,
  loans: LOANS,
  payments: SEED_PAYMENTS,
  registerPayment: (loanId, amount, method, collectorId, fullPayoff = false) =>
    set((state) => {
      const loan = state.loans.find((l) => l.id === loanId);
      if (!loan) return state;
      const record: Payment = {
        id: `pay_${Date.now()}_${loanId}`,
        loanId,
        clientId: loan.clientId,
        collectorId,
        amount,
        method,
        date: new Date().toISOString(),
        fullPayoff,
      };
      return { payments: [record, ...state.payments] };
    }),
  toggleCollectorActive: (userId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId && u.role === "Cobrador" ? { ...u, isActive: !u.isActive } : u,
      ),
    })),
  assignClientToCollector: (clientId, collectorId) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, assignedCollectorId: collectorId } : c,
      ),
    })),
}));

// ---------- Derived helpers ----------

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export function paidForLoan(payments: Payment[], loanId: string) {
  return payments.filter((p) => p.loanId === loanId).reduce((s, p) => s + p.amount, 0);
}

export function deriveRouteClient(
  client: Client,
  loan: Loan,
  payments: Payment[],
): RouteClientView {
  const paid = paidForLoan(payments, loan.id);
  const totalDebt = Math.max(0, loan.total - paid);
  const paidToday = payments
    .filter((p) => p.loanId === loan.id && isToday(p.date))
    .reduce((s, p) => s + p.amount, 0);
  const paidCuotas = Math.floor(paid / loan.dailyPayment);
  const remainingDays = Math.max(0, loan.termDays - paidCuotas);

  let status: PaymentStatus;
  if (totalDebt === 0) status = "pagado";
  else if (paidToday >= loan.dailyPayment) status = "pagado";
  else if (loan.initialStatus === "atrasado" && paidToday === 0) status = "atrasado";
  else status = "pendiente";

  return {
    id: client.id,
    loanId: loan.id,
    order: client.order,
    name: client.name,
    business: client.business,
    address: client.address,
    dailyPayment: loan.dailyPayment,
    totalDebt,
    remainingDays,
    status,
    assignedCollectorId: client.assignedCollectorId,
    leaderId: client.leaderId,
  };
}

export interface DataScope {
  clientIds?: string[];   // undefined = todos
}

export function buildRouteList(
  clients: Client[],
  loans: Loan[],
  payments: Payment[],
  scope: DataScope = {},
): RouteClientView[] {
  const wanted = scope.clientIds ? new Set(scope.clientIds) : null;
  return clients
    .filter((c) => (wanted ? wanted.has(c.id) : true))
    .map((c) => {
      const loan = loans.find((l) => l.clientId === c.id);
      if (!loan) return null;
      return deriveRouteClient(c, loan, payments);
    })
    .filter((x): x is RouteClientView => x !== null)
    .sort((a, b) => a.order - b.order);
}
