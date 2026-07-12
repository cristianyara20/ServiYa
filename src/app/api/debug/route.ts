import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch servicios
    const { data: servicios, error: err1 } = await supabase.schema("gestion").from("servicios").select("*");
    
    // Fetch últimas reservas
    const { data: reservas, error: err2 } = await supabase.schema("gestion").from("reservas").select("*").order("id_reserva", { ascending: false }).limit(5);

    if (err1 || err2) return NextResponse.json({ error: err1?.message || err2?.message });
    return NextResponse.json({ servicios, reservas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
