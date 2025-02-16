export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      configuration_points: {
        Row: {
          config_type: string
          created_at: string
          default_value: string | null
          description: string | null
          end_position: number
          id: string
          is_required: boolean | null
          label: string
          snippet_id: string
          start_position: number
          template_placeholder: string | null
          updated_at: string
        }
        Insert: {
          config_type: string
          created_at?: string
          default_value?: string | null
          description?: string | null
          end_position: number
          id?: string
          is_required?: boolean | null
          label: string
          snippet_id: string
          start_position: number
          template_placeholder?: string | null
          updated_at?: string
        }
        Update: {
          config_type?: string
          created_at?: string
          default_value?: string | null
          description?: string | null
          end_position?: number
          id?: string
          is_required?: boolean | null
          label?: string
          snippet_id?: string
          start_position?: number
          template_placeholder?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuration_points_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      label_templates: {
        Row: {
          config_type: string
          created_at: string
          created_by: string
          default_value: string | null
          description: string | null
          id: string
          name: string
          template_placeholder: string | null
          updated_at: string
        }
        Insert: {
          config_type: string
          created_at?: string
          created_by: string
          default_value?: string | null
          description?: string | null
          id?: string
          name: string
          template_placeholder?: string | null
          updated_at?: string
        }
        Update: {
          config_type?: string
          created_at?: string
          created_by?: string
          default_value?: string | null
          description?: string | null
          id?: string
          name?: string
          template_placeholder?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_label_mappings: {
        Row: {
          created_at: string
          id: string
          label_template_id: string
          prompt_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_template_id: string
          prompt_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label_template_id?: string
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_label_mappings_label_template_id_fkey"
            columns: ["label_template_id"]
            isOneToOne: false
            referencedRelation: "label_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_label_mappings_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          system_message: string
          updated_at: string
          user_message: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          system_message: string
          updated_at?: string
          user_message: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          system_message?: string
          updated_at?: string
          user_message?: string
        }
        Relationships: []
      }
      snippets: {
        Row: {
          code_content: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          language: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code_content: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          language?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code_content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          language?: string | null
          title?: string
          updated_at?: string
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
      organization_role: "admin" | "member"
      team_role: "leader" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
