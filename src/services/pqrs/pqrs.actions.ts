"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PqrsRepository } from "./pqrs.repository";
import { PqrsService } from "./pqrs.service";
import { CreatePqrsSchema } from "./pqrs.schema";

const repo = new PqrsRepository();
const service = new PqrsService(repo);

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createPqrsAction(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    idCliente: Number(formData.get("idCliente")),
    idReserva: Number(formData.get("idReserva")),
    tipoPqr: formData.get("tipoPqr") as string,
    descripcion: formData.get("descripcion") as string,
  };

  const validation = CreatePqrsSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: "Errores en el formulario",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const result = await service.create({
    ...validation.data,
    estadoPqr: validation.data.estadoPqr ?? "pendiente",
  });

  if (!result.success) {
    return { success: false, message: result.error || "Error" };
  }

  revalidatePath("/dashboard/pqrs");
  redirect("/dashboard/pqrs");
}

export async function deletePqrsAction(
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

  revalidatePath("/dashboard/pqrs");

  return { success: true, message: "PQRS eliminado" };
}