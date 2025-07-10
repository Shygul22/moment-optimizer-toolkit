export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          meta_description: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          availability_id: string | null
          client_id: string
          consultant_id: string
          created_at: string
          end_time: string
          google_meet_id: string | null
          google_meet_link: string | null
          id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["booking_type"]
          updated_at: string
        }
        Insert: {
          availability_id?: string | null
          client_id: string
          consultant_id: string
          created_at?: string
          end_time: string
          google_meet_id?: string | null
          google_meet_link?: string | null
          id?: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Update: {
          availability_id?: string | null
          client_id?: string
          consultant_id?: string
          created_at?: string
          end_time?: string
          google_meet_id?: string | null
          google_meet_link?: string | null
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          type?: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "consultant_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size_bytes: number
          file_type: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size_bytes: number
          file_type: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string
          has_attachment: boolean
          id: string
          is_read: boolean
          room_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          has_attachment?: boolean
          id?: string
          is_read?: boolean
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          has_attachment?: boolean
          id?: string
          is_read?: boolean
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          client_id: string
          consultant_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          consultant_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          consultant_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_questionnaires: {
        Row: {
          admin_notes: string | null
          business_objectives: string
          client_name: string
          company_name: string
          company_size: string
          consulting_goals: string
          created_at: string
          current_operations: string
          desired_services: string[]
          id: string
          improvement_areas: string
          industry: string
          location: string
          mobile_number: string
          pressing_issues: string
          reviewed_at: string | null
          status: string
          submitted_at: string
          target_audience: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_objectives: string
          client_name: string
          company_name: string
          company_size: string
          consulting_goals: string
          created_at?: string
          current_operations: string
          desired_services: string[]
          id?: string
          improvement_areas: string
          industry: string
          location: string
          mobile_number: string
          pressing_issues: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          target_audience: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_objectives?: string
          client_name?: string
          company_name?: string
          company_size?: string
          consulting_goals?: string
          created_at?: string
          current_operations?: string
          desired_services?: string[]
          id?: string
          improvement_areas?: string
          industry?: string
          location?: string
          mobile_number?: string
          pressing_issues?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          target_audience?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_todos: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultant_availability: {
        Row: {
          consultant_id: string
          created_at: string
          end_time: string
          id: string
          is_booked: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          consultant_id: string
          created_at?: string
          end_time: string
          id?: string
          is_booked?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          consultant_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_availability_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          invoice_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          invoice_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          invoice_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          start_date: string
          title: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          user_usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date: string
          title: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
        }
        Relationships: []
      }
      hero_variations: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          sort_order?: number
          subtitle: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          client_id: string
          consultant_id: string
          created_at: string
          currency: string
          description: string | null
          discount_amount: number | null
          discount_source_id: string | null
          discount_source_type: string | null
          discount_type: string | null
          due_at: string
          id: string
          invoice_number: string
          issued_at: string
          line_items: Json | null
          original_amount: number | null
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          client_id: string
          consultant_id: string
          created_at?: string
          currency?: string
          description?: string | null
          discount_amount?: number | null
          discount_source_id?: string | null
          discount_source_type?: string | null
          discount_type?: string | null
          due_at: string
          id?: string
          invoice_number: string
          issued_at?: string
          line_items?: Json | null
          original_amount?: number | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          client_id?: string
          consultant_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          discount_amount?: number | null
          discount_source_id?: string | null
          discount_source_type?: string | null
          discount_type?: string | null
          due_at?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          line_items?: Json | null
          original_amount?: number | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_sections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          metadata: Json | null
          section_type: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          section_type: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_usage: {
        Row: {
          discount_amount: number
          id: string
          invoice_id: string | null
          offer_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          discount_amount: number
          id?: string
          invoice_id?: string | null
          offer_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          discount_amount?: number
          id?: string
          invoice_id?: string | null
          offer_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_usage_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_usage_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          start_date: string
          title: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date: string
          title: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          id: string
          invoice_id: string
          notes: string | null
          payment_method: string
          processed_at: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_method: string
          processed_at?: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_method?: string
          processed_at?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_details: string | null
          business_name: string | null
          contact_number: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          last_seen: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_details?: string | null
          business_name?: string | null
          contact_number?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          is_featured?: boolean | null
          last_seen?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_details?: string | null
          business_name?: string | null
          contact_number?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          last_seen?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          referral_code: string
          referred_id: string | null
          referred_reward_type: string | null
          referred_reward_value: number | null
          referrer_id: string
          referrer_reward_type: string | null
          referrer_reward_value: number | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referred_reward_type?: string | null
          referred_reward_value?: number | null
          referrer_id: string
          referrer_reward_type?: string | null
          referrer_reward_value?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referred_reward_type?: string | null
          referred_reward_value?: number | null
          referrer_id?: string
          referrer_reward_type?: string | null
          referrer_reward_value?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      apply_coupon: {
        Args: {
          p_coupon_code: string
          p_user_id: string
          p_order_amount: number
        }
        Returns: Json
      }
      book_consultation: {
        Args: { p_availability_id: string }
        Returns: {
          availability_id: string | null
          client_id: string
          consultant_id: string
          created_at: string
          end_time: string
          google_meet_id: string | null
          google_meet_link: string | null
          id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["booking_type"]
          updated_at: string
        }
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_consultants: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          business_details: string | null
          business_name: string | null
          contact_number: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          last_seen: string | null
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          p_user_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      update_booking_status: {
        Args: {
          p_booking_id: string
          p_new_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "client" | "consultant" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "rescheduled"
      booking_type: "online" | "offline"
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
      app_role: ["client", "consultant", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      booking_type: ["online", "offline"],
    },
  },
} as const
