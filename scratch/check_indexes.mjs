import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
    const { data, error } = await supabase.from('pg_indexes').select('indexdef').eq('schemaname', 'seguridad').eq('tablename', 'usuarios');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}
run();
