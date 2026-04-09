import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkFresh() {
    // Fresh fetch of ALL calificaciones
    const { data: cals, error } = await supabase.schema('gestion').from('calificaciones')
        .select('*').order('id_calificacion', { ascending: false });
    console.log("Total calificaciones:", cals?.length, error ? "ERROR:" + error.message : "");
    console.table(cals?.slice(0, 5)); // Show 5 most recent

    // Check if today's date has any
    const today = new Date().toISOString().split('T')[0];
    const todayCals = cals?.filter(c => c.fecha_calificacion >= '2026-04-09');
    console.log("\nCalificaciones from 2026-04-09 onwards:", todayCals?.length);
    console.table(todayCals);

    // Cross-check with admin users (nicoll:68, oo:70, J'ulian:69)
    const realUserIds = [68, 69, 70, 60, 57, 58];
    const { data: theirReservations } = await supabase.schema('gestion').from('reservas')
        .select('id_reserva, id_cliente, estado_reserva')
        .in('id_cliente', realUserIds);
    console.log("\nReservations of real users:", theirReservations?.length);
    console.table(theirReservations);

    // Any calificaciones for their reservations?
    const theirReservaIds = theirReservations?.map(r => r.id_reserva) || [];
    const theirCals = cals?.filter(c => theirReservaIds.includes(c.id_reserva));
    console.log("\nCalificaciones for real user reservations:", theirCals?.length);
    console.table(theirCals);
}
checkFresh();
