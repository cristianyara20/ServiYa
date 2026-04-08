"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getRoleAfterLogin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .schema('seguridad')
    .from('usuarios' as any)
    .select('rol' as any)
    .eq('auth_id', user.id)
    .single();

  return (data as any)?.rol || 'cliente';
}