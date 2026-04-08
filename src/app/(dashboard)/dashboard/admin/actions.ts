"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Credenciales
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvxhporsajorgckeisna.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eGhwb3JzYWpvcmdja2Vpc25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyNTIzNSwiZXhwIjoyMDg5MDAxMjM1fQ.2jGgr7tocFeq1QSsLdzUZBQ3sA_PytrNhbBiJBEcPPg';

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
    // 1. Citas
    const userReservs = finalReservas.filter(r => 
        user.validIds.has(String(r.id_cliente)) || 
        user.validIds.has(String(r.id_usuario))
    );
    const uCitas = userReservs.length;

    // 2. PQRs
    const uPQRs = pqrs.filter(p => 
        user.validIds.has(String(p.id_cliente)) || 
        user.validIds.has(String(p.id_usuario))
    ).length;

    // 3. Reseñas (Fijación crítica en id_reserva)
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

  // Listas para pestañas detalladas
  const allReservas = finalReservas.map(r => {
      const u = Array.from(allUsersMap.values()).find(user => user.validIds.has(String(r.id_cliente)) || user.validIds.has(String(r.id_usuario)));
      return { ...r, cliente_nombre: u?.nombre || 'Desconocido', cliente_email: u?.email || 'N/A' };
  });

  const allPQRsList = pqrs.map(p => {
      const u = Array.from(allUsersMap.values()).find(user => user.validIds.has(String(p.id_cliente)) || user.validIds.has(String(p.id_usuario)));
      return { ...p, cliente_nombre: u?.nombre || 'Desconocido', cliente_email: u?.email || 'N/A' };
  });

  const allReviewsList = calificaciones.map(c => {
      const res = finalReservas.find(r => String(r.id_reserva) === String(c.id_reserva));
      const u = res ? Array.from(allUsersMap.values()).find(user => user.validIds.has(String(res.id_cliente)) || user.validIds.has(String(res.id_usuario))) : null;
      return { ...c, cliente_nombre: u?.nombre || 'Desconocido' };
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

export async function updateAdminUser(id: string, attributes: any) {
  if (id.startsWith('legacy-')) return;
  await supabaseAdmin.auth.admin.updateUserById(id, attributes);
  revalidatePath('/dashboard/admin');
}

export async function createAdminUser(email: string, password?: string) {
  await supabaseAdmin.auth.admin.createUser({ email, password: password || '123456', email_confirm: true });
  revalidatePath('/dashboard/admin');
}
