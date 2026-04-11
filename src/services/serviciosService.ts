// services/serviciosService.ts
import { supabase } from "@/lib/supabase";

export async function getServicios() {
  const { data, error } = await supabase
    .from("servicios")
    .select("*");

  if (error) {
    throw error;
  }

  return data;
}