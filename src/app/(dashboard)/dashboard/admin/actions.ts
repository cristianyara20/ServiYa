"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getAdminUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data.users;
}

export async function deleteAdminUser(id: string) {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/admin');
  return data;
}

export async function updateAdminUser(id: string, attributes: { email?: string; password?: string }) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, attributes);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/admin');
  return data;
}

export async function createAdminUser(email: string, password?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password || '123456', // default password logic
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/admin');
  return data;
}
