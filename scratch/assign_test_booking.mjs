import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function assignTest() {
    console.log("Assigning Booking #1 to James (ID 14)...");
    const { error } = await supabase
        .schema('gestion')
        .from('reservas')
        .update({ id_prestador: 14, estado_reserva: 'pendiente', subservicio: 'Reparación de Fuga (TEST)' })
        .eq('id_reserva', 1);
    
    if (error) console.error("Error:", error);
    else console.log("Success! Booking #1 is now pending for James.");
}
assignTest();
