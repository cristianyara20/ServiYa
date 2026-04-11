import { supabase } from "@/lib/supabase";

export async function getPqrs() {
  const { data, error } = await supabase
    .from("pqrs")
    .select("*");

  if (error) throw error;

  return data;
}

export async function createPqrs(pqrs: any) {
  const { data, error } = await supabase
    .from("pqrs")
    .insert([pqrs])
    .select();

  if (error) throw error;

  return data;
}