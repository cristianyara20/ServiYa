"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Credenciales (Usando variables de entorno del proyecto actual)
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function getAdminDashboardData() {
  const errors: Record<string, string> = {};
  
  // 1. Fetch de todas las tablas base
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) errors.auth = authError.message;
  const authUsersList = authData?.users || [];

  async function fetchWithDiag(schema: string, table: string) {
    const { data, error } = await supabaseAdmin.schema(schema).from(table).select("*");
    if (error) {
      errors[`${schema}.${table}`] = error.message;
      return [];
    }
    return data || [];
  }

  const segUsuarios = await fetchWithDiag("seguridad", "usuarios");
  const clientes = await fetchWithDiag("gestion", "clientes");
  const reservas = await fetchWithDiag("gestion", "reservas");
  const calificaciones = await fetchWithDiag("gestion", "calificaciones");
  const pqrs = await fetchWithDiag("soporte", "pqrs");

  // Plan B: Resurgimiento de reservas si falló esquema gestión
  let finalReservas = reservas;
  if (reservas.length === 0 && !errors["gestion.reservas"]) {
     const { data: pubRes } = await supabaseAdmin.from("reservas").select("*");
     if (pubRes && pubRes.length > 0) finalReservas = pubRes;
  }

  // --- Mapeo de Identidad Total ---
  const authMap = new Map<string, any>();
  const authMapByEmail = new Map<string, any>();
  authUsersList.forEach(u => {
      authMap.set(u.id, u);
      if (u.email) authMapByEmail.set(u.email.toLowerCase(), u);
  });

  // Generar la lista enriquecida empezando por la tabla de seguridad (dueña de los nombres y de las reseñas antiguas)
  const allUsersMap = new Map<string, any>();

  segUsuarios.forEach(s => {
      const email = s.correo?.toLowerCase();
      const authUser = s.auth_id ? authMap.get(s.auth_id) : (email ? authMapByEmail.get(email) : null);
      
      const userIdKey = String(s.id_usuario);
      allUsersMap.set(userIdKey, {
          id: authUser?.id || `legacy-${s.id_usuario}`, 
          db_id: s.id_usuario,
          email: s.correo || authUser?.email || 'N/A',
          nombre: s.nombre || authUser?.email?.split('@')[0] || 'Usuario',
          apellido: s.apellido || '',
          created_at: authUser?.created_at || new Date(0).toISOString(),
          is_auth: !!authUser,
          validIds: new Set([String(s.id_usuario), s.auth_id, authUser?.id].filter(Boolean) as string[])
      });
  });

  // Añadir usuarios de Auth que NO estén en seguridad (si los hay)
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

  // Procesar Métricas para cada usuario en la lista combinada
  const enrichedUsers = Array.from(allUsersMap.values()).map(user => {
    const numericId = Number(user.db_id);

    // 1. Citas - match by id_cliente == db_id (numeric)
    const userReservs = finalReservas.filter(r => Number(r.id_cliente) === numericId);
    const uCitas = userReservs.length;

    // 2. PQRs
    const uPQRs = pqrs.filter(p => Number(p.id_cliente) === numericId || Number((p as any).id_usuario) === numericId).length;

    // 3. Reseñas
    const uReservIds = new Set(userReservs.map(r => String(r.id_reserva)));
    const uResenas = calificaciones.filter(c => uReservIds.has(String(c.id_reserva))).length;

    return {
      ...user,
      metrics: { citas: uCitas, resenas: uResenas, pqrs: uPQRs }
    };
  });

  // Estadísticas Globales
  const totalCitas = finalReservas.length;
  const totalResenas = calificaciones.length;
  const totalPQRs = pqrs.length;
  const totalSumaPuntos = calificaciones.reduce((acc, curr) => acc + Number(curr.puntuacion || 0), 0);
  const promedioTotal = totalResenas > 0 ? (totalSumaPuntos / totalResenas).toFixed(1) : "0.0";
  const pqrsPendientes = pqrs.filter(p => !['Resuelto', 'Cerrado'].includes(p.estado_pqr)).length;

  // Build a simple numeric-keyed map for fast lookup by id_usuario
  const userByDbId = new Map<number, any>();
  Array.from(allUsersMap.values()).forEach(u => {
    if (u.db_id != null) userByDbId.set(Number(u.db_id), u);
  });

  // Listas para pestañas detalladas
  const allReservas = finalReservas.map(r => {
      const u = userByDbId.get(Number(r.id_cliente));
      return { ...r, cliente_nombre: u?.nombre || `Cliente #${r.id_cliente}`, cliente_email: u?.email || 'N/A' };
  });

  const allPQRsList = pqrs.map(p => {
      const u = userByDbId.get(Number(p.id_cliente)) || userByDbId.get(Number((p as any).id_usuario));
      return { ...p, cliente_nombre: u?.nombre || `Cliente #${p.id_cliente}`, cliente_email: u?.email || 'N/A' };
  });

  const allReviewsList = calificaciones.map(c => {
      // id_calificacion → id_reserva → id_cliente → id_usuario en seguridad
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

export async function deleteAdminUser(id: string) {
  if (id.startsWith('legacy-')) return; // No borrar legacy desde el auth list
  await supabaseAdmin.auth.admin.deleteUser(id);
  revalidatePath('/dashboard/admin');
}

export async function updateAdminUser(id: string, attributes: any, db_id?: any) {
  const isLegacy = id.startsWith('legacy-');
  const metadata = attributes.user_metadata || {};
  
  // 1. Si NO es legado, actualizar en Supabase Auth
  if (!isLegacy) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, attributes);
    if (authError) return { error: authError.message };
  }

  // 2. Sincronizar con la tabla seguridad.usuarios
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

export async function createAdminUser(email: string, password?: string, metadata: any = {}) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ 
    email, 
    password: password || '123456', 
    email_confirm: true,
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
