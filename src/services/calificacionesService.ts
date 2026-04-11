import { supabase } from "@/lib/supabase";

export const obtenerReservas = async () => {
  return await supabase
    .schema("gestion")
    .from("reservas")
    .select("id_reserva")
    .order("id_reserva", { ascending: false });
};

export const crearCalificacion = async (data: any) => {
  return await supabase
    .schema("gestion")
    .from("calificaciones")
    .insert(data);
};