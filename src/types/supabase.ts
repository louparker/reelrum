export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          email: string
          phone: string | null
          bio: string | null
          is_provider: boolean
          stripe_customer_id: string | null
          stripe_account_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email: string
          phone?: string | null
          bio?: string | null
          is_provider?: boolean
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email?: string
          phone?: string | null
          bio?: string | null
          is_provider?: boolean
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string
          property_type: string
          address: Json
          dimensions: Json | null
          amenities: string[] | null
          nearby_facilities: string[] | null
          hourly_rate: number | null
          daily_rate: number | null
          images: string[]
          is_published: boolean
          avg_rating: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description: string
          property_type: string
          address: Json
          dimensions?: Json | null
          amenities?: string[] | null
          nearby_facilities?: string[] | null
          hourly_rate?: number | null
          daily_rate?: number | null
          images: string[]
          is_published?: boolean
          avg_rating?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string
          property_type?: string
          address?: Json
          dimensions?: Json | null
          amenities?: string[] | null
          nearby_facilities?: string[] | null
          hourly_rate?: number | null
          daily_rate?: number | null
          images?: string[]
          is_published?: boolean
          avg_rating?: number | null
        }
      }
      availability: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string
          date: string
          is_available: boolean
          special_price: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id: string
          date: string
          is_available?: boolean
          special_price?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string
          date?: string
          is_available?: boolean
          special_price?: number | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          payment_intent_id: string | null
          payment_status: string
          special_requests: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
          payment_intent_id?: string | null
          payment_status?: string
          special_requests?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
          payment_intent_id?: string | null
          payment_status?: string
          special_requests?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string
          booking_id: string
          user_id: string
          rating: number
          comment: string | null
          response: string | null
          response_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id: string
          booking_id: string
          user_id: string
          rating: number
          comment?: string | null
          response?: string | null
          response_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string
          booking_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          response?: string | null
          response_at?: string | null
        }
      }
      saved_properties: {
        Row: {
          id: string
          created_at: string
          user_id: string
          property_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          property_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          property_id?: string
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          message: string
          is_read: boolean
          data: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          message: string
          is_read?: boolean
          data?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: string
          message?: string
          is_read?: boolean
          data?: Json | null
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          booking_id: string | null
          property_id: string | null
          type: string
          name: string
          url: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          booking_id?: string | null
          property_id?: string | null
          type: string
          name: string
          url: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          booking_id?: string | null
          property_id?: string | null
          type?: string
          name?: string
          url?: string
          status?: string
        }
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
  }
}
