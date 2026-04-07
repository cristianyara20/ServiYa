/**
 * @file src/modules/servicios/types.ts
 * @description Tipos para Servicios
 */

export interface Servicio {
  idServicio: number;
  nombreServicio: string;
  descripcion: string;
  categoria: string;
  estadoServicio: string;
}

/** Crear */
export type CreateServicioDTO = Omit<Servicio, "idServicio">;

/** Actualizar */
export type UpdateServicioDTO = Partial<CreateServicioDTO>;

/** Filtros */
export interface ServicioFilters {
  categoria?: string;
  estadoServicio?: string;
}