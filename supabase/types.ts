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
      app_keys: {
        Row: {
          api_key: string
          app_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          secret_key: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          app_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          secret_key: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          app_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          secret_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_app_id"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          }
        ]
      }
      apps: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      model_data: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          model_id: string
          schema: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          model_id: string
          schema: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          model_id?: string
          schema?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_model_id"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          }
        ]
      }
      models: {
        Row: {
          app_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          schema: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          schema: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          schema?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_app_id"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
