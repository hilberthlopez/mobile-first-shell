# CONTEXTO — CarteraApp

Fuente de verdad de arquitectura y reglas de negocio. **Regla estricta:** cada
vez que se cree una funcionalidad, se refactorice código o se agregue un
módulo, este archivo debe actualizarse antes de dar por terminada la tarea.

---

## 1. Roles del sistema (RBAC)

Definidos en `src/context/auth-context.tsx` (`Role`, `ROLES`).

| Rol             | Acceso principal                                                    |
| --------------- | ------------------------------------------------------------------- |
| `Administrador` | Dashboard global, Líderes, Clientes, Préstamos, Gestión de Ruta.    |
| `Líder`         | Dashboard, Mis Cobradores, Clientes, Préstamos, Gestión de Ruta.    |
| `Cobrador`      | Dashboard, Mi Ruta, Clientes, Préstamos.                            |
| `Cliente`       | Mi Estado de Cuenta (solo lectura).                                 |

- Administrador global hardcodeado: `hilberth.valderrama@gmail.com` / `987654`.
- Sesión persistida en `localStorage` (`carteraapp.auth`).
- Rutas protegidas mediante `<ProtectedRoute allowedRoles={[...]}>`.
- Menú lateral (`src/components/app-sidebar.tsx`) se renderiza dinámicamente
  según el rol activo.

## 2. Reglas de negocio — Préstamos

Implementadas en `src/components/loan-disbursement.tsx` (`calculateLoan`).

- **Plazo fijo:** 25 días.
- **Interés fijo:** 25% sobre el capital inicial, calculado al desembolsar.
- **Total a pagar:** `capital + (capital × 0.25)`.
  - Ej.: capital `10.000.000` → total `12.500.000`.
- **Cuota diaria:** `total / 25`. Ej.: `500.000`.
- **Desembolso:** solo en efectivo, requiere confirmación en Dialog.
- **Pagos:**
  - Métodos aceptados: `efectivo` | `deposito` (bancario).
  - Soporta **Pago Completo Anticipado** (salda toda la deuda).
  - Estados de cuota: `pagado` | `pendiente` | `atrasado`.

## 3. Política "No-Email"

Ninguna funcionalidad puede enviar correos electrónicos ni llamar a APIs
externas de email. "¿Olvidé mi contraseña?" solo muestra un toast:
_"Contacte al administrador del sistema para recuperar su acceso"_.

## 4. Arquitectura

- **Enrutado:** file-based en `src/routes/` (TanStack Router). Nada de
  `src/pages/`. Cada ruta con su propio `head()` (SEO).
- **Layout raíz:** `src/routes/__root.tsx` provee shell HTML + `<Outlet />`.
- **Layout de app:** `src/components/app-layout.tsx` (Sidebar + Topbar +
  `ProtectedRoute`).
- **Datos mock centralizados:** `src/services/mockData.ts`
  (clientes de ruta, cobradores, dashboard totals, préstamo/pagos de cliente).
- **Estado global:** `src/store/data-store.ts` (Zustand) con `clients` +
  `payments` y acción `registerPayment(...)`. Los pagos registrados por el
  Cobrador en `daily-route-list.tsx` se reflejan en vivo en el
  `leader-dashboard.tsx` (Recaudo Diario, barra semanal, atrasos).
- **Formularios:** `react-hook-form` + `zod`.
- **Notificaciones:** `sonner` (Toaster global en `__root.tsx`).

## 5. PWA

- `vite-plugin-pwa` con `registerType: "autoUpdate"`, `sw.js`.
- Precache: `js/css/html/img/fonts`.
- Runtime:
  - Navegaciones → `NetworkFirst` con `navigateFallback: "/"`.
  - Scripts/estilos → `StaleWhileRevalidate`.
  - Imágenes/fuentes → `CacheFirst`.
- Registro guardado (`src/lib/register-sw.ts`): solo se activa en producción
  publicada; se ignora en dev y en la preview de Lovable.
- `manifest.webmanifest`: nombre `CarteraApp`, tema `#2563eb`, íconos 192/512.

## 6. Módulos y rutas actuales

| Ruta              | Componente / propósito                             | Roles                                       |
| ----------------- | -------------------------------------------------- | ------------------------------------------- |
| `/`               | Dashboard (Líder/Admin) o vista Cobrador           | Autenticado                                 |
| `/login`          | Login simulado + selector de rol demo              | Público                                     |
| `/lideres`        | Listado de líderes                                 | Administrador                               |
| `/cobradores`     | Mis cobradores                                     | Líder                                       |
| `/clientes`       | Listado + stepper de registro                      | Administrador, Líder, Cobrador              |
| `/prestamos`      | Desembolso (`LoanDisbursement`)                    | Administrador, Líder, Cobrador              |
| `/rutas`          | Gestión de ruta (`DailyRouteList`)                 | Administrador, Líder                        |
| `/mi-ruta`        | Ruta diaria del cobrador                           | Cobrador                                    |
| `/estado-cuenta`  | Estado de cuenta de solo lectura                   | Cliente                                     |

## 7. Registro de clientes (Stepper)

`src/components/client-registration-stepper.tsx` — 4 pasos:
1. Datos personales (cédula, nombre, 2 teléfonos, email).
2. Datos del negocio (nombre, dirección).
3. Ubicación GPS vía `navigator.geolocation`.
4. Documentos (dropzone en desktop, `capture="environment"` en móvil).

Validación con `zod`. Sin envío a APIs externas.

## 8. Stack tecnológico

- **Framework:** React 19 + TanStack Start v1 (SSR/SSG capable), Vite 7.
- **Ruteo:** TanStack Router (file-based).
- **Estilos:** Tailwind CSS v4 (via `src/styles.css`).
- **UI:** shadcn/ui + Radix + lucide-react.
- **Estado:** Zustand (global), Context API (auth).
- **Formularios:** react-hook-form + zod.
- **Gráficos:** recharts.
- **Notificaciones:** sonner.
- **PWA:** vite-plugin-pwa (Workbox).
- **Lenguaje:** TypeScript (strict).
- **Backend:** ninguno aún (mock data). Sin envío de emails por política.

---

## 9. Cómo mantener este archivo

Al terminar cualquier tarea que:
- Cree/elimine rutas, componentes o módulos.
- Cambie roles, permisos o reglas de negocio.
- Modifique el stack, arquitectura de datos o estrategia PWA.

…actualiza las secciones correspondientes **antes** de reportar la tarea como
completada.
