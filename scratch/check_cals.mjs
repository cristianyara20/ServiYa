import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkCals() {
    console.log("=== gestion.calificaciones (first 10) ===");
    const { data, error } = await supabase.schema('gestion').from('calificaciones').select('*').limit(10);
    if (error) console.error("Error:", error.message);
    else {
        console.table(data);
        console.log("Total found:", data.length);
    }

    console.log("\n=== gestion.reservas joined with calificaciones ===");
    const { data: res } = await supabase.schema('gestion').from('reservas')
        .select('id_reserva, id_cliente, estado_reserva').limit(10);
    console.table(res);
}
checkCals();
