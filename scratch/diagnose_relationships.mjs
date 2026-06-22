import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function diagnose() {
    console.log("--- PERFILES EN SEGURIDAD.USUARIOS ---");
    const { data: users } = await supabase.schema('seguridad').from('usuarios').select('id_usuario, nombre, auth_id, rol').limit(5);
    console.table(users);

    console.log("\n--- RESERVAS EN GESTION.RESERVAS ---");
    const { data: res } = await supabase.schema('gestion').from('reservas').select('id_reserva, id_cliente, id_prestador, id_servicio, estado_reserva').limit(5);
    console.table(res);

    console.log("\n--- CLIENTES EN GESTION.CLIENTES ---");
    const { data: cli } = await supabase.schema('gestion').from('clientes').select('id_cliente, auth_id').limit(5);
    console.table(cli);
}
diagnose();
