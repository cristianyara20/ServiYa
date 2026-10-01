/**
 * @file services/reservas/reservaClientService.ts
 * @description Servicio de reservas para el navegador.
 * Encapsula creación y consulta de reservas comunicándose con la API Go
 * con fallback de contingencia a Supabase.
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
 * Flujo: Formulario Web -> API Backend Go (POST /api/v1/reservas) -> Base de datos Supabase
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
  const { data: { session } } = await supabase.auth.getSession();

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_REPORTES_API_URL ||
    "https://apiserviya.onrender.com/api/v1";

  // 1. Intentar registrar a través de la API REST en Go
  if (apiBaseUrl) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(`${apiBaseUrl}/reservas`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdReserva = await response.json();
        return [createdReserva];
      }

      // Si la API devolvió un error de validación de negocio (400, etc.)
      if (response.status === 400 || response.status === 422) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.detalle || "Error de validación al crear la reserva");
      }
    } catch (err: any) {
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
      console.warn("⚠️ API Go no disponible, procediendo con fallback resiliente a Supabase:", err);
    }
  }

  // 2. Fallback de contingencia: Inserción directa en Supabase
  const { data, error } = await supabase
    .schema("gestion")
    .from("reservas")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}
