import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  const { data: res } = await supabase.schema('gestion').from('reservas').select('id_reserva, id_cliente, id_servicio, descripcion, direccion, estado_reserva, fecha_agenda').order('id_reserva', { ascending: false }).limit(5);
  console.log('RESERVAS:', res);

  const { data: users } = await supabase.schema('seguridad').from('usuarios').select('id_usuario, auth_id, correo, nombre').limit(5);
  console.log('USUARIOS:', users);
}
run();