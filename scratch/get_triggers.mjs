import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
     const { data, error } = await supabaseAdmin.rpc('run_sql_or_something', {}); // Unfortunately no arbitrary SQL RPC by default.
     
     // I'll query pg_proc to find the function
     const { data: d2, error: e2 } = await supabaseAdmin.from('pg_proc').select('proname, prosrc').limit(10);
     if (e2) {
         console.log(e2);
     }
}
run();
