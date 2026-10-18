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
 * Crea una nueva PQRS enviando los datos a la API REST de Go.
 * Cuenta con fallback resiliente hacia Supabase si la API no responde.
 */
export async function createPqrs(payload: {
  id_cliente: number;
  id_reserva: number;
  tipo_pqr: string;
  descripcion: string;
}) {
  const supabase = createBrowserSupabaseClient();

  // 1. Obtener token de autenticación del usuario activo
  let token = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (_) {}

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://apiserviya.onrender.com/api/v1";

  // 2. Intentar registrar a través de la API REST de Go: /operativo/pqrs
  try {
    const response = await fetch(`${apiUrl}/operativo/pqrs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return [data];
    } else {
      const errorData = await response.json().catch(() => null);
      console.warn("⚠️ [PQRS Web]: Respuesta no exitosa de la API Go:", errorData);
    }
  } catch (err) {
    console.warn("⚠️ [PQRS Web]: Error conectando con API Go. Aplicando contingencia en Supabase:", err);
  }

  // 3. Fallback resiliente directo en Supabase
  const fallbackPayload = {
    ...payload,
    estado_pqr: "Abierto",
  };

  const { data, error } = await supabase
    .schema("soporte")
    .from("pqrs")
    .insert([fallbackPayload])
    .select();

  if (error) throw error;
  return data;
}

