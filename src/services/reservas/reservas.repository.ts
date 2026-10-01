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
    id_servicio: dto.idServicio,
    fecha_agenda: dto.fechaAgenda,
    ...(dto.idPrestador != null && { id_prestador: dto.idPrestador }),
    ...(dto.fechaSolicitud && { fecha_solicitud: dto.fechaSolicitud }),
    ...(dto.direccion && { direccion: dto.direccion }),
    ...(dto.descripcion && { descripcion: dto.descripcion }),
  };
}

function mapToUpdateRow(dto: Partial<CreateReservaDTO>) {
  return {
    ...(dto.idCliente !== undefined && { id_cliente: dto.idCliente }),
    ...(dto.idPrestador != null && { id_prestador: dto.idPrestador }),
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
    const { data: { session } } = await supabase.auth.getSession();

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_REPORTES_API_URL ||
      "https://apiserviya.onrender.com/api/v1";

    if (apiBaseUrl) {
      try {
        const payload = {
          id_cliente: dto.idCliente,
          id_servicio: dto.idServicio,
          id_prestador: dto.idPrestador ?? null,
          direccion: dto.direccion || "",
          descripcion: dto.descripcion || "",
          fecha_agenda: dto.fechaAgenda,
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
        }

        const response = await fetch(`${apiBaseUrl}/reservas`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const resJson = await response.json();
          return mapToReserva(resJson);
        }
      } catch (e) {
        console.warn("⚠️ API Go fallback a Supabase en create:", e);
      }
    }

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