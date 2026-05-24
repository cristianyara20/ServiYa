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
  const updates = [
    { id_servicio: 1, nombre_servicio: "Plomería y Agua", descripcion_servicio: "Servicios de plomería y agua", tarifa_base: 50000 },
    { id_servicio: 2, nombre_servicio: "Electricidad", descripcion_servicio: "Servicios eléctricos", tarifa_base: 50000 },
    { id_servicio: 3, nombre_servicio: "Gas", descripcion_servicio: "Servicios de gas", tarifa_base: 50000 },
    { id_servicio: 4, nombre_servicio: "Carpintería", descripcion_servicio: "Servicios de carpintería", tarifa_base: 50000 },
    { id_servicio: 5, nombre_servicio: "Pintura", descripcion_servicio: "Servicios de pintura", tarifa_base: 50000 },
    { id_servicio: 6, nombre_servicio: "Aire Acondicionado", descripcion_servicio: "Servicios de aire acondicionado", tarifa_base: 50000 },
  ];

  for (const up of updates) {
    const { error } = await supabaseAdmin.schema('gestion').from('servicios').upsert(up, { onConflict: 'id_servicio' });
    if (error) {
       console.error("Error updating ID " + up.id_servicio, error);
    } else {
       console.log("Updated ID " + up.id_servicio + " to " + up.nombre_servicio);
    }
  }
}
run();
