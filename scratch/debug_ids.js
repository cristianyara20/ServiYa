const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://lvxhporsajorgckeisna.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eGhwb3JzYWpvcmdja2Vpc25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyNTIzNSwiZXhwIjoyMDg5MDAxMjM1fQ.2jGgr7tocFeq1QSsLdzUZBQ3sA_PytrNhbBiJBEcPPg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function check() {
  try {
    const list = [
      { s: 'seguridad', t: 'usuarios' },
      { s: 'gestion', t: 'clientes' },
      { s: 'gestion', t: 'reservas' },
      { s: 'soporte', t: 'pqrs' }
    ];

    for (const item of list) {
       console.log(`Checking ${item.s}.${item.t}...`);
       const { data, error } = await supabase.schema(item.s).from(item.t).select('*').limit(1);
       if (error) {
         console.error(`Error in ${item.s}.${item.t}:`, error.message);
       } else {
         console.log(`Data in ${item.s}.${item.t}:`, data);
       }
    }

    // Try public schema just in case
    console.log("Checking public schema...");
    const { data: pubData, error: pubErr } = await supabase.from('usuarios').select('*').limit(1);
    if (pubErr) console.log("Public usuarios not found");
    else console.log("Public usuarios data:", pubData);

  } catch (e) {
    console.error(e);
  }
}

check();
