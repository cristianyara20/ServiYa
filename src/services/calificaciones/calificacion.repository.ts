import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { IRepository } from "@/lib/interfaces/repository.interface";
import type { Calificacion, CreateCalificacionDTO } from "./types";

function mapToCalificacion(row: any): Calificacion {
  return {
    idCalificacion: row.id_calificacion,
    idReserva: row.id_reserva,
    puntuacion: row.puntuacion,
    comentario: row.comentario,
    fechaCalificacion: row.fecha_calificacion,
  };
}

function mapToInsertRow(dto: CreateCalificacionDTO) {
  return {
    id_reserva: dto.idReserva,
    puntuacion: dto.puntuacion,
    comentario: dto.comentario,
    ...(dto.fechaCalificacion && { fecha_calificacion: dto.fechaCalificacion }),
  };
}

function mapToUpdateRow(dto: Partial<CreateCalificacionDTO>) {
  return {
    ...(dto.idReserva !== undefined && { id_reserva: dto.idReserva }),
    ...(dto.puntuacion !== undefined && { puntuacion: dto.puntuacion }),
    ...(dto.comentario !== undefined && { comentario: dto.comentario }),
    ...(dto.fechaCalificacion !== undefined && { fecha_calificacion: dto.fechaCalificacion }),
  };
}

export class CalificacionRepository implements IRepository<Calificacion, number, CreateCalificacionDTO> {
  async findAll(): Promise<Calificacion[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("calificaciones")
      .select("*")
      .order("fecha_calificacion", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(mapToCalificacion);
  }

  async findById(id: number): Promise<Calificacion | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("calificaciones")
      .select("*")
      .eq("id_calificacion", id)
      .single();
    if (error) return null;
    return mapToCalificacion(data);
  }

  async create(dto: CreateCalificacionDTO): Promise<Calificacion> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("calificaciones")
      .insert(mapToInsertRow(dto))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapToCalificacion(data);
  }

  async update(id: number, dto: Partial<CreateCalificacionDTO>): Promise<Calificacion | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("calificaciones")
      .update(mapToUpdateRow(dto))
      .eq("id_calificacion", id)
      .select()
      .single();
    if (error) return null;
    return mapToCalificacion(data);
  }

  async delete(id: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .schema("gestion")
      .from("calificaciones")
      .delete()
      .eq("id_calificacion", id);
    return !error;
  }
}