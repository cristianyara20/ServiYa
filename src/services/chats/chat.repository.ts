import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Chat, CreateChatDTO } from "./types";

function mapToChat(row: any): Chat {
  return {
    idChat: row.id_chat,
    idCliente: row.id_cliente,
    idPrestador: row.id_prestador,
    fechaInicio: row.fecha_inicio,
  };
}

export class ChatRepository {
  async findAll(): Promise<Chat[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("comunicacion")
      .from("chats")
      .select("*");
    if (error) throw new Error(error.message);
    return data.map(mapToChat);
  }

  async findByUser(idCliente: number): Promise<Chat[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("comunicacion")
      .from("chats")
      .select("*")
      .eq("id_cliente", idCliente);
    if (error) throw new Error(error.message);
    return data.map(mapToChat);
  }

  async create(dto: CreateChatDTO): Promise<Chat> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("comunicacion")
      .from("chats")
      .insert({
        id_cliente: dto.idCliente,
        id_prestador: dto.idPrestador,
        fecha_inicio: dto.fechaInicio,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapToChat(data);
  }
}