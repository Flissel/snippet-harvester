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
      analysis_results: {
        Row: {
          created_at: string | null
          id: string
          prompt_id: string
          result_data: Json
          session_id: string
          step_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt_id: string
          result_data: Json
          session_id: string
          step_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt_id?: string
          result_data?: Json
          session_id?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_sessions: {
        Row: {
          created_at: string | null
          created_by: string
          current_step: number | null
          id: string
          metadata: Json | null
          snippet_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_step?: number | null
          id?: string
          metadata?: Json | null
          snippet_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_step?: number | null
          id?: string
          metadata?: Json | null
          snippet_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_sessions_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt_id: string | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          role?: Database["public"]["Enums"]["message_role"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context: string | null
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          validation_rules: Json | null
          yaml_path: string | null
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
          validation_rules?: Json | null
          yaml_path?: string | null
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
          validation_rules?: Json | null
          yaml_path?: string | null
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
      configuration_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          description: string | null
          file_path: string
          id: string
          name: string
          repository_tree_id: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          description?: string | null
          file_path: string
          id?: string
          name: string
          repository_tree_id: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_path?: string
          id?: string
          name?: string
          repository_tree_id?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuration_templates_repository_tree_id_fkey"
            columns: ["repository_tree_id"]
            isOneToOne: false
            referencedRelation: "repository_trees"
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
      prompt_configurations: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_default: boolean | null
          is_finalized: boolean | null
          model: string | null
          name: string
          system_message: string
          updated_at: string
          user_message: string
          yaml_template: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_finalized?: boolean | null
          model?: string | null
          name: string
          system_message: string
          updated_at?: string
          user_message: string
          yaml_template?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_finalized?: boolean | null
          model?: string | null
          name?: string
          system_message?: string
          updated_at?: string
          user_message?: string
          yaml_template?: string | null
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
          model: string | null
          name: string
          prompt_generation_guidelines: string | null
          prompt_generation_role: string | null
          prompt_generation_structure: string | null
          prompt_type: Database["public"]["Enums"]["prompt_type"] | null
          system_message: string
          updated_at: string
          user_message: string | null
          yaml_template: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name: string
          prompt_generation_guidelines?: string | null
          prompt_generation_role?: string | null
          prompt_generation_structure?: string | null
          prompt_type?: Database["public"]["Enums"]["prompt_type"] | null
          system_message: string
          updated_at?: string
          user_message?: string | null
          yaml_template?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name?: string
          prompt_generation_guidelines?: string | null
          prompt_generation_role?: string | null
          prompt_generation_structure?: string | null
          prompt_type?: Database["public"]["Enums"]["prompt_type"] | null
          system_message?: string
          updated_at?: string
          user_message?: string | null
          yaml_template?: string | null
        }
        Relationships: []
      }
      repository_trees: {
        Row: {
          available_file_types: string[] | null
          created_at: string
          created_by: string
          id: string
          repository_url: string
          tree_structure: Json
          updated_at: string
        }
        Insert: {
          available_file_types?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          repository_url: string
          tree_structure: Json
          updated_at?: string
        }
        Update: {
          available_file_types?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          repository_url?: string
          tree_structure?: Json
          updated_at?: string
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
          python_version: string | null
          source_commit: string | null
          source_path: string | null
          source_url: string | null
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
          python_version?: string | null
          source_commit?: string | null
          source_path?: string | null
          source_url?: string | null
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
          python_version?: string | null
          source_commit?: string | null
          source_path?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_items: {
        Row: {
          analysis_type: string | null
          created_at: string
          description: string | null
          id: string
          model: string | null
          order_index: number
          result_data: Json | null
          snippet_id: string | null
          status: string
          system_message: string | null
          title: string
          updated_at: string
          user_message: string | null
          workflow_session_id: string
          workflow_type: string
        }
        Insert: {
          analysis_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          model?: string | null
          order_index: number
          result_data?: Json | null
          snippet_id?: string | null
          status?: string
          system_message?: string | null
          title: string
          updated_at?: string
          user_message?: string | null
          workflow_session_id: string
          workflow_type?: string
        }
        Update: {
          analysis_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          model?: string | null
          order_index?: number
          result_data?: Json | null
          snippet_id?: string | null
          status?: string
          system_message?: string | null
          title?: string
          updated_at?: string
          user_message?: string | null
          workflow_session_id?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_items_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_items_workflow_session_id_fkey"
            columns: ["workflow_session_id"]
            isOneToOne: false
            referencedRelation: "workflow_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_sessions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string | null
          snippet_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          snippet_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          snippet_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_sessions_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      yml_configurations: {
        Row: {
          config_type: string
          created_at: string | null
          created_by: string
          id: string
          imports: string[]
          processed_code: string
          snippet_id: string | null
          updated_at: string | null
          yml_content: string
        }
        Insert: {
          config_type: string
          created_at?: string | null
          created_by: string
          id?: string
          imports: string[]
          processed_code: string
          snippet_id?: string | null
          updated_at?: string | null
          yml_content: string
        }
        Update: {
          config_type?: string
          created_at?: string | null
          created_by?: string
          id?: string
          imports?: string[]
          processed_code?: string
          snippet_id?: string | null
          updated_at?: string | null
          yml_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "yml_configurations_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      yml_patterns: {
        Row: {
          created_at: string | null
          example_code: string
          id: string
          pattern_name: string
          pattern_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          example_code: string
          id?: string
          pattern_name: string
          pattern_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          example_code?: string
          id?: string
          pattern_name?: string
          pattern_type?: string
          updated_at?: string | null
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
      message_role: "user" | "assistant" | "system"
      organization_role: "admin" | "member"
      prompt_type:
        | "yml_maker"
        | "import_analyzer"
        | "component_builder"
        | "code_merger"
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
