import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkNewCal() {
    console.log("=== ALL calificaciones ===");
    const { data: cals, error } = await supabase.schema('gestion').from('calificaciones').select('*').order('id_calificacion', { ascending: false });
    if (error) console.error(error.message);
    else console.table(cals);

    // The new cal should have a reservation. Let's check what reservation it links to
    if (cals && cals.length > 0) {
        const latest = cals[0];
        console.log("\nLatest calificacion:", latest);
        
        const { data: res } = await supabase.schema('gestion').from('reservas')
            .select('id_reserva, id_cliente, id_prestador, estado_reserva')
            .eq('id_reserva', latest.id_reserva)
            .maybeSingle();
        console.log("Linked reservation:", res);
        
        if (res) {
            const { data: user } = await supabase.schema('seguridad').from('usuarios')
                .select('id_usuario, nombre, correo').eq('id_usuario', res.id_cliente).maybeSingle();
            console.log("Client user:", user);
        }
    }
}
checkNewCal();
