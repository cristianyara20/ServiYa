"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { ReservaRepository } from "./reservas.repository";
import { ReservaService } from "./reserva.service";
import {
  CreateReservaSchema,
  UpdateReservaSchema
} from "./reserva.schema";

const repo = new ReservaRepository();
const service = new ReservaService(repo);

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createReservaAction(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    idCliente: Number(formData.get("idCliente")),
    idPrestador: Number(formData.get("idPrestador")),
    idServicio: Number(formData.get("idServicio")),
    fechaAgenda: formData.get("fechaAgenda") as string,
    direccion: formData.get("direccion") as string,
    descripcion: formData.get("descripcion") as string,
  };

  const validation = CreateReservaSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: "Errores en el formulario",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const result = await service.create(validation.data);

  if (!result.success) {
    return { success: false, message: result.error || "Error" };
  }

  revalidatePath("/dashboard/reservas");
  redirect("/dashboard/reservas");
}

export async function deleteReservaAction(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const id = Number(formData.get("id"));

  if (!id) {
    return { success: false, message: "ID inválido" };
  }

  const result = await service.delete(id);

  if (!result.success) {
    return { success: false, message: result.error || "Error al eliminar" };
  }

  revalidatePath("/dashboard/reservas");

  return { success: true, message: "Reserva eliminada" };
}

export async function cancelarReservaAction(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const id = Number(formData.get("id"));
  const idCliente = Number(formData.get("idCliente"));

  if (!id || !idCliente) {
    return { success: false, message: "ID de reserva o cliente inválido" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    return { success: false, message: "No autenticado" };
  }

  const apiUrl = process.env.NEXT_PUBLIC_REPORTES_API_URL;

  // Si la variable de entorno para la API en producción existe y no es localhost, usamos la API de Go
  if (apiUrl && !apiUrl.includes("localhost")) {
    try {
      const response = await fetch(`${apiUrl}/reservas/${id}/cancelar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id_cliente: idCliente }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", response.status, errorData);
        return { success: false, message: errorData.error || "Error al cancelar la reserva por la API" };
      }

      revalidatePath("/dashboard/reservas");
      return { success: true, message: "Reserva cancelada correctamente" };
    } catch (err: any) {
      console.error("Fetch Error:", err);
      return { success: false, message: "Error de conexión con la API" };
    }
  }

  // FALLBACK: Si no hay API configurada (ej. en Vercel sin backend desplegado),
  // actualizamos el estado directamente en Supabase.
  const updatePayload: any = { estado_reserva: "cancelada" };
  const { error } = await supabase
    .schema("gestion")
    .from("reservas")
    .update(updatePayload)
    .eq("id_reserva", id)
    .eq("id_cliente", idCliente)
    .in("estado_reserva", ["pendiente", "aceptada"]);

  if (error) {
    console.error("Supabase Update Error:", error);
    return { success: false, message: "Error al cancelar la reserva en la base de datos" };
  }

  revalidatePath("/dashboard/reservas");
  return { success: true, message: "Reserva cancelada correctamente" };
}