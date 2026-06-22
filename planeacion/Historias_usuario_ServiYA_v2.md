# 📋 Historias de Usuario — ServiYA v2.0

> **Sistema de Información para el agendamiento de servicios para hogar**
> Versión refactorizada con base en el estado real del proyecto — Junio 2026

---

## 📌 Tabla Resumen del Backlog

| ID | Historia | Módulo | Prioridad | Estado |
|---|---|---|---|---|
| US001 | Iniciar sesión con selección de rol | Auth | Muy Alta | ✅ Implementado |
| US002 | Acceder al módulo PQR | PQRS | Muy Alta | ✅ Implementado |
| US003 | Llenar formulario PQR | PQRS | Alta | ✅ Implementado |
| US004 | Enviar formulario PQR | PQRS | Alta | ✅ Implementado |
| US005 | Admin visualizar PQRs | PQRS | Alta | ✅ Implementado |
| US006 | Admin responder un PQR | PQRS | Muy Alta | 🔴 Pendiente |
| US007 | Cliente calificar un servicio | Calificaciones | Muy Alta | ✅ Implementado |
| US008 | Cliente escribir una reseña | Calificaciones | Alta | ✅ Implementado |
| US009 | Prestador responder reseñas | Calificaciones | Alta | 🔴 Pendiente |
| US010 | Admin revisar reseñas | Calificaciones | Muy Alta | 🔴 Pendiente |
| US011 | Admin eliminar reseñas inapropiadas | Calificaciones | Muy Alta | 🔴 Pendiente |
| US012 | Cliente agendar un servicio | Reservas | Muy Alta | ✅ Implementado |
| US013 | Cliente cancelar una reserva | Reservas | Alta | 🔴 Pendiente |
| US014 | Prestador actualizar disponibilidad | Reservas | Muy Alta | 🔴 Pendiente |
| US015 | Admin supervisar agendamientos | Reservas | Alta | ✅ Implementado (parcial) |
| US016 | Admin generar reportes del sistema | Reportes | Muy Alta | ✅ Implementado |
| US017 | Cliente registrarse en la plataforma | Auth | Muy Alta | ✅ Implementado |
| US018 | Cliente recuperar contraseña | Auth | Alta | ✅ Implementado |
| US019 | Cliente actualizar su contraseña | Auth | Alta | ✅ Implementado |
| US020 | Prestador ver sus reservas asignadas | Prestador | Muy Alta | ✅ Implementado |
| US021 | Prestador aceptar o rechazar reserva | Prestador | Muy Alta | ✅ Implementado |
| US022 | Cliente explorar catálogo de servicios | Servicios | Alta | ✅ Implementado |
| US023 | Chat entre cliente y prestador | Chat | Alta | ✅ Implementado |
| US024 | Dashboard principal post-login | Dashboard | Alta | ✅ Implementado |
| US025 | Admin consultar servicios populares | Reportes | Alta | ✅ Implementado |
| US026 | Admin consultar actividad de usuarios | Reportes | Alta | ✅ Implementado |
| US027 | Admin descargar reporte en PDF | Reportes | Muy Alta | ✅ Implementado |
| US028 | Auto-creación de perfil de prestador | Prestador | Alta | ✅ Implementado |

---

## 🔐 Sección 1 — Autenticación y Usuarios

---

### US001 — Iniciar sesión con selección de rol
**Código:** CU001
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** usuario (cliente, prestador o administrador)
**NECESITO** iniciar sesión seleccionando mi rol
**PARA** acceder al panel correspondiente a mi tipo de cuenta

**Criterios de Aceptación:**
- El sistema muestra tres opciones de rol: Usuario, Prestador, Administrador
- Si el usuario ingresa correo y contraseña válidos y el rol coincide con la BD, se permite el acceso
- Si el rol seleccionado no corresponde al rol real del usuario, el acceso es denegado con mensaje claro
- Si los datos son incorrectos, no permite el acceso
- Si el usuario deja campos vacíos, muestra un mensaje para completar el campo
- Según el rol, redirige a: `/dashboard` (usuario), `/dashboard/prestador` (prestador), `/dashboard/admin` (administrador)

**Escenarios:**
- Usuario ingresa correo, contraseña válidos y rol correcto → acceso permitido, redirección al panel correspondiente
- Usuario selecciona rol incorrecto (ej: es cliente pero elige prestador) → acceso denegado con mensaje de rol
- Usuario ingresa datos incorrectos → acceso denegado
- Usuario deja campos vacíos → sistema muestra mensaje de validación

**Necesitamos:**
- Correo, contraseña y selector de rol
- Tabla `seguridad.usuarios` con campo de rol
- Supabase Auth activo

---

### US017 — Registrarse en la plataforma
**Código:** CU017
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** persona nueva
**NECESITO** registrarme como usuario cliente
**PARA** poder usar la plataforma y agendar servicios

**Criterios de Aceptación:**
- El formulario solicita: nombre, apellido, fecha de nacimiento, correo electrónico y contraseña
- El registro solo está disponible para el rol "usuario" (cliente); los roles prestador y administrador están bloqueados con mensaje explicativo
- El sistema valida que el correo no esté ya registrado
- Tras el registro, se envía un correo de confirmación al email del usuario
- El usuario no puede iniciar sesión hasta confirmar su email

**Escenarios:**
- Usuario completa todos los campos y envía → registro exitoso, correo de confirmación enviado
- Usuario intenta registrarse con correo ya existente → mensaje de error
- Usuario intenta seleccionar rol prestador o admin → opción bloqueada, muestra candado 🔒
- Usuario deja campos obligatorios vacíos → validación bloquea el envío

**Necesitamos:**
- Formulario de registro con validación
- Supabase Auth para creación de usuario
- Trigger en BD para insertar en `seguridad.usuarios` automáticamente

---

### US018 — Recuperar contraseña
**Código:** CU018
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** usuario registrado
**NECESITO** recuperar mi contraseña olvidada
**PARA** volver a acceder a mi cuenta

**Criterios de Aceptación:**
- El sistema solicita el correo electrónico del usuario
- Si el correo existe en el sistema, se envía un email con enlace de recuperación
- El enlace de recuperación expira después de un tiempo definido por Supabase

**Escenarios:**
- Usuario ingresa correo válido registrado → email de recuperación enviado
- Usuario ingresa correo no registrado → mensaje genérico (sin revelar si existe o no)
- Usuario no ingresa correo → validación bloquea el envío

**Necesitamos:**
- Correo registrado en Supabase Auth
- Servicio de email de Supabase configurado

---

### US019 — Actualizar contraseña
**Código:** CU019
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** usuario que recibió el email de recuperación
**NECESITO** establecer una nueva contraseña
**PARA** recuperar el acceso a mi cuenta

**Criterios de Aceptación:**
- El usuario accede a la página de actualización desde el enlace en su email
- El sistema solicita la nueva contraseña y su confirmación
- Si las contraseñas coinciden y cumplen los requisitos, se actualiza correctamente
- Tras actualizar, el usuario es redirigido al login

**Escenarios:**
- Usuario ingresa contraseña válida y coincidente → contraseña actualizada, redirección al login
- Contraseñas no coinciden → mensaje de error de validación
- Enlace expirado → mensaje indicando que el enlace ya no es válido

**Necesitamos:**
- Token de recuperación de Supabase Auth (en la URL del callback)
- Formulario de nueva contraseña

---

## 📢 Sección 2 — Módulo PQRS

---

### US002 — Acceder al módulo PQR
**Código:** CU002
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** usuario cliente
**NECESITO** acceder al módulo PQR
**PARA** registrar una petición, queja, reclamo o sugerencia

**Criterios de Aceptación:**
- Si el usuario ha iniciado sesión, puede ver y acceder al módulo PQR desde el navbar
- Si el usuario no ha iniciado sesión, el middleware redirige al login
- El módulo muestra el listado de PQRS propias del cliente

**Escenarios:**
- Usuario cliente inicia sesión → puede ver y acceder al módulo PQR
- Usuario no autenticado intenta acceder a `/dashboard/pqrs` → redirigido al login

**Necesitamos:**
- Usuario autenticado con rol cliente
- Middleware de protección de rutas activo
- Esquema `soporte.pqrs` en la BD

---

### US003 — Llenar formulario PQR
**Código:** CU003
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** usuario cliente
**NECESITO** llenar el formulario de PQR
**PARA** registrar formalmente mi petición, queja, reclamo o sugerencia

**Criterios de Aceptación:**
- El formulario contiene campos obligatorios: tipo de PQR (selector: Petición / Queja / Reclamo / Sugerencia), descripción y reserva asociada
- El campo `tipo_pqr` es un selector, no texto libre
- El campo `id_reserva` debe ser una reserva existente del cliente
- Si el usuario deja campos vacíos, el sistema bloquea el envío con mensajes de validación (Zod)
- La descripción tiene longitud mínima para garantizar información suficiente

**Escenarios:**
- Usuario completa todos los campos obligatorios → formulario válido, puede enviar
- Usuario deja campos vacíos → sistema muestra error y no permite continuar
- Usuario selecciona una reserva que no le pertenece → error de validación

**Necesitamos:**
- Tipo de PQR (selector)
- Descripción (texto)
- ID de reserva vinculada al cliente

---

### US004 — Enviar formulario PQR
**Código:** CU004
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** usuario cliente
**NECESITO** enviar el formulario PQR completado
**PARA** que quede registrado en el sistema y sea atendido

**Criterios de Aceptación:**
- Si el formulario está completo y válido, se envía mediante Server Action a Supabase
- El PQR queda guardado con `estado_pqr = "abierto"` por defecto
- El sistema muestra confirmación de envío exitoso (toast de éxito)
- Si hay campos vacíos, no permite el envío

**Escenarios:**
- Formulario completo → envío exitoso, toast de confirmación, redirección al listado
- Formulario incompleto → sistema muestra error de validación y no envía

**Necesitamos:**
- PQR con todos los campos válidos
- Server Action `crearPQRS`
- Usuario autenticado como cliente con `id_cliente` válido

---

### US005 — Administrador visualizar PQRs
**Código:** CU005
**Prioridad:** Alta
**Estado:** ✅ Implementado (panel web Next.js)

**COMO** administrador
**NECESITO** visualizar todas las PQRs del sistema
**PARA** hacer seguimiento y atender las solicitudes de los clientes

**Criterios de Aceptación:**
- El administrador accede desde el panel de administración en `/dashboard/admin`
- Puede ver un listado de todas las PQRs con estado (abierto/cerrado/en proceso)
- Puede ver los detalles de cada PQR
- Solo el administrador autorizado tiene acceso (protegido por email en middleware)

**Escenarios:**
- Administrador ingresa al panel → visualiza listado de PQRs con estados
- Administrador selecciona un PQR → puede ver detalles completos
- Usuario normal intenta acceder a `/dashboard/admin` → redirigido, acceso denegado

**Necesitamos:**
- Acceso de administrador (email autorizado en middleware)
- Panel de administración en Next.js

---

### US006 — Administrador responder un PQR *(PENDIENTE)*
**Código:** CU006
**Prioridad:** Muy Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** administrador
**NECESITO** responder un PQR
**PARA** dar solución al problema del cliente

**Criterios de Aceptación:**
- El administrador puede escribir una respuesta textual a la PQR
- Una vez dada la respuesta, el `estado_pqr` cambia a "resuelto" automáticamente
- El sistema no permite enviar respuesta vacía
- La respuesta queda almacenada y visible para el cliente

**Escenarios:**
- Administrador escribe respuesta y envía → estado cambia a "Resuelto"
- Administrador intenta enviar respuesta vacía → sistema no permite registrar solución

**Necesitamos implementar:**
- Campo `respuesta` en tabla `soporte.pqrs`
- UI en panel admin para escribir y enviar respuesta
- Server Action para actualizar PQR con respuesta y cambio de estado

---

## ⭐ Sección 3 — Módulo Calificaciones y Reseñas

---

### US007 — Cliente calificar un servicio
**Código:** CU007
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** cliente
**NECESITO** calificar un servicio recibido
**PARA** reflejar mi experiencia con el prestador

**Criterios de Aceptación:**
- El sistema solo permite calificar servicios que tengan una reserva registrada en la BD
- La calificación debe ser de 1 a 5 estrellas (puntuacion en la tabla)
- El sistema no permite enviar calificación sin seleccionar estrellas
- La calificación queda asociada al `id_reserva` y al cliente que la realizó
- Cada reserva solo puede tener una calificación (relación 1 a 1 en BD)

**Escenarios:**
- Cliente selecciona entre 1 a 5 estrellas y envía → calificación registrada exitosamente
- Cliente no selecciona estrellas → mensaje de validación "Debe seleccionar una puntuación"
- Cliente intenta calificar dos veces la misma reserva → error de duplicado

**Necesitamos:**
- Selector de 1 a 5 estrellas
- Reserva asociada (`id_reserva`)
- Usuario autenticado como cliente con `id_cliente`

---

### US008 — Cliente escribir una reseña
**Código:** CU008
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** cliente
**NECESITO** escribir un comentario junto a mi calificación
**PARA** justificar mi opinión sobre el servicio recibido

**Criterios de Aceptación:**
- El campo comentario es obligatorio junto a la calificación
- El comentario debe tener mínimo 10 caracteres y máximo 500 caracteres
- No se puede enviar la reseña sin haber seleccionado una puntuación
- La calificación y el comentario se envían juntos en un solo formulario

**Escenarios:**
- Cliente ingresa texto válido (≥10 caracteres) y puntuación → reseña registrada exitosamente
- Cliente intenta enviar reseña sin texto → mensaje "El comentario es requerido"
- Cliente intenta publicar sin calificación → mensaje "Debe seleccionar una puntuación"

**Necesitamos:**
- Texto de comentario (campo obligatorio)
- Puntuación seleccionada (1-5)
- Usuario autenticado como cliente

---

### US009 — Prestador responder reseñas *(PENDIENTE)*
**Código:** CU009
**Prioridad:** Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** prestador
**NECESITO** responder las reseñas recibidas
**PARA** aclarar comentarios de los clientes y mejorar mi reputación

**Criterios de Aceptación:**
- El prestador solo puede responder reseñas que correspondan a sus propios servicios
- El sistema no permite modificar la reseña original del cliente
- Cada reseña puede tener máximo una respuesta del prestador
- No se puede responder una reseña de otro prestador

**Escenarios:**
- Prestador responde reseña de su propio servicio → respuesta registrada
- Prestador intenta responder reseña de otro prestador → error de permisos
- Prestador intenta añadir segunda respuesta → no permitido

**Necesitamos implementar:**
- Campo `respuesta_prestador` en tabla `gestion.calificaciones`
- UI en panel prestador para responder reseñas
- Validación de pertenencia de la reseña al prestador

---

### US010 — Administrador revisar reseñas
**Código:** CU010
**Prioridad:** Muy Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** administrador
**NECESITO** revisar las reseñas publicadas
**PARA** garantizar la calidad de contenido del sistema

**Criterios de Aceptación:**
- El administrador puede visualizar todas las reseñas y sus respuestas en el panel admin
- El administrador puede marcar una reseña como "inapropiada"
- Las reseñas marcadas quedan en estado pendiente de eliminación

**Escenarios:**
- Admin ingresa al panel → lista de reseñas visible
- Admin marca reseña como inapropiada → estado cambia a "inapropiada"

**Necesitamos implementar:**
- Campo `estado_resena` en tabla `gestion.calificaciones`
- Panel de revisión de reseñas en dashboard admin

---

### US011 — Administrador eliminar reseñas inapropiadas *(PENDIENTE)*
**Código:** CU011
**Prioridad:** Muy Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** administrador
**NECESITO** eliminar reseñas inapropiadas
**PARA** mantener la calidad del contenido en el sistema

**Criterios de Aceptación:**
- El sistema elimina la reseña seleccionada tras confirmación del admin
- La reseña deja de ser visible para clientes y prestadores
- La acción es irreversible (o se puede hacer soft-delete con estado)

**Escenarios:**
- Admin confirma eliminación → reseña eliminada del sistema
- Admin cancela acción → reseña se mantiene

**Necesitamos implementar:**
- Función de eliminación de calificaciones en panel admin
- Confirmación modal antes de eliminar
- Permisos exclusivos de administrador

---

## 📅 Sección 4 — Módulo Reservas y Agendamiento

---

### US012 — Cliente agendar un servicio
**Código:** CU012
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** cliente
**NECESITO** agendar un servicio
**PARA** que un prestador atienda mi solicitud en la fecha que elija

**Criterios de Aceptación:**
- El sistema valida que el cliente esté autenticado antes de agendar
- El cliente selecciona el tipo de servicio desde el catálogo (`gestion.servicios`)
- El cliente ingresa la fecha de agenda manualmente (`fecha_agenda`)
- El cliente puede ingresar dirección y descripción del trabajo a realizar
- La reserva se crea con `id_prestador = null` inicialmente (sin asignar)
- Al guardar, aparece en el panel de los prestadores disponibles para aceptarla
- Se muestra confirmación de agendamiento exitoso

**Escenarios:**
- Cliente selecciona servicio, fecha válida y completa campos → reserva creada exitosamente
- Cliente intenta agendar sin iniciar sesión → redirigido al login
- Cliente no selecciona un servicio → validación bloquea el envío

**Necesitamos:**
- Catálogo de servicios cargado desde `gestion.servicios`
- `id_cliente` del usuario autenticado
- Campos: `id_servicio`, `fecha_agenda`, `direccion`, `descripcion`

---

### US013 — Cliente cancelar una reserva *(PENDIENTE)*
**Código:** CU013
**Prioridad:** Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** cliente
**NECESITO** poder cancelar una reserva agendada
**PARA** gestionar mis servicios cuando ya no los necesito

**Criterios de Aceptación:**
- El cliente puede acceder a su historial de reservas y cancelar una activa
- La cancelación solo está disponible para reservas en estado "pendiente" o "aceptada"
- El sistema muestra confirmación antes de cancelar
- Al cancelar, el estado de la reserva cambia a "cancelada"
- El prestador asignado es notificado (si aplica)

**Escenarios:**
- Cliente cancela reserva en estado pendiente → estado cambia a "cancelada"
- Cliente intenta cancelar reserva ya completada → acción no permitida

**Necesitamos implementar:**
- Campo `estado_reserva` en tabla `gestion.reservas`
- Botón de cancelar en historial de reservas del cliente
- Server Action para actualizar estado de reserva

---

### US014 — Prestador actualizar su disponibilidad *(PENDIENTE)*
**Código:** CU014
**Prioridad:** Muy Alta
**Estado:** 🔴 Pendiente de implementar

**COMO** prestador
**NECESITO** gestionar mis horarios de disponibilidad
**PARA** evitar agendamientos en fechas que ya están ocupadas

**Criterios de Aceptación:**
- El prestador puede marcar fechas/horarios como disponibles o no disponibles
- Los cambios se reflejan en la plataforma para que los clientes vean disponibilidad real
- El sistema no permite marcar como no disponible un horario que ya tiene reserva

**Escenarios:**
- Prestador marca horario como ocupado → no disponible para clientes
- Prestador marca horario como disponible → visible para agendamiento
- Prestador intenta bloquear horario ya reservado → mensaje de error

**Necesitamos implementar:**
- Tabla de disponibilidad de prestadores en BD
- Módulo de calendario en panel de prestador
- Integración de disponibilidad con el flujo de agendamiento

---

### US015 — Administrador supervisar agendamientos
**Código:** CU015
**Prioridad:** Alta
**Estado:** ✅ Implementado (parcial — sin filtros avanzados)

**COMO** administrador
**NECESITO** supervisar todos los agendamientos del sistema
**PARA** garantizar el correcto funcionamiento de la plataforma

**Criterios de Aceptación:**
- El administrador puede visualizar todas las reservas desde el panel admin en Next.js
- Puede ver reservas activas, canceladas y completadas
- El administrador no puede modificar reservas directamente
- La API Go expone datos de reservas en el reporte consolidado mensual

**Escenarios:**
- Admin accede al panel → visualiza listado de agendamientos con sus estados
- Admin accede al reporte mensual → ve estadísticas de reservas (pendientes, aceptadas, completadas, canceladas)

**Necesitamos:**
- Usuario autenticado como administrador
- Panel de gestión de reservas en Next.js dashboard
- API Go con endpoint `/api/v1/reportes/admin` para datos agrupados

---

## 📊 Sección 5 — Módulo Prestadores

---

### US020 — Prestador ver sus reservas asignadas
**Código:** CU020
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** prestador
**NECESITO** ver todas las reservas que me han asignado o que están disponibles
**PARA** gestionar mi trabajo diario

**Criterios de Aceptación:**
- El panel del prestador muestra todas las reservas disponibles (sin prestador asignado) y las asignadas a él
- Cada reserva muestra: servicio solicitado, fecha, dirección, descripción y datos del cliente
- El panel es accesible solo para usuarios con rol prestador

**Escenarios:**
- Prestador inicia sesión → ve panel con reservas disponibles y sus reservas aceptadas
- Usuario con rol cliente intenta acceder al panel de prestador → acceso denegado

**Necesitamos:**
- Usuario autenticado con rol prestador
- `id_prestador` válido en `gestion.prestadores`
- Query a `gestion.reservas` filtrado por prestador

---

### US021 — Prestador aceptar o rechazar una reserva
**Código:** CU021
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** prestador
**NECESITO** aceptar o rechazar reservas disponibles
**PARA** gestionar cuáles servicios voy a realizar

**Criterios de Aceptación:**
- El prestador puede aceptar una reserva → su `id_prestador` queda asignado a esa reserva
- El prestador puede rechazar una reserva → la reserva vuelve a estar disponible para otros prestadores
- Si el prestador no tiene perfil aún, se crea automáticamente al aceptar su primera reserva
- Solo reservas en estado "pendiente" pueden ser aceptadas

**Escenarios:**
- Prestador acepta reserva → `id_prestador` asignado, reserva deja de estar disponible para otros
- Prestador rechaza reserva → reserva permanece disponible para otros prestadores
- Prestador sin perfil acepta reserva → perfil creado automáticamente y luego asignado

**Necesitamos:**
- Usuario autenticado como prestador
- Server Actions `aceptarReserva` y `rechazarReserva`
- Lógica de auto-creación de perfil si no existe

---

### US028 — Auto-creación de perfil de prestador
**Código:** CU028
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** prestador recién registrado
**NECESITO** que el sistema cree mi perfil automáticamente
**PARA** poder empezar a aceptar reservas sin pasos manuales adicionales

**Criterios de Aceptación:**
- Si el usuario tiene rol prestador pero no tiene registro en `gestion.prestadores`, se crea automáticamente al hacer cualquier acción
- El perfil se crea con calificación_promedio = 0.0 y experiencia vacía por defecto
- Este proceso es transparente para el usuario

**Escenarios:**
- Prestador inicia sesión por primera vez → perfil creado automáticamente en background
- Prestador ya tiene perfil → no se crea uno nuevo

**Necesitamos:**
- Server Action que verifica y crea perfil si no existe
- `id_prestador` vinculado al `id_usuario` del prestador

---

## 💬 Sección 6 — Chat y Comunicación

---

### US023 — Chat entre cliente y prestador
**Código:** CU023
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** cliente o prestador
**NECESITO** comunicarme mediante mensajes directos con la otra parte
**PARA** coordinar detalles del servicio a realizar

**Criterios de Aceptación:**
- El sistema permite abrir un chat entre un cliente y un prestador vinculados
- Todos los mensajes quedan almacenados en `comunicacion.mensajes`
- Los mensajes muestran: contenido, fecha de envío y remitente
- El chat es accesible desde el panel del dashboard

**Escenarios:**
- Cliente abre chat con su prestador → puede enviar y recibir mensajes
- Prestador responde mensaje del cliente → mensaje almacenado en la BD

**Necesitamos:**
- Usuario autenticado (cliente o prestador)
- Esquema `comunicacion` con tablas `chats` y `mensajes`
- `id_cliente` e `id_prestador` vinculados a un chat

---

## 🛠️ Sección 7 — Catálogo y Dashboard

---

### US022 — Cliente explorar catálogo de servicios
**Código:** CU022
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** cliente
**NECESITO** explorar el catálogo de servicios disponibles
**PARA** elegir el tipo de servicio que necesito agendar

**Criterios de Aceptación:**
- El catálogo muestra todos los servicios con: nombre, categoría, descripción y estado
- Solo se muestran servicios con `estado_servicio = "activo"`
- El cliente puede ver el catálogo desde el dashboard en `/dashboard/servicios`

**Escenarios:**
- Cliente accede al catálogo → ve lista de servicios disponibles con su información
- No hay servicios activos → se muestra mensaje informativo

**Necesitamos:**
- Usuario autenticado
- Tabla `gestion.servicios` con datos
- Repositorio `servicio.repository.ts`

---

### US024 — Dashboard principal post-login
**Código:** CU024
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** usuario autenticado (cualquier rol)
**NECESITO** una página principal de bienvenida al ingresar al sistema
**PARA** navegar fácilmente a los módulos disponibles según mi rol

**Criterios de Aceptación:**
- Tras iniciar sesión, el usuario es redirigido a `/dashboard`
- El dashboard muestra accesos rápidos a los módulos: Reservas, Calificaciones, PQRS, Chat, Servicios
- El Navbar muestra el link a "Panel Admin" solo si el usuario es administrador
- El dashboard se adapta según el rol del usuario

**Escenarios:**
- Usuario cliente inicia sesión → accede al dashboard con módulos de cliente
- Administrador inicia sesión → ve opción adicional de Panel Admin en el navbar

**Necesitamos:**
- Usuario autenticado con sesión válida
- Layout del dashboard con Navbar
- Middleware que protege todas las rutas `/dashboard/*`

---

## 📈 Sección 8 — Reportes (API Go)

---

### US016 — Administrador generar reportes del sistema
**Código:** CU016
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** administrador
**NECESITO** consultar reportes estadísticos del sistema
**PARA** tomar decisiones sobre la operación de la plataforma

**Criterios de Aceptación:**
- El sistema genera un reporte consolidado mensual seleccionando mes y año
- El reporte incluye:
  - Total de reservas (pendientes, aceptadas, completadas, canceladas)
  - Top 5 prestadores con más reservas y su calificación
  - Total de PQRS abiertas en el período
- El administrador debe autenticarse con JWT en la API Go para acceder
- El reporte está disponible en formato JSON y en PDF descargable

**Escenarios:**
- Admin se autentica y selecciona mes/año válido → reporte generado en JSON
- Admin solicita exportación → archivo PDF descargado correctamente
- Admin sin JWT intenta acceder a los reportes → error 401 Unauthorized

**Necesitamos:**
- Usuario autenticado como admin con JWT de Supabase
- API Go corriendo en puerto 8080
- Endpoint: `GET /api/v1/reportes/admin?mes=X&anio=Y`

---

### US025 — Admin consultar servicios más populares
**Código:** CU025
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** administrador
**NECESITO** consultar cuáles servicios son los más solicitados del mes
**PARA** enfocar los esfuerzos de la plataforma en los servicios más demandados

**Criterios de Aceptación:**
- El sistema devuelve el top 10 de servicios con más reservas en el mes y año indicados
- Cada resultado incluye: nombre del servicio, categoría y cantidad de veces solicitado
- Requiere autenticación con JWT de admin

**Escenarios:**
- Admin consulta con mes/año válido → lista de top 10 servicios
- No hay datos para el período → lista vacía sin error

**Necesitamos:**
- JWT válido de administrador
- Endpoint: `GET /api/v1/reportes/servicios-populares?mes=X&anio=Y`

---

### US026 — Admin consultar actividad de usuarios
**Código:** CU026
**Prioridad:** Alta
**Estado:** ✅ Implementado

**COMO** administrador
**NECESITO** consultar la actividad de los usuarios en un mes
**PARA** medir el crecimiento y engagement de la plataforma

**Criterios de Aceptación:**
- El sistema devuelve cuántos usuarios nuevos se registraron en el período
- El sistema devuelve cuántos usuarios estuvieron activos (con al menos una reserva)
- Requiere autenticación con JWT de admin

**Escenarios:**
- Admin consulta con mes/año válido → datos de usuarios nuevos y activos
- Sin datos → retorna ceros, no error

**Necesitamos:**
- JWT válido de administrador
- Endpoint: `GET /api/v1/reportes/actividad-usuarios?mes=X&anio=Y`

---

### US027 — Admin descargar reporte en PDF
**Código:** CU027
**Prioridad:** Muy Alta
**Estado:** ✅ Implementado

**COMO** administrador
**NECESITO** descargar el reporte mensual en formato PDF
**PARA** compartirlo o archivarlo en formato imprimible

**Criterios de Aceptación:**
- El sistema genera un PDF con: reporte consolidado, servicios populares y actividad de usuarios
- El archivo se llama `reporte.pdf` y se descarga directamente en el navegador
- El PDF incluye formato profesional con tablas y secciones diferenciadas
- Requiere autenticación con JWT de admin

**Escenarios:**
- Admin solicita PDF con mes/año válido → archivo PDF generado y descargado
- Admin sin autenticación intenta descargar → error 401 Unauthorized

**Necesitamos:**
- JWT válido de administrador
- Endpoint: `GET /api/v1/reportes/admin/pdf?mes=X&anio=Y`
- Generador de PDF en Go (gofpdf)

---

## 🔴 Resumen — Historias Pendientes de Implementar

Estas historias están documentadas pero **aún no tienen implementación** en el código actual.
Deben ser priorizadas para futuros sprints de desarrollo.

| ID | Historia | Módulo | Lo que se necesita |
|---|---|---|---|
| US006 | Admin responder PQR | PQRS | Campo `respuesta` en BD + UI en panel admin |
| US009 | Prestador responder reseñas | Calificaciones | Campo `respuesta_prestador` en BD + UI en panel prestador |
| US010 | Admin revisar reseñas | Calificaciones | Campo `estado_resena` en BD + panel de moderación |
| US011 | Admin eliminar reseñas inapropiadas | Calificaciones | Función de eliminación + confirmación modal |
| US013 | Cliente cancelar reserva | Reservas | Campo `estado_reserva` en BD + botón cancelar en UI |
| US014 | Prestador gestionar disponibilidad | Reservas | Tabla de disponibilidad en BD + módulo calendario |

---

*Documento generado el 16 de junio de 2026 — Versión 2.0*
*Basado en análisis del código real: Next.js (frontend) + Go API (backend) + Supabase (BD)*
