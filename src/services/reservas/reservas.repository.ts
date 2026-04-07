import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { IRepository } from "@/lib/interfaces/repository.interface";
import type { Reserva, CreateReservaDTO } from "./types";

function mapToReserva(row: any): Reserva {
  return {
    idReserva: row.id_reserva,
    idCliente: row.id_cliente,
    idPrestador: row.id_prestador,
    idServicio: row.id_servicio,
    nombreServicio: row.servicios?.nombre_servicio ?? "—",
    fechaSolicitud: row.fecha_solicitud,
    fechaAgenda: row.fecha_agenda,
    direccion: row.direccion,
    descripcion: row.descripcion,
  };
}

function mapToInsertRow(dto: CreateReservaDTO) {
  return {
    id_cliente: dto.idCliente,
    id_prestador: dto.idPrestador,
    id_servicio: dto.idServicio,
    fecha_agenda: dto.fechaAgenda,
    ...(dto.fechaSolicitud && { fecha_solicitud: dto.fechaSolicitud }),
    ...(dto.direccion && { direccion: dto.direccion }),
    ...(dto.descripcion && { descripcion: dto.descripcion }),
  };
}

function mapToUpdateRow(dto: Partial<CreateReservaDTO>) {
  return {
    ...(dto.idCliente !== undefined && { id_cliente: dto.idCliente }),
    ...(dto.idPrestador !== undefined && { id_prestador: dto.idPrestador }),
    ...(dto.idServicio !== undefined && { id_servicio: dto.idServicio }),
    ...(dto.fechaSolicitud !== undefined && { fecha_solicitud: dto.fechaSolicitud }),
    ...(dto.fechaAgenda !== undefined && { fecha_agenda: dto.fechaAgenda }),
    ...(dto.direccion !== undefined && { direccion: dto.direccion }),
    ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
  };
}

export class ReservaRepository implements IRepository<Reserva, number, CreateReservaDTO> {
  async findAll(): Promise<Reserva[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("reservas")
      .select("*, servicios(nombre_servicio)");
    if (error) throw new Error(error.message);
    return data.map(mapToReserva);
  }

  async findById(id: number): Promise<Reserva | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("reservas")
      .select("*, servicios(nombre_servicio)")
      .eq("id_reserva", id)
      .single();
    if (error) return null;
    return mapToReserva(data);
  }

  async create(dto: CreateReservaDTO): Promise<Reserva> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("reservas")
      .insert(mapToInsertRow(dto))
      .select("*, servicios(nombre_servicio)")
      .single();
    if (error) throw new Error(error.message);
    return mapToReserva(data);
  }

  async update(id: number, dto: Partial<CreateReservaDTO>): Promise<Reserva | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("reservas")
      .update(mapToUpdateRow(dto))
      .eq("id_reserva", id)
      .select("*, servicios(nombre_servicio)")
      .single();
    if (error) return null;
    return mapToReserva(data);
  }

  async delete(id: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .schema("gestion")
      .from("reservas")
      .delete()
      .eq("id_reserva", id);
    return !error;
  }
}