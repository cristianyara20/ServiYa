import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { IRepository } from "@/lib/interfaces/repository.interface";
import type { Pqrs, CreatePqrsDTO } from "./types";

function mapToPqrs(row: any): Pqrs {
  return {
    idPqr: row.id_pqr,
    descripcion: row.descripcion,
    estadoPqr: row.estado_pqr,
    idCliente: row.id_cliente,
    idReserva: row.id_reserva,
    tipoPqr: row.tipo_pqr,
  };
}

function mapToInsertRow(dto: CreatePqrsDTO) {
  return {
    descripcion: dto.descripcion,
    tipo_pqr: dto.tipoPqr,
    id_cliente: dto.idCliente,
    id_reserva: dto.idReserva,
    estado_pqr: dto.estadoPqr ?? "pendiente",
  };
}

function mapToUpdateRow(dto: Partial<CreatePqrsDTO>) {
  return {
    ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
    ...(dto.tipoPqr !== undefined && { tipo_pqr: dto.tipoPqr }),
    ...(dto.idCliente !== undefined && { id_cliente: dto.idCliente }),
    ...(dto.idReserva !== undefined && { id_reserva: dto.idReserva }),
    ...(dto.estadoPqr !== undefined && { estado_pqr: dto.estadoPqr }),
  };
}

export class PqrsRepository implements IRepository<Pqrs, number, CreatePqrsDTO> {
  async findAll(): Promise<Pqrs[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .select("*");
    if (error) throw new Error(error.message);
    return data.map(mapToPqrs);
  }

  async findById(id: number): Promise<Pqrs | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .select("*")
      .eq("id_pqr", id)
      .single();
    if (error) return null;
    return mapToPqrs(data);
  }

  async create(dto: CreatePqrsDTO): Promise<Pqrs> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .insert(mapToInsertRow(dto))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapToPqrs(data);
  }

  async update(id: number, dto: Partial<CreatePqrsDTO>): Promise<Pqrs | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .update(mapToUpdateRow(dto))
      .eq("id_pqr", id)
      .select()
      .single();
    if (error) return null;
    return mapToPqrs(data);
  }

  async delete(id: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .delete()
      .eq("id_pqr", id);
    return !error;
  }
}