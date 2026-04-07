/**
 * @file src/modules/chats/types.ts
 * @description Tipos para Chats
 */

export interface Chat {
  idChat: number;
  idCliente: number;
  idPrestador: number;
  fechaInicio: string;
}

/** Crear */
export type CreateChatDTO = Omit<Chat, "idChat">;

/** Actualizar */
export type UpdateChatDTO = Partial<CreateChatDTO>;