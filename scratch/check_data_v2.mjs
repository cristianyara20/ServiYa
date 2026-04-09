import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkData() {
    console.log("Checking gestion.reservas sample data...");
    const { data: res } = await supabase.schema('gestion').from('reservas').select('*').limit(3);
    console.log(JSON.stringify(res, null, 2));

    console.log("\nChecking gestion.prestadores sample data...");
    const { data: pres } = await supabase.schema('gestion').from('prestadores').select('*').limit(3);
    console.log(JSON.stringify(pres, null, 2));
}
checkData();
