import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Administrador" | "Líder" | "Cobrador" | "Cliente";

export const ROLES: Role[] = ["Administrador", "Líder", "Cobrador", "Cliente"];

export interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  hydrated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "carteraapp.auth";

const demoUserFor = (role: Role): User => ({
  name: `Demo ${role}`,
  email: `${role.toLowerCase().replace("í", "i")}@carteraapp.dev`,
  role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
    login: (role) => setUser(demoUserFor(role)),
    logout: () => setUser(null),
    setRole: (role) => setUser((prev) => (prev ? { ...prev, role } : demoUserFor(role))),
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
