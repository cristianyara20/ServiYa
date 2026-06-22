"use server";

/**
 * @file services/auth/auth.actions.ts
 * @description Server Actions de autenticación.
 * Solo importa librerías externas e infraestructura.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
