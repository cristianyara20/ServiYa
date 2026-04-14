/**
 * @file services/servicios/servicioClientService.ts
 * @description Servicio de servicios para el navegador.
 * Encapsula queries de Supabase para el catálogo de servicios
 * del lado del cliente. Solo importa librerías externas e infraestructura.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Obtiene todos los servicios disponibles.
 */
export async function getServicios() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .schema("gestion")
    .from("servicios")
    .select("*");

  if (error) throw error;
  return data;
}
