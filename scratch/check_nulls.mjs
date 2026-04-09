import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkConstraints() {
  const { data, error } = await supabase.rpc('run_sql', { sql: `
    SELECT 
      column_name, 
      is_nullable, 
      column_default
    FROM 
      information_schema.columns 
    WHERE 
      table_schema = 'seguridad' 
      AND table_name = 'usuarios';
  ` });

  if (error) {
    // If run_sql fails, try querying directly from information_schema if possible
    const { data: d2, error: e2 } = await supabase
        .from('information_schema.columns')
        .select('column_name, is_nullable, column_default')
        .eq('table_schema', 'seguridad')
        .eq('table_name', 'usuarios');
        
    if (e2) console.error(e2);
    else console.log(JSON.stringify(d2, null, 2));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkConstraints();
