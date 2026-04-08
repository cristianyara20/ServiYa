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
  
  // 1. Auth Users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) errors.auth = authError.message;
  const authUsers = authData?.users || [];

  // Helper para fetch con diagnóstico
  async function fetchWithDiag(schema: string, table: string) {
    const { data, error } = await supabaseAdmin.schema(schema).from(table).select("*");
    if (error) {
      errors[`${schema}.${table}`] = error.message;
      return [];
    }
    return data || [];
  }

  const segUsers = await fetchWithDiag("seguridad", "usuarios");
  const clientes = await fetchWithDiag("gestion", "clientes");
  const reservas = await fetchWithDiag("gestion", "reservas");
  const calificaciones = await fetchWithDiag("gestion", "calificaciones");
  const pqrs = await fetchWithDiag("soporte", "pqrs");

  // Plan B: Buscar en esquema public si fallaron los específicos
  let finalReservas = reservas;
  if (reservas.length === 0 && !errors["gestion.reservas"]) {
     const { data: pubRes } = await supabaseAdmin.from("reservas").select("*");
     if (pubRes && pubRes.length > 0) finalReservas = pubRes;
  }

  // Mapeo agresivo de usuarios
  const userMapByAnyId = new Map<string, { email?: string; nombre?: string }>();
  
  segUsers.forEach(s => {
      const info = { email: s.correo, nombre: s.nombre };
      if (s.id_usuario) userMapByAnyId.set(String(s.id_usuario), info);
      if (s.auth_id) userMapByAnyId.set(s.auth_id, info);
  });

  authUsers.forEach(u => {
      if (!userMapByAnyId.has(u.id)) {
          userMapByAnyId.set(u.id, { email: u.email, nombre: u.email?.split('@')[0] });
      }
  });

  clientes.forEach(c => {
      const info = userMapByAnyId.get(c.auth_id) || { email: 'Legacy', nombre: 'Cliente #' + c.id_cliente };
      userMapByAnyId.set(String(c.id_cliente), info);
  });

  // Estadísticas GLOBALES (Basadas en el total de tablas, no solo en matches de usuarios actuales)
  let pqrsPendientes = pqrs.filter(p => p.estado_pqr !== 'Cerrado' && p.estado_pqr !== 'Resuelto').length;
  let totalSumaPuntos = calificaciones.reduce((acc, curr) => acc + Number(curr.puntuacion || 0), 0);
  let promedioTotal = calificaciones.length > 0 ? (totalSumaPuntos / calificaciones.length).toFixed(1) : "0.0";

  // Enriquecer usuarios para la lista
  const enrichedUsers = authUsers.map((user) => {
    const p = userMapByAnyId.get(user.id);
    const validIds = new Set<string>();
    
    segUsers.forEach(s => {
       if(s.auth_id === user.id || (s.correo && user.email && s.correo.toLowerCase() === user.email.toLowerCase())) {
          validIds.add(String(s.id_usuario));
       }
    });
    clientes.forEach(c => {
       if(c.auth_id === user.id) validIds.add(String(c.id_cliente));
    });
    validIds.add(user.id);

    let uCitas = finalReservas.filter(r => validIds.has(String(r.id_cliente)) || validIds.has(String(r.id_usuario))).length;
    let uPQRs = pqrs.filter(p => validIds.has(String(p.id_cliente)) || validIds.has(String(p.id_usuario))).length;
    
    // Contar reseñas específicas de este usuario (vía sus reservas)
    const uReservIds = new Set(finalReservas.filter(r => validIds.has(String(r.id_cliente)) || validIds.has(String(r.id_usuario))).map(r => String(r.id_reserva)));
    let uResenas = calificaciones.filter(c => uReservIds.has(String(c.id_reserva))).length;

    return {
      id: user.id,
      email: user.email,
      nombre: p?.nombre || user.email?.split('@')[0],
      created_at: user.created_at,
      metrics: { citas: uCitas, resenas: uResenas, pqrs: uPQRs }
    };
  });

  const allReservas = finalReservas.map(r => {
      const client = userMapByAnyId.get(String(r.id_cliente)) || userMapByAnyId.get(String(r.id_usuario));
      return { ...r, cliente_nombre: client?.nombre || 'Desconocido', cliente_email: client?.email || 'N/A' };
  });

  const allPQRs = pqrs.map(p => {
      const client = userMapByAnyId.get(String(p.id_cliente)) || userMapByAnyId.get(String(p.id_usuario));
      return { ...p, cliente_nombre: client?.nombre || 'Desconocido', cliente_email: client?.email || 'N/A' };
  });

  const allReviews = calificaciones.map(c => {
      const res = finalReservas.find(r => Number(r.id_reserva) === Number(c.id_reserva));
      const client = res ? (userMapByAnyId.get(String(res.id_cliente)) || userMapByAnyId.get(String(res.id_usuario))) : null;
      return { ...c, cliente_nombre: client?.nombre || 'Desconocido' };
  });

  return {
    users: enrichedUsers,
    allReservas,
    allPQRs,
    allReviews,
    stats: {
      usuarios: authUsers.length,
      citas: finalReservas.length,
      resenas: calificaciones.length,
      pqrs: pqrs.length,
      promedio: promedioTotal,
      pqrPendientes: pqrsPendientes,
    },
    debug: { errors, counts: { auth: authUsers.length, res: finalReservas.length, pqr: pqrs.length, cal: calificaciones.length } }
  };
}

export async function deleteAdminUser(id: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;
  revalidatePath('/dashboard/admin');
}

export async function updateAdminUser(id: string, attributes: any) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, attributes);
  if (error) throw error;
  revalidatePath('/dashboard/admin');
}

export async function createAdminUser(email: string, password?: string) {
  const { error } = await supabaseAdmin.auth.admin.createUser({ email, password: password || '123456', email_confirm: true });
  if (error) throw error;
  revalidatePath('/dashboard/admin');
}
