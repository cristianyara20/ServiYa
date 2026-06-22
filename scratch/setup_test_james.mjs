import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function createJamesPrestador() {
    console.log("Creating Prestador profile for James (ID 14)...");
    const { error: presErr } = await supabase
        .schema('gestion')
        .from('prestadores')
        .insert({
            id_prestador: 14,
            experiencia: 'Prestador de prueba',
            calificacion_promedio: 5.0,
            estado_disponibilidad: 'disponible'
        });
    
    if (presErr) console.error("Error creating prestador:", presErr);
    else console.log("James is now a Prestador!");

    console.log("Assigning Booking #1 to James...");
    const { error: resErr } = await supabase
        .schema('gestion')
        .from('reservas')
        .update({ id_prestador: 14, estado_reserva: 'pendiente', subservicio: 'Reparación de Fuga (TEST)' })
        .eq('id_reserva', 1);
    
    if (resErr) console.error("Error updating booking:", resErr);
    else console.log("Success! Refresh the dashboard.");
}
createJamesPrestador();
