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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      patient_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          patient_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          patient_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          patient_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number
          allergies: string[] | null
          blood_pressure: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          gender: string
          heart_rate: number | null
          id: string
          patient_id: string
          phone: string | null
          pre_existing_conditions: string[] | null
          spo2: number | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          age: number
          allergies?: string[] | null
          blood_pressure?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          gender: string
          heart_rate?: number | null
          id?: string
          patient_id: string
          phone?: string | null
          pre_existing_conditions?: string[] | null
          spo2?: number | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          age?: number
          allergies?: string[] | null
          blood_pressure?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          gender?: string
          heart_rate?: number | null
          id?: string
          patient_id?: string
          phone?: string | null
          pre_existing_conditions?: string[] | null
          spo2?: number | null
          temperature?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      triage_cases: {
        Row: {
          ai_confidence: number | null
          ai_contributing_factors: Json | null
          ai_explanation: string | null
          ambulance_id: string | null
          assigned_department: string | null
          assigned_doctor: string | null
          assigned_floor: string | null
          created_at: string
          created_by: string | null
          estimated_wait_time: number | null
          eta_minutes: number | null
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          medications: Json | null
          paramedic_location: string | null
          patient_id: string
          recommended_department: string | null
          risk_level: string | null
          status: string
          symptom_source: string | null
          symptoms: string
          treatment_notes: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_contributing_factors?: Json | null
          ai_explanation?: string | null
          ambulance_id?: string | null
          assigned_department?: string | null
          assigned_doctor?: string | null
          assigned_floor?: string | null
          created_at?: string
          created_by?: string | null
          estimated_wait_time?: number | null
          eta_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          medications?: Json | null
          paramedic_location?: string | null
          patient_id: string
          recommended_department?: string | null
          risk_level?: string | null
          status?: string
          symptom_source?: string | null
          symptoms: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_contributing_factors?: Json | null
          ai_explanation?: string | null
          ambulance_id?: string | null
          assigned_department?: string | null
          assigned_doctor?: string | null
          assigned_floor?: string | null
          created_at?: string
          created_by?: string | null
          estimated_wait_time?: number | null
          eta_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          medications?: Json | null
          paramedic_location?: string | null
          patient_id?: string
          recommended_department?: string | null
          risk_level?: string | null
          status?: string
          symptom_source?: string | null
          symptoms?: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_healthcare_provider: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "triage_nurse" | "paramedic" | "doctor" | "admin"
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
      app_role: ["triage_nurse", "paramedic", "doctor", "admin"],
    },
  },
} as const
