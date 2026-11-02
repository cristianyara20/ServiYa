import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (fs.existsSync('.env')) {
    const env = fs.readFileSync('.env', 'utf-8');
    env.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = trimmed.split('=')[1].trim();
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceRoleKey = trimmed.split('=')[1].trim();
      if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceRoleKey = trimmed.split('=')[1].trim();
    });
  }
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontradas.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];

  if (!email || !password) {
    console.error('Uso: node scratch/create_admin.mjs <email> <password>');
    console.error('O defina las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD.');
    process.exit(1);
  }

  console.log(`Checking if user ${email} exists...`);
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.log('User exists! Updating password...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: password
    });
    if (updateError) {
      console.error('Error updating password:', updateError);
    } else {
      console.log('Password updated successfully!');
    }
  } else {
    console.log('User does not exist. Creating...');
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    if (createError) {
      console.error('Error creating user:', createError);
    } else {
      console.log('User created successfully!');
    }
  }
}

main();
