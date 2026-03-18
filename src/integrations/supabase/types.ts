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
  public: {
    Tables: {
      actions: {
        Row: {
          assigned_to: string | null
          call_id: string | null
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          payload: Json
          priority: string
          resolved_at: string | null
          source: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          call_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          payload?: Json
          priority?: string
          resolved_at?: string | null
          source?: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          call_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          payload?: Json
          priority?: string
          resolved_at?: string | null
          source?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          after_hours_greeting: string | null
          business_description: string | null
          business_hours_only_transfer: boolean
          created_at: string
          enabled_actions: Json
          escalation_rules: Json
          fallback_message: string | null
          greeting: string | null
          id: string
          is_active: boolean
          language: string
          max_clarification_attempts: number
          name: string
          notification_email: string | null
          offer_callback_on_fallback: boolean
          organization_id: string
          outcome_behaviors: Json
          response_style: string
          special_instructions: string | null
          tone: string
          transfer_announcement: string | null
          transfer_number: string | null
          updated_at: string
          version: number
          webhook_url: string | null
        }
        Insert: {
          after_hours_greeting?: string | null
          business_description?: string | null
          business_hours_only_transfer?: boolean
          created_at?: string
          enabled_actions?: Json
          escalation_rules?: Json
          fallback_message?: string | null
          greeting?: string | null
          id?: string
          is_active?: boolean
          language?: string
          max_clarification_attempts?: number
          name?: string
          notification_email?: string | null
          offer_callback_on_fallback?: boolean
          organization_id: string
          outcome_behaviors?: Json
          response_style?: string
          special_instructions?: string | null
          tone?: string
          transfer_announcement?: string | null
          transfer_number?: string | null
          updated_at?: string
          version?: number
          webhook_url?: string | null
        }
        Update: {
          after_hours_greeting?: string | null
          business_description?: string | null
          business_hours_only_transfer?: boolean
          created_at?: string
          enabled_actions?: Json
          escalation_rules?: Json
          fallback_message?: string | null
          greeting?: string | null
          id?: string
          is_active?: boolean
          language?: string
          max_clarification_attempts?: number
          name?: string
          notification_email?: string | null
          offer_callback_on_fallback?: boolean
          organization_id?: string
          outcome_behaviors?: Json
          response_style?: string
          special_instructions?: string | null
          tone?: string
          transfer_announcement?: string | null
          transfer_number?: string | null
          updated_at?: string
          version?: number
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_accounts: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          included_usage_units: number
          monthly_price_cents: number
          organization_id: string
          overage_rate_cents: number
          payment_method_expiry: string | null
          payment_method_last4: string | null
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          used_usage_units: number
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          included_usage_units?: number
          monthly_price_cents?: number
          organization_id: string
          overage_rate_cents?: number
          payment_method_expiry?: string | null
          payment_method_last4?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          used_usage_units?: number
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          included_usage_units?: number
          monthly_price_cents?: number
          organization_id?: string
          overage_rate_cents?: number
          payment_method_expiry?: string | null
          payment_method_last4?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          used_usage_units?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          cost_cents: number | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          from_number: string
          handled_by: string | null
          id: string
          organization_id: string
          outcome: string | null
          provider: string | null
          provider_call_id: string | null
          recording_url: string | null
          sentiment: string | null
          started_at: string
          status: string
          to_number: string
          updated_at: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number: string
          handled_by?: string | null
          id?: string
          organization_id: string
          outcome?: string | null
          provider?: string | null
          provider_call_id?: string | null
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string
          status?: string
          to_number: string
          updated_at?: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string
          handled_by?: string | null
          id?: string
          organization_id?: string
          outcome?: string | null
          provider?: string | null
          provider_call_id?: string | null
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string
          status?: string
          to_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_account_id: string
          created_at: string
          id: string
          invoice_number: string | null
          organization_id: string
          overage_amount_cents: number
          period_end: string
          period_start: string
          status: string
          stripe_invoice_id: string | null
          subscription_amount_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          created_at?: string
          id?: string
          invoice_number?: string | null
          organization_id: string
          overage_amount_cents?: number
          period_end: string
          period_start: string
          status?: string
          stripe_invoice_id?: string | null
          subscription_amount_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          created_at?: string
          id?: string
          invoice_number?: string | null
          organization_id?: string
          overage_amount_cents?: number
          period_end?: string
          period_start?: string
          status?: string
          stripe_invoice_id?: string | null
          subscription_amount_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          organization_id: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          organization_id: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          organization_id?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          location: string | null
          name: string
          onboarding_status: Json
          opening_hours: string | null
          primary_business_number: string | null
          status: string
          subscription_plan: string
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          onboarding_status?: Json
          opening_hours?: string | null
          primary_business_number?: string | null
          status?: string
          subscription_plan?: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          onboarding_status?: Json
          opening_hours?: string | null
          primary_business_number?: string | null
          status?: string
          subscription_plan?: string
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      phone_setups: {
        Row: {
          after_hours_enabled: boolean
          business_number: string | null
          created_at: string
          forwarding_confirmed: boolean
          id: string
          last_test_call_at: string | null
          organization_id: string
          provider: string
          provider_config: Json
          provisioned_at: string | null
          ring_staff_first: boolean
          routing_enabled: boolean
          updated_at: string
          verification_status: string
          virtual_application_id: string | null
          virtual_number: string | null
          virtual_phone_number_id: string | null
        }
        Insert: {
          after_hours_enabled?: boolean
          business_number?: string | null
          created_at?: string
          forwarding_confirmed?: boolean
          id?: string
          last_test_call_at?: string | null
          organization_id: string
          provider?: string
          provider_config?: Json
          provisioned_at?: string | null
          ring_staff_first?: boolean
          routing_enabled?: boolean
          updated_at?: string
          verification_status?: string
          virtual_application_id?: string | null
          virtual_number?: string | null
          virtual_phone_number_id?: string | null
        }
        Update: {
          after_hours_enabled?: boolean
          business_number?: string | null
          created_at?: string
          forwarding_confirmed?: boolean
          id?: string
          last_test_call_at?: string | null
          organization_id?: string
          provider?: string
          provider_config?: Json
          provisioned_at?: string | null
          ring_staff_first?: boolean
          routing_enabled?: boolean
          updated_at?: string
          verification_status?: string
          virtual_application_id?: string | null
          virtual_number?: string | null
          virtual_phone_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_setups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          default_voice_provider: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_voice_provider?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_voice_provider?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          call_id: string
          created_at: string
          extracted_intent: string | null
          id: string
          internal_notes: Json | null
          messages: Json
          organization_id: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          call_id: string
          created_at?: string
          extracted_intent?: string | null
          id?: string
          internal_notes?: Json | null
          messages?: Json
          organization_id: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          call_id?: string
          created_at?: string
          extracted_intent?: string | null
          id?: string
          internal_notes?: Json | null
          messages?: Json
          organization_id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "staff"
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
      app_role: ["owner", "admin", "staff"],
    },
  },
} as const
