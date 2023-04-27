export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          created_at: string | null
          id: number
          questions: string
          teacher_id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          questions: string
          teacher_id: number
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          questions?: string
          teacher_id?: number
          title?: string
          updated_at?: string | null
        }
      }
      assignments: {
        Row: {
          basket: string
          created_at: string | null
          id: number
          mark: number
          questions: string | null
          status: string
          student_id: number
          teacher_id: number
          title: string
          total: number
        }
        Insert: {
          basket: string
          created_at?: string | null
          id?: number
          mark: number
          questions?: string | null
          status?: string
          student_id: number
          teacher_id: number
          title?: string
          total: number
        }
        Update: {
          basket?: string
          created_at?: string | null
          id?: number
          mark?: number
          questions?: string | null
          status?: string
          student_id?: number
          teacher_id?: number
          title?: string
          total?: number
        }
      }
      classes: {
        Row: {
          created_at: string | null
          grade: string
          id: number
          name: string
          schedule: number[]
          school_id: number
        }
        Insert: {
          created_at?: string | null
          grade?: string
          id?: number
          name?: string
          schedule?: number[]
          school_id: number
        }
        Update: {
          created_at?: string | null
          grade?: string
          id?: number
          name?: string
          schedule?: number[]
          school_id?: number
        }
      }
      navadra_fights: {
        Row: {
          created_at: string | null
          id: number
          monsterId: number
          monsterLeftStamina: number | null
          outcome: string | null
          prestige: number | null
          progress: string | null
          userId: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          monsterId: number
          monsterLeftStamina?: number | null
          outcome?: string | null
          prestige?: number | null
          progress?: string | null
          userId: string
        }
        Update: {
          created_at?: string | null
          id?: number
          monsterId?: number
          monsterLeftStamina?: number | null
          outcome?: string | null
          prestige?: number | null
          progress?: string | null
          userId?: string
        }
      }
      navadra_monsters: {
        Row: {
          category: string
          created_at: string | null
          dead: boolean
          element: string
          id: number
          level: number
          name: string
          nb_hunters: number
          position: string
        }
        Insert: {
          category: string
          created_at?: string | null
          dead?: boolean
          element: string
          id?: number
          level?: number
          name: string
          nb_hunters?: number
          position: string
        }
        Update: {
          category?: string
          created_at?: string | null
          dead?: boolean
          element?: string
          id?: number
          level?: number
          name?: string
          nb_hunters?: number
          position?: string
        }
      }
      navadra_players: {
        Row: {
          avatar: string
          created_at: string | null
          earth_pyrs: number
          fire_pyrs: number
          id: number
          level: number
          monsters_ids: number[]
          position: string
          prestige: number
          pseudo: string
          sex: string
          spent_earth_pyrs: number
          spent_fire_pyrs: number
          spent_water_pyrs: number
          spent_wind_pyrs: number
          tuto: string
          tutor: string
          user_id: number
          water_pyrs: number
          wind_pyrs: number
          xp: number
        }
        Insert: {
          avatar: string
          created_at?: string | null
          earth_pyrs?: number
          fire_pyrs?: number
          id?: number
          level?: number
          monsters_ids: number[]
          position: string
          prestige: number
          pseudo: string
          sex: string
          spent_earth_pyrs?: number
          spent_fire_pyrs?: number
          spent_water_pyrs?: number
          spent_wind_pyrs?: number
          tuto: string
          tutor: string
          user_id: number
          water_pyrs?: number
          wind_pyrs?: number
          xp?: number
        }
        Update: {
          avatar?: string
          created_at?: string | null
          earth_pyrs?: number
          fire_pyrs?: number
          id?: number
          level?: number
          monsters_ids?: number[]
          position?: string
          prestige?: number
          pseudo?: string
          sex?: string
          spent_earth_pyrs?: number
          spent_fire_pyrs?: number
          spent_water_pyrs?: number
          spent_wind_pyrs?: number
          tuto?: string
          tutor?: string
          user_id?: number
          water_pyrs?: number
          wind_pyrs?: number
          xp?: number
        }
      }
      navadra_spells: {
        Row: {
          created_at: string | null
          id: number
          level: number
          player_id: number | null
          spell_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          level: number
          player_id?: number | null
          spell_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          level?: number
          player_id?: number | null
          spell_id?: number
        }
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: number
          metadescription: string
          published_at: string
          summary: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          metadescription?: string
          published_at?: string
          summary: string
          tags: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          metadescription?: string
          published_at?: string
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
      }
      progression: {
        Row: {
          created_at: string | null
          id: number
          progression: Json | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          progression?: Json | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          progression?: Json | null
          user_id?: number | null
        }
      }
      results: {
        Row: {
          assessment_id: number | null
          created_at: string | null
          id: number
          result: Json | null
          status: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          assessment_id?: number | null
          created_at?: string | null
          id?: number
          result?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          assessment_id?: number | null
          created_at?: string | null
          id?: number
          result?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
      }
      schools: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
      }
      tags: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
      users: {
        Row: {
          auth_id: string | null
          classe_ids: number[] | null
          created_at: string | null
          email: string
          firstname: string
          gidouilles: number | null
          grade: string | null
          id: number
          lastname: string
          role: string
          school_id: number | null
          teacher_id: number | null
          teacher_uuid: string | null
          updated_at: string | null
          vips: string | null
        }
        Insert: {
          auth_id?: string | null
          classe_ids?: number[] | null
          created_at?: string | null
          email?: string
          firstname?: string
          gidouilles?: number | null
          grade?: string | null
          id?: number
          lastname?: string
          role?: string
          school_id?: number | null
          teacher_id?: number | null
          teacher_uuid?: string | null
          updated_at?: string | null
          vips?: string | null
        }
        Update: {
          auth_id?: string | null
          classe_ids?: number[] | null
          created_at?: string | null
          email?: string
          firstname?: string
          gidouilles?: number | null
          grade?: string | null
          id?: number
          lastname?: string
          role?: string
          school_id?: number | null
          teacher_id?: number | null
          teacher_uuid?: string | null
          updated_at?: string | null
          vips?: string | null
        }
      }
      warnings: {
        Row: {
          created_at: string | null
          date: string
          id: number
          student_id: number
          warnings: string[]
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: number
          student_id: number
          warnings?: string[]
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: number
          student_id?: number
          warnings?: string[]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
