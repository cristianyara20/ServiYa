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
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const sol = authUsers.users.find(u => u.email === 'sol@gmail.com');
  if (sol) {
    console.log('Encontrado Sol en auth.users:', sol.id);
    const { data: inserted, error: errI } = await supabase.schema('seguridad').from('usuarios').insert({
      auth_id: sol.id,
      correo: sol.email,
      nombre: 'Sol',
      apellido: 'Cliente',
      rol: 'usuario'
    }).select().single();

    console.log('Insertado en seguridad.usuarios:', inserted, errI);

    if (inserted) {
      await supabase.schema('gestion').from('clientes').insert({
        id_cliente: inserted.id_usuario,
        auth_id: sol.id
      });
      console.log('Insertado en gestion.clientes con id_cliente:', inserted.id_usuario);
    }
  }
}
run();