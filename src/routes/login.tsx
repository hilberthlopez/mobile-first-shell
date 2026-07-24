import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, useAuth, type Role } from "@/context/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — CarteraApp" },
      { name: "description", content: "Accede a tu cuenta de CarteraApp." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Administrador");

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/", replace: true });
  }, [hydrated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Bienvenido a CarteraApp</CardTitle>
          <p className="text-sm text-muted-foreground">
            Inicia sesión para continuar (modo demostración).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" placeholder="usuario@carteraapp.com" defaultValue="demo@carteraapp.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" defaultValue="demo" />
            </div>
            <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-3">
              <Label htmlFor="role" className="text-xs uppercase tracking-wide text-muted-foreground">
                Rol de prueba (solo desarrollo)
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Iniciar sesión como {role}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
