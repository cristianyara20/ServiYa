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
    .select('id_reserva, id_servicio, descripcion, estado_reserva, fecha_agenda, servicios(nombre_servicio)')
    .order('id_reserva', { ascending: false })
    .limit(10);

  if (error) { console.error("Error:", error); return; }

  console.log("\n=== ÚLTIMAS 10 RESERVAS EN LA DB ===\n");
  data.forEach(r => {
    console.log(`Reserva #${r.id_reserva}`);
    console.log(`  id_servicio   : ${r.id_servicio}`);
    console.log(`  nombre_servicio: ${r.servicios?.nombre_servicio}`);
    console.log(`  descripcion    : ${r.descripcion}`);
    console.log(`  estado         : ${r.estado_reserva}`);
    console.log(`  fecha          : ${r.fecha_agenda}`);
    console.log('---');
  });
}
run();
