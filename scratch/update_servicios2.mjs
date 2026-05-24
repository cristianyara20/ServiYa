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
    { id_servicio: 1, nombre_servicio: "Plomería y Agua" },
    { id_servicio: 2, nombre_servicio: "Electricidad" },
    { id_servicio: 3, nombre_servicio: "Gas" },
    { id_servicio: 4, nombre_servicio: "Carpintería" },
    { id_servicio: 5, nombre_servicio: "Pintura" },
    { id_servicio: 6, nombre_servicio: "Aire Acondicionado" },
  ];

  for (const up of updates) {
    const { error } = await supabaseAdmin.schema('gestion').from('servicios').update({ nombre_servicio: up.nombre_servicio }).eq('id_servicio', up.id_servicio);
    if (error) {
       console.error("Error updating ID " + up.id_servicio, error);
       
       // Try inserting if it doesn't exist
       const { error: insErr } = await supabaseAdmin.schema('gestion').from('servicios').insert(up);
       if (insErr) console.error("Insert error for " + up.id_servicio, insErr);
       else console.log("Inserted ID " + up.id_servicio);
    } else {
       console.log("Updated ID " + up.id_servicio + " to " + up.nombre_servicio);
       
       // Note: update doesn't return an error if 0 rows matched. We can check with select.
       const { data } = await supabaseAdmin.schema('gestion').from('servicios').select('*').eq('id_servicio', up.id_servicio);
       if (data.length === 0) {
         console.log("ID " + up.id_servicio + " not found, inserting...");
         await supabaseAdmin.schema('gestion').from('servicios').insert(up);
       }
    }
  }
}
run();
