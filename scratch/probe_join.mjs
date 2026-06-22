import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkFKs() {
    console.log("Fetching raw reservas metadata...");
    const { data: res, error } = await supabase.schema('gestion').from('reservas').select('*').limit(1);
    if (error) console.error(error);
    else console.log("Reservas row:", res[0]);

    // Check if we can join with seguridad.usuarios directly
    console.log("Trying direct join with seguridad.usuarios...");
    const { data: joinTest, error: joinErr } = await supabase
        .schema('gestion')
        .from('reservas')
        .select('*, usuarios:id_cliente(nombre)')
        .limit(1);
    
    if (joinErr) {
        console.error("Direct join failed:", joinErr.message);
        // Try another hint
        console.log("Trying join via 'id_cliente' table hint...");
         const { data: joinTest2, error: joinErr2 } = await supabase
            .schema('gestion')
            .from('reservas')
            .select('*, cliente:clientes!id_cliente(auth_id)')
            .limit(1);
        if (joinErr2) console.error("Join via clientes failed:", joinErr2.message);
        else console.log("Join via clientes worked!");
    } else {
        console.log("Direct join with usuarios worked!");
    }
}
checkFKs();
