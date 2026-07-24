import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useDataStore } from "@/store/data-store";

export function CreateCollectorDialog({ leaderId, trigger }: { leaderId: string; trigger: ReactNode }) {
  const createCollector = useDataStore((s) => s.createCollector);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    birthDate: "",
    cedula: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    phone2: "",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm({ birthDate: "", cedula: "", firstName: "", lastName: "", address: "", phone: "", phone2: "" });
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: Array<keyof typeof form> = ["birthDate", "cedula", "firstName", "lastName", "address", "phone", "phone2"];
    if (required.some((k) => !form[k].trim())) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    const res = createCollector({ leaderId, ...form });
    if (!res.ok) { setError(res.error); return; }
    toast.success(`Cobrador ${form.firstName} ${form.lastName} creado. Contraseña temporal: cédula.`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo cobrador</DialogTitle>
          <DialogDescription>
            El cobrador quedará vinculado a tu equipo. La contraseña inicial será su cédula.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input id="birthDate" type="date" value={form.birthDate} onChange={set("birthDate")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cedula">Cédula / Documento</Label>
            <Input id="cedula" inputMode="numeric" value={form.cedula} onChange={set("cedula")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombres</Label>
            <Input id="firstName" value={form.firstName} onChange={set("firstName")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellidos</Label>
            <Input id="lastName" value={form.lastName} onChange={set("lastName")} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={form.address} onChange={set("address")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono 1</Label>
            <Input id="phone" inputMode="tel" value={form.phone} onChange={set("phone")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone2">Teléfono 2</Label>
            <Input id="phone2" inputMode="tel" value={form.phone2} onChange={set("phone2")} required />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear cobrador</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
