import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function inspectSchema() {
    console.log("Inspecting 'gestion.reservas'...");
    const { data: res, error: resErr } = await supabase.schema('gestion').from('reservas').select('*').limit(1);
    if (resErr) console.error("Error reservas:", resErr);
    else console.log("Reservas columns:", Object.keys(res[0] || {}).join(', '));

    console.log("\nInspecting 'seguridad.usuarios'...");
    const { data: usu, error: usuErr } = await supabase.schema('seguridad').from('usuarios').select('*').limit(1);
    if (usuErr) console.error("Error usuarios:", usuErr);
    else console.log("Usuarios columns:", Object.keys(usu[0] || {}).join(', '));

    // Check if prestadores table exists
    const { data: pres, error: presErr } = await supabase.schema('gestion').from('prestadores').select('*').limit(1);
    if (presErr) console.log("Table 'gestion.prestadores' probably doesn't exist.");
    else console.log("Prestadores columns:", Object.keys(pres[0] || {}).join(', '));
}
inspectSchema();
