import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
let url = '';
let key = '';
lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
});

const supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  // Rename old ID 10 so we can use the name
  await supabaseAdmin.schema('gestion').from('servicios').update({ nombre_servicio: "Aire Acondicionado Antiguo" }).eq('id_servicio', 10);
  
  // Now update ID 6
  const { error } = await supabaseAdmin.schema('gestion').from('servicios').update({ nombre_servicio: "Aire Acondicionado" }).eq('id_servicio', 6);
  if (error) {
     console.error("Error updating ID 6", error);
  } else {
     console.log("Successfully updated ID 6 to Aire Acondicionado");
  }
}
run();
