"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Obtiene los datos necesarios para el Dashboard del Prestador
 */
export async function getPrestadorDashboardData(authId: string) {
  try {
    // 1. Obtener el perfil del prestador (ID de usuario en la DB)
    let { data: usuario } = await supabaseAdmin
      .schema('seguridad')
      .from('usuarios')
      .select('id_usuario, nombre, apellido, correo')
      .eq('auth_id', authId)
      .maybeSingle();

    // Fallback: Si no está vinculado por auth_id, buscamos por correo
    if (!usuario) {
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(authId);
      if (authUser?.email) {
        const { data: fallbackUser } = await supabaseAdmin
          .schema('seguridad')
          .from('usuarios')
          .select('id_usuario, nombre, apellido, correo')
          .eq('correo', authUser.email)
          .maybeSingle();
        
        if (fallbackUser) {
          usuario = fallbackUser;
          await supabaseAdmin.schema('seguridad').from('usuarios')
            .update({ auth_id: authId }).eq('id_usuario', fallbackUser.id_usuario);
        }
      }
    }

    if (!usuario) throw new Error("No se encontró el perfil del prestador vinculado a esta cuenta.");

    const dbId = usuario.id_usuario;

    // 2. Obtener estado de disponibilidad del prestador
    const { data: prestador } = await supabaseAdmin
      .schema('gestion')
      .from('prestadores')
      .select('estado_disponibilidad, experiencia, calificacion_promedio')
      .eq('id_prestador', dbId)
      .maybeSingle();

    // 3. Reservas PENDIENTES: ALL open requests (no id_prestador filter)
    //    Este es el "mercado": cualquier prestador puede aceptar una reserva pendiente.
    //    Una vez aceptada, id_prestador se asigna y desaparece del mercado.
    const { data: pendientesRaw, error: pendError } = await supabaseAdmin
      .schema('gestion')
      .from('reservas')
      .select('*')
      .eq('estado_reserva', 'pendiente')
      .order('fecha_solicitud', { ascending: true });

    if (pendError) throw pendError;

    // 4. Reservas PROPIAS: aceptadas, en curso o terminadas - solo las de este prestador
    const { data: propiasRaw, error: propError } = await supabaseAdmin
      .schema('gestion')
      .from('reservas')
      .select('*')
      .eq('id_prestador', dbId)
      .in('estado_reserva', ['aceptada', 'terminada', 'rechazada'])
      .order('fecha_agenda', { ascending: true });

    if (propError) throw propError;

    // 5. Obtener nombres de clientes para todas las reservas
    const allReservas = [...(pendientesRaw || []), ...(propiasRaw || [])];
    const clienteIds = [...new Set(allReservas.map(r => r.id_cliente).filter(Boolean))];
    
    let clientesMap = new Map();
    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabaseAdmin
        .schema('seguridad')
        .from('usuarios')
        .select('id_usuario, nombre, apellido, correo')
        .in('id_usuario', clienteIds);
      
      clientesData?.forEach(c => clientesMap.set(c.id_usuario, c));
    }

    // 6. Unir datos: pendientes del mercado + las propias
    const reservas = [
      ...(pendientesRaw || []).map(r => ({
        ...r,
        cliente: clientesMap.get(r.id_cliente) || null
      })),
      ...(propiasRaw || []).map(r => ({
        ...r,
        cliente: clientesMap.get(r.id_cliente) || null
      }))
    ];

    return {
      success: true,
      perfil: {
        ...usuario,
        ...prestador,
        id_usuario: dbId,
        disponibilidad: prestador?.estado_disponibilidad || 'disponible'
      },
      reservas
    };

  } catch (error: any) {
    console.error("Error fetching provider dashboard data:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado de una reserva (Aceptar, Rechazar, Terminar).
 * Al ACEPTAR, auto-crea el perfil en gestion.prestadores si no existe
 * para evitar el error de clave foránea.
 */
export async function updateBookingStatus(bookingId: number, newStatus: string, prestadorId?: number) {
  try {
    // Al aceptar: asegurar que el prestador existe en gestion.prestadores
    if (newStatus === 'aceptada' && prestadorId) {
      await supabaseAdmin
        .schema('gestion')
        .from('prestadores')
        .upsert({
          id_prestador: prestadorId,
          experiencia: '',
          calificacion_promedio: 5.0,
          estado_disponibilidad: 'disponible'
        }, { onConflict: 'id_prestador', ignoreDuplicates: true });
    }

    const updatePayload: Record<string, any> = { estado_reserva: newStatus };

    // Al aceptar, asignar este prestador a la reserva
    if (newStatus === 'aceptada' && prestadorId) {
      updatePayload.id_prestador = prestadorId;
    }

    const { error } = await supabaseAdmin
      .schema('gestion')
      .from('reservas')
      .update(updatePayload)
      .eq('id_reserva', bookingId);

    if (error) throw error;

    revalidatePath('/dashboard/prestador');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado de disponibilidad del prestador
 */
export async function updatePrestadorAvailability(dbId: number, newStatus: string) {
  try {
    const { error } = await supabaseAdmin
      .schema('gestion')
      .from('prestadores')
      .upsert({
        id_prestador: dbId,
        estado_disponibilidad: newStatus,
        experiencia: '', // Valor por defecto para evitar violación de restricción NOT NULL
        calificacion_promedio: 5.0 // Valor por defecto inicial
      }, { onConflict: 'id_prestador' });

    if (error) throw error;

    revalidatePath('/dashboard/prestador');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
