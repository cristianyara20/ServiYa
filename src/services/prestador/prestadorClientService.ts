/**
 * @file services/prestador/prestadorClientService.ts
 * @description Servicio del prestador para el navegador.
 * Encapsula queries de Supabase para el panel del prestador.
 * Solo importa librerías externas e infraestructura.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Obtiene el usuario autenticado del browser (para el panel prestador).
 */
export async function getPrestadorAuthUser() {
  const supabase = createBrowserSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Suscribe a cambios en tiempo real de la tabla reservas.
 * Devuelve una función de limpieza para desuscribirse.
 */
export function subscribeReservasChanges(onChangeCallback: () => void) {
  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    .channel("reservas_prestador")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "gestion",
        table: "reservas",
      },
      () => {
        console.log("🔄 Cambio detectado en reservas, actualizando...");
        onChangeCallback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
