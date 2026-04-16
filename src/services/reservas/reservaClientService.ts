/**
 * @file services/reservas/reservaClientService.ts
 * @description Servicio de reservas para el navegador.
 * Encapsula queries de Supabase para reservas del lado del cliente.
 * Solo importa librerías externas e infraestructura.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Obtiene las reservas de un cliente específico.
 */
export async function getReservasByCliente(clienteId: number) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .schema("gestion")
    .from("reservas")
    .select("*, servicios(nombre_servicio)")
    .eq("id_cliente", clienteId)
    .order("fecha_agenda", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Crea una nueva reserva.
 */
export async function createReserva(payload: {
  id_cliente: number;
  id_prestador: number | null;
  id_servicio: number;
  direccion: string;
  descripcion: string;
  fecha_agenda: string;
}) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .schema("gestion")
    .from("reservas")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}
