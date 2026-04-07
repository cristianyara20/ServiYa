/**
 * Entidad PQRS
 */
export interface Pqrs {
  idPqr: number;
  descripcion: string;
  estadoPqr: string;
  idCliente: number;
  idReserva: number;
  tipoPqr: string;
}

/**
 * DTO Crear
 */
export type CreatePqrsDTO = Omit<Pqrs, "idPqr"> & {
  estadoPqr?: string;
};

/**
 * DTO Update
 */
export type UpdatePqrsDTO = Partial<CreatePqrsDTO>;