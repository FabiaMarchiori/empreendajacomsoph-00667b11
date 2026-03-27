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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assinaturas: {
        Row: {
          created_at: string | null
          data_expiracao: string | null
          data_inicio: string
          email: string
          id: string
          kiwify_customer_id: string | null
          kiwify_subscription_id: string
          nome_cliente: string | null
          plano: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string | null
          user_id: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          data_expiracao?: string | null
          data_inicio?: string
          email: string
          id?: string
          kiwify_customer_id?: string | null
          kiwify_subscription_id: string
          nome_cliente?: string | null
          plano: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          user_id?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          data_expiracao?: string | null
          data_inicio?: string
          email?: string
          id?: string
          kiwify_customer_id?: string | null
          kiwify_subscription_id?: string
          nome_cliente?: string | null
          plano?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          user_id?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          categoria: string
          created_at: string | null
          id: number
          imagem_url: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: number
          imagem_url?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: number
          imagem_url?: string | null
        }
        Relationships: []
      }
      clientes_autorizados: {
        Row: {
          created_at: string
          customer_id: string | null
          data_compra: string | null
          email: string
          id: string
          produto_id: string | null
          status_assinatura: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          data_compra?: string | null
          email: string
          id?: string
          produto_id?: string | null
          status_assinatura?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          data_compra?: string | null
          email?: string
          id?: string
          produto_id?: string | null
          status_assinatura?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          created_at: string
          fornecedor_id: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fornecedor_id: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fornecedor_id?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          categoria: string | null
          created_at: string
          Endereco: string | null
          id: number
          Instagram_url: string | null
          logo_url: string | null
          mockup_url: string | null
          nome_loja: string | null
          Whatsapp: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          Endereco?: string | null
          id?: number
          Instagram_url?: string | null
          logo_url?: string | null
          mockup_url?: string | null
          nome_loja?: string | null
          Whatsapp?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          Endereco?: string | null
          id?: number
          Instagram_url?: string | null
          logo_url?: string | null
          mockup_url?: string | null
          nome_loja?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      soph_access_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          is_active: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          evento: string
          id: string
          payload: Json
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          evento: string
          id?: string
          payload: Json
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          evento?: string
          id?: string
          payload?: Json
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_subscriptions_for_current_user: { Args: never; Returns: number }
      get_distinct_fornecedores: {
        Args: never
        Returns: {
          categoria: string
          created_at: string
          Endereco: string
          id: number
          Instagram_url: string
          logo_url: string
          mockup_url: string
          nome_loja: string
          Whatsapp: string
        }[]
      }
      has_active_subscription: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      has_role: {
        Args: { requested_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      subscription_status:
        | "ativa"
        | "inativa"
        | "cancelada"
        | "expirada"
        | "reembolsada"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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
  public: {
    Enums: {
      subscription_status: [
        "ativa",
        "inativa",
        "cancelada",
        "expirada",
        "reembolsada",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
