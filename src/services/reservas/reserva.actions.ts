"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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