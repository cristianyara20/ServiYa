export interface Calificacion {
  idCalificacion: number;
  idReserva: number;
  puntuacion: number;
  comentario: string;
  fechaCalificacion: string;
}

export type CreateCalificacionDTO = Omit<Calificacion, "idCalificacion" | "fechaCalificacion"> & {
  fechaCalificacion?: string;
};

export type UpdateCalificacionDTO = Partial<CreateCalificacionDTO>;

export interface CalificacionFilters {
  idReserva?: number;
  puntuacionMin?: number;
  puntuacionMax?: number;
}