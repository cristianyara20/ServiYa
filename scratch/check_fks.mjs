import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkFKs() {
    const { data, error } = await supabase.rpc('get_table_fks', { table_name: 'reservas' });
    if (error) {
        // Fallback: try to query information_schema directly if rpc doesn't exist
        console.log("RPC get_table_fks failed. Trying direct query...");
        const { data: fks, error: err2 } = await supabase.from('information_schema.key_column_usage').select('*').eq('table_name', 'reservas');
        if (err2) console.error(err2);
        else console.log(JSON.stringify(fks, null, 2));
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}
// wait, I don't have get_table_fks rpc. I'll use a better diagnostic script.
