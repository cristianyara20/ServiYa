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

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  const { data, error } = await supabase
    .schema('gestion')
    .from('reservas')
    .select('estado_reserva');

  if (error) { console.error("Error:", error); return; }

  const states = new Set(data.map(r => r.estado_reserva));
  console.log("Distinct states:", Array.from(states));
}
run();
