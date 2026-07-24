// Relational mock data. Every entity is linked by IDs so the app behaves as
// if reading from a real database. All auth users (Admin, Líder, Cobrador,
// Cliente) live in a single USERS collection.

export type Role = "Administrador" | "Líder" | "Cobrador" | "Cliente";
export type PaymentMethod = "efectivo" | "deposito";
export type PaymentStatus = "pagado" | "pendiente" | "atrasado";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  phone?: string;
  /** Required for Cobrador and Cliente (owner leader). */
  leaderId?: string;
  /** Cobrador metadata. */
  route?: string;
  goal?: number;
  /** Cliente → link to the Client record. */
  clientId?: string;
  // Perfil extendido (usado al crear cobradores).
  firstName?: string;
  lastName?: string;
  cedula?: string;
  birthDate?: string;
  address?: string;
  phone2?: string;
}

export interface Client {
  id: string;
  name: string;
  business: string;
  address: string;
  phone?: string;
  /** Owner: the leader always owns the client. */
  leaderId: string;
  /** The leader assigns any of their cobradores to collect. */
  assignedCollectorId?: string;
  order: number;
}

export interface Loan {
  id: string;
  clientId: string;
  capital: number;
  total: number;
  dailyPayment: number;
  termDays: 25;
  startDate: string;
  paidDays: number;
  initialStatus: PaymentStatus;
}

export interface Payment {
  id: string;
  loanId: string;
  clientId: string;
  collectorId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  fullPayoff?: boolean;
}

// ---------- Seed: Users ----------

export const ADMIN_EMAIL = "hilberth.valderrama@gmail.com";
export const ADMIN_PASSWORD = "987654";
const DEMO_PASSWORD = "demo1234";

export const USERS: User[] = [
  { id: "u_admin", name: "Hilberth Valderrama", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "Administrador", isActive: true },

  // Líderes
  { id: "u_l1", name: "Laura Mendoza", email: "laura@carteraapp.dev", password: DEMO_PASSWORD, role: "Líder", isActive: true, phone: "3001112233" },
  { id: "u_l2", name: "Ricardo Vélez", email: "ricardo@carteraapp.dev", password: DEMO_PASSWORD, role: "Líder", isActive: true, phone: "3004445566" },

  // Cobradores del Líder 1 (3)
  { id: "u_c1", name: "Andrés Molina", email: "andres@carteraapp.dev", password: DEMO_PASSWORD, role: "Cobrador", isActive: true, leaderId: "u_l1", route: "Ruta Norte", goal: 2_000_000, phone: "3011000001" },
  { id: "u_c2", name: "Diana Rojas", email: "diana@carteraapp.dev", password: DEMO_PASSWORD, role: "Cobrador", isActive: true, leaderId: "u_l1", route: "Ruta Centro", goal: 2_000_000, phone: "3011000002" },
  { id: "u_c3", name: "Felipe Cano", email: "felipe@carteraapp.dev", password: DEMO_PASSWORD, role: "Cobrador", isActive: true, leaderId: "u_l1", route: "Ruta Sur", goal: 1_500_000, phone: "3011000003" },

  // Cobrador del Líder 2 (1)
  { id: "u_c4", name: "Marcela Díaz", email: "marcela@carteraapp.dev", password: DEMO_PASSWORD, role: "Cobrador", isActive: true, leaderId: "u_l2", route: "Ruta Occidente", goal: 1_800_000, phone: "3011000004" },

  // Un usuario Cliente (para probar /estado-cuenta) vinculado al Client cl_1
  { id: "u_cli1", name: "María González", email: "maria@carteraapp.dev", password: DEMO_PASSWORD, role: "Cliente", isActive: true, leaderId: "u_l1", clientId: "cl_1" },
];

// ---------- Seed: Clients ----------

export const CLIENTS: Client[] = [
  // Líder 1 (5 clientes)
  { id: "cl_1", name: "María González", business: "Tienda La Esquina", address: "Cra 12 #34-56", phone: "3101110001", leaderId: "u_l1", assignedCollectorId: "u_c1", order: 1 },
  { id: "cl_2", name: "Carlos Ramírez", business: "Panadería El Trigal", address: "Cll 45 #12-08", phone: "3101110002", leaderId: "u_l1", assignedCollectorId: "u_c1", order: 2 },
  { id: "cl_3", name: "Ana Suárez", business: "Papelería Ana", address: "Cra 7 #22-15", phone: "3101110003", leaderId: "u_l1", assignedCollectorId: "u_c2", order: 3 },
  { id: "cl_4", name: "Jorge Pérez", business: "Ferretería Central", address: "Cll 60 #4-30", phone: "3101110004", leaderId: "u_l1", assignedCollectorId: "u_c2", order: 4 },
  { id: "cl_5", name: "Luisa Torres", business: "Cafetería Aroma", address: "Cra 15 #9-11", phone: "3101110005", leaderId: "u_l1", assignedCollectorId: "u_c3", order: 5 },

  // Líder 2 (2 clientes)
  { id: "cl_6", name: "Sofía Herrera", business: "Miscelánea Sofi", address: "Cll 80 #21-40", phone: "3201110006", leaderId: "u_l2", assignedCollectorId: "u_c4", order: 1 },
  { id: "cl_7", name: "Óscar Bermúdez", business: "Frutería El Sol", address: "Cra 30 #50-12", phone: "3201110007", leaderId: "u_l2", assignedCollectorId: "u_c4", order: 2 },
];

// ---------- Seed: Loans ----------
// Regla: total = capital * 1.25, cuota = total / 25, plazo 25 días.
const mkLoan = (
  id: string,
  clientId: string,
  capital: number,
  paidDays: number,
  initialStatus: PaymentStatus,
  startDate: string,
): Loan => {
  const total = capital * 1.25;
  return {
    id, clientId, capital, total,
    dailyPayment: total / 25,
    termDays: 25,
    startDate,
    paidDays,
    initialStatus,
  };
};

export const LOANS: Loan[] = [
  mkLoan("ln_1", "cl_1", 10_000_000, 12, "pendiente", "2026-11-05"),
  mkLoan("ln_2", "cl_2",  5_000_000,  3, "atrasado", "2026-11-15"),
  mkLoan("ln_3", "cl_3",  1_200_000, 15, "pagado",   "2026-10-25"),
  mkLoan("ln_4", "cl_4",  8_000_000,  1, "pendiente", "2026-11-20"),
  mkLoan("ln_5", "cl_5",  2_500_000, 10, "pendiente", "2026-11-08"),
  mkLoan("ln_6", "cl_6",  4_000_000,  6, "pendiente", "2026-11-12"),
  mkLoan("ln_7", "cl_7",  6_000_000,  2, "atrasado", "2026-11-18"),
];

// ---------- Seed: Historic Payments (para dashboard/histórico) ----------

const daysAgo = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString();
};

export const SEED_PAYMENTS: Payment[] = [
  // Historial de cl_1 (los últimos días)
  { id: "p_seed_1", loanId: "ln_1", clientId: "cl_1", collectorId: "u_c1", amount: 500_000, method: "efectivo", date: daysAgo(1) },
  { id: "p_seed_2", loanId: "ln_1", clientId: "cl_1", collectorId: "u_c1", amount: 500_000, method: "efectivo", date: daysAgo(2) },
  { id: "p_seed_3", loanId: "ln_1", clientId: "cl_1", collectorId: "u_c1", amount: 500_000, method: "deposito", date: daysAgo(3) },
  { id: "p_seed_4", loanId: "ln_1", clientId: "cl_1", collectorId: "u_c1", amount: 500_000, method: "efectivo", date: daysAgo(4) },
  { id: "p_seed_5", loanId: "ln_1", clientId: "cl_1", collectorId: "u_c1", amount: 500_000, method: "deposito", date: daysAgo(5) },
  { id: "p_seed_6", loanId: "ln_3", clientId: "cl_3", collectorId: "u_c2", amount: 60_000,  method: "efectivo", date: daysAgo(1) },
  { id: "p_seed_7", loanId: "ln_5", clientId: "cl_5", collectorId: "u_c3", amount: 125_000, method: "efectivo", date: daysAgo(2) },
  { id: "p_seed_8", loanId: "ln_6", clientId: "cl_6", collectorId: "u_c4", amount: 200_000, method: "efectivo", date: daysAgo(1) },
];

// ---------- Weekly reference (base only; live payments se suman en el dashboard) ----------
export const DAILY_COLLECTIONS = [
  { day: "Lun", monto: 2_400_000 },
  { day: "Mar", monto: 2_800_000 },
  { day: "Mié", monto: 1_900_000 },
  { day: "Jue", monto: 3_200_000 },
  { day: "Vie", monto: 2_780_000 },
  { day: "Sáb", monto: 3_500_000 },
  { day: "Dom", monto: 800_000 },
];
