// Centralized mock data for the app. Move fake datasets here so visual
// components stay focused on presentation.

export type PaymentStatus = "pagado" | "pendiente" | "atrasado";
export type PaymentMethod = "efectivo" | "deposito";

export interface RouteClient {
  id: string;
  order: number;
  name: string;
  business: string;
  address: string;
  dailyPayment: number;
  remainingDays: number;
  totalDebt: number;
  status: PaymentStatus;
}

export interface Collector {
  id: string;
  name: string;
  route: string;
  activeLoans: number;
  collected: number;
  goal: number;
  overdue: number;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO
}

export const ROUTE_CLIENTS: RouteClient[] = [
  { id: "1", order: 1, name: "María González", business: "Tienda La Esquina", address: "Cra 12 #34-56", dailyPayment: 500_000, remainingDays: 18, totalDebt: 9_000_000, status: "pendiente" },
  { id: "2", order: 2, name: "Carlos Ramírez", business: "Panadería El Trigal", address: "Cll 45 #12-08", dailyPayment: 250_000, remainingDays: 22, totalDebt: 5_500_000, status: "atrasado" },
  { id: "3", order: 3, name: "Ana Suárez", business: "Papelería Ana", address: "Cra 7 #22-15", dailyPayment: 120_000, remainingDays: 10, totalDebt: 1_200_000, status: "pagado" },
  { id: "4", order: 4, name: "Jorge Pérez", business: "Ferretería Central", address: "Cll 60 #4-30", dailyPayment: 400_000, remainingDays: 24, totalDebt: 9_600_000, status: "pendiente" },
  { id: "5", order: 5, name: "Luisa Torres", business: "Cafetería Aroma", address: "Cra 15 #9-11", dailyPayment: 180_000, remainingDays: 15, totalDebt: 2_700_000, status: "pendiente" },
];

export const COLLECTORS: Collector[] = [
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

export const DAILY_COLLECTIONS = [
  { day: "Lun", monto: 12_400_000 },
  { day: "Mar", monto: 13_800_000 },
  { day: "Mié", monto: 11_900_000 },
  { day: "Jue", monto: 15_200_000 },
  { day: "Vie", monto: 14_780_000 },
  { day: "Sáb", monto: 16_500_000 },
  { day: "Dom", monto: 8_300_000 },
];

export const DASHBOARD_TOTALS = {
  totalLent: 285_400_000,
  baseDailyCollected: 14_780_000,
  capitalAtRisk: 18_950_000,
  activeLoans: 42,
  goalDaily: 19_000_000,
  overdueAccounts: 6,
};

export const CLIENT_LOAN = {
  capital: 10_000_000,
  total: 12_500_000,
  dailyPayment: 500_000,
  termDays: 25,
  paidDays: 12,
  startDate: "05 nov 2026",
  endDate: "30 nov 2026",
};

export const CLIENT_PAYMENTS: { id: string; date: string; amount: number; method: PaymentMethod }[] = [
  { id: "p12", date: "24 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p11", date: "23 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p10", date: "22 nov 2026", amount: 500_000, method: "deposito" },
  { id: "p9", date: "21 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p8", date: "20 nov 2026", amount: 500_000, method: "efectivo" },
  { id: "p7", date: "19 nov 2026", amount: 500_000, method: "deposito" },
  { id: "p6", date: "18 nov 2026", amount: 500_000, method: "efectivo" },
];
