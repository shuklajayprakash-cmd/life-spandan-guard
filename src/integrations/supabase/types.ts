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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notify_on_sos: boolean
          phone: string
          priority: number
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notify_on_sos?: boolean
          phone: string
          priority?: number
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notify_on_sos?: boolean
          phone?: string
          priority?: number
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_events: {
        Row: {
          accuracy_m: number | null
          address: string | null
          battery_level: number | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          network_type: string | null
          notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["emergency_status"]
          trigger_type: string
          user_id: string
        }
        Insert: {
          accuracy_m?: number | null
          address?: string | null
          battery_level?: number | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          network_type?: string | null
          notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          trigger_type?: string
          user_id: string
        }
        Update: {
          accuracy_m?: number | null
          address?: string | null
          battery_level?: number | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          network_type?: string | null
          notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          id: string
          member_user_id: string | null
          name: string
          owner_id: string
          phone: string | null
          relationship: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_user_id?: string | null
          name: string
          owner_id: string
          phone?: string | null
          relationship?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_user_id?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          relationship?: string | null
          status?: string
        }
        Relationships: []
      }
      health_reports: {
        Row: {
          created_at: string
          doc_type: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      health_scores: {
        Row: {
          created_at: string
          health_score: number
          id: string
          lifestyle_score: number
          recommendations: string[]
          risk_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          health_score?: number
          id?: string
          lifestyle_score?: number
          recommendations?: string[]
          risk_score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          health_score?: number
          id?: string
          lifestyle_score?: number
          recommendations?: string[]
          risk_score?: number
          user_id?: string
        }
        Relationships: []
      }
      medical_profiles: {
        Row: {
          allergies: string[]
          blood_group: string | null
          conditions: string[]
          created_at: string
          doctor_phone: string | null
          height_cm: number | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          medications: string[]
          notes: string | null
          organ_donor: boolean
          preferred_hospital: string | null
          primary_doctor: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string[]
          blood_group?: string | null
          conditions?: string[]
          created_at?: string
          doctor_phone?: string | null
          height_cm?: number | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medications?: string[]
          notes?: string | null
          organ_donor?: boolean
          preferred_hospital?: string | null
          primary_doctor?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string[]
          blood_group?: string | null
          conditions?: string[]
          created_at?: string
          doctor_phone?: string | null
          height_cm?: number | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medications?: string[]
          notes?: string | null
          organ_donor?: boolean
          preferred_hospital?: string | null
          primary_doctor?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          email_notifications: boolean
          language: string
          medicine_reminders: boolean
          push_notifications: boolean
          share_location: boolean
          sos_countdown_seconds: number
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          email_notifications?: boolean
          language?: string
          medicine_reminders?: boolean
          push_notifications?: boolean
          share_location?: boolean
          sos_countdown_seconds?: number
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          email_notifications?: boolean
          language?: string
          medicine_reminders?: boolean
          push_notifications?: boolean
          share_location?: boolean
          sos_countdown_seconds?: number
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_of: {
        Args: { _owner: string; _viewer: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "hospital" | "ambulance"
      emergency_status: "active" | "dispatched" | "resolved" | "cancelled"
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
      app_role: ["user", "admin", "hospital", "ambulance"],
      emergency_status: ["active", "dispatched", "resolved", "cancelled"],
    },
  },
} as const
