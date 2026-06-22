import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkDeepNestedJoin() {
    console.log("Trying deep nested join reservas -> clientes -> usuarios -> nombre...");
    const { data, error } = await supabase
        .schema('gestion')
        .from('reservas')
        .select(`
            id_reserva,
            id_cliente (
              usuarios:id_cliente (
                nombre
              )
            )
        `)
        .limit(1);
    
    if (error) {
        console.error("Deep nested join failed:", error.message);
        // Try another variation
        console.log("Trying with explicit schema hint...");
        const { data: d2, error: e2 } = await supabase
            .schema('gestion')
            .from('reservas')
            .select(`
                id_reserva,
                id_cliente (
                  usuarios!id_cliente (
                    nombre
                  )
                )
            `)
            .limit(1);
        if (e2) console.error("Second attempt failed:", e2.message);
        else console.log("Second attempt worked!");
    } else {
        console.log("Deep nested join worked!", JSON.stringify(data, null, 2));
    }
}
checkDeepNestedJoin();
