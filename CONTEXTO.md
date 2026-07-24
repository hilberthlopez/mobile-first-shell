# CONTEXTO — CarteraApp

Fuente de verdad de arquitectura y reglas de negocio. **Regla estricta:** cada
vez que se cree una funcionalidad, se refactorice código o se agregue un
módulo, este archivo debe actualizarse antes de dar por terminada la tarea.

---

## 1. Roles del sistema (RBAC)

Definidos en `src/services/mockData.ts` (`Role`). Todos los usuarios (Admin,
Líderes, Cobradores y Clientes) viven en una única colección relacional
`USERS`. La única forma de entrar es a través del formulario de Login que
evalúa credenciales — **no existe selector de rol demo** en ninguna vista.

| Rol             | Acceso principal                                                    |
| --------------- | ------------------------------------------------------------------- |
| `Administrador` | Dashboard global, Líderes, Clientes, Préstamos, Gestión de Ruta.    |
| `Líder`         | Dashboard, Mis Cobradores (activar/desactivar y reasignar clientes), Clientes, Préstamos, Gestión de Ruta. |
| `Cobrador`      | Dashboard, Mi Ruta (solo clientes asignados), Clientes, Préstamos.  |
| `Cliente`       | Mi Estado de Cuenta (solo lectura).                                 |

- Administrador global: `hilberth.valderrama@gmail.com` / `987654`.
- Demás usuarios demo: contraseña `demo1234`.
- Sesión persistida en `localStorage` (`carteraapp.auth`).
- Rutas protegidas mediante `<ProtectedRoute allowedRoles={[...]}>`.
- Menú lateral (`src/components/app-sidebar.tsx`) dinámico según el rol.

## 2. Modelo de datos relacional

Fuente única en `src/services/mockData.ts`. Estado global en
`src/store/data-store.ts` (Zustand) con acciones `registerPayment`,
`toggleCollectorActive` y `assignClientToCollector`.

### Entidades

- **User** `{ id, name, email, password, role, isActive, phone?, leaderId?, route?, goal?, clientId? }`
  - `Cobrador` **requiere** `leaderId` e `isActive` (booleano para desactivarlo).
  - `Cliente` (rol de sesión) enlaza a un `Client` vía `clientId`.
- **Client** `{ id, name, business, address, phone?, leaderId, assignedCollectorId?, order }`
  - **El dueño es siempre el Líder** (`leaderId` obligatorio).
  - Los cobradores no son dueños; el líder asigna cualquier cliente de su
    cartera a cualquier cobrador de su equipo (`assignedCollectorId`).
- **Loan** `{ id, clientId, capital, total, dailyPayment, termDays: 25, startDate, paidDays, initialStatus }`
  - `total = capital * 1.25`, `dailyPayment = total / 25`.
- **Payment** `{ id, loanId, clientId, collectorId?, amount, method, date, fullPayoff? }`

### Semilla coherente

- **1 Administrador**: `u_admin`.
- **Líder 1** (`u_l1`, Laura Mendoza): 3 cobradores (`u_c1`, `u_c2`, `u_c3`)
  y 5 clientes (`cl_1..cl_5`) con préstamos activos, distribuidos entre sus
  cobradores.
- **Líder 2** (`u_l2`, Ricardo Vélez): 1 cobrador (`u_c4`) y 2 clientes
  (`cl_6`, `cl_7`) asignados.
- Cliente demo `u_cli1` enlazado al `Client cl_1` para probar
  `/estado-cuenta`.

Todo se cruza por IDs — no hay datos huérfanos. Los dashboards, tablas de
rendimiento y el estado de cuenta se **derivan** de esta data (no hay
totales precalculados).

## 3. Reglas de negocio — Préstamos

Implementadas en `src/components/loan-disbursement.tsx` (`calculateLoan`) y
respetadas por `LOANS` en el seed.

- **Plazo fijo:** 25 días.
- **Interés fijo:** 25% sobre el capital inicial.
- **Total a pagar:** `capital + (capital × 0.25)`. Ej: 10.000.000 → 12.500.000.
- **Cuota diaria:** `total / 25`.
- **Desembolso:** solo en efectivo, requiere confirmación en Dialog.
- **Pagos:** métodos `efectivo` | `deposito`. Soporta Pago Completo
  Anticipado. Estados de cuota: `pagado` | `pendiente` | `atrasado`
  (derivados de pagos en `buildRouteList` / `deriveRouteClient`).

## 4. Política "No-Email"

Ninguna funcionalidad puede enviar correos electrónicos ni llamar a APIs
externas de email. "¿Olvidé mi contraseña?" solo muestra un toast:
_"Contacte al administrador del sistema para recuperar su acceso"_.

## 5. Arquitectura

- **Enrutado:** file-based en `src/routes/` (TanStack Router). Cada ruta con
  su propio `head()` (SEO).
- **Layout raíz:** `src/routes/__root.tsx` (shell HTML + `<Outlet />`).
- **Layout de app:** `src/components/app-layout.tsx` (Sidebar + Topbar +
  `ProtectedRoute`).
- **Datos + estado:** `src/services/mockData.ts` (seed relacional) +
  `src/store/data-store.ts` (Zustand con selectores derivados
  `deriveRouteClient`, `buildRouteList`, `paidForLoan`).
- **Auth:** `src/context/auth-context.tsx` valida credenciales contra la
  colección `USERS` (incluye chequeo de `isActive`). Sin selector demo.
- **Formularios:** `react-hook-form` + `zod`.
- **Notificaciones:** `sonner` (Toaster global en `__root.tsx`).

## 6. PWA

- `vite-plugin-pwa` con `registerType: "autoUpdate"`, `sw.js`.
- Precache: `js/css/html/img/fonts`.
- Runtime: navegaciones `NetworkFirst` (`navigateFallback: "/"`),
  scripts/estilos `StaleWhileRevalidate`, imágenes/fuentes `CacheFirst`.
- Registro (`src/lib/register-sw.ts`) solo en producción publicada.

## 7. Módulos y rutas actuales

| Ruta              | Componente / propósito                                       | Roles                                       |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------- |
| `/`               | Dashboard (Líder/Admin) o vista Cobrador                     | Autenticado                                 |
| `/login`          | Login con credenciales contra `USERS`                        | Público                                     |
| `/lideres`        | Listado de líderes + equipos (derivado)                      | Administrador                               |
| `/cobradores`     | Mis cobradores: `isActive` toggle y reasignación de clientes | Líder                                       |
| `/clientes`       | Listado + stepper de registro                                | Administrador, Líder, Cobrador              |
| `/prestamos`      | Desembolso (`LoanDisbursement`)                              | Administrador, Líder, Cobrador              |
| `/rutas`          | Gestión de ruta (alcance por rol)                            | Administrador, Líder                        |
| `/mi-ruta`        | Ruta diaria (solo clientes asignados al cobrador)            | Cobrador                                    |
| `/estado-cuenta`  | Estado de cuenta derivado del `Loan` del cliente             | Cliente                                     |

## 8. Registro de clientes (Stepper)

`src/components/client-registration-stepper.tsx` — 4 pasos: datos personales,
datos de negocio, ubicación GPS (`navigator.geolocation`), documentos
(dropzone desktop / `capture="environment"` móvil). Validación con `zod`.

## 9. Stack tecnológico

React 19 + TanStack Start v1 (Vite 7), TanStack Router, Tailwind CSS v4,
shadcn/ui + Radix + lucide-react, Zustand (global) + Context API (auth),
react-hook-form + zod, recharts, sonner, vite-plugin-pwa (Workbox),
TypeScript strict. Backend: ninguno (mock relacional en memoria).

---

## 10. Cómo mantener este archivo

Al terminar cualquier tarea que cree/elimine rutas, cambie roles/reglas de
negocio o modifique el modelo de datos, actualiza las secciones
correspondientes **antes** de reportar la tarea como completada.
