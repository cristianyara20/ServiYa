import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkAllChain() {
    console.log("=== Calificaciones → Reserva → Cliente → Usuario ===\n");

    const { data: cals } = await supabase.schema('gestion').from('calificaciones')
        .select('id_calificacion, id_reserva, puntuacion').order('id_calificacion', { ascending: false });

    // Get all linked reservas
    const reservaIds = cals?.map(c => c.id_reserva) || [];
    const { data: reservas } = await supabase.schema('gestion').from('reservas')
        .select('id_reserva, id_cliente').in('id_reserva', reservaIds);
    const resMap = new Map(reservas?.map(r => [r.id_reserva, r.id_cliente]) || []);

    // Get all client user IDs
    const clienteIds = [...new Set(reservas?.map(r => r.id_cliente) || [])];
    const { data: usuarios } = await supabase.schema('seguridad').from('usuarios')
        .select('id_usuario, nombre, correo').in('id_usuario', clienteIds);
    const usuariosMap = new Map(usuarios?.map(u => [u.id_usuario, u]) || []);

    console.log("id_cal | id_res | id_cliente | nombre_cliente          | correo");
    console.log("-------|--------|------------|-------------------------|--------------------");
    cals?.forEach(c => {
        const idCliente = resMap.get(c.id_reserva);
        const user = usuariosMap.get(idCliente);
        console.log(`  ${String(c.id_calificacion).padEnd(4)} | ${String(c.id_reserva).padEnd(6)} | ${String(idCliente).padEnd(10)} | ${(user?.nombre || 'SIN NOMBRE').padEnd(23)} | ${user?.correo || 'N/A'}`);
    });

    console.log("\n=== All real users in seguridad.usuarios with id > 50 ===");
    const { data: realUsers } = await supabase.schema('seguridad').from('usuarios')
        .select('id_usuario, nombre, correo, rol').gt('id_usuario', 50);
    console.table(realUsers);
}
checkAllChain();
