import { createServerSupabaseClient } from "@/lib/supabase/server";

export class UsuarioRepository {
  async findAll() {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .schema("seguridad")
      .from("usuarios")
      .select("*");

    if (error) throw new Error(error.message);

    return data;
  }

  async findById(id: number) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .schema("seguridad")
      .from("usuarios")
      .select("*")
      .eq("id_usuario", id)
      .single();

    if (error) return null;

    return data;
  }

  async create(usuario: any) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .schema("seguridad")
      .from("usuarios")
      .insert(usuario)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}