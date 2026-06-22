import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
let url = '';
let key = '';
lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.schema('gestion').from('servicios').select('*');
  console.log("Servicios en DB:");
  data.forEach(d => console.log(`${d.id_servicio}: ${d.nombre_servicio}`));
  if (error) console.error("Error:", error);
}
run();
