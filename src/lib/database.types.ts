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
      hotels: {
        Row: {
          id: string
          name: string
          code: string
          pin: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          pin: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          pin?: string
          created_at?: string | null
        }
      }
      log_entries: {
        Row: {
          id: string
          log_id: string
          text: string
          timestamp: string
          created_at: string | null
          reply_to: string | null
          status: string
          global_entry_id: string | null
          original_log_id: string | null
          hotel_id: string
          created_by: string | null
          last_edited_at: string | null
          edited_by: string | null
        }
        Insert: {
          id?: string
          log_id: string
          text: string
          timestamp: string
          created_at?: string | null
          reply_to?: string | null
          status?: string
          global_entry_id?: string | null
          original_log_id?: string | null
          hotel_id: string
          created_by?: string | null
          last_edited_at?: string | null
          edited_by?: string | null
        }
        Update: {
          id?: string
          log_id?: string
          text?: string
          timestamp?: string
          created_at?: string | null
          reply_to?: string | null
          status?: string
          global_entry_id?: string | null
          original_log_id?: string | null
          hotel_id?: string
          created_by?: string | null
          last_edited_at?: string | null
          edited_by?: string | null
        }
      }
      logs: {
        Row: {
          id: string
          receptionist: string
          start_time: string
          end_time: string | null
          status: string
          created_at: string | null
          cash_brl_start: number | null
          cash_usd_start: number | null
          pens_count_start: number | null
          cash_brl_end: number | null
          cash_usd_end: number | null
          pens_count_end: number | null
          envelope_brl_start: number | null
          envelope_brl_end: number | null
          calculator_start: number | null
          calculator_end: number | null
          phone_start: number | null
          phone_end: number | null
          car_key_start: number | null
          car_key_end: number | null
          adapter_start: number | null
          adapter_end: number | null
          umbrella_start: number | null
          umbrella_end: number | null
          highlighter_start: number | null
          highlighter_end: number | null
          cards_towels_start: number | null
          cards_towels_end: number | null
          hotel_id: string | null
          values_last_edited_at: string | null
          values_edited_by: string | null
        }
        Insert: {
          id?: string
          receptionist: string
          start_time: string
          end_time?: string | null
          status: string
          created_at?: string | null
          cash_brl_start?: number | null
          cash_usd_start?: number | null
          pens_count_start?: number | null
          cash_brl_end?: number | null
          cash_usd_end?: number | null
          pens_count_end?: number | null
          envelope_brl_start?: number | null
          envelope_brl_end?: number | null
          calculator_start?: number | null
          calculator_end?: number | null
          phone_start?: number | null
          phone_end?: number | null
          car_key_start?: number | null
          car_key_end?: number | null
          adapter_start?: number | null
          adapter_end?: number | null
          umbrella_start?: number | null
          umbrella_end?: number | null
          highlighter_start?: number | null
          highlighter_end?: number | null
          cards_towels_start?: number | null
          cards_towels_end?: number | null
          hotel_id?: string | null
          values_last_edited_at?: string | null
          values_edited_by?: string | null
        }
        Update: {
          id?: string
          receptionist?: string
          start_time?: string
          end_time?: string | null
          status?: string
          created_at?: string | null
          cash_brl_start?: number | null
          cash_usd_start?: number | null
          pens_count_start?: number | null
          cash_brl_end?: number | null
          cash_usd_end?: number | null
          pens_count_end?: number | null
          envelope_brl_start?: number | null
          envelope_brl_end?: number | null
          calculator_start?: number | null
          calculator_end?: number | null
          phone_start?: number | null
          phone_end?: number | null
          car_key_start?: number | null
          car_key_end?: number | null
          adapter_start?: number | null
          adapter_end?: number | null
          umbrella_start?: number | null
          umbrella_end?: number | null
          highlighter_start?: number | null
          highlighter_end?: number | null
          cards_towels_start?: number | null
          cards_towels_end?: number | null
          hotel_id?: string | null
          values_last_edited_at?: string | null
          values_edited_by?: string | null
        }
      }
      edit_history: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          previous_value: Json
          edited_at: string | null
          edited_by: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          previous_value: Json
          edited_at?: string | null
          edited_by?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          previous_value?: Json
          edited_at?: string | null
          edited_by?: string | null
        }
      }
      tutorials: {
        Row: {
          id: string
          title: string
          description: string | null
          hotel_id: string
          created_by: string
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          hotel_id: string
          created_by: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          hotel_id?: string
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
      }
      tutorial_steps: {
        Row: {
          id: string
          tutorial_id: string
          step_number: number
          title: string
          content: string
          image_url: string | null
          question: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tutorial_id: string
          step_number: number
          title: string
          content: string
          image_url?: string | null
          question?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tutorial_id?: string
          step_number?: number
          title?: string
          content?: string
          image_url?: string | null
          question?: string | null
          created_at?: string | null
        }
      }
      tutorial_step_options: {
        Row: {
          id: string
          step_id: string
          option_text: string
          next_step_id: string | null
          order_index: number
        }
        Insert: {
          id?: string
          step_id: string
          option_text: string
          next_step_id?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          step_id?: string
          option_text?: string
          next_step_id?: string | null
          order_index?: number
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