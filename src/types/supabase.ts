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
      fcm_tokens: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          platform: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          platform?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          platform?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
      coffee: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean | null
          category: "coffee" | "non coffee" | null
          tag: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean | null
          category?: "coffee" | "non coffee" | null
          tag?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean | null
          category?: "coffee" | "non coffee" | null
          tag?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      delivery_addresses: {
        Row: {
          id: string
          customer_id: string
          label: string | null
          recipient_name: string
          phone: string
          address_details: string
          is_default: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string | null
          recipient_name: string
          phone: string
          address_details: string
          is_default?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string | null
          recipient_name?: string
          phone?: string
          address_details?: string
          is_default?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          total_price: number
          postage: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          delivery_address: string | null
          order_status: Database["public"]["Enums"]["order_status"] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          total_price: number
          postage: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          delivery_address?: string | null
          order_status?: Database["public"]["Enums"]["order_status"] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          total_price?: number
          postage?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          delivery_address?: string | null
          order_status?: Database["public"]["Enums"]["order_status"] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          coffe_id: string
          quantity: number
          price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          coffe_id: string
          quantity: number
          price: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          coffe_id?: string
          quantity?: number
          price?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_coffe_id_fkey"
            columns: ["coffe_id"]
            isOneToOne: false
            referencedRelation: "coffee"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          order_id: string
          proof_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          created_at: string | null
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          proof_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          created_at?: string | null
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          proof_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          created_at?: string | null
          confirmed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
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
      user_role: "customer" | "admin"
      payment_method: "cod" | "qris"
      order_status: "pending" | "waiting_payment" | "waiting_admin_confirmation" | "processing" | "done" | "completed" | "cancelled" | "rejected"
      payment_status: "pending" | "waiting_payment" | "waiting_admin_confirmation" | "confirmed" | "rejected"
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
