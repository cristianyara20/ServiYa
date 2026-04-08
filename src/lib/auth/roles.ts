/**
 * @file src/lib/auth/roles.ts
 * @description Lógica para consultar y validar roles de usuario.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type UserRole = 'admin' | 'cliente' | 'prestador' | null;

/**
 * Obtiene el rol de un usuario consultando la tabla seguridad.usuarios.
 * @param userId ID de autenticación (auth_id) del usuario.
 * @returns El rol encontrado o null si no se encuentra.
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .schema('seguridad')
      .from('usuarios' as any)
      .select('rol' as any)
      .eq('auth_id', userId)
      .single();

    if (error || !data) {
      console.warn(`No se encontró rol para el usuario ${userId}:`, error?.message);
      return null;
    }

    return (data as any).rol as UserRole;
  } catch (err) {
    console.error("Error al obtener rol del usuario:", err);
    return null;
  }
}

/**
 * Verifica si el usuario actual tiene el rol requerido.
 */
export async function checkRole(requiredRole: UserRole): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const role = await getUserRole(user.id);
  return role === requiredRole;
}
