import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkJames() {
    console.log("Searching for user: james@gmail.com");
    const { data: user } = await supabase.schema('seguridad').from('usuarios').select('*').eq('correo', 'james@gmail.com').maybeSingle();
    
    if (user) {
        console.log("User found:", JSON.stringify(user, null, 2));
        const dbId = user.id_usuario;
        
        console.log(`\nChecking bookings for id_prestador = ${dbId}...`);
        const { data: res } = await supabase.schema('gestion').from('reservas').select('*').eq('id_prestador', dbId);
        if (res && res.length > 0) {
            console.log(`Found ${res.length} bookings:`);
            console.table(res);
        } else {
            console.log("No bookings found for this provider ID.");
        }

        console.log("\nWhat bookings exist in the system?");
        const { data: allRes } = await supabase.schema('gestion').from('reservas').select('id_reserva, id_prestador, estado_reserva').limit(10);
        console.table(allRes);
    } else {
        console.log("User james@gmail.com not found in seguridad.usuarios.");
    }
}
checkJames();
