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
  const { data: users, error: errU } = await supabase.schema('seguridad').from('usuarios').select('id_usuario, auth_id, correo, nombre, rol').order('id_usuario', { ascending: false }).limit(10);
  console.log('ULTIMOS USUARIOS EN SEGURIDAD:', users);

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('AUTH USERS:', authUsers.users.map(u => ({ id: u.id, email: u.email })));
}
run();