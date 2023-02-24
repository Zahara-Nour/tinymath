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
          questions: Json[] | null
          teacher_id: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          questions?: Json[] | null
          teacher_id?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          questions?: Json[] | null
          teacher_id?: number | null
          title?: string | null
          updated_at?: string | null
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
          img: string
          imgHead: string | null
          level: number
          name: string
          nbHunters: number
          position: Json
          userId: string
        }
        Insert: {
          category: string
          created_at?: string | null
          dead?: boolean
          element: string
          id?: number
          img: string
          imgHead?: string | null
          level: number
          name: string
          nbHunters: number
          position: Json
          userId: string
        }
        Update: {
          category?: string
          created_at?: string | null
          dead?: boolean
          element?: string
          id?: number
          img?: string
          imgHead?: string | null
          level?: number
          name?: string
          nbHunters?: number
          position?: Json
          userId?: string
        }
      }
      navadra_players: {
        Row: {
          avatar: string
          avatarHead: string
          created_at: string | null
          earthPyrs: number
          firePyrs: number
          id: number
          level: number
          monsters: number[] | null
          position: Json | null
          prestige: number
          pseudo: string
          sex: string
          spentEarthPyrs: number | null
          spentFirePyrs: number | null
          spentWaterPyrs: number
          spentWindPyrs: number | null
          tuto: string | null
          tutor: string | null
          tutorImage: string | null
          userId: string | null
          waterPyrs: number
          windPyrs: number
          xp: number
        }
        Insert: {
          avatar: string
          avatarHead: string
          created_at?: string | null
          earthPyrs?: number
          firePyrs?: number
          id?: number
          level?: number
          monsters?: number[] | null
          position?: Json | null
          prestige?: number
          pseudo: string
          sex: string
          spentEarthPyrs?: number | null
          spentFirePyrs?: number | null
          spentWaterPyrs?: number
          spentWindPyrs?: number | null
          tuto?: string | null
          tutor?: string | null
          tutorImage?: string | null
          userId?: string | null
          waterPyrs?: number
          windPyrs?: number
          xp?: number
        }
        Update: {
          avatar?: string
          avatarHead?: string
          created_at?: string | null
          earthPyrs?: number
          firePyrs?: number
          id?: number
          level?: number
          monsters?: number[] | null
          position?: Json | null
          prestige?: number
          pseudo?: string
          sex?: string
          spentEarthPyrs?: number | null
          spentFirePyrs?: number | null
          spentWaterPyrs?: number
          spentWindPyrs?: number | null
          tuto?: string | null
          tutor?: string | null
          tutorImage?: string | null
          userId?: string | null
          waterPyrs?: number
          windPyrs?: number
          xp?: number
        }
      }
      navadra_spells: {
        Row: {
          created_at: string | null
          element1: string | null
          id: number
          level: number
          num: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          element1?: string | null
          id?: number
          level: number
          num: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          element1?: string | null
          id?: number
          level?: number
          num?: number
          user_id?: string
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
          city: string | null
          classes: string[] | null
          country: string | null
          created_at: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          classes?: string[] | null
          country?: string | null
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          classes?: string[] | null
          country?: string | null
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          assessments: number[] | null
          classes: string[] | null
          created_at: string | null
          email: string | null
          firstname: string | null
          grade: string | null
          id: number
          lastname: string | null
          others: number[] | null
          roles: string[] | null
          schoolId: number | null
          teacherId: number | null
          updated_at: string | null
          userId: string | null
        }
        Insert: {
          assessments?: number[] | null
          classes?: string[] | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          grade?: string | null
          id?: number
          lastname?: string | null
          others?: number[] | null
          roles?: string[] | null
          schoolId?: number | null
          teacherId?: number | null
          updated_at?: string | null
          userId?: string | null
        }
        Update: {
          assessments?: number[] | null
          classes?: string[] | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          grade?: string | null
          id?: number
          lastname?: string | null
          others?: number[] | null
          roles?: string[] | null
          schoolId?: number | null
          teacherId?: number | null
          updated_at?: string | null
          userId?: string | null
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
