import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function debugAdmin() {
    console.log("Fetching gestion.reservas...");
    const { data: res, error: err } = await supabase.schema('gestion').from('reservas').select("*");
    if (err) console.error("Error gestion.reservas:", err.message);
    else console.log("Success! Found", res.length, "reservas in gestion.");

    console.log("\nFetching public.reservas...");
    const { data: resPub, error: errPub } = await supabase.from('reservas').select("*");
    if (errPub) console.error("Error public.reservas:", errPub.message);
    else console.log("Success! Found", resPub.length, "reservas in public.");
}
debugAdmin();
