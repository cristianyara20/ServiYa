/**
 * @file services/pqrs/pqrsClientService.ts
 * @description Servicio de PQRS para el navegador.
 * Encapsula queries de Supabase para PQRS del lado del cliente.
 * Solo importa librerías externas e infraestructura.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Obtiene las PQRS de un cliente específico.
 */
export async function getPqrsByCliente(clienteId: number) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .schema("soporte")
    .from("pqrs")
    .select("*")
    .eq("id_cliente", clienteId)
    .order("id_pqr", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Crea una nueva PQRS.
 */
export async function createPqrs(payload: {
  id_cliente: number;
  id_reserva: number;
  tipo_pqr: string;
  descripcion: string;
}) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .schema("soporte")
    .from("pqrs")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}
