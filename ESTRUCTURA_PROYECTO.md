# 📁 Estructura del Proyecto ServiYa

> **ServiYa** es una plataforma web para conectar usuarios con prestadores de servicios a domicilio en Colombia. Construida con **Next.js 16**, **React 19**, **Supabase** y **TailwindCSS 4**.

---

## 📂 Raíz del proyecto (`/`)

| Archivo | Función |
|---|---|
| `package.json` | Dependencias y scripts del proyecto (`dev`, `build`, `start`, `lint`) |
| `package-lock.json` | Versiones exactas de todas las dependencias (generado automáticamente) |
| `next.config.ts` | Configuración de Next.js |
| `tsconfig.json` | Configuración de TypeScript (paths, módulos, aliases) |
| `middleware.ts` | **Middleware de autenticación** — protege rutas `/dashboard/*` (redirige a login si no hay sesión), protege `/dashboard/admin` (solo email autorizado), y redirige a `/dashboard` si ya estás logueado e intentas ir a `/auth/*` |
| `eslint.config.mjs` | Configuración de ESLint para linting del código |
| `postcss.config.mjs` | Configuración de PostCSS (necesario para TailwindCSS) |
| `.env` | Variables de entorno: URLs y claves de Supabase |
| `.gitignore` | Archivos/carpetas ignorados por Git |
| `next-env.d.ts` | Tipos de Next.js (generado automáticamente) |
| `tsconfig.tsbuildinfo` | Cache de compilación de TypeScript |
| `README.md` | Documentación general del proyecto |
| `AGENTS.md` | Reglas para asistentes de IA sobre las convenciones de Next.js |
| `CLAUDE.md` | Reglas adicionales para asistentes de IA |
| `fix_permissions.sql` | Script SQL para corregir permisos de tablas en Supabase |
| `roles_migration.sql` | Script SQL para la migración de roles de usuario |

---

## 📂 `src/` — Código fuente principal

Todo el código de la aplicación vive aquí. Está organizado en 6 subcarpetas:

---

### 📂 `src/app/` — Páginas y rutas (App Router de Next.js)

Next.js usa el sistema de archivos para definir las rutas. Cada carpeta es una ruta URL.

| Archivo | Función |
|---|---|
| `layout.tsx` | **Layout raíz** — Define la estructura HTML base, carga las fuentes (DM Sans, DM Serif Display), aplica los estilos globales, y define el metadata SEO del sitio |
| `page.tsx` | **Página de inicio (Landing page)** — Página pública con hero, estadísticas, categorías de servicios, y botones para registrarse/iniciar sesión. Tema oscuro con acentos naranja |
| `globals.css` | Estilos CSS globales (importa TailwindCSS) |
| `favicon.ico` | Ícono del sitio web |

---

### 📂 `src/app/auth/` — Autenticación

Todas las páginas relacionadas con registro, login y recuperación de contraseña.

#### 📂 `auth/login/`
| Archivo | Función |
|---|---|
| `page.tsx` | Página de inicio de sesión (UI y estructura) |
| `LoginForm.tsx` | **Formulario de login** — Selector de rol (usuario/prestador/admin), email, contraseña. Valida que el rol seleccionado coincida con el rol real en la BD. Redirige al dashboard correspondiente según el rol |
| `actions.ts` | Server Action para cerrar sesión (`logoutAction`) |

#### 📂 `auth/register/`
| Archivo | Función |
|---|---|
| `page.tsx` | Página de registro (UI y estructura) |
| `RegisterForm.tsx` | **Formulario de registro** — Campos: nombre, apellido, fecha de nacimiento, email, contraseña. Muestra 3 opciones de rol pero solo permite registrar como "usuario" (prestador y admin están bloqueados 🔒). Envía datos a Supabase Auth |

#### 📂 `auth/recuperar/`
| Archivo | Función |
|---|---|
| `page.tsx` | Página para solicitar recuperación de contraseña por email |

#### 📂 `auth/actualizar-clave/`
| Archivo | Función |
|---|---|
| `page.tsx` | Página para establecer nueva contraseña después de la recuperación |

#### 📂 `auth/confirmar/`
| Archivo | Función |
|---|---|
| `route.ts` | **API Route** — Maneja el callback de confirmación de email de Supabase. Intercambia el código de verificación por una sesión |

---

### 📂 `src/app/(dashboard)/` — Panel de gestión (protegido)

El paréntesis `(dashboard)` es un **route group** de Next.js — agrupa rutas sin afectar la URL.

| Archivo | Función |
|---|---|
| `layout.tsx` | **Layout del dashboard** — Obtiene el usuario autenticado del servidor, muestra el Navbar y envuelve todas las páginas del dashboard |

#### 📂 `dashboard/`
| Archivo | Función |
|---|---|
| `page.tsx` | **Página principal del dashboard** — Vista de inicio para usuarios logueados |

#### 📂 `dashboard/reservas/`
| Archivo | Función |
|---|---|
| `page.tsx` | Lista de reservas del usuario (citas agendadas con prestadores) |

#### 📂 `dashboard/reservas/nueva/`
| Archivo | Función |
|---|---|
| `page.tsx` | Formulario para crear una nueva reserva de servicio |

#### 📂 `dashboard/calificaciones/`
| Archivo | Función |
|---|---|
| `page.tsx` | Página para ver y dejar calificaciones/reseñas de servicios recibidos |

#### 📂 `dashboard/pqrs/`
| Archivo | Función |
|---|---|
| `page.tsx` | Lista de PQRS (Peticiones, Quejas, Reclamos, Sugerencias) del usuario |

#### 📂 `dashboard/pqrs/nueva/`
| Archivo | Función |
|---|---|
| `page.tsx` | Formulario para crear una nueva PQRS |

#### 📂 `dashboard/servicios/`
| Archivo | Función |
|---|---|
| `page.tsx` | Catálogo de servicios disponibles en la plataforma |

#### 📂 `dashboard/chat/`
| Archivo | Función |
|---|---|
| `page.tsx` | Sistema de chat/mensajería (comunicación entre usuarios y prestadores) |

#### 📂 `dashboard/prestador/`
| Archivo | Función |
|---|---|
| `page.tsx` | **Panel del prestador** — Vista para prestadores de servicios donde gestionan sus reservas, aceptan/rechazan solicitudes, y ven información de clientes |
| `actions.ts` | Server Actions del prestador — Lógica para aceptar/rechazar reservas, auto-crear perfil de prestador si no existe |

#### 📂 `dashboard/admin/`
| Archivo | Función |
|---|---|
| `page.tsx` | **Panel de administración** — Dashboard completo con estadísticas, gestión de usuarios, reservas, reseñas, y métricas de la plataforma. Solo accesible para administradores |
| `actions.ts` | Server Actions del admin — Consultas agregadas para obtener estadísticas, conteos, y datos del panel de administración |

---

### 📂 `src/components/` — Componentes reutilizables

#### 📂 `components/layout/`
| Archivo | Función |
|---|---|
| `Navbar.tsx` | **Barra de navegación** — Logo, enlaces a Reservas, Calificaciones, PQRS, Chat. Muestra enlace a Panel Admin solo si el email es el del administrador. Incluye botón SOS, info del usuario, y botón de cerrar sesión |

---

### 📂 `src/hooks/` — Custom Hooks de React

Hooks personalizados para manejar lógica reutilizable con estado.

| Archivo | Función |
|---|---|
| `useCliente.ts` | **Hook principal de identidad** — Obtiene el usuario autenticado, busca su `id_cliente` en el esquema `gestion.clientes`. Si no existe, lo crea automáticamente vinculándolo con `seguridad.usuarios`. Maneja estados de carga y error |
| `useReservas.ts` | Hook para obtener las reservas del cliente actual desde `gestion.reservas`. Depende de `useCliente`. Incluye función `refetch` para recargar datos |
| `usePQRS.ts` | Hook para obtener las PQRS del cliente actual desde `soporte.pqrs`. Depende de `useCliente`. Incluye función `refetch` para recargar datos |

---

### 📂 `src/lib/` — Librerías y utilidades

#### 📂 `lib/supabase/` — Clientes de Supabase
| Archivo | Función |
|---|---|
| `client.ts` | **Cliente para el navegador** — Crea instancia de Supabase para Client Components (`"use client"`). Usa la clave anónima (segura para el browser). Schema por defecto: `gestion` |
| `server.ts` | **Cliente para el servidor** — Crea instancia de Supabase para Server Components y Server Actions. Maneja cookies automáticamente para mantener la sesión |
| `middleware.ts` | **Cliente para middleware** — Crea instancia de Supabase para el Edge Runtime. Lee y escribe cookies en request/response para refrescar sesiones |

#### 📂 `lib/interfaces/`
| Archivo | Función |
|---|---|
| `repository.interface.ts` | **Interfaces base del patrón Repository** — Define `IRepository<T>` (CRUD genérico), `ServiceResult<T>` (resultado con error), `IPaginableRepository` (paginación), y `PageResult<T>` |

---

### 📂 `src/services/` — Capa de servicios y repositorios

Implementa el **patrón Repository** para separar la lógica de acceso a datos de la UI. Cada dominio tiene su propia subcarpeta con archivos especializados.

#### 📂 `services/calificaciones/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para calificaciones |
| `calificacion.schema.ts` | Esquema de validación Zod para calificaciones |
| `calificacion.repository.ts` | Repositorio — Queries a Supabase para CRUD de calificaciones |
| `calificacion.service.ts` | Servicio — Lógica de negocio sobre calificaciones |
| `calificacion.actions.ts` | Server Actions — Funciones invocables desde el frontend para crear/obtener calificaciones |

#### 📂 `services/reservas/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para reservas |
| `reserva.schema.ts` | Esquema de validación Zod para reservas |
| `reservas.repository.ts` | Repositorio — Queries a Supabase para CRUD de reservas |
| `reserva.service.ts` | Servicio — Lógica de negocio sobre reservas |
| `reserva.actions.ts` | Server Actions — Funciones invocables desde el frontend para crear/obtener reservas |

#### 📂 `services/pqrs/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para PQRS |
| `pqrs.schema.ts` | Esquema de validación Zod para PQRS |
| `pqrs.repository.ts` | Repositorio — Queries a Supabase para CRUD de PQRS |
| `pqrs.service.ts` | Servicio — Lógica de negocio sobre PQRS |
| `pqrs.actions.ts` | Server Actions — Funciones invocables desde el frontend para crear/obtener PQRS |

#### 📂 `services/servicios/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para servicios |
| `servicio.repository.ts` | Repositorio — Queries a Supabase para obtener catálogo de servicios |

#### 📂 `services/chats/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para mensajes de chat |
| `chat.repository.ts` | Repositorio — Queries a Supabase para enviar/recibir mensajes |

#### 📂 `services/usuario/`
| Archivo | Función |
|---|---|
| `types.ts` | Tipos TypeScript para usuarios |
| `usuario.repository.ts` | Repositorio — Queries a Supabase para datos de usuario |

---

### 📂 `src/types/` — Tipos TypeScript globales

| Archivo | Función |
|---|---|
| `database.types.ts` | **Tipos auto-generados de Supabase** — Define la estructura de todas las tablas, vistas, y funciones de la base de datos en TypeScript. Incluye los esquemas `gestion`, `seguridad`, y `soporte` |

---

## 📂 `public/` — Archivos estáticos

Archivos servidos directamente sin procesamiento.

| Archivo | Función |
|---|---|
| `file.svg` | Ícono SVG de archivo |
| `globe.svg` | Ícono SVG de globo |
| `next.svg` | Logo de Next.js |
| `vercel.svg` | Logo de Vercel |
| `window.svg` | Ícono SVG de ventana |

---

## 📂 `supabase/` — Configuración de Supabase

| Archivo/Carpeta | Función |
|---|---|
| `config.toml` | Configuración local de Supabase (puertos, keys, etc.) |
| `.gitignore` | Ignora archivos sensibles de Supabase |
| `migrations/` | Carpeta con migraciones de base de datos |
| `migrations/20260328155727_remote_schema.sql` | Migración del esquema remoto de la base de datos |

---

## 📂 `scratch/` — Scripts de depuración y utilidad

Scripts temporales usados durante el desarrollo para depurar, diagnosticar, y probar la base de datos. **No son parte de la aplicación en producción.**

| Archivo | Función |
|---|---|
| `create_admin.mjs` | Crea un usuario administrador en la base de datos |
| `check_data.js` / `check_data.mjs` / `check_data_v2.mjs` | Scripts para verificar datos generales en las tablas |
| `check_db.mjs` | Verifica la conexión y estructura de la base de datos |
| `check_cals.mjs` / `check_fresh_cals.mjs` / `check_new_cal.mjs` | Verifican datos de calificaciones/reseñas |
| `check_client_names.mjs` | Verifica nombres de clientes en la BD |
| `check_fks.mjs` | Verifica llaves foráneas entre tablas |
| `check_indexes.mjs` | Verifica índices de las tablas |
| `check_nulls.mjs` | Busca valores nulos en registros |
| `check_real_bookings.mjs` | Verifica reservas reales en el sistema |
| `check_id_14.mjs` | Depuración de un registro específico (ID 14) |
| `check_james_data.mjs` / `setup_james_57.mjs` / `setup_test_james.mjs` | Scripts de prueba con usuario "James" |
| `check_full_chain.mjs` | Traza la cadena completa de relaciones de un registro |
| `debug_admin_bookings.mjs` | Depuración de reservas en el panel admin |
| `debug_ids.js` / `debug_reviews.js` | Depuración de IDs y reseñas |
| `diag_admin_ids.mjs` | Diagnostica IDs en el panel admin |
| `diagnose_relationships.mjs` | Diagnostica relaciones entre tablas |
| `get_columns.mjs` | Obtiene columnas de una tabla |
| `get_triggers.mjs` | Obtiene triggers de la base de datos |
| `inspect_provider_schema.mjs` | Inspecciona el esquema de prestadores |
| `list_tables.js` | Lista todas las tablas de la BD |
| `probe_deep_join.mjs` / `probe_join.mjs` / `probe_nested_join.mjs` | Pruebas de joins entre tablas |
| `assign_test_booking.mjs` | Asigna una reserva de prueba |
| `test_insert.mjs` | Prueba inserción de registros |
| `trace_dwef_user.mjs` | Traza datos de un usuario específico |

---

## 🗄️ Esquemas de Base de Datos (Supabase)

La base de datos está organizada en **3 esquemas**:

| Esquema | Función |
|---|---|
| `seguridad` | Tabla `usuarios` — Datos de identidad: nombre, apellido, fecha de nacimiento, rol (usuario/prestador/admin), vinculado con `auth.users` vía `auth_id` |
| `gestion` | Tablas de negocio: `clientes`, `prestadores`, `servicios`, `reservas` — Toda la lógica de la plataforma de servicios |
| `soporte` | Tabla `pqrs` — Sistema de Peticiones, Quejas, Reclamos y Sugerencias |

---

## 🏗️ Arquitectura General

```
Usuario → Landing Page (/) → Registro/Login (/auth/*)
                                    ↓
                            Middleware (protección de rutas)
                                    ↓
                    ┌───────────────────────────────────┐
                    │         Dashboard (/dashboard)     │
                    ├───────────────────────────────────┤
                    │  Usuario:  Reservas, PQRS, Chat   │
                    │  Prestador: Panel prestador       │
                    │  Admin:    Panel administración    │
                    └───────────────────────────────────┘
                                    ↓
                    Hooks (useCliente, useReservas, usePQRS)
                                    ↓
                    Services (Repository Pattern)
                                    ↓
                    Supabase (PostgreSQL + Auth + RLS)
```

---

## 🔧 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.1 | Framework React con App Router |
| React | 19.2.4 | Librería de UI |
| TypeScript | 5.x | Tipado estático |
| Supabase | 2.102.1 | Backend (BD, Auth, Realtime) |
| TailwindCSS | 4.x | Estilos CSS |
| Zod | 4.3.6 | Validación de esquemas |
| React Hook Form | 7.72.0 | Gestión de formularios |
| Lucide React | 1.7.0 | Íconos SVG |
| date-fns | 4.1.0 | Formateo de fechas |
| react-hot-toast | 2.6.0 | Notificaciones tipo toast |
