import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvxhporsajorgckeisna.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eGhwb3JzYWpvcmdja2Vpc25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyNTIzNSwiZXhwIjoyMDg5MDAxMjM1fQ.2jGgr7tocFeq1QSsLdzUZBQ3sA_PytrNhbBiJBEcPPg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = 'pepitoperez132604@gmail.com';
  const password = '001199';

  console.log('Checking if user exists...');
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
