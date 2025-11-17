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
          achievement_type: string
          badge_name: string | null
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_name?: string | null
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_name?: string | null
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_quick_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      admin_security_events: {
        Row: {
          admin_id: string | null
          auto_action_taken: boolean | null
          created_at: string
          description: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          auto_action_taken?: boolean | null
          created_at?: string
          description: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          auto_action_taken?: boolean | null
          created_at?: string
          description?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_audio_profiles: {
        Row: {
          ai_analysis: Json | null
          audio_file_id: string
          bpm: number | null
          created_at: string
          dynamic_range: number | null
          genre_confidence: number | null
          genre_prediction: string | null
          id: string
          key_signature: string | null
          loudness_lufs: number | null
          processing_time_ms: number | null
          spectral_centroid: number | null
          tempo_bpm: number | null
          tempo_stability: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          audio_file_id: string
          bpm?: number | null
          created_at?: string
          dynamic_range?: number | null
          genre_confidence?: number | null
          genre_prediction?: string | null
          id?: string
          key_signature?: string | null
          loudness_lufs?: number | null
          processing_time_ms?: number | null
          spectral_centroid?: number | null
          tempo_bpm?: number | null
          tempo_stability?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          audio_file_id?: string
          bpm?: number | null
          created_at?: string
          dynamic_range?: number | null
          genre_confidence?: number | null
          genre_prediction?: string | null
          id?: string
          key_signature?: string | null
          loudness_lufs?: number | null
          processing_time_ms?: number | null
          spectral_centroid?: number | null
          tempo_bpm?: number | null
          tempo_stability?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_audio_profiles_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_collaboration_matches: {
        Row: {
          artist_id: string | null
          compatibility_score: number | null
          complementary_skills: string[] | null
          created_at: string
          engineer_id: string | null
          genre_match_score: number | null
          id: string
          match_reason: string | null
          match_score: number | null
          matched_user_id: string
          project_id: string
          status: string | null
          style_match_score: number | null
          technical_match_score: number | null
        }
        Insert: {
          artist_id?: string | null
          compatibility_score?: number | null
          complementary_skills?: string[] | null
          created_at?: string
          engineer_id?: string | null
          genre_match_score?: number | null
          id?: string
          match_reason?: string | null
          match_score?: number | null
          matched_user_id: string
          project_id: string
          status?: string | null
          style_match_score?: number | null
          technical_match_score?: number | null
        }
        Update: {
          artist_id?: string | null
          compatibility_score?: number | null
          complementary_skills?: string[] | null
          created_at?: string
          engineer_id?: string | null
          genre_match_score?: number | null
          id?: string
          match_reason?: string | null
          match_score?: number | null
          matched_user_id?: string
          project_id?: string
          status?: string | null
          style_match_score?: number | null
          technical_match_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_collaboration_matches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_financial_insights: {
        Row: {
          action_taken: boolean | null
          confidence_score: number | null
          created_at: string
          data: Json | null
          description: string
          id: string
          impact_amount: number | null
          insight_type: string
          severity: string | null
          title: string
        }
        Insert: {
          action_taken?: boolean | null
          confidence_score?: number | null
          created_at?: string
          data?: Json | null
          description: string
          id?: string
          impact_amount?: number | null
          insight_type: string
          severity?: string | null
          title: string
        }
        Update: {
          action_taken?: boolean | null
          confidence_score?: number | null
          created_at?: string
          data?: Json | null
          description?: string
          id?: string
          impact_amount?: number | null
          insight_type?: string
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      ai_mixing_suggestions: {
        Row: {
          applied: boolean | null
          confidence_score: number | null
          created_at: string
          description: string
          id: string
          is_applied: boolean | null
          priority: string | null
          project_id: string
          suggestion_type: string
          technical_details: Json | null
          title: string
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description: string
          id?: string
          is_applied?: boolean | null
          priority?: string | null
          project_id: string
          suggestion_type: string
          technical_details?: Json | null
          title: string
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string
          id?: string
          is_applied?: boolean | null
          priority?: string | null
          project_id?: string
          suggestion_type?: string
          technical_details?: Json | null
          title?: string
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mixing_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_files: {
        Row: {
          created_at: string
          duration: number | null
          duration_seconds: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          job_id: string | null
          mime_type: string | null
          project_id: string | null
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          duration_seconds?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          duration_seconds?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          quality_settings: Json | null
          session_id: string
          stream_name: string | null
          stream_type: string | null
          user_id: string
          volume: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          is_solo?: boolean | null
          quality_settings?: Json | null
          session_id: string
          stream_name?: string | null
          stream_type?: string | null
          user_id: string
          volume?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          is_solo?: boolean | null
          quality_settings?: Json | null
          session_id?: string
          stream_name?: string | null
          stream_type?: string | null
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          resource_id: string | null
          resource_type: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      battle_tournaments: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          prize_pool: number | null
          start_date: string
          status: string | null
          tournament_name: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          start_date: string
          status?: string | null
          tournament_name: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          start_date?: string
          status?: string | null
          tournament_name?: string
        }
        Relationships: []
      }
      battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          user_id: string
          voted_for: string
          winner: string | null
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          user_id: string
          voted_for: string
          winner?: string | null
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          user_id?: string
          voted_for?: string
          winner?: string | null
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
          id: string
          losses: number | null
          overall_score: number | null
          ranking_points: number | null
          total_battles: number | null
          user_id: string
          win_rate: number | null
          wins: number | null
        }
        Insert: {
          battler_name: string
          created_at?: string
          id?: string
          losses?: number | null
          overall_score?: number | null
          ranking_points?: number | null
          total_battles?: number | null
          user_id: string
          win_rate?: number | null
          wins?: number | null
        }
        Update: {
          battler_name?: string
          created_at?: string
          id?: string
          losses?: number | null
          overall_score?: number | null
          ranking_points?: number | null
          total_battles?: number | null
          user_id?: string
          win_rate?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      battles: {
        Row: {
          battle_type: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          rapper1: string | null
          rapper2: string | null
          status: string | null
          title: string
          views_count: number | null
          votes_count: number | null
        }
        Insert: {
          battle_type?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          rapper1?: string | null
          rapper2?: string | null
          status?: string | null
          title: string
          views_count?: number | null
          votes_count?: number | null
        }
        Update: {
          battle_type?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          rapper1?: string | null
          rapper2?: string | null
          status?: string | null
          title?: string
          views_count?: number | null
          votes_count?: number | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collaboration_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          is_resolved: boolean | null
          project_id: string | null
          session_id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          project_id?: string | null
          session_id: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          project_id?: string | null
          session_id?: string
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_sessions: {
        Row: {
          audio_quality: string | null
          created_at: string
          description: string | null
          host_user_id: string
          id: string
          max_participants: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          session_name: string | null
          session_state: Json | null
          session_type: string | null
          status: string | null
          title: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          audio_quality?: string | null
          created_at?: string
          description?: string | null
          host_user_id: string
          id?: string
          max_participants?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_name?: string | null
          session_state?: Json | null
          session_type?: string | null
          status?: string | null
          title: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          audio_quality?: string | null
          created_at?: string
          description?: string | null
          host_user_id?: string
          id?: string
          max_participants?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_name?: string | null
          session_state?: Json | null
          session_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
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
          status: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      engineer_deliverables: {
        Row: {
          created_at: string
          engineer_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          notes: string | null
          project_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          engineer_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          project_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          engineer_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineer_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_earnings: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          engineer_id: string
          id: string
          payment_date: string | null
          project_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          engineer_id: string
          id?: string
          payment_date?: string | null
          project_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          engineer_id?: string
          id?: string
          payment_date?: string | null
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_earnings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_profiles: {
        Row: {
          availability_status: string | null
          completed_projects: number | null
          created_at: string
          equipment_list: string[] | null
          genres: string[] | null
          hourly_rate: number | null
          id: string
          portfolio_url: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          completed_projects?: number | null
          created_at?: string
          equipment_list?: string[] | null
          genres?: string[] | null
          hourly_rate?: number | null
          id?: string
          portfolio_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          completed_projects?: number | null
          created_at?: string
          equipment_list?: string[] | null
          genres?: string[] | null
          hourly_rate?: number | null
          id?: string
          portfolio_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      financial_actions_log: {
        Row: {
          action_type: string
          amount: number | null
          created_at: string
          id: string
          performed_by: string | null
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          amount?: number | null
          created_at?: string
          id?: string
          performed_by?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          amount?: number | null
          created_at?: string
          id?: string
          performed_by?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      financial_forecasts: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string
          forecast_date: string
          id: string
          model_version: string | null
          predicted_value: number
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          forecast_date: string
          id?: string
          model_version?: string | null
          predicted_value: number
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          forecast_date?: string
          id?: string
          model_version?: string | null
          predicted_value?: number
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          engineer_id: string | null
          estimated_delivery: string | null
          id: string
          job_id: string
          message: string | null
          proposed_rate: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          engineer_id?: string | null
          estimated_delivery?: string | null
          id?: string
          job_id: string
          message?: string | null
          proposed_rate?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          engineer_id?: string | null
          estimated_delivery?: string | null
          id?: string
          job_id?: string
          message?: string | null
          proposed_rate?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          ai_analysis: Json | null
          artist_id: string
          budget: number | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          deadline: string | null
          description: string
          genre: string | null
          id: string
          service_type: string | null
          skills_required: string[] | null
          status: string | null
          stems_prepared: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          artist_id: string
          budget?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline?: string | null
          description: string
          genre?: string | null
          id?: string
          service_type?: string | null
          skills_required?: string[] | null
          status?: string | null
          stems_prepared?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          artist_id?: string
          budget?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline?: string | null
          description?: string
          genre?: string | null
          id?: string
          service_type?: string | null
          skills_required?: string[] | null
          status?: string | null
          stems_prepared?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mastering_packages: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          track_limit: number | null
          turnaround_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          track_limit?: number | null
          turnaround_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          track_limit?: number | null
          turnaround_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          project_id: string | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          currency: string | null
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string | null
          processed_at: string | null
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          project_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bpm: number | null
          client_id: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          key: string | null
          metadata: Json | null
          mixing_goals: Json | null
          special_instructions: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          mixing_goals?: Json | null
          special_instructions?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          mixing_goals?: Json | null
          special_instructions?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_analytics: {
        Row: {
          arr: number | null
          average_revenue_per_user: number | null
          churn_mrr: number | null
          churn_rate: number | null
          churned_customers: number | null
          created_at: string
          id: string
          mrr: number | null
          new_customers: number | null
          new_mrr: number | null
          period_end: string
          period_start: string
          total_revenue: number | null
        }
        Insert: {
          arr?: number | null
          average_revenue_per_user?: number | null
          churn_mrr?: number | null
          churn_rate?: number | null
          churned_customers?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          new_customers?: number | null
          new_mrr?: number | null
          period_end: string
          period_start: string
          total_revenue?: number | null
        }
        Update: {
          arr?: number | null
          average_revenue_per_user?: number | null
          churn_mrr?: number | null
          churn_rate?: number | null
          churned_customers?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          new_customers?: number | null
          new_mrr?: number | null
          period_end?: string
          period_start?: string
          total_revenue?: number | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_shares: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          session_id: string
          stream_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          session_id: string
          stream_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          session_id?: string
          stream_url?: string | null
          user_id?: string
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
          created_at: string
          id: string
          session_id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          session_id: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          session_id?: string
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      session_invitations: {
        Row: {
          artist_id: string | null
          created_at: string
          engineer_id: string | null
          id: string
          invitee_email: string
          inviter_id: string
          message: string | null
          responded_at: string | null
          session_id: string
          status: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          engineer_id?: string | null
          id?: string
          invitee_email: string
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          session_id: string
          status?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          engineer_id?: string | null
          id?: string
          invitee_email?: string
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_invitations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_join_requests: {
        Row: {
          created_at: string
          engineer_id: string | null
          id: string
          message: string | null
          responded_at: string | null
          session_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          engineer_id?: string | null
          id?: string
          message?: string | null
          responded_at?: string | null
          session_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          engineer_id?: string | null
          id?: string
          message?: string | null
          responded_at?: string | null
          session_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_join_requests_session_id_fkey"
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
          joined_at: string
          permissions: Json | null
          role: string | null
          session_id: string
          user_id: string
          video_enabled: boolean | null
        }
        Insert: {
          audio_input_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          joined_at?: string
          permissions?: Json | null
          role?: string | null
          session_id: string
          user_id: string
          video_enabled?: boolean | null
        }
        Update: {
          audio_input_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          joined_at?: string
          permissions?: Json | null
          role?: string | null
          session_id?: string
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
          created_at: string | null
          duration_seconds: number | null
          file_path: string
          file_size: number | null
          id: string
          session_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_path: string
          file_size?: number | null
          id?: string
          session_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_path?: string
          file_size?: number | null
          id?: string
          session_id?: string
          status?: string | null
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
      user_distribution_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_name: string
          started_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_name: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_name?: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mastering_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          started_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          started_at?: string
          status?: string | null
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
          package_name: string
          started_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_name: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_name?: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      cleanup_old_audit_logs: {
        Args: { days_to_keep: number }
        Returns: number
      }
      cleanup_old_chatbot_messages: {
        Args: { days_to_keep: number }
        Returns: number
      }
      cleanup_old_notifications: {
        Args: { days_to_keep: number }
        Returns: number
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      get_security_dashboard_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "artist" | "engineer"
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
      app_role: ["admin", "moderator", "user", "artist", "engineer"],
    },
  },
} as const
