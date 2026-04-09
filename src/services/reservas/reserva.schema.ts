import { z } from "zod";

/**
 * Crear Reserva
 */
export const CreateReservaSchema = z.object({
  idCliente: z
    .number()
    .int("Debe ser un número entero")
    .positive(),

  idPrestador: z
    .number()
    .int("Debe ser un número entero")
    .positive(),

  idServicio: z
    .number()
    .int("Debe ser un número entero")
    .positive(),

  fechaAgenda: z
    .string()
    .min(5, "Fecha inválida"), // puedes mejorar con date luego

  descripcion: z
    .string()
    .max(300)
    .optional(),

  direccion: z
    .string()
    .max(200)
    .optional(),
});

/**
 * Actualizar Reserva
 */
export const UpdateReservaSchema = CreateReservaSchema.partial();

/**
 * Tipos
 */
export type CreateReservaInput = z.infer<typeof CreateReservaSchema>;
export type UpdateReservaInput = z.infer<typeof UpdateReservaSchema>;