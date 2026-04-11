import { supabase } from "@/lib/supabase";

export const crearReserva = async (data:any) => {
  return await supabase
    .schema("gestion")
    .from("reservas")
    .insert(data)
    .select(); // 👈 IMPORTANTE
};

export const obtenerReservas = async () => {
  return await supabase
    .schema("gestion")
    .from("reservas")
    .select("*")
    .order("id_reserva", { ascending: false });
};