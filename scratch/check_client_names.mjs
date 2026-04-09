import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkClientNames() {
    // Get first 5 reservas
    const { data: res } = await supabase.schema('gestion').from('reservas').select('id_reserva, id_cliente').limit(5);
    console.log("reservas.id_cliente values:", res?.map(r => r.id_cliente));

    const clienteIds = res?.map(r => r.id_cliente) || [];

    // Try matching via seguridad.usuarios.id_usuario
    const { data: byUserId } = await supabase.schema('seguridad').from('usuarios')
        .select('id_usuario, nombre, correo').in('id_usuario', clienteIds);
    console.log("\nSeguridad by id_usuario match:");
    console.table(byUserId);

    // Try matching via gestion.clientes.id_cliente → auth_id → seguridad.usuarios.auth_id
    const { data: clientes } = await supabase.schema('gestion').from('clientes')
        .select('id_cliente, auth_id').in('id_cliente', clienteIds);
    console.log("\ngestion.clientes for those ids:");
    console.table(clientes);

    const authIds = clientes?.map(c => c.auth_id).filter(Boolean) || [];
    if (authIds.length > 0) {
        const { data: byAuthId } = await supabase.schema('seguridad').from('usuarios')
            .select('auth_id, nombre, correo').in('auth_id', authIds);
        console.log("\nSeguridad by auth_id match:");
        console.table(byAuthId);
    } else {
        console.log("\nAll clientes.auth_id are NULL — cannot lookup by auth_id.");
    }
}
checkClientNames();
