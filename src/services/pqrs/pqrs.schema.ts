import { z } from "zod";

/**
 * Crear PQRS
 */
export const CreatePqrsSchema = z.object({
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede superar 500 caracteres"),

  tipoPqr: z
    .string()
    .min(3, "El tipo debe tener al menos 3 caracteres")
    .max(50),

  idCliente: z
    .number()
    .int("Debe ser un número entero")
    .positive("Debe ser positivo"),

  idReserva: z
    .number()
    .int("Debe ser un número entero")
    .positive("Debe ser positivo"),

  estadoPqr: z
    .string()
    .optional(), // normalmente lo maneja el sistema
});

/**
 * Actualizar PQRS
 */
export const UpdatePqrsSchema = CreatePqrsSchema.partial();

/**
 * Tipos
 */
export type CreatePqrsInput = z.infer<typeof CreatePqrsSchema>;
export type UpdatePqrsInput = z.infer<typeof UpdatePqrsSchema>;