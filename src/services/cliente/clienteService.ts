/**
 * @file services/cliente/clienteService.ts
 * @description Servicio de cliente para el navegador.
 * Encapsula todas las queries de Supabase relacionadas con
 * la identidad del usuario y su perfil de cliente.
 * Solo importa librerías externas e infraestructura.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Obtiene el usuario autenticado actual desde Supabase Auth.
 */
export async function getAuthUser() {
  const supabase = createBrowserSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Obtiene la sesión actual del usuario.
 */
export async function getAuthSession() {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Suscribirse a cambios de estado de autenticación.
 * Devuelve una función de limpieza para desuscribirse.
 */
export function subscribeAuthState(callback: (user: any) => void) {
  const supabase = createBrowserSupabaseClient();
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );
  return () => {
    listener.subscription.unsubscribe();
  };
}

/**
 * Busca el id_cliente en gestion.clientes por auth_id.
 * Devuelve null si no existe.
 */
export async function getClienteByAuthId(authId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data: cliente, error } = await supabase
    .schema("gestion")
    .from("clientes")
    .select("id_cliente")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw error;
  return cliente;
}
