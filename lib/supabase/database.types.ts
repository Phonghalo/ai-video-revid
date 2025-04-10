export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          original_content: string
          script: string
          status: "draft" | "pending" | "processing" | "completed" | "failed"
          created_at: string
          updated_at: string
          video_id: string | null
        }
        Insert: {
          id?: string
          title: string
          original_content: string
          script: string
          status?: "draft" | "pending" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          original_content?: string
          script?: string
          status?: "draft" | "pending" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
          video_id?: string | null
        }
      }
      videos: {
        Row: {
          id: string
          project_id: string
          title: string
          status: "pending" | "processing" | "completed" | "failed"
          progress: number
          url: string | null
          error: string | null
          created_at: string
          updated_at: string
          webhook_id: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          status?: "pending" | "processing" | "completed" | "failed"
          progress?: number
          url?: string | null
          error?: string | null
          created_at?: string
          updated_at?: string
          webhook_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          status?: "pending" | "processing" | "completed" | "failed"
          progress?: number
          url?: string | null
          error?: string | null
          created_at?: string
          updated_at?: string
          webhook_id?: string | null
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
