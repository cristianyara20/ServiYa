const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://lvxhporsajorgckeisna.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eGhwb3JzYWpvcmdja2Vpc25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyNTIzNSwiZXhwIjoyMDg5MDAxMjM1fQ.2jGgr7tocFeq1QSsLdzUZBQ3sA_PytrNhbBiJBEcPPg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  console.log("Listing tables in public schema...");
  const { data, error } = await supabase.rpc('get_tables_info'); 
  // Probably no RPC, let's try query
  
  const { data: qData, error: qErr } = await supabase.from('information_schema.tables').select('table_name, table_schema').eq('table_type', 'BASE TABLE');
  console.log("Tables:", qData || qErr);
}
run();
