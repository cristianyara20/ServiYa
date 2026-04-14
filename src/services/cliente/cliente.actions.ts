"use server";

/**
 * @file services/cliente/cliente.actions.ts
 * @description Server Action para sincronizar perfil de cliente.
 * Usa admin client para bypass de RLS.
 * Solo importa librerías externas.
 */

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function syncClienteProfile(authId: string) {
  try {
    // 1. Obtener de seguridad.usuarios
    const { data: usuarioSeg, error: errorSeg } = await supabaseAdmin
      .schema("seguridad")
      .from("usuarios")
      .select("id_usuario")
      .eq("auth_id", authId)
      .single();

    if (errorSeg || !usuarioSeg) {
      return { error: "No se encontró usuario en esquema de seguridad" };
    }

    // 2. Hacer UPSERT en gestion.clientes brincándose el RLS
    const { data: nuevoCliente, error: errorInsert } = await supabaseAdmin
      .schema("gestion")
      .from("clientes")
      .upsert({
        id_cliente: usuarioSeg.id_usuario,
        auth_id: authId,
      })
      .select()
      .single();

    if (errorInsert) {
      return { error: errorInsert.message };
    }

    return { success: true, id_cliente: nuevoCliente.id_cliente };
  } catch (error: any) {
    return { error: error.message };
  }
}
