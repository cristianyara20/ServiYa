import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function setupJames() {
    console.log("Setting up James (id_usuario=57) as a Prestador...");

    // 1. Create prestador record for James
    const { error: presErr } = await supabase.schema('gestion').from('prestadores')
        .upsert({
            id_prestador: 57,
            experiencia: 'Prestador de servicios generales',
            calificacion_promedio: 5.0,
            estado_disponibilidad: 'disponible'
        }, { onConflict: 'id_prestador' });

    if (presErr) {
        console.error("Error creating prestador:", presErr.message, presErr.details);
        return;
    }
    console.log("✅ Prestador record created for James (ID 57)");

    // 2. Find an existing cliente to use for the test reservation
    const { data: clientes } = await supabase.schema('gestion').from('clientes').select('id_cliente').limit(1);
    const clienteId = clientes?.[0]?.id_cliente || 1;

    // 3. Find an existing servicio to reference
    const { data: servicios } = await supabase.schema('gestion').from('servicios').select('id_servicio').limit(1);
    const servicioId = servicios?.[0]?.id_servicio || 1;

    // 4. Create a test reservation assigned to James
    const { error: resErr } = await supabase.schema('gestion').from('reservas')
        .insert({
            id_cliente: clienteId,
            id_prestador: 57,
            id_servicio: servicioId,
            fecha_solicitud: new Date().toISOString().split('T')[0],
            fecha_agenda: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subservicio: 'Reparación Eléctrica de Prueba',
            descripcion: 'Revisión del sistema eléctrico del hogar',
            estado_reserva: 'pendiente'
        });

    if (resErr) {
        console.error("Error creating reservation:", resErr.message, resErr.details);
    } else {
        console.log("✅ Test reservation created for James!");
        console.log("Refresh http://localhost:3000/dashboard/prestador — you should see the booking now.");
    }
}

setupJames();
