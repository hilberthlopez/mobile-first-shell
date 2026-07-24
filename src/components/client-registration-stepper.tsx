import { useCallback, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const personalSchema = z.object({
  cedula: z
    .string()
    .trim()
    .min(6, "La cédula debe tener al menos 6 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[0-9A-Za-z-]+$/, "Solo letras, números y guiones"),
  nombre: z.string().trim().min(3, "Ingresa el nombre completo").max(100),
  telefono1: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Solo números y símbolos de teléfono"),
  telefono2: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Solo números y símbolos de teléfono")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Correo inválido").max(255),
});

const businessSchema = z.object({
  negocio: z.string().trim().min(2, "Nombre del negocio requerido").max(120),
  direccion: z.string().trim().min(5, "Dirección requerida").max(255),
});

type PersonalData = z.infer<typeof personalSchema>;
type BusinessData = z.infer<typeof businessSchema>;

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface Doc {
  id: string;
  name: string;
  size: number;
  preview?: string;
}

const STEPS = ["Datos personales", "Datos del negocio", "Ubicación", "Documentos"];

export function ClientRegistrationStepper({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState<PersonalData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePersonal: SubmitHandler<PersonalData> = (data) => {
    setPersonal(data);
    next();
  };
  const handleBusiness: SubmitHandler<BusinessData> = (data) => {
    setBusiness(data);
    next();
  };

  const captureLocation = () => {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Este dispositivo no soporta geolocalización.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Permiso de ubicación denegado. Habilítalo en tu navegador.",
          2: "No se pudo obtener la ubicación. Verifica tu conexión o GPS.",
          3: "Tiempo de espera agotado. Intenta nuevamente.",
        };
        setLocError(messages[err.code] ?? "Error desconocido de geolocalización.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleFinish = async () => {
    if (docs.length === 0) {
      setDocError("Sube al menos un documento.");
      return;
    }
    setSubmitting(true);
    // Simulated submit
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    toast.success("Cliente registrado correctamente");
    setStep(0);
    setPersonal(null);
    setBusiness(null);
    setLocation(null);
    setDocs([]);
    onDone?.();
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Stepper current={step} />

      <Card>
        <CardContent className="p-4 sm:p-6">
          {step === 0 && (
            <PersonalStep defaults={personal ?? undefined} onSubmit={handlePersonal} />
          )}
          {step === 1 && (
            <BusinessStep
              defaults={business ?? undefined}
              onSubmit={handleBusiness}
              onBack={back}
            />
          )}
          {step === 2 && (
            <LocationStep
              location={location}
              error={locError}
              loading={locLoading}
              onCapture={captureLocation}
              onBack={back}
              onNext={() => {
                if (!location) {
                  setLocError("Captura la ubicación para continuar.");
                  return;
                }
                next();
              }}
            />
          )}
          {step === 3 && (
            <DocumentsStep
              docs={docs}
              setDocs={setDocs}
              error={docError}
              setError={setDocError}
              onBack={back}
              onFinish={handleFinish}
              submitting={submitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden truncate text-sm sm:inline",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 bg-border",
                  (done || active) && "bg-primary/40",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}

function PersonalStep({
  defaults,
  onSubmit,
}: {
  defaults?: PersonalData;
  onSubmit: SubmitHandler<PersonalData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Datos personales</h2>
        <p className="text-sm text-muted-foreground">Información de contacto del cliente.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cedula">Cédula *</Label>
        <Input id="cedula" placeholder="001-2345678-9" {...register("cedula")} />
        <FieldError msg={errors.cedula?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo *</Label>
        <Input id="nombre" placeholder="Juan Pérez" {...register("nombre")} />
        <FieldError msg={errors.nombre?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefono1">Teléfono principal *</Label>
          <Input id="telefono1" type="tel" placeholder="+1 809 000 0000" {...register("telefono1")} />
          <FieldError msg={errors.telefono1?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono2">Teléfono alterno</Label>
          <Input id="telefono2" type="tel" placeholder="Opcional" {...register("telefono2")} />
          <FieldError msg={errors.telefono2?.message} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input id="email" type="email" placeholder="cliente@correo.com" {...register("email")} />
        <FieldError msg={errors.email?.message} />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit">
          Continuar <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function BusinessStep({
  defaults,
  onSubmit,
  onBack,
}: {
  defaults?: BusinessData;
  onSubmit: SubmitHandler<BusinessData>;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessData>({
    resolver: zodResolver(businessSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Datos del negocio</h2>
        <p className="text-sm text-muted-foreground">Información comercial del cliente.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="negocio">Nombre del negocio *</Label>
        <Input id="negocio" placeholder="Colmado La Esquina" {...register("negocio")} />
        <FieldError msg={errors.negocio?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección comercial *</Label>
        <Textarea
          id="direccion"
          rows={3}
          placeholder="Calle, número, sector, ciudad"
          {...register("direccion")}
        />
        <FieldError msg={errors.direccion?.message} />
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button type="submit">
          Continuar <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function LocationStep({
  location,
  error,
  loading,
  onCapture,
  onBack,
  onNext,
}: {
  location: Location | null;
  error: string | null;
  loading: boolean;
  onCapture: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ubicación del negocio</h2>
        <p className="text-sm text-muted-foreground">
          Captura las coordenadas GPS exactas desde el sitio.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <MapPin className="mx-auto h-10 w-10 text-primary" />
        {location ? (
          <div className="mt-3 space-y-1">
            <p className="text-sm text-muted-foreground">Coordenadas capturadas</p>
            <p className="font-mono text-sm">
              Lat: <span className="font-semibold">{location.latitude.toFixed(6)}</span>
            </p>
            <p className="font-mono text-sm">
              Lng: <span className="font-semibold">{location.longitude.toFixed(6)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Precisión: ±{Math.round(location.accuracy)} m
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Aún no se ha capturado la ubicación.
          </p>
        )}

        <Button
          type="button"
          onClick={onCapture}
          disabled={loading}
          className="mt-4"
          variant={location ? "outline" : "default"}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Obteniendo…
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {location ? "Capturar de nuevo" : "Capturar ubicación"}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button type="button" onClick={onNext}>
          Continuar <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const MAX_FILE_MB = 10;
const ALLOWED_TYPES = ["image/", "application/pdf"];

function DocumentsStep({
  docs,
  setDocs,
  error,
  setError,
  onBack,
  onFinish,
  submitting,
}: {
  docs: Doc[];
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  error: string | null;
  setError: (e: string | null) => void;
  onBack: () => void;
  onFinish: () => void;
  submitting: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      const accepted: Doc[] = [];
      for (const f of Array.from(files)) {
        if (!ALLOWED_TYPES.some((t) => f.type.startsWith(t))) {
          setError(`Formato no permitido: ${f.name}. Usa imágenes o PDF.`);
          continue;
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          setError(`${f.name} supera ${MAX_FILE_MB} MB.`);
          continue;
        }
        accepted.push({
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
          name: f.name,
          size: f.size,
          preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        });
      }
      if (accepted.length) setDocs((prev) => [...prev, ...accepted]);
    },
    [setDocs, setError],
  );

  const removeDoc = (id: string) => {
    setDocs((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc?.preview) URL.revokeObjectURL(doc.preview);
      return prev.filter((d) => d.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Documentos</h2>
        <p className="text-sm text-muted-foreground">
          Sube cédula, comprobante o fotos del negocio (imágenes o PDF, máx. {MAX_FILE_MB} MB).
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          Arrastra archivos aquí <span className="hidden sm:inline">o</span>
        </p>
        <p className="text-xs text-muted-foreground sm:hidden">o usa los botones abajo</p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Elegir archivos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" /> Tomar foto
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {docs.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-md border bg-background p-2"
            >
              {d.preview ? (
                <img
                  src={d.preview}
                  alt={d.name}
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-muted text-xs font-medium">
                  PDF
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(d.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDoc(d.id)}
                aria-label={`Quitar ${d.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button type="button" onClick={onFinish} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Finalizar registro
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
