import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkRealBookings() {
    // Check ALL reservas above id 10 (likely real ones)
    const { data: res } = await supabase.schema('gestion').from('reservas')
        .select('id_reserva, id_cliente, id_prestador, estado_reserva, fecha_solicitud')
        .gt('id_reserva', 10)
        .order('id_reserva', { ascending: false })
        .limit(20);
    console.log("Real reservas (id > 10):");
    console.table(res);

    // Check gestion.clientes for real users (id > 50)
    const { data: clis } = await supabase.schema('gestion').from('clientes')
        .select('id_cliente, auth_id').gt('id_cliente', 50);
    console.log("\ngestion.clientes with id > 50:");
    console.table(clis);

    // The link between them:
    // What id_cliente values appear in real reservations?
    const clienteIds = [...new Set(res?.map(r => r.id_cliente) || [])];
    console.log("\nDistinct id_cliente in recent reservas:", clienteIds);

    // Cross-reference with seguridad.usuarios
    const { data: users } = await supabase.schema('seguridad').from('usuarios')
        .select('id_usuario, nombre, correo').in('id_usuario', clienteIds);
    console.log("\nMatching seguridad.usuarios:");
    console.table(users);
}
checkRealBookings();
