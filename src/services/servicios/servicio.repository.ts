import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Servicio } from "./types";

function mapToServicio(row: any): Servicio {
  return {
    idServicio: row.id_servicio,
    nombreServicio: row.nombre_servicio,
    descripcion: row.descripcion,
    categoria: row.categoria,
    estadoServicio: row.estado_servicio,
  };
}

export class ServicioRepository {
  async findAll(): Promise<Servicio[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("servicios")
      .select("*")
      .eq("estado_servicio", "activo");
    if (error) throw new Error(error.message);
    return data.map(mapToServicio);
  }

  async findById(id: number): Promise<Servicio | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("gestion")
      .from("servicios")
      .select("*")
      .eq("id_servicio", id)
      .single();
    if (error) return null;
    return mapToServicio(data);
  }
}