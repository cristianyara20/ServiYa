"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CalificacionRepository } from "./calificacion.repository";
import { CalificacionService } from "./calificacion.service";
import { CreateCalificacionSchema } from "./calificacion.schema";

const repo = new CalificacionRepository();
const service = new CalificacionService(repo);

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createCalificacionAction(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    idReserva: Number(formData.get("idReserva")),
    puntuacion: Number(formData.get("puntuacion")),
    comentario: formData.get("comentario") as string,
  };

  const validation = CreateCalificacionSchema.safeParse(rawData);

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

  revalidatePath("/dashboard/calificaciones");
  redirect("/dashboard/calificaciones");
}

export async function deleteCalificacionAction(
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

  revalidatePath("/dashboard/calificaciones");

  return { success: true, message: "Calificación eliminada" };
}