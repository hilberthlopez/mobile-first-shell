import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { USERS, ADMIN_EMAIL, ADMIN_PASSWORD, type Role, type User } from "@/services/mockData";

export type { Role };
export const ROLES: Role[] = ["Administrador", "Líder", "Cobrador", "Cliente"];
export { ADMIN_EMAIL, ADMIN_PASSWORD };

export type SessionUser = Omit<User, "password">;

interface AuthContextValue {
  user: SessionUser | null;
  hydrated: boolean;
  loginWithCredentials: (
    email: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "carteraapp.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user, hydrated]);

  const value: AuthContextValue = {
    user,
    hydrated,
    loginWithCredentials: (email, password) => {
      const normalized = email.trim().toLowerCase();
      const found = USERS.find((u) => u.email.toLowerCase() === normalized);
      if (!found || found.password !== password) {
        return { ok: false, error: "Credenciales inválidas. Contacte al administrador del sistema." };
      }
      if (!found.isActive) {
        return { ok: false, error: "Usuario desactivado. Contacte al administrador del sistema." };
      }
      const { password: _pw, ...session } = found;
      setUser(session);
      return { ok: true };
    },
    logout: () => setUser(null),
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => (user ? roles.includes(user.role) : false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
