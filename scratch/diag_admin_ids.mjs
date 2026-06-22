import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function diagAdmin() {
    // 1. Fetch reservas
    const { data: res } = await supabase.schema('gestion').from('reservas').select('id_reserva, id_cliente, id_prestador, estado_reserva').limit(5);
    console.log("Sample reservas:");
    console.table(res);

    // 2. Fetch clientes
    const { data: cli } = await supabase.schema('gestion').from('clientes').select('*').limit(5);
    console.log("Sample clientes:");
    console.table(cli);

    // 3. Fetch seguridad.usuarios  
    const { data: seg } = await supabase.schema('seguridad').from('usuarios').select('id_usuario, nombre, correo').limit(5);
    console.log("Sample seguridad.usuarios:");
    console.table(seg);

    // So the question is: does id_cliente in reservas match id_usuario in seguridad.usuarios?
    // Or does it match id_cliente in gestion.clientes?
    if (res && seg) {
        const clienteIds = res.map(r => r.id_cliente);
        const usuarioIds = seg.map(u => u.id_usuario);
        const matchesViaUsuario = clienteIds.filter(id => usuarioIds.includes(id));
        console.log("\nid_cliente values in reservas:", clienteIds);
        console.log("id_usuario values in seguridad:", usuarioIds);
        console.log("Matches (id_cliente == id_usuario):", matchesViaUsuario);
    }
}
diagAdmin();
