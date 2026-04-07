export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  comunicacion: {
    Tables: {
      chats: {
        Row: {
          fecha_inicio: string
          id_chat: number
          id_cliente: number
          id_prestador: number
        }
        Insert: {
          fecha_inicio?: string
          id_chat?: number
          id_cliente: number
          id_prestador: number
        }
        Update: {
          fecha_inicio?: string
          id_chat?: number
          id_cliente?: number
          id_prestador?: number
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          contenido: string
          fecha_envio: string
          id_chat: number
          id_mensaje: number
          remitente: string
        }
        Insert: {
          contenido: string
          fecha_envio?: string
          id_chat: number
          id_mensaje?: number
          remitente: string
        }
        Update: {
          contenido?: string
          fecha_envio?: string
          id_chat?: number
          id_mensaje?: number
          remitente?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mensajes_chats"
            columns: ["id_chat"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id_chat"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  gestion: {
    Tables: {
      calificaciones: {
        Row: {
          comentario: string
          fecha_calificacion: string
          id_calificacion: number
          id_reserva: number
          puntuacion: number
        }
        Insert: {
          comentario: string
          fecha_calificacion?: string
          id_calificacion?: number
          id_reserva: number
          puntuacion: number
        }
        Update: {
          comentario?: string
          fecha_calificacion?: string
          id_calificacion?: number
          id_reserva?: number
          puntuacion?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_calificaciones_reservas"
            columns: ["id_reserva"]
            isOneToOne: true
            referencedRelation: "reservas"
            referencedColumns: ["id_reserva"]
          },
        ]
      }
      clientes: {
        Row: {
          fecha_registro: string
          id_cliente: number
          auth_id: string | null
        }
        Insert: {
          fecha_registro?: string
          id_cliente: number
          auth_id?: string | null
        }
        Update: {
          fecha_registro?: string
          id_cliente?: number
          auth_id?: string | null
        }
        Relationships: []
      }
      prestadores: {
        Row: {
          calificacion_promedio: number
          experiencia: string
          id_prestador: number
        }
        Insert: {
          calificacion_promedio?: number
          experiencia: string
          id_prestador: number
        }
        Update: {
          calificacion_promedio?: number
          experiencia?: string
          id_prestador?: number
        }
        Relationships: []
      }
      reservas: {
        Row: {
          descripcion: string | null
          direccion: string | null
          fecha_agenda: string
          fecha_solicitud: string
          id_cliente: number
          id_prestador: number
          id_reserva: number
          id_servicio: number
        }
        Insert: {
          descripcion?: string | null
          direccion?: string | null
          fecha_agenda: string
          fecha_solicitud?: string
          id_cliente: number
          id_prestador: number
          id_reserva?: number
          id_servicio: number
        }
        Update: {
          descripcion?: string | null
          direccion?: string | null
          fecha_agenda?: string
          fecha_solicitud?: string
          id_cliente?: number
          id_prestador?: number
          id_reserva?: number
          id_servicio?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservas_clientes"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id_cliente"]
          },
          {
            foreignKeyName: "fk_reservas_prestadores"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id_prestador"]
          },
          {
            foreignKeyName: "fk_reservas_servicios"
            columns: ["id_servicio"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id_servicio"]
          },
        ]
      }
      servicios: {
        Row: {
          categoria: string
          descripcion: string
          estado_servicio: string
          id_servicio: number
          nombre_servicio: string
        }
        Insert: {
          categoria: string
          descripcion: string
          estado_servicio?: string
          id_servicio?: number
          nombre_servicio: string
        }
        Update: {
          categoria?: string
          descripcion?: string
          estado_servicio?: string
          id_servicio?: number
          nombre_servicio?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  seguridad: {
    Tables: {
      usuarios: {
        Row: {
          apellido: string
          auth_id: string | null
          correo: string
          fecha_nacimiento: string
          id_usuario: number
          nombre: string
        }
        Insert: {
          apellido: string
          auth_id?: string | null
          correo: string
          fecha_nacimiento: string
          id_usuario?: number
          nombre: string
        }
        Update: {
          apellido?: string
          auth_id?: string | null
          correo?: string
          fecha_nacimiento?: string
          id_usuario?: number
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  soporte: {
    Tables: {
      pqrs: {
        Row: {
          descripcion: string
          estado_pqr: string
          id_cliente: number
          id_pqr: number
          id_reserva: number
          tipo_pqr: string
        }
        Insert: {
          descripcion: string
          estado_pqr?: string
          id_cliente: number
          id_pqr?: number
          id_reserva: number
          tipo_pqr: string
        }
        Update: {
          descripcion?: string
          estado_pqr?: string
          id_cliente?: number
          id_pqr?: number
          id_reserva?: number
          tipo_pqr?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals["gestion"]
export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  comunicacion: {
    Enums: {},
  },
  gestion: {
    Enums: {},
  },
  seguridad: {
    Enums: {},
  },
  soporte: {
    Enums: {},
  },
} as const
