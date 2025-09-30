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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_files: {
        Row: {
          bit_depth: number | null
          channels: number | null
          created_at: string
          duration_seconds: number | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_stem: boolean | null
          job_id: string | null
          processing_status: string | null
          project_id: string
          sample_rate: number | null
          stem_type: string | null
          updated_at: string
          uploaded_by: string
          waveform_data: Json | null
        }
        Insert: {
          bit_depth?: number | null
          channels?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_stem?: boolean | null
          job_id?: string | null
          processing_status?: string | null
          project_id: string
          sample_rate?: number | null
          stem_type?: string | null
          updated_at?: string
          uploaded_by: string
          waveform_data?: Json | null
        }
        Update: {
          bit_depth?: number | null
          channels?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_stem?: boolean | null
          job_id?: string | null
          processing_status?: string | null
          project_id?: string
          sample_rate?: number | null
          stem_type?: string | null
          updated_at?: string
          uploaded_by?: string
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audio_files_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_streams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          is_muted: boolean | null
          is_solo: boolean | null
          session_id: string | null
          stream_name: string
          stream_type: string
          user_id: string
          volume: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          is_solo?: boolean | null
          session_id?: string | null
          stream_name: string
          stream_type: string
          user_id: string
          volume?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          is_solo?: boolean | null
          session_id?: string | null
          stream_name?: string
          stream_type?: string
          user_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_streams_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_comments: {
        Row: {
          battle_id: string
          content: string
          created_at: string
          id: string
          likes_count: number | null
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          battle_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          battle_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_comments_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "battle_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          rounds_won: Json | null
          user_id: string
          winner: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          rounds_won?: Json | null
          user_id: string
          winner: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          rounds_won?: Json | null
          user_id?: string
          winner?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battler_stats: {
        Row: {
          battler_name: string
          created_at: string
          draws: number | null
          id: string
          last_updated: string
          losses: number | null
          ltbr_rank: number | null
          overall_score: number | null
          platform_votes: number | null
          social_score: number | null
          total_battles: number | null
          versetracker_rank: number | null
          wins: number | null
        }
        Insert: {
          battler_name: string
          created_at?: string
          draws?: number | null
          id?: string
          last_updated?: string
          losses?: number | null
          ltbr_rank?: number | null
          overall_score?: number | null
          platform_votes?: number | null
          social_score?: number | null
          total_battles?: number | null
          versetracker_rank?: number | null
          wins?: number | null
        }
        Update: {
          battler_name?: string
          created_at?: string
          draws?: number | null
          id?: string
          last_updated?: string
          losses?: number | null
          ltbr_rank?: number | null
          overall_score?: number | null
          platform_votes?: number | null
          social_score?: number | null
          total_battles?: number | null
          versetracker_rank?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      battles: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          league: string | null
          rapper1: string
          rapper2: string
          title: string
          updated_at: string
          video_id: string
          views_count: number | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          league?: string | null
          rapper1: string
          rapper2: string
          title: string
          updated_at?: string
          video_id: string
          views_count?: number | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          league?: string | null
          rapper1?: string
          rapper2?: string
          title?: string
          updated_at?: string
          video_id?: string
          views_count?: number | null
          votes_count?: number | null
        }
        Relationships: []
      }
      collaboration_comments: {
        Row: {
          audio_file_id: string | null
          comment_text: string
          created_at: string | null
          id: string
          project_id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          audio_file_id?: string | null
          comment_text: string
          created_at?: string | null
          id?: string
          project_id: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          audio_file_id?: string | null
          comment_text?: string
          created_at?: string | null
          id?: string
          project_id?: string
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_comments_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_sessions: {
        Row: {
          audio_quality: string | null
          created_at: string
          ended_at: string | null
          host_user_id: string
          id: string
          max_participants: number | null
          project_id: string | null
          session_name: string
          session_type: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          audio_quality?: string | null
          created_at?: string
          ended_at?: string | null
          host_user_id: string
          id?: string
          max_participants?: number | null
          project_id?: string | null
          session_name: string
          session_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          audio_quality?: string | null
          created_at?: string
          ended_at?: string | null
          host_user_id?: string
          id?: string
          max_participants?: number | null
          project_id?: string | null
          session_name?: string
          session_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          budget: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      daw_imported_files: {
        Row: {
          bit_depth: number | null
          channels: number | null
          created_at: string
          duration_seconds: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          sample_rate: number | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bit_depth?: number | null
          channels?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          sample_rate?: number | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bit_depth?: number | null
          channels?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          sample_rate?: number | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engineer_profiles: {
        Row: {
          certifications: string[] | null
          created_at: string
          equipment_list: string[] | null
          featured_engineer: boolean | null
          id: string
          is_available: boolean | null
          mastering_rate_per_song: number | null
          mixing_rate_per_song: number | null
          onboarding_profile_id: string | null
          portfolio_links: string[] | null
          rating_average: number | null
          rush_fee_percentage: number | null
          specialties: string[] | null
          total_projects_completed: number | null
          total_reviews: number | null
          turnaround_days: number | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          equipment_list?: string[] | null
          featured_engineer?: boolean | null
          id?: string
          is_available?: boolean | null
          mastering_rate_per_song?: number | null
          mixing_rate_per_song?: number | null
          onboarding_profile_id?: string | null
          portfolio_links?: string[] | null
          rating_average?: number | null
          rush_fee_percentage?: number | null
          specialties?: string[] | null
          total_projects_completed?: number | null
          total_reviews?: number | null
          turnaround_days?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          equipment_list?: string[] | null
          featured_engineer?: boolean | null
          id?: string
          is_available?: boolean | null
          mastering_rate_per_song?: number | null
          mixing_rate_per_song?: number | null
          onboarding_profile_id?: string | null
          portfolio_links?: string[] | null
          rating_average?: number | null
          rush_fee_percentage?: number | null
          specialties?: string[] | null
          total_projects_completed?: number | null
          total_reviews?: number | null
          turnaround_days?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_profiles_onboarding_profile_id_fkey"
            columns: ["onboarding_profile_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events_schedule: {
        Row: {
          card: Json | null
          created_at: string
          event_date: string
          id: string
          league: string | null
          location: string | null
          ppv_link: string | null
          price: string | null
          source: string
          status: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          card?: Json | null
          created_at?: string
          event_date: string
          id?: string
          league?: string | null
          location?: string | null
          ppv_link?: string | null
          price?: string | null
          source: string
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          card?: Json | null
          created_at?: string
          event_date?: string
          id?: string
          league?: string | null
          location?: string | null
          ppv_link?: string | null
          price?: string | null
          source?: string
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      external_rankings: {
        Row: {
          battler_name: string
          created_at: string
          date_scraped: string
          id: string
          league: string | null
          losses: number | null
          points: number | null
          rank: number
          source: string
          wins: number | null
        }
        Insert: {
          battler_name: string
          created_at?: string
          date_scraped?: string
          id?: string
          league?: string | null
          losses?: number | null
          points?: number | null
          rank: number
          source: string
          wins?: number | null
        }
        Update: {
          battler_name?: string
          created_at?: string
          date_scraped?: string
          id?: string
          league?: string | null
          losses?: number | null
          points?: number | null
          rank?: number
          source?: string
          wins?: number | null
        }
        Relationships: []
      }
      file_analysis: {
        Row: {
          analysis_data: Json
          audio_file_id: string
          created_at: string
          id: string
          job_id: string | null
          processing_status: string | null
          stems_generated: boolean | null
          stems_paths: Json | null
          updated_at: string
        }
        Insert: {
          analysis_data?: Json
          audio_file_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          processing_status?: string | null
          stems_generated?: boolean | null
          stems_paths?: Json | null
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          audio_file_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
          processing_status?: string | null
          stems_generated?: boolean | null
          stems_paths?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          engineer_id: string
          estimated_delivery: string | null
          id: string
          job_id: string
          message: string | null
          proposed_rate: number | null
          status: string
        }
        Insert: {
          created_at?: string
          engineer_id: string
          estimated_delivery?: string | null
          id?: string
          job_id: string
          message?: string | null
          proposed_rate?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          engineer_id?: string
          estimated_delivery?: string | null
          id?: string
          job_id?: string
          message?: string | null
          proposed_rate?: number | null
          status?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          ai_analysis: Json | null
          artist_id: string
          assigned_engineer_id: string | null
          budget: number | null
          created_at: string
          deadline: string | null
          description: string | null
          genre: string | null
          id: string
          service_type: string
          status: string
          stems_prepared: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          artist_id: string
          assigned_engineer_id?: string | null
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          service_type?: string
          status?: string
          stems_prepared?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          artist_id?: string
          assigned_engineer_id?: string | null
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          service_type?: string
          status?: string
          stems_prepared?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mastering_packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          track_limit: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          track_limit?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          track_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mixing_packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          track_limit: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          track_limit?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          track_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string
          current_step: number
          daw_preference: string | null
          equipment: Json | null
          experience_level: string | null
          genre: string | null
          hourly_rate: number | null
          id: string
          onboarding_completed: boolean
          portfolio_links: Json | null
          services_offered: Json | null
          stage_name: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          current_step?: number
          daw_preference?: string | null
          equipment?: Json | null
          experience_level?: string | null
          genre?: string | null
          hourly_rate?: number | null
          id?: string
          onboarding_completed?: boolean
          portfolio_links?: Json | null
          services_offered?: Json | null
          stage_name?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          current_step?: number
          daw_preference?: string | null
          equipment?: Json | null
          experience_level?: string | null
          genre?: string | null
          hourly_rate?: number | null
          id?: string
          onboarding_completed?: boolean
          portfolio_links?: Json | null
          services_offered?: Json | null
          stage_name?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          project_id: string
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          project_id: string
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          project_id?: string
          status?: string | null
          stripe_payment_id?: string | null
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
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_updates: {
        Row: {
          created_at: string
          engineer_id: string
          id: string
          message: string
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          created_at?: string
          engineer_id: string
          id?: string
          message: string
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          created_at?: string
          engineer_id?: string
          id?: string
          message?: string
          project_id?: string
          status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: [
          {
            foreignKeyName: "progress_updates_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_stem: boolean | null
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_stem?: boolean | null
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_stem?: boolean | null
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          content: string | null
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          project_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          project_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          project_id: string
          rating: number
          review_text: string | null
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          project_id: string
          rating: number
          review_text?: string | null
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          project_id?: string
          rating?: number
          review_text?: string | null
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          deadline: string | null
          description: string | null
          engineer_id: string | null
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_shares: {
        Row: {
          ended_at: string | null
          id: string
          is_active: boolean | null
          screen_type: string | null
          session_id: string | null
          shared_by: string
          started_at: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          screen_type?: string | null
          session_id?: string | null
          shared_by: string
          started_at?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          screen_type?: string | null
          session_id?: string | null
          shared_by?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screen_shares_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_comments: {
        Row: {
          comment_text: string
          comment_type: string | null
          created_at: string
          id: string
          session_id: string | null
          timestamp_seconds: number
          user_id: string
        }
        Insert: {
          comment_text: string
          comment_type?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          timestamp_seconds: number
          user_id: string
        }
        Update: {
          comment_text?: string
          comment_type?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          timestamp_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          audio_input_enabled: boolean | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          permissions: Json | null
          role: string
          session_id: string | null
          user_id: string
          video_enabled: boolean | null
        }
        Insert: {
          audio_input_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          permissions?: Json | null
          role?: string
          session_id?: string | null
          user_id: string
          video_enabled?: boolean | null
        }
        Update: {
          audio_input_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          permissions?: Json | null
          role?: string
          session_id?: string | null
          user_id?: string
          video_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          audio_format: string | null
          created_at: string
          duration_seconds: number | null
          file_path: string
          file_size_bytes: number | null
          id: string
          recorded_by: string
          recording_name: string
          session_id: string | null
        }
        Insert: {
          audio_format?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          file_size_bytes?: number | null
          id?: string
          recorded_by: string
          recording_name: string
          session_id?: string | null
        }
        Update: {
          audio_format?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          recorded_by?: string
          recording_name?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_posts: {
        Row: {
          author_handle: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          platform: string
          post_id: string
          post_url: string | null
          posted_at: string
          profile_name: string
          profile_type: string
          replies_count: number | null
          retweets_count: number | null
          updated_at: string
        }
        Insert: {
          author_handle: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          platform: string
          post_id: string
          post_url?: string | null
          posted_at: string
          profile_name: string
          profile_type: string
          replies_count?: number | null
          retweets_count?: number | null
          updated_at?: string
        }
        Update: {
          author_handle?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          platform?: string
          post_id?: string
          post_url?: string | null
          posted_at?: string
          profile_name?: string
          profile_type?: string
          replies_count?: number | null
          retweets_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      social_mentions: {
        Row: {
          author: string | null
          battler_mentions: string[] | null
          content: string
          created_at: string
          date_posted: string
          id: string
          likes_count: number | null
          platform: string
          sentiment: number | null
          shares_count: number | null
        }
        Insert: {
          author?: string | null
          battler_mentions?: string[] | null
          content: string
          created_at?: string
          date_posted: string
          id?: string
          likes_count?: number | null
          platform: string
          sentiment?: number | null
          shares_count?: number | null
        }
        Update: {
          author?: string | null
          battler_mentions?: string[] | null
          content?: string
          created_at?: string
          date_posted?: string
          id?: string
          likes_count?: number | null
          platform?: string
          sentiment?: number | null
          shares_count?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          engineer_id: string
          id: string
          priority: string | null
          project_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          engineer_id: string
          id?: string
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          engineer_id?: string
          id?: string
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mastering_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tracks_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tracks_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tracks_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mastering_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "mastering_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mixing_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          status: string
          stripe_customer_id: string | null
          tracks_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          status?: string
          stripe_customer_id?: string | null
          tracks_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          status?: string
          stripe_customer_id?: string | null
          tracks_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mixing_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "mixing_packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_achievement: {
        Args: {
          p_badge_description: string
          p_badge_name: string
          p_badge_type: string
          p_user_id: string
        }
        Returns: string
      }
      award_points: {
        Args: { points_to_add: number; user_id: string }
        Returns: undefined
      }
      calculate_battler_score: {
        Args: {
          ltbr_rank: number
          platform_votes: number
          social_score: number
          versetracker_rank: number
        }
        Returns: number
      }
      has_mastering_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_mixing_access: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      project_status:
        | "pending"
        | "in_progress"
        | "mixing"
        | "mastering"
        | "revision"
        | "completed"
        | "cancelled"
      user_role: "client" | "engineer" | "admin"
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
      project_status: [
        "pending",
        "in_progress",
        "mixing",
        "mastering",
        "revision",
        "completed",
        "cancelled",
      ],
      user_role: ["client", "engineer", "admin"],
    },
  },
} as const
