/**
 * @file src/modules/usuarios/types.ts
 * @description Tipos de dominio para el modulo de Usuarios (Serviya)
 *
 * Mapeamos los nombres de columnas PostgreSQL (snake_case)
 * a nombres TypeScript (camelCase).
 *
 * @principle DIP: el dominio es independiente de Supabase
 */

/** Entidad Usuario */
export interface Usuario {
  idUsuario: number;        // id_usuario
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;  // fecha_nacimiento
  authId?: string | null;   // auth_id
}

/** DTO crear usuario */
export type CreateUsuarioDTO = Omit<Usuario, "idUsuario">;

/** DTO actualizar usuario */
export type UpdateUsuarioDTO = Partial<CreateUsuarioDTO>;

/** Filtros */
export interface UsuarioFilters {
  nombre?: string;
  correo?: string;
}