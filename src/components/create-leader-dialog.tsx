import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useDataStore } from "@/store/data-store";

export function CreateLeaderDialog({ trigger }: { trigger: ReactNode }) {
  const createLeader = useDataStore((s) => s.createLeader);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setName(""); setEmail(""); setPassword(""); setPhone(""); setError(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Completa todos los campos. La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const res = createLeader({ name, email, password, phone: phone || undefined });
    if (!res.ok) { setError(res.error); return; }
    toast.success(`Líder ${name} creado correctamente.`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Líder</DialogTitle>
          <DialogDescription>
            El líder podrá ingresar con estas credenciales y gestionar su propio equipo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="l-name">Nombre completo</Label>
            <Input id="l-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-email">Correo</Label>
            <Input id="l-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-pass">Contraseña</Label>
            <Input id="l-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-phone">Teléfono (opcional)</Label>
            <Input id="l-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear líder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
