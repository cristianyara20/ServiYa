import { z } from "zod";

export const CreateCalificacionSchema = z.object({
  idReserva: z.number().int().positive(),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().min(3).max(500),
});

export const UpdateCalificacionSchema = CreateCalificacionSchema.partial();

export type CreateCalificacionInput = z.infer<typeof CreateCalificacionSchema>;
export type UpdateCalificacionInput = z.infer<typeof UpdateCalificacionSchema>;