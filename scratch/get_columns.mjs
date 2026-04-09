import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
     const { data: d2, error: e2 } = await supabaseAdmin.schema('seguridad').from('usuarios').select('*').limit(1);
     console.log("Error RPC, fallback query data keys:", d2 ? Object.keys(d2[0] || {}) : e2);
}
run();
