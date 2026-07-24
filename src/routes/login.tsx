import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — CarteraApp" },
      { name: "description", content: "Accede a tu cuenta de CarteraApp." },
    ],
  }),
  component: LoginPage,
});

function landingFor(role: string) {
  if (role === "Cobrador") return "/mi-ruta" as const;
  if (role === "Cliente") return "/estado-cuenta" as const;
  return "/" as const;
}

function LoginPage() {
  const { loginWithCredentials, user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) navigate({ to: landingFor(user.role), replace: true });
  }, [hydrated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginWithCredentials(email, password);
    if (result.ok) {
      toast.success("Bienvenido a CarteraApp");
      // Re-lee usuario recién autenticado desde localStorage no es necesario:
      // el efecto de arriba redirige cuando `user` cambia.
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };


  const handleForgotPassword = () => {
    toast.message("Contacte al administrador del sistema para recuperar su acceso.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Bienvenido a CarteraApp</CardTitle>
          <p className="text-sm text-muted-foreground">Inicia sesión con tus credenciales.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@carteraapp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
