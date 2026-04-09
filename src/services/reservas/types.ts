export interface Reserva {
  idReserva: number;
  idCliente: number;
  idPrestador: number | null;
  idServicio: number;
  nombreServicio?: string;
  fechaSolicitud: string;
  fechaAgenda: string;
  direccion?: string | null;
  descripcion?: string | null;
}

export type CreateReservaDTO = Omit<Reserva, "idReserva" | "fechaSolicitud" | "nombreServicio"> & {
  fechaSolicitud?: string;
};

export type UpdateReservaDTO = Partial<CreateReservaDTO>;

export interface ReservaFilters {
  idCliente?: number;
  idPrestador?: number;
}