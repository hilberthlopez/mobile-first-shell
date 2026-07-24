import { create } from "zustand";
import {
  ROUTE_CLIENTS,
  type PaymentMethod,
  type PaymentRecord,
  type RouteClient,
} from "@/services/mockData";

interface DataState {
  clients: RouteClient[];
  payments: PaymentRecord[];
  registerPayment: (
    clientId: string,
    amount: number,
    method: PaymentMethod,
    fullPayoff?: boolean,
  ) => void;
}

export const useDataStore = create<DataState>((set) => ({
  clients: ROUTE_CLIENTS,
  payments: [],
  registerPayment: (clientId, amount, method, fullPayoff = false) =>
    set((state) => {
      const client = state.clients.find((c) => c.id === clientId);
      if (!client) return state;
      const record: PaymentRecord = {
        id: `pay_${Date.now()}_${clientId}`,
        clientId,
        clientName: client.name,
        amount,
        method,
        date: new Date().toISOString(),
      };
      return {
        clients: state.clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                status: "pagado",
                totalDebt: fullPayoff ? 0 : Math.max(0, c.totalDebt - amount),
                remainingDays: fullPayoff ? 0 : c.remainingDays,
              }
            : c,
        ),
        payments: [record, ...state.payments],
      };
    }),
}));
