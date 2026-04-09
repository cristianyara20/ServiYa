import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkNestedJoin() {
    console.log("Trying nested join reservas -> clientes -> usuarios...");
    const { data, error } = await supabase
        .schema('gestion')
        .from('reservas')
        .select(`
            id_reserva,
            id_cliente (
              auth_id
            )
        `)
        .limit(1);
    
    if (error) {
        console.error("Nested join failed:", error.message);
    } else {
        console.log("Nested join worked:", JSON.stringify(data, null, 2));
    }

    console.log("\nTrying join with seguridad.usuarios via id_cliente directly...");
    const { data: data2, error: error2 } = await supabase
        .schema('gestion')
        .from('reservas')
        .select(`
            id_reserva,
            cliente:id_cliente!inner (
               *
            )
        `)
        .limit(1);
    if (error2) console.error("Direct join failed again:", error2.message);
    else console.log("Direct join worked:", JSON.stringify(data2, null, 2));
}
checkNestedJoin();
