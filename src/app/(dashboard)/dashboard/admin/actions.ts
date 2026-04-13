"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

/**
 * CONFIGURACIÓN DE SUPABASE ADMIN
 * Se utiliza la Service Role Key para saltar las políticas de RLS 
 * y permitir la gestión total de usuarios.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * OBTIENE TODA LA INFORMACIÓN PARA EL DASHBOARD ADMINISTRATIVO
 * Cruza datos de Supabase Auth con las tablas de negocio en diferentes esquemas.
 */
export async function getAdminDashboardData() {
  const errors: Record<string, string> = {};

  // 1. Obtiene la lista global de usuarios desde Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) errors.auth = authError.message;
  const authUsersList = authData?.users || [];

  /**
   * FUNCIÓN AUXILIAR: fetchWithDiag
   * Ejecuta consultas en esquemas específicos y registra errores de diagnóstico.
   */
  async function fetchWithDiag(schema: string, table: string) {
    const { data, error } = await supabaseAdmin.schema(schema).from(table).select("*");
    if (error) {
      errors[`${schema}.${table}`] = error.message;
      return [];
    }
    return data || [];
  }

  // Carga masiva de datos desde los distintos esquemas de la base de datos
  const segUsuarios = await fetchWithDiag("seguridad", "usuarios");
  const clientes = await fetchWithDiag("gestion", "clientes");
  const reservas = await fetchWithDiag("gestion", "reservas");
  const calificaciones = await fetchWithDiag("gestion", "calificaciones");
  const pqrs = await fetchWithDiag("soporte", "pqrs");

  // Plan B: Si la tabla de gestión de reservas falla o está vacía, busca en el esquema public por defecto
  let finalReservas = reservas;
  if (reservas.length === 0 && !errors["gestion.reservas"]) {
    const { data: pubRes } = await supabaseAdmin.from("reservas").select("*");
    if (pubRes && pubRes.length > 0) finalReservas = pubRes;
  }

  // --- MAPEO DE IDENTIDAD TOTAL ---
  // Crea mapas en memoria para búsquedas rápidas por ID o Email
  const authMap = new Map<string, any>();
  const authMapByEmail = new Map<string, any>();
  authUsersList.forEach(u => {
    authMap.set(u.id, u);
    if (u.email) authMapByEmail.set(u.email.toLowerCase(), u);
  });

  const allUsersMap = new Map<string, any>();

  // Sincroniza los usuarios de la tabla de seguridad con los de Auth
  segUsuarios.forEach(s => {
    const email = s.correo?.toLowerCase();
    const authUser = s.auth_id ? authMap.get(s.auth_id) : (email ? authMapByEmail.get(email) : null);

    const userIdKey = String(s.id_usuario);
    allUsersMap.set(userIdKey, {
      id: authUser?.id || `legacy-${s.id_usuario}`, // Etiqueta como 'legacy' si no existe en Auth
      db_id: s.id_usuario,
      email: s.correo || authUser?.email || 'N/A',
      nombre: s.nombre || authUser?.email?.split('@')[0] || 'Usuario',
      apellido: s.apellido || '',
      created_at: authUser?.created_at || new Date(0).toISOString(),
      is_auth: !!authUser,
      validIds: new Set([String(s.id_usuario), s.auth_id, authUser?.id].filter(Boolean) as string[])
    });
  });

  // Agrega al mapa aquellos usuarios que existen en Auth pero no en la tabla seguridad.usuarios
  authUsersList.forEach(u => {
    const email = u.email?.toLowerCase();
    const alreadyIn = segUsuarios.some(s => s.auth_id === u.id || (s.correo && s.correo.toLowerCase() === email));
    if (!alreadyIn) {
      allUsersMap.set(u.id, {
        id: u.id,
        db_id: null,
        email: u.email,
        nombre: u.email?.split('@')[0],
        apellido: '',
        created_at: u.created_at,
        is_auth: true,
        validIds: new Set([u.id])
      });
    }
  });

  // --- PROCESAMIENTO DE MÉTRICAS POR USUARIO ---
  const enrichedUsers = Array.from(allUsersMap.values()).map(user => {
    const numericId = Number(user.db_id);

    // Cuenta Citas/Reservas asociadas
    const userReservs = finalReservas.filter(r => Number(r.id_cliente) === numericId);
    const uCitas = userReservs.length;

    // Cuenta PQRs (soporte)
    const uPQRs = pqrs.filter(p => Number(p.id_cliente) === numericId || Number((p as any).id_usuario) === numericId).length;

    // Cuenta Reseñas basadas en las reservas del usuario
    const uReservIds = new Set(userReservs.map(r => String(r.id_reserva)));
    const uResenas = calificaciones.filter(c => uReservIds.has(String(c.id_reserva))).length;

    return {
      ...user,
      metrics: { citas: uCitas, resenas: uResenas, pqrs: uPQRs }
    };
  });

  // --- ESTADÍSTICAS GLOBALES DEL SITIO ---
  const totalCitas = finalReservas.length;
  const totalResenas = calificaciones.length;
  const totalPQRs = pqrs.length;
  const totalSumaPuntos = calificaciones.reduce((acc, curr) => acc + Number(curr.puntuacion || 0), 0);
  const promedioTotal = totalResenas > 0 ? (totalSumaPuntos / totalResenas).toFixed(1) : "0.0";
  const pqrsPendientes = pqrs.filter(p => !['Resuelto', 'Cerrado'].includes(p.estado_pqr)).length;

  const userByDbId = new Map<number, any>();
  Array.from(allUsersMap.values()).forEach(u => {
    if (u.db_id != null) userByDbId.set(Number(u.db_id), u);
  });

  // --- FORMATEO DE LISTAS DETALLADAS PARA LAS TABLAS DEL DASHBOARD ---
  const allReservas = finalReservas.map(r => {
    const u = userByDbId.get(Number(r.id_cliente));
    return { ...r, cliente_nombre: u?.nombre || `Cliente #${r.id_cliente}`, cliente_email: u?.email || 'N/A' };
  });

  const allPQRsList = pqrs.map(p => {
    const u = userByDbId.get(Number(p.id_cliente)) || userByDbId.get(Number((p as any).id_usuario));
    return { ...p, cliente_nombre: u?.nombre || `Cliente #${p.id_cliente}`, cliente_email: u?.email || 'N/A' };
  });

  const allReviewsList = calificaciones.map(c => {
    const res = finalReservas.find(r => Number(r.id_reserva) === Number(c.id_reserva));
    const u = res ? userByDbId.get(Number(res.id_cliente)) : null;
    return {
      ...c,
      cliente_nombre: u?.nombre ? `${u.nombre}${u.apellido ? ' ' + u.apellido : ''}` : `Cliente #${res?.id_cliente ?? '?'}`,
      cliente_email: u?.email || 'N/A',
      servicio_id: res?.id_servicio || '?',
    };
  });

  return {
    users: enrichedUsers,
    allReservas,
    allPQRs: allPQRsList,
    allReviews: allReviewsList,
    stats: {
      usuarios: enrichedUsers.length,
      citas: totalCitas,
      resenas: totalResenas,
      pqrs: totalPQRs,
      promedio: promedioTotal,
      pqrPendientes: pqrsPendientes,
    },
    debug: { errors, counts: { total_users: enrichedUsers.length, auth: authUsersList.length, res: totalCitas, pqr: totalPQRs, cal: totalResenas } }
  };
}

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * ELIMINA UN USUARIO (AUTH + DB + CASCADA MANUAL)
 */
export async function deleteAdminUser(id: string, db_id?: any) {
  // Verificación de seguridad: Solo permite la acción si el usuario activo tiene rol 'admin'
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== 'admin') {
    return { error: 'No autorizado. Solo los administradores pueden eliminar usuarios.' };
  }

  // 1. Elimina de Supabase Auth (si no es un usuario legacy)
  if (!id.startsWith('legacy-')) {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Error deleting auth user:", authError);
      return { error: `Auth Error: ${authError.message}` };
    }
  }

  const targetDbId = id.startsWith('legacy-') ? id.replace('legacy-', '') : db_id;

  if (targetDbId) {
    // 2. Limpieza en cascada manual de todas las relaciones en la base de datos
    try {
      // Borra PQRs relacionadas
      await supabaseAdmin.schema('soporte').from('pqrs').delete().eq('id_cliente', targetDbId);
      await supabaseAdmin.schema('soporte').from('pqrs').delete().eq('id_usuario', targetDbId);

      // Borra calificaciones vinculadas a las reservas del usuario
      const { data: userReservas } = await supabaseAdmin.schema('gestion').from('reservas').select('id_reserva').eq('id_cliente', targetDbId);
      if (userReservas && userReservas.length > 0) {
        const resIds = userReservas.map(r => r.id_reserva);
        await supabaseAdmin.schema('gestion').from('calificaciones').delete().in('id_reserva', resIds);
      }

      // Borra registros de reservas (como cliente o prestador)
      await supabaseAdmin.schema('gestion').from('reservas').delete().eq('id_cliente', targetDbId);
      await supabaseAdmin.schema('gestion').from('reservas').delete().eq('id_prestador', targetDbId);

      // Borra perfiles de cliente/prestador
      await supabaseAdmin.schema('gestion').from('clientes').delete().eq('id_cliente', targetDbId);
      await supabaseAdmin.schema('gestion').from('prestadores').delete().eq('id_prestador', targetDbId);
    } catch (cleanupError) {
      console.error("Cleanup warning:", cleanupError);
    }

    // 3. Finalmente, borra el registro de la tabla de seguridad.usuarios
    const { error: dbError } = await supabaseAdmin
      .schema('seguridad')
      .from('usuarios')
      .delete()
      .eq('id_usuario', targetDbId);

    if (dbError) {
      console.error("Error deleting from DB:", dbError);
      return { error: `DB Error: ${dbError.message}` };
    }
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * ACTUALIZA DATOS DE USUARIO (AUTH + DB)
 */
export async function updateAdminUser(id: string, attributes: any, db_id?: any) {
  const isLegacy = id.startsWith('legacy-');
  const metadata = attributes.user_metadata || {};

  // 1. Actualiza en Supabase Auth si es un usuario real
  if (!isLegacy) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, attributes);
    if (authError) return { error: authError.message };
  }

  // 2. Sincroniza los cambios con la tabla seguridad.usuarios para mantener consistencia
  const targetDbId = isLegacy ? id.replace('legacy-', '') : db_id;

  if (targetDbId) {
    const { error: dbError } = await supabaseAdmin
      .schema('seguridad')
      .from('usuarios')
      .update({
        nombre: metadata.nombre,
        apellido: metadata.apellido,
        rol: metadata.rol,
        correo: attributes.email,
        fecha_nacimiento: metadata.fecha_nacimiento || null
      })
      .eq('id_usuario', targetDbId);

    if (dbError) {
      console.error("Error syncing to DB:", dbError);
      if (isLegacy) return { error: `Error en base de datos: ${dbError.message}` };
    }
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * CREA UN NUEVO USUARIO DESDE EL PANEL DE ADMIN
 * Se confirma el email automáticamente y se asignan metadatos.
 */
export async function createAdminUser(email: string, password?: string, metadata: any = {}) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password || '123456',
    email_confirm: true, // Evita que el usuario tenga que validar el correo para entrar
    user_metadata: {
      nombre: metadata.nombre || '',
      apellido: metadata.apellido || '',
      rol: metadata.rol || 'usuario',
      fecha_nacimiento: metadata.fecha_nacimiento || null
    }
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin');
  return { success: true, user: data.user };
}