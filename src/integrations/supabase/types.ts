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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          achievement_type: string
          badge_name: string | null
          badge_type: string | null
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          achievement_type: string
          badge_name?: string | null
          badge_type?: string | null
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          achievement_type?: string
          badge_name?: string | null
          badge_type?: string | null
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          achievement_type: string
          badge_description: string | null
          badge_name: string | null
          badge_type: string | null
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          metadata: Json | null
          name: string | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_description?: string | null
          badge_name?: string | null
          badge_type?: string | null
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_description?: string | null
          badge_name?: string | null
          badge_type?: string | null
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      addon_services: {
        Row: {
          applicable_to: string[] | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          is_percentage: boolean | null
          percentage_value: number | null
          price: number
          service_description: string | null
          service_name: string
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          applicable_to?: string[] | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_percentage?: boolean | null
          percentage_value?: number | null
          price: number
          service_description?: string | null
          service_name: string
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applicable_to?: string[] | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_percentage?: boolean | null
          percentage_value?: number | null
          price?: number
          service_description?: string | null
          service_name?: string
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
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
      application_templates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          service_type: string | null
          template_content: string
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          service_type?: string | null
          template_content: string
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          service_type?: string | null
          template_content?: string
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artist_day1s: {
        Row: {
          artist_follower_count_at_follow: number
          artist_id: string
          artist_milestone_10k: boolean
          artist_milestone_1k: boolean
          artist_milestone_verified: boolean
          coinz_awarded_10k: boolean
          coinz_awarded_1k: boolean
          coinz_awarded_verified: boolean
          created_at: string
          fan_id: string
          followed_at: string
          id: string
          puttin_in_at_time: number
          recognition_tier: string
          updated_at: string
        }
        Insert: {
          artist_follower_count_at_follow?: number
          artist_id: string
          artist_milestone_10k?: boolean
          artist_milestone_1k?: boolean
          artist_milestone_verified?: boolean
          coinz_awarded_10k?: boolean
          coinz_awarded_1k?: boolean
          coinz_awarded_verified?: boolean
          created_at?: string
          fan_id: string
          followed_at?: string
          id?: string
          puttin_in_at_time?: number
          recognition_tier?: string
          updated_at?: string
        }
        Update: {
          artist_follower_count_at_follow?: number
          artist_id?: string
          artist_milestone_10k?: boolean
          artist_milestone_1k?: boolean
          artist_milestone_verified?: boolean
          coinz_awarded_10k?: boolean
          coinz_awarded_1k?: boolean
          coinz_awarded_verified?: boolean
          created_at?: string
          fan_id?: string
          followed_at?: string
          id?: string
          puttin_in_at_time?: number
          recognition_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_day1s_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_day1s_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_contexts: {
        Row: {
          context_prefix: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          context_prefix: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          context_prefix?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
          waveform_data: Json | null
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
          waveform_data?: Json | null
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
          waveform_data?: Json | null
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
          entry_fee: number | null
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
          entry_fee?: number | null
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
          entry_fee?: number | null
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
      beat_purchases: {
        Row: {
          amount_cents: number
          beat_id: string | null
          buyer_id: string
          created_at: string | null
          downloaded_at: string | null
          id: string
          license_type: string
          platform_fee_cents: number
          seller_earnings_cents: number
          seller_id: string
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          beat_id?: string | null
          buyer_id: string
          created_at?: string | null
          downloaded_at?: string | null
          id?: string
          license_type: string
          platform_fee_cents?: number
          seller_earnings_cents: number
          seller_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          beat_id?: string | null
          buyer_id?: string
          created_at?: string | null
          downloaded_at?: string | null
          id?: string
          license_type?: string
          platform_fee_cents?: number
          seller_earnings_cents?: number
          seller_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beat_purchases_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "producer_beats"
            referencedColumns: ["id"]
          },
        ]
      }
      beat_royalties: {
        Row: {
          artist_amount: number
          artist_percentage: number
          beat_id: string | null
          created_at: string
          gross_revenue: number
          id: string
          paid_at: string | null
          partnership_id: string
          period_end: string
          period_start: string
          platform: string | null
          platform_fee: number | null
          producer_amount: number
          producer_percentage: number
          status: string | null
          stream_count: number | null
          track_release_id: string | null
        }
        Insert: {
          artist_amount?: number
          artist_percentage: number
          beat_id?: string | null
          created_at?: string
          gross_revenue?: number
          id?: string
          paid_at?: string | null
          partnership_id: string
          period_end: string
          period_start: string
          platform?: string | null
          platform_fee?: number | null
          producer_amount?: number
          producer_percentage: number
          status?: string | null
          stream_count?: number | null
          track_release_id?: string | null
        }
        Update: {
          artist_amount?: number
          artist_percentage?: number
          beat_id?: string | null
          created_at?: string
          gross_revenue?: number
          id?: string
          paid_at?: string | null
          partnership_id?: string
          period_end?: string
          period_start?: string
          platform?: string | null
          platform_fee?: number | null
          producer_amount?: number
          producer_percentage?: number
          status?: string | null
          stream_count?: number | null
          track_release_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beat_royalties_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "producer_beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beat_royalties_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beat_royalties_track_release_id_fkey"
            columns: ["track_release_id"]
            isOneToOne: false
            referencedRelation: "track_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          asset_context: string | null
          asset_type: string
          category: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          prompt_used: string | null
          public_url: string
          storage_path: string
          thumbnail_url: string | null
        }
        Insert: {
          asset_context?: string | null
          asset_type: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          prompt_used?: string | null
          public_url: string
          storage_path: string
          thumbnail_url?: string | null
        }
        Update: {
          asset_context?: string | null
          asset_type?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          prompt_used?: string | null
          public_url?: string
          storage_path?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      brand_settings: {
        Row: {
          active_asset_id: string | null
          id: string
          setting_value: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_asset_id?: string | null
          id: string
          setting_value?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_asset_id?: string | null
          id?: string
          setting_value?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_settings_active_asset_id_fkey"
            columns: ["active_asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          created_at: string
          enrollment_id: string | null
          expires_at: string | null
          id: string
          issued_at: string
          metadata: Json | null
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          created_at?: string
          enrollment_id?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          created_at?: string
          enrollment_id?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_messages: {
        Row: {
          chatbot_type: string | null
          context: Json | null
          created_at: string
          id: string
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          chatbot_type?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          chatbot_type?: string | null
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
      collaborative_projects: {
        Row: {
          actual_hours: number | null
          client_id: string | null
          cover_image_url: string | null
          created_at: string
          deadline: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          partnership_id: string
          priority: string | null
          progress_percentage: number | null
          project_type: string | null
          release_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          client_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          partnership_id: string
          priority?: string | null
          progress_percentage?: number | null
          project_type?: string | null
          release_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          client_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          partnership_id?: string
          priority?: string | null
          progress_percentage?: number | null
          project_type?: string | null
          release_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborative_projects_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      community_unlockables: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_unlocked: boolean | null
          name: string
          threshold_type: string
          threshold_value: number
          unlock_order: number | null
          unlockable_type: string | null
          unlocked_at: string | null
          updated_at: string | null
          visual_asset_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean | null
          name: string
          threshold_type: string
          threshold_value: number
          unlock_order?: number | null
          unlockable_type?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          visual_asset_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean | null
          name?: string
          threshold_type?: string
          threshold_value?: number
          unlock_order?: number | null
          unlockable_type?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          visual_asset_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_unlockables_visual_asset_id_fkey"
            columns: ["visual_asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
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
      contract_expiration_notifications: {
        Row: {
          contract_id: string
          created_at: string | null
          days_until_expiration: number
          id: string
          is_sent: boolean | null
          notification_date: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          days_until_expiration: number
          id?: string
          is_sent?: boolean | null
          notification_date: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          days_until_expiration?: number
          id?: string
          is_sent?: boolean | null
          notification_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_expiration_notifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "enterprise_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          certificate_issued: boolean | null
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_lesson_id: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          certificate_issued?: boolean | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_lesson_id?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          certificate_issued?: boolean | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_lesson_id?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_last_accessed_lesson_id_fkey"
            columns: ["last_accessed_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_public: boolean | null
          is_verified_purchase: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          is_verified_purchase?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          is_verified_purchase?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          outcomes: string[] | null
          price: number | null
          requirements: string[] | null
          stripe_price_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          tier: string | null
          title: string
          total_enrollments: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          outcomes?: string[] | null
          price?: number | null
          requirements?: string[] | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tier?: string | null
          title: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          outcomes?: string[] | null
          price?: number | null
          requirements?: string[] | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tier?: string | null
          title?: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_client_tags: {
        Row: {
          client_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_client_tags_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_client_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crm_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clients: {
        Row: {
          avatar_url: string | null
          client_type: string
          client_user_id: string | null
          company: string | null
          created_at: string
          deals_count: number | null
          email: string | null
          id: string
          last_interaction_at: string | null
          metadata: Json | null
          name: string
          notes_count: number | null
          phone: string | null
          source: string | null
          status: string | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          client_type?: string
          client_user_id?: string | null
          company?: string | null
          created_at?: string
          deals_count?: number | null
          email?: string | null
          id?: string
          last_interaction_at?: string | null
          metadata?: Json | null
          name: string
          notes_count?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          client_type?: string
          client_user_id?: string | null
          company?: string | null
          created_at?: string
          deals_count?: number | null
          email?: string | null
          id?: string
          last_interaction_at?: string | null
          metadata?: Json | null
          name?: string
          notes_count?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_clients_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string
          currency: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          metadata: Json | null
          probability: number | null
          project_id: string | null
          stage: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          metadata?: Json | null
          probability?: number | null
          project_id?: string | null
          stage?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          metadata?: Json | null
          probability?: number | null
          project_id?: string | null
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          occurred_at: string
          reference_id: string | null
          sentiment: string | null
          summary: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          occurred_at?: string
          reference_id?: string | null
          sentiment?: string | null
          summary: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          occurred_at?: string
          reference_id?: string | null
          sentiment?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          deal_id: string | null
          id: string
          is_pinned: boolean | null
          note_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      curator_premiere_slots: {
        Row: {
          available_days: string[] | null
          created_at: string | null
          curator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          max_bookings_per_day: number | null
          max_duration_seconds: number | null
          price_coinz: number
          slot_name: string
          slot_type: string | null
          time_window: string | null
        }
        Insert: {
          available_days?: string[] | null
          created_at?: string | null
          curator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          max_duration_seconds?: number | null
          price_coinz: number
          slot_name: string
          slot_type?: string | null
          time_window?: string | null
        }
        Update: {
          available_days?: string[] | null
          created_at?: string | null
          curator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          max_duration_seconds?: number | null
          price_coinz?: number
          slot_name?: string
          slot_type?: string | null
          time_window?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curator_premiere_slots_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "curator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curator_profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          curator_name: string
          featured_playlist_id: string | null
          genres: string[] | null
          id: string
          is_verified: boolean | null
          minimum_payment: number | null
          response_time_hours: number | null
          social_links: Json | null
          status: string | null
          total_earnings: number | null
          total_placements: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          curator_name: string
          featured_playlist_id?: string | null
          genres?: string[] | null
          id?: string
          is_verified?: boolean | null
          minimum_payment?: number | null
          response_time_hours?: number | null
          social_links?: Json | null
          status?: string | null
          total_earnings?: number | null
          total_placements?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          curator_name?: string
          featured_playlist_id?: string | null
          genres?: string[] | null
          id?: string
          is_verified?: boolean | null
          minimum_payment?: number | null
          response_time_hours?: number | null
          social_links?: Json | null
          status?: string | null
          total_earnings?: number | null
          total_placements?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curator_profiles_featured_playlist_id_fkey"
            columns: ["featured_playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curator_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curator_promotion_requests: {
        Row: {
          artist_id: string
          artist_notes: string | null
          completed_at: string | null
          created_at: string | null
          curator_id: string
          curator_notes: string | null
          id: string
          payment_amount: number
          payment_currency: string
          playlist_url: string | null
          responded_at: string | null
          status: string | null
          track_id: string | null
          track_title: string
          track_url: string | null
        }
        Insert: {
          artist_id: string
          artist_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          curator_id: string
          curator_notes?: string | null
          id?: string
          payment_amount: number
          payment_currency: string
          playlist_url?: string | null
          responded_at?: string | null
          status?: string | null
          track_id?: string | null
          track_title: string
          track_url?: string | null
        }
        Update: {
          artist_id?: string
          artist_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          curator_id?: string
          curator_notes?: string | null
          id?: string
          payment_amount?: number
          payment_currency?: string
          playlist_url?: string | null
          responded_at?: string | null
          status?: string | null
          track_id?: string | null
          track_title?: string
          track_url?: string | null
        }
        Relationships: []
      }
      curator_slot_bookings: {
        Row: {
          artist_id: string
          artist_notes: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          curator_id: string
          curator_notes: string | null
          escrow_transaction_id: string | null
          id: string
          payment_amount: number
          premiere_date: string
          slot_id: string
          status: string | null
          track_id: string | null
          track_title: string
          track_url: string | null
        }
        Insert: {
          artist_id: string
          artist_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          curator_id: string
          curator_notes?: string | null
          escrow_transaction_id?: string | null
          id?: string
          payment_amount: number
          premiere_date: string
          slot_id: string
          status?: string | null
          track_id?: string | null
          track_title: string
          track_url?: string | null
        }
        Update: {
          artist_id?: string
          artist_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          curator_id?: string
          curator_notes?: string | null
          escrow_transaction_id?: string | null
          id?: string
          payment_amount?: number
          premiere_date?: string
          slot_id?: string
          status?: string | null
          track_id?: string | null
          track_title?: string
          track_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curator_slot_bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curator_slot_bookings_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "curator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curator_slot_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "curator_premiere_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_beats: {
        Row: {
          ai_prompt: string | null
          audio_url: string | null
          bpm: number | null
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          duration_seconds: number | null
          generation_model: string | null
          genre: string
          id: string
          intensity: number | null
          is_featured: boolean | null
          mood: string
          play_count: number | null
          storage_path: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_prompt?: string | null
          audio_url?: string | null
          bpm?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          generation_model?: string | null
          genre?: string
          id?: string
          intensity?: number | null
          is_featured?: boolean | null
          mood?: string
          play_count?: number | null
          storage_path?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_prompt?: string | null
          audio_url?: string | null
          bpm?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          generation_model?: string | null
          genre?: string
          id?: string
          intensity?: number | null
          is_featured?: boolean | null
          mood?: string
          play_count?: number | null
          storage_path?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string | null
          id: string
          message_text: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          thread_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_text: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          thread_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_text?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_packages: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          is_featured: boolean | null
          package_description: string | null
          package_name: string
          partner_affiliate_url: string
          partner_name: string
          platforms_count: number | null
          price: number
          sort_order: number | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          package_description?: string | null
          package_name: string
          partner_affiliate_url: string
          partner_name: string
          platforms_count?: number | null
          price: number
          sort_order?: number | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          package_description?: string | null
          package_name?: string
          partner_affiliate_url?: string
          partner_name?: string
          platforms_count?: number | null
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      distribution_referrals: {
        Row: {
          commission_amount: number | null
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_id: string
          status: string | null
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
        }
        Update: {
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      effect_presets: {
        Row: {
          created_at: string
          effect_type: string
          id: string
          is_public: boolean | null
          parameters: Json
          preset_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          effect_type: string
          id?: string
          is_public?: boolean | null
          parameters: Json
          preset_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          effect_type?: string
          id?: string
          is_public?: boolean | null
          parameters?: Json
          preset_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "effect_presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_enrollments: {
        Row: {
          completed_at: string | null
          current_step: number | null
          enrolled_at: string | null
          id: string
          last_email_at: string | null
          metadata: Json | null
          next_email_at: string | null
          sequence_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          last_email_at?: string | null
          metadata?: Json | null
          next_email_at?: string | null
          sequence_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          last_email_at?: string | null
          metadata?: Json | null
          next_email_at?: string | null
          sequence_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_steps: {
        Row: {
          conditions: Json | null
          created_at: string | null
          delay_hours: number | null
          html_template: string
          id: string
          is_active: boolean | null
          sequence_id: string
          step_order: number
          subject: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          delay_hours?: number | null
          html_template: string
          id?: string
          is_active?: boolean | null
          sequence_id: string
          step_order: number
          subject: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          delay_hours?: number | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          sequence_id?: string
          step_order?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      engineer_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_rarity: string | null
          badge_type: string | null
          created_at: string | null
          earned_at: string | null
          engineer_id: string
          icon_name: string | null
          id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_rarity?: string | null
          badge_type?: string | null
          created_at?: string | null
          earned_at?: string | null
          engineer_id: string
          icon_name?: string | null
          id?: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_rarity?: string | null
          badge_type?: string | null
          created_at?: string | null
          earned_at?: string | null
          engineer_id?: string
          icon_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineer_badges_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          version_number: number | null
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
          version_number?: number | null
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
          version_number?: number | null
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
          base_amount: number | null
          bonus_amount: number | null
          created_at: string
          currency: string | null
          engineer_id: string
          id: string
          payment_date: string | null
          payout_date: string | null
          project_id: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          amount: number
          base_amount?: number | null
          bonus_amount?: number | null
          created_at?: string
          currency?: string | null
          engineer_id: string
          id?: string
          payment_date?: string | null
          payout_date?: string | null
          project_id?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          amount?: number
          base_amount?: number | null
          bonus_amount?: number | null
          created_at?: string
          currency?: string | null
          engineer_id?: string
          id?: string
          payment_date?: string | null
          payout_date?: string | null
          project_id?: string | null
          status?: string | null
          total_amount?: number | null
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
      engineer_payouts: {
        Row: {
          created_at: string | null
          eligible_for_payout_at: string | null
          engineer_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          payment_id: string | null
          payout_method: string | null
          platform_fee: number
          processed_at: string | null
          project_id: string | null
          status: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          created_at?: string | null
          eligible_for_payout_at?: string | null
          engineer_id?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          payment_id?: string | null
          payout_method?: string | null
          platform_fee: number
          processed_at?: string | null
          project_id?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          created_at?: string | null
          eligible_for_payout_at?: string | null
          engineer_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          payment_id?: string | null
          payout_method?: string | null
          platform_fee?: number
          processed_at?: string | null
          project_id?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_payouts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_payouts_project_id_fkey"
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
          trending_score: number | null
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
          trending_score?: number | null
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
          trending_score?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      engineer_reviews: {
        Row: {
          client_id: string
          created_at: string
          engineer_id: string
          id: string
          is_verified: boolean | null
          project_id: string | null
          rating: number
          review_text: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          engineer_id: string
          id?: string
          is_verified?: boolean | null
          project_id?: string | null
          rating: number
          review_text?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          engineer_id?: string
          id?: string
          is_verified?: boolean | null
          project_id?: string | null
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_reviews_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          last_session_date: string | null
          longest_streak: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          last_session_date?: string | null
          longest_streak?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          last_session_date?: string | null
          longest_streak?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enterprise_accounts: {
        Row: {
          account_name: string
          account_type: string | null
          billing_tier: string | null
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          monthly_revenue: number | null
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_type?: string | null
          billing_tier?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_revenue?: number | null
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_type?: string | null
          billing_tier?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_revenue?: number | null
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_contracts: {
        Row: {
          client_id: string
          contract_name: string
          contract_value: number
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          contract_name: string
          contract_value: number
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          contract_name?: string
          contract_value?: number
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exported_tracks: {
        Row: {
          artist_name: string | null
          bit_depth: number | null
          bpm: number | null
          created_at: string | null
          distributed_at: string | null
          distribution_partner: string | null
          duration_seconds: number | null
          file_path: string
          file_size_bytes: number | null
          format: string | null
          genre: string | null
          id: string
          sample_rate: number | null
          title: string
          user_id: string
          velvet_curve_preset: string | null
        }
        Insert: {
          artist_name?: string | null
          bit_depth?: number | null
          bpm?: number | null
          created_at?: string | null
          distributed_at?: string | null
          distribution_partner?: string | null
          duration_seconds?: number | null
          file_path: string
          file_size_bytes?: number | null
          format?: string | null
          genre?: string | null
          id?: string
          sample_rate?: number | null
          title: string
          user_id: string
          velvet_curve_preset?: string | null
        }
        Update: {
          artist_name?: string | null
          bit_depth?: number | null
          bpm?: number | null
          created_at?: string | null
          distributed_at?: string | null
          distribution_partner?: string | null
          duration_seconds?: number | null
          file_path?: string
          file_size_bytes?: number | null
          format?: string | null
          genre?: string | null
          id?: string
          sample_rate?: number | null
          title?: string
          user_id?: string
          velvet_curve_preset?: string | null
        }
        Relationships: []
      }
      fan_stats: {
        Row: {
          artists_supported: number | null
          created_at: string | null
          current_tier: string | null
          day1_badges: number | null
          engagement_streak: number | null
          id: string
          last_activity_at: string | null
          longest_streak: number | null
          mixxcoinz_earned: number | null
          total_comments: number | null
          total_premieres_attended: number | null
          total_shares: number | null
          total_votes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artists_supported?: number | null
          created_at?: string | null
          current_tier?: string | null
          day1_badges?: number | null
          engagement_streak?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak?: number | null
          mixxcoinz_earned?: number | null
          total_comments?: number | null
          total_premieres_attended?: number | null
          total_shares?: number | null
          total_votes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artists_supported?: number | null
          created_at?: string | null
          current_tier?: string | null
          day1_badges?: number | null
          engagement_streak?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak?: number | null
          mixxcoinz_earned?: number | null
          total_comments?: number | null
          total_premieres_attended?: number | null
          total_shares?: number | null
          total_votes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      funnel_events: {
        Row: {
          created_at: string | null
          funnel_source: string
          id: string
          session_id: string
          step: string
          step_data: Json | null
        }
        Insert: {
          created_at?: string | null
          funnel_source: string
          id?: string
          session_id: string
          step: string
          step_data?: Json | null
        }
        Update: {
          created_at?: string | null
          funnel_source?: string
          id?: string
          session_id?: string
          step?: string
          step_data?: Json | null
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          context: string | null
          created_at: string | null
          generation_time_ms: number | null
          id: string
          metadata: Json | null
          mode: string
          prompt: string
          provider: string
          result_url: string | null
          saved_asset_id: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          metadata?: Json | null
          mode: string
          prompt: string
          provider: string
          result_url?: string | null
          saved_asset_id?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          metadata?: Json | null
          mode?: string
          prompt?: string
          provider?: string
          result_url?: string | null
          saved_asset_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_saved_asset_id_fkey"
            columns: ["saved_asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_milestones: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          milestone_name: string
          milestone_type: string
          progress: number | null
          reward_type: string | null
          reward_value: number | null
          target: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          milestone_name: string
          milestone_type: string
          progress?: number | null
          reward_type?: string | null
          reward_value?: number | null
          target?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          milestone_name?: string
          milestone_type?: string
          progress?: number | null
          reward_type?: string | null
          reward_value?: number | null
          target?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hybrid_user_preferences: {
        Row: {
          created_at: string | null
          id: string
          primary_role: string | null
          show_role_switcher: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          primary_role?: string | null
          show_role_switcher?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          primary_role?: string | null
          show_role_switcher?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hybrid_user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          auth_url: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          provider_description: string | null
          provider_name: string
          provider_type: string
        }
        Insert: {
          auth_url?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          provider_description?: string | null
          provider_name: string
          provider_type: string
        }
        Update: {
          auth_url?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          provider_description?: string | null
          provider_name?: string
          provider_type?: string
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
          estimated_duration: string | null
          experience_level: string | null
          genre: string | null
          id: string
          location: string | null
          project_type: string | null
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
          estimated_duration?: string | null
          experience_level?: string | null
          genre?: string | null
          id?: string
          location?: string | null
          project_type?: string | null
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
          estimated_duration?: string | null
          experience_level?: string | null
          genre?: string | null
          id?: string
          location?: string | null
          project_type?: string | null
          service_type?: string | null
          skills_required?: string[] | null
          status?: string | null
          stems_prepared?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      label_partnerships: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          label_name: string
          label_type: string | null
          metadata: Json | null
          partnership_status: string | null
          revenue_share: number | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          label_name: string
          label_type?: string | null
          metadata?: Json | null
          partnership_status?: string | null
          revenue_share?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          label_name?: string
          label_type?: string | null
          metadata?: Json | null
          partnership_status?: string | null
          revenue_share?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      label_service_requests: {
        Row: {
          artist_id: string
          created_at: string | null
          id: string
          request_status: string | null
          response_data: Json | null
          service_id: string
          submission_data: Json | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          id?: string
          request_status?: string | null
          response_data?: Json | null
          service_id: string
          submission_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          id?: string
          request_status?: string | null
          response_data?: Json | null
          service_id?: string
          submission_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_service_requests_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "label_service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "label_services"
            referencedColumns: ["id"]
          },
        ]
      }
      label_services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          partnership_id: string | null
          price: number
          service_name: string
          service_type: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          partnership_id?: string | null
          price: number
          service_name: string
          service_type: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          partnership_id?: string | null
          price?: number
          service_name?: string
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "label_services_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "label_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          notes: string | null
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          notes?: string | null
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          lesson_id: string
          notes: string | null
          quiz_score: number | null
          updated_at: string | null
          watched_duration: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          lesson_id: string
          notes?: string | null
          quiz_score?: number | null
          updated_at?: string | null
          watched_duration?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          quiz_score?: number | null
          updated_at?: string | null
          watched_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          order_index: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index?: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      licensing_agreements: {
        Row: {
          amount_cents: number
          contract_url: string | null
          created_at: string | null
          end_date: string | null
          id: string
          license_type: string
          licensee_name: string
          licensor_id: string
          metadata: Json | null
          notes: string | null
          royalty_percentage: number | null
          start_date: string
          status: string | null
          track_id: string | null
          track_name: string | null
          updated_at: string | null
          upfront_fee_cents: number | null
          usage_context: string | null
        }
        Insert: {
          amount_cents: number
          contract_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          license_type: string
          licensee_name: string
          licensor_id: string
          metadata?: Json | null
          notes?: string | null
          royalty_percentage?: number | null
          start_date: string
          status?: string | null
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
          upfront_fee_cents?: number | null
          usage_context?: string | null
        }
        Update: {
          amount_cents?: number
          contract_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          license_type?: string
          licensee_name?: string
          licensor_id?: string
          metadata?: Json | null
          notes?: string | null
          royalty_percentage?: number | null
          start_date?: string
          status?: string | null
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
          upfront_fee_cents?: number | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licensing_agreements_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_history: {
        Row: {
          duration_played: number | null
          id: string
          played_at: string | null
          source: string | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          duration_played?: number | null
          id?: string
          played_at?: string | null
          source?: string | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          duration_played?: number | null
          id?: string
          played_at?: string | null
          source?: string | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listening_history_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "user_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_highlighted: boolean | null
          message: string
          message_type: string | null
          metadata: Json | null
          stream_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_highlighted?: boolean | null
          message: string
          message_type?: string | null
          metadata?: Json | null
          stream_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_highlighted?: boolean | null
          message?: string
          message_type?: string | null
          metadata?: Json | null
          stream_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_gifts: {
        Row: {
          animation_type: string | null
          coin_cost: number
          created_at: string | null
          creator_value: number
          emoji: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          animation_type?: string | null
          coin_cost: number
          created_at?: string | null
          creator_value: number
          emoji: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          animation_type?: string | null
          coin_cost?: number
          created_at?: string | null
          creator_value?: number
          emoji?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          category: string | null
          co_hosts: Json | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          is_live: boolean | null
          is_recorded: boolean | null
          peak_viewers: number | null
          playback_url: string | null
          recording_url: string | null
          started_at: string | null
          stream_key: string | null
          stream_type: string | null
          thumbnail_url: string | null
          title: string
          total_gifts_value: number | null
          updated_at: string | null
          viewer_count: number | null
          visibility: string | null
        }
        Insert: {
          category?: string | null
          co_hosts?: Json | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          is_live?: boolean | null
          is_recorded?: boolean | null
          peak_viewers?: number | null
          playback_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          stream_key?: string | null
          stream_type?: string | null
          thumbnail_url?: string | null
          title: string
          total_gifts_value?: number | null
          updated_at?: string | null
          viewer_count?: number | null
          visibility?: string | null
        }
        Update: {
          category?: string | null
          co_hosts?: Json | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          is_live?: boolean | null
          is_recorded?: boolean | null
          peak_viewers?: number | null
          playback_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          stream_key?: string | null
          stream_type?: string | null
          thumbnail_url?: string | null
          title?: string
          total_gifts_value?: number | null
          updated_at?: string | null
          viewer_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          badge_icon: string | null
          benefits: Json | null
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          min_points: number
          tier_level: number
          tier_name: string
        }
        Insert: {
          badge_icon?: string | null
          benefits?: Json | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_points?: number
          tier_level: number
          tier_name: string
        }
        Update: {
          badge_icon?: string | null
          benefits?: Json | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_points?: number
          tier_level?: number
          tier_name?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          ad_variants: Json | null
          campaign_type: string | null
          created_at: string | null
          generated_assets: Json | null
          generated_copy: Json | null
          id: string
          key_message: string | null
          name: string
          social_posts: Json | null
          status: string | null
          target_audience: string | null
          tone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ad_variants?: Json | null
          campaign_type?: string | null
          created_at?: string | null
          generated_assets?: Json | null
          generated_copy?: Json | null
          id?: string
          key_message?: string | null
          name: string
          social_posts?: Json | null
          status?: string | null
          target_audience?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ad_variants?: Json | null
          campaign_type?: string | null
          created_at?: string | null
          generated_assets?: Json | null
          generated_copy?: Json | null
          id?: string
          key_message?: string | null
          name?: string
          social_posts?: Json | null
          status?: string | null
          target_audience?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          category_description: string | null
          category_name: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          category_description?: string | null
          category_name: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category_description?: string | null
          category_name?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          currency: string | null
          files: Json | null
          id: string
          item_description: string | null
          item_name: string
          item_type: string
          preview_urls: string[] | null
          price: number
          sales_count: number | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          files?: Json | null
          id?: string
          item_description?: string | null
          item_name: string
          item_type: string
          preview_urls?: string[] | null
          price: number
          sales_count?: number | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          files?: Json | null
          id?: string
          item_description?: string | null
          item_name?: string
          item_type?: string
          preview_urls?: string[] | null
          price?: number
          sales_count?: number | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_purchases: {
        Row: {
          buyer_id: string
          created_at: string | null
          currency: string | null
          id: string
          item_id: string
          purchase_amount: number
          seller_id: string
          status: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          item_id: string
          purchase_amount: number
          seller_id: string
          status?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          item_id?: string
          purchase_amount?: number
          seller_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_purchases_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      match_requests: {
        Row: {
          budget_range: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          message: string | null
          project_type: string | null
          recipient_id: string
          responded_at: string | null
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          message?: string | null
          project_type?: string | null
          recipient_id: string
          responded_at?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          message?: string | null
          project_type?: string | null
          recipient_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          artist_id: string
          created_at: string | null
          engineer_id: string
          id: string
          match_reason: string | null
          match_score: number | null
          project_id: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          engineer_id: string
          id?: string
          match_reason?: string | null
          match_score?: number | null
          project_id?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          engineer_id?: string
          id?: string
          match_reason?: string | null
          match_score?: number | null
          project_id?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          inventory_count: number | null
          is_active: boolean | null
          name: string
          price: number
          storefront_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory_count?: number | null
          is_active?: boolean | null
          name: string
          price: number
          storefront_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory_count?: number | null
          is_active?: boolean | null
          name?: string
          price?: number
          storefront_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_products_storefront_id_fkey"
            columns: ["storefront_id"]
            isOneToOne: false
            referencedRelation: "user_storefronts"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          image_url: string | null
          inventory_count: number | null
          name: string
          price: number
          product_id: string | null
          size: string | null
          sku: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          name: string
          price: number
          product_id?: string | null
          size?: string | null
          sku?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          name?: string
          price?: number
          product_id?: string | null
          size?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
        ]
      }
      message_revenue_links: {
        Row: {
          created_at: string
          id: string
          link_type: string | null
          message_id: string
          revenue_split_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_type?: string | null
          message_id: string
          revenue_split_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: string | null
          message_id?: string
          revenue_split_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_revenue_links_revenue_split_id_fkey"
            columns: ["revenue_split_id"]
            isOneToOne: false
            referencedRelation: "revenue_splits"
            referencedColumns: ["id"]
          },
        ]
      }
      mixing_packages: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          package_name: string
          price: number
          track_limit: number | null
          turnaround_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          package_name: string
          price: number
          track_limit?: number | null
          turnaround_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          package_name?: string
          price?: number
          track_limit?: number | null
          turnaround_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mixx_coin_packages: {
        Row: {
          bonus_percentage: number | null
          coinz_amount: number
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          stripe_price_id: string | null
          usd_price: number
        }
        Insert: {
          bonus_percentage?: number | null
          coinz_amount: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          stripe_price_id?: string | null
          usd_price: number
        }
        Update: {
          bonus_percentage?: number | null
          coinz_amount?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          stripe_price_id?: string | null
          usd_price?: number
        }
        Relationships: []
      }
      mixx_mission_progress: {
        Row: {
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          last_reset_at: string | null
          mission_id: string
          times_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_reset_at?: string | null
          mission_id: string
          times_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_reset_at?: string | null
          mission_id?: string
          times_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mixx_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mixx_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mixx_missions: {
        Row: {
          category: string
          coinz_reward: number
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          metric_type: string
          name: string
          repeatable: boolean | null
          reset_interval: string | null
          role_required: string | null
          sort_order: number | null
          target_value: number
          tier_required: number | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          coinz_reward: number
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          metric_type: string
          name: string
          repeatable?: boolean | null
          reset_interval?: string | null
          role_required?: string | null
          sort_order?: number | null
          target_value: number
          tier_required?: number | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          coinz_reward?: number
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          metric_type?: string
          name?: string
          repeatable?: boolean | null
          reset_interval?: string | null
          role_required?: string | null
          sort_order?: number | null
          target_value?: number
          tier_required?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      mixx_transactions: {
        Row: {
          amount: number
          balance_type: string
          counterparty_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_type: string
          counterparty_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_type?: string
          counterparty_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      mixx_vault_items: {
        Row: {
          asset_url: string | null
          category: string
          coinz_price: number
          created_at: string | null
          description: string | null
          feature_flag_key: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          limited_quantity: number | null
          name: string
          quantity_remaining: number | null
          rarity: string | null
          requires_earned_only: boolean | null
          role_required: string | null
          sort_order: number | null
          tier_required: number | null
        }
        Insert: {
          asset_url?: string | null
          category: string
          coinz_price: number
          created_at?: string | null
          description?: string | null
          feature_flag_key?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          limited_quantity?: number | null
          name: string
          quantity_remaining?: number | null
          rarity?: string | null
          requires_earned_only?: boolean | null
          role_required?: string | null
          sort_order?: number | null
          tier_required?: number | null
        }
        Update: {
          asset_url?: string | null
          category?: string
          coinz_price?: number
          created_at?: string | null
          description?: string | null
          feature_flag_key?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          limited_quantity?: number | null
          name?: string
          quantity_remaining?: number | null
          rarity?: string | null
          requires_earned_only?: boolean | null
          role_required?: string | null
          sort_order?: number | null
          tier_required?: number | null
        }
        Relationships: []
      }
      mixx_vault_ownership: {
        Row: {
          coinz_paid: number
          id: string
          item_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          coinz_paid: number
          id?: string
          item_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          coinz_paid?: number
          id?: string
          item_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mixx_vault_ownership_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "mixx_vault_items"
            referencedColumns: ["id"]
          },
        ]
      }
      mixx_wallets: {
        Row: {
          created_at: string | null
          daily_purchased: number | null
          daily_purchased_reset_at: string | null
          earned_balance: number | null
          id: string
          purchased_balance: number | null
          total_earned: number | null
          total_gifted: number | null
          total_purchased: number | null
          total_received: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_purchased?: number | null
          daily_purchased_reset_at?: string | null
          earned_balance?: number | null
          id?: string
          purchased_balance?: number | null
          total_earned?: number | null
          total_gifted?: number | null
          total_purchased?: number | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_purchased?: number | null
          daily_purchased_reset_at?: string | null
          earned_balance?: number | null
          id?: string
          purchased_balance?: number | null
          total_earned?: number | null
          total_gifted?: number | null
          total_purchased?: number | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_awards: {
        Row: {
          announced_at: string | null
          award_month: string
          category: string
          created_at: string
          id: string
          metrics: Json | null
          prize_amount: number | null
          runner_up_id: string | null
          winner_id: string | null
        }
        Insert: {
          announced_at?: string | null
          award_month: string
          category: string
          created_at?: string
          id?: string
          metrics?: Json | null
          prize_amount?: number | null
          runner_up_id?: string | null
          winner_id?: string | null
        }
        Update: {
          announced_at?: string | null
          award_month?: string
          category?: string
          created_at?: string
          id?: string
          metrics?: Json | null
          prize_amount?: number | null
          runner_up_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_awards_runner_up_id_fkey"
            columns: ["runner_up_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_awards_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_releases: {
        Row: {
          artist_name: string
          cover_art_url: string | null
          created_at: string | null
          earnings_data: Json | null
          id: string
          platforms: string[] | null
          project_id: string | null
          release_date: string | null
          status: string | null
          streaming_stats: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist_name: string
          cover_art_url?: string | null
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          platforms?: string[] | null
          project_id?: string | null
          release_date?: string | null
          status?: string | null
          streaming_stats?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist_name?: string
          cover_art_url?: string | null
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          platforms?: string[] | null
          project_id?: string | null
          release_date?: string | null
          status?: string | null
          streaming_stats?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_releases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_releases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      musical_profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          influences: string[] | null
          instruments: string[] | null
          preferred_bpm_max: number | null
          preferred_bpm_min: number | null
          preferred_keys: string[] | null
          primary_genre: string | null
          production_style: string | null
          secondary_genres: string[] | null
          updated_at: string
          user_id: string
          vocal_range: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          influences?: string[] | null
          instruments?: string[] | null
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_keys?: string[] | null
          primary_genre?: string | null
          production_style?: string | null
          secondary_genres?: string[] | null
          updated_at?: string
          user_id: string
          vocal_range?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          influences?: string[] | null
          instruments?: string[] | null
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_keys?: string[] | null
          primary_genre?: string | null
          production_style?: string | null
          secondary_genres?: string[] | null
          updated_at?: string
          user_id?: string
          vocal_range?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "musical_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          collaboration_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          payment_updates: boolean | null
          project_updates: boolean | null
          session_invitations: boolean | null
          system_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collaboration_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          payment_updates?: boolean | null
          project_updates?: boolean | null
          session_invitations?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collaboration_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          payment_updates?: boolean | null
          project_updates?: boolean | null
          session_invitations?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
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
          related_id: string | null
          related_type: string | null
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
          related_id?: string | null
          related_type?: string | null
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
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          affiliate_code: string
          commission_rate: number | null
          created_at: string | null
          id: string
          joined_at: string | null
          pending_commissions: number | null
          status: string | null
          tier: string | null
          total_commissions: number | null
          total_referrals: number | null
          total_revenue: number | null
          updated_at: string | null
          upgraded_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          joined_at?: string | null
          pending_commissions?: number | null
          status?: string | null
          tier?: string | null
          total_commissions?: number | null
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          upgraded_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          joined_at?: string | null
          pending_commissions?: number | null
          status?: string | null
          tier?: string | null
          total_commissions?: number | null
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          upgraded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partnership_health: {
        Row: {
          activity_score: number | null
          communication_score: number | null
          factors: Json | null
          health_score: number | null
          id: string
          last_calculated_at: string
          partnership_id: string
          payment_score: number | null
        }
        Insert: {
          activity_score?: number | null
          communication_score?: number | null
          factors?: Json | null
          health_score?: number | null
          id?: string
          last_calculated_at?: string
          partnership_id: string
          payment_score?: number | null
        }
        Update: {
          activity_score?: number | null
          communication_score?: number | null
          factors?: Json | null
          health_score?: number | null
          id?: string
          last_calculated_at?: string
          partnership_id?: string
          payment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_health_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: true
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_metrics: {
        Row: {
          average_project_value: number | null
          calculated_at: string
          completed_projects: number | null
          id: string
          last_activity_at: string | null
          partnership_id: string
          total_projects: number | null
          total_revenue: number | null
        }
        Insert: {
          average_project_value?: number | null
          calculated_at?: string
          completed_projects?: number | null
          id?: string
          last_activity_at?: string | null
          partnership_id: string
          total_projects?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_project_value?: number | null
          calculated_at?: string
          completed_projects?: number | null
          id?: string
          last_activity_at?: string | null
          partnership_id?: string
          total_projects?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_metrics_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: true
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          accepted_at: string | null
          artist_earnings: number | null
          artist_id: string
          artist_percentage: number | null
          beat_id: string | null
          created_at: string
          default_split_type: string
          engineer_earnings: number | null
          engineer_id: string | null
          engineer_percentage: number | null
          id: string
          partnership_type: string
          producer_earnings: number | null
          producer_id: string | null
          producer_percentage: number | null
          status: string
          terms: string | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          artist_earnings?: number | null
          artist_id: string
          artist_percentage?: number | null
          beat_id?: string | null
          created_at?: string
          default_split_type?: string
          engineer_earnings?: number | null
          engineer_id?: string | null
          engineer_percentage?: number | null
          id?: string
          partnership_type?: string
          producer_earnings?: number | null
          producer_id?: string | null
          producer_percentage?: number | null
          status?: string
          terms?: string | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          artist_earnings?: number | null
          artist_id?: string
          artist_percentage?: number | null
          beat_id?: string | null
          created_at?: string
          default_split_type?: string
          engineer_earnings?: number | null
          engineer_id?: string | null
          engineer_percentage?: number | null
          id?: string
          partnership_type?: string
          producer_earnings?: number | null
          producer_id?: string | null
          producer_percentage?: number | null
          status?: string
          terms?: string | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "producer_beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pathfinder_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          dismissed_at: string | null
          id: string
          is_completed: boolean
          journey_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          dismissed_at?: string | null
          id?: string
          is_completed?: boolean
          journey_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          dismissed_at?: string | null
          id?: string
          is_completed?: boolean
          journey_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathfinder_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string
          currency: string | null
          expires_at: string | null
          id: string
          link_url: string
          partnership_id: string
          project_id: string | null
          status: string | null
          used_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          link_url: string
          partnership_id: string
          project_id?: string | null
          status?: string | null
          used_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          link_url?: string
          partnership_id?: string
          project_id?: string | null
          status?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
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
      payout_processing_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          id: string
          payouts_failed: number | null
          payouts_processed: number | null
          payouts_skipped: number | null
          processing_details: Json | null
          run_id: string
          started_at: string | null
          total_amount_transferred: number | null
          trigger_source: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          payouts_failed?: number | null
          payouts_processed?: number | null
          payouts_skipped?: number | null
          processing_details?: Json | null
          run_id: string
          started_at?: string | null
          total_amount_transferred?: number | null
          trigger_source: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          payouts_failed?: number | null
          payouts_processed?: number | null
          payouts_skipped?: number | null
          processing_details?: Json | null
          run_id?: string
          started_at?: string | null
          total_amount_transferred?: number | null
          trigger_source?: string
        }
        Relationships: []
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
      playlist_tracks: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          playlist_id: string | null
          position: number
          track_id: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id?: string | null
          position: number
          track_id?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id?: string | null
          position?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "user_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          play_count: number | null
          total_duration: number | null
          track_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          play_count?: number | null
          total_duration?: number | null
          track_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          play_count?: number | null
          total_duration?: number | null
          track_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      premiere_votes: {
        Row: {
          created_at: string | null
          id: string
          premiere_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          premiere_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          premiere_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "premiere_votes_premiere_id_fkey"
            columns: ["premiere_id"]
            isOneToOne: false
            referencedRelation: "premieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiere_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premieres: {
        Row: {
          artist_id: string
          artwork_url: string | null
          audio_url: string | null
          average_rating: number | null
          bpm: number | null
          created_at: string | null
          description: string | null
          engineer_id: string | null
          genre: string | null
          id: string
          monthly_rank: number | null
          play_count: number | null
          premiere_date: string
          project_id: string | null
          status: string | null
          title: string
          total_votes: number | null
          trending_score: number | null
          updated_at: string | null
          weekly_rank: number | null
        }
        Insert: {
          artist_id: string
          artwork_url?: string | null
          audio_url?: string | null
          average_rating?: number | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          engineer_id?: string | null
          genre?: string | null
          id?: string
          monthly_rank?: number | null
          play_count?: number | null
          premiere_date: string
          project_id?: string | null
          status?: string | null
          title: string
          total_votes?: number | null
          trending_score?: number | null
          updated_at?: string | null
          weekly_rank?: number | null
        }
        Update: {
          artist_id?: string
          artwork_url?: string | null
          audio_url?: string | null
          average_rating?: number | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          engineer_id?: string | null
          genre?: string | null
          id?: string
          monthly_rank?: number | null
          play_count?: number | null
          premiere_date?: string
          project_id?: string | null
          status?: string | null
          title?: string
          total_votes?: number | null
          trending_score?: number | null
          updated_at?: string | null
          weekly_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "premieres_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prime_brand_assets: {
        Row: {
          asset_type: string
          created_at: string | null
          description: string | null
          id: string
          is_canonical: boolean | null
          metadata: Json | null
          name: string
          public_url: string
          storage_path: string
          updated_at: string | null
          usage_context: string[] | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_canonical?: boolean | null
          metadata?: Json | null
          name: string
          public_url: string
          storage_path: string
          updated_at?: string | null
          usage_context?: string[] | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_canonical?: boolean | null
          metadata?: Json | null
          name?: string
          public_url?: string
          storage_path?: string
          updated_at?: string | null
          usage_context?: string[] | null
        }
        Relationships: []
      }
      prime_content_queue: {
        Row: {
          audio_url: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          engagement_metrics: Json | null
          generation_metadata: Json | null
          id: string
          image_url: string | null
          platform_content: Json | null
          platforms_posted: Json | null
          posted_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scheduled_for: string | null
          script: string
          source_trend_id: string | null
          status: string | null
          thumbnail_url: string | null
          topic: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          engagement_metrics?: Json | null
          generation_metadata?: Json | null
          id?: string
          image_url?: string | null
          platform_content?: Json | null
          platforms_posted?: Json | null
          posted_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          script: string
          source_trend_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          topic?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          engagement_metrics?: Json | null
          generation_metadata?: Json | null
          id?: string
          image_url?: string | null
          platform_content?: Json | null
          platforms_posted?: Json | null
          posted_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          script?: string
          source_trend_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          topic?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      prime_persona_config: {
        Row: {
          content_pillars: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          persona_prompt: string
          platform_guidelines: Json | null
          tone_modifiers: Json | null
          updated_at: string | null
          visual_identity: Json | null
          voice_id: string | null
        }
        Insert: {
          content_pillars?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona_prompt: string
          platform_guidelines?: Json | null
          tone_modifiers?: Json | null
          updated_at?: string | null
          visual_identity?: Json | null
          voice_id?: string | null
        }
        Update: {
          content_pillars?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona_prompt?: string
          platform_guidelines?: Json | null
          tone_modifiers?: Json | null
          updated_at?: string | null
          visual_identity?: Json | null
          voice_id?: string | null
        }
        Relationships: []
      }
      producer_beats: {
        Row: {
          audio_url: string | null
          bpm: number | null
          cover_image_url: string | null
          created_at: string | null
          custom_license_terms: Json | null
          description: string | null
          downloads: number | null
          exclusive_price_cents: number | null
          genre: string | null
          id: string
          is_exclusive_available: boolean | null
          key_signature: string | null
          license_type: string | null
          mood: string[] | null
          plays: number | null
          preview_url: string | null
          price_cents: number | null
          producer_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_license_terms?: Json | null
          description?: string | null
          downloads?: number | null
          exclusive_price_cents?: number | null
          genre?: string | null
          id?: string
          is_exclusive_available?: boolean | null
          key_signature?: string | null
          license_type?: string | null
          mood?: string[] | null
          plays?: number | null
          preview_url?: string | null
          price_cents?: number | null
          producer_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_license_terms?: Json | null
          description?: string | null
          downloads?: number | null
          exclusive_price_cents?: number | null
          genre?: string | null
          id?: string
          is_exclusive_available?: boolean | null
          key_signature?: string | null
          license_type?: string | null
          mood?: string[] | null
          plays?: number | null
          preview_url?: string | null
          price_cents?: number | null
          producer_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      producer_stats: {
        Row: {
          avg_rating: number | null
          id: string
          monthly_plays: number | null
          monthly_sales: number | null
          total_beats: number | null
          total_downloads: number | null
          total_plays: number | null
          total_revenue_cents: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_rating?: number | null
          id?: string
          monthly_plays?: number | null
          monthly_sales?: number | null
          total_beats?: number | null
          total_downloads?: number | null
          total_plays?: number | null
          total_revenue_cents?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_rating?: number | null
          id?: string
          monthly_plays?: number | null
          monthly_sales?: number | null
          total_beats?: number | null
          total_downloads?: number | null
          total_plays?: number | null
          total_revenue_cents?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          source: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          source?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          source?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string
          email: string | null
          follower_count: number | null
          following_count: number | null
          full_name: string | null
          genre: string | null
          genre_specialties: Json | null
          id: string
          is_available_for_collab: boolean | null
          is_verified: boolean | null
          last_active_at: string | null
          level: number | null
          location: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          pinned_track_id: string | null
          points: number | null
          profile_theme: string | null
          profile_views_count: number | null
          project_id: string | null
          role: string | null
          social_links: Json | null
          status_emoji: string | null
          status_text: string | null
          stripe_connect_account_id: string | null
          tagline: string | null
          total_xp: number | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          genre?: string | null
          genre_specialties?: Json | null
          id: string
          is_available_for_collab?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          level?: number | null
          location?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          pinned_track_id?: string | null
          points?: number | null
          profile_theme?: string | null
          profile_views_count?: number | null
          project_id?: string | null
          role?: string | null
          social_links?: Json | null
          status_emoji?: string | null
          status_text?: string | null
          stripe_connect_account_id?: string | null
          tagline?: string | null
          total_xp?: number | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          genre?: string | null
          genre_specialties?: Json | null
          id?: string
          is_available_for_collab?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          level?: number | null
          location?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          pinned_track_id?: string | null
          points?: number | null
          profile_theme?: string | null
          profile_views_count?: number | null
          project_id?: string | null
          role?: string | null
          social_links?: Json | null
          status_emoji?: string | null
          status_text?: string | null
          stripe_connect_account_id?: string | null
          tagline?: string | null
          total_xp?: number | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
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
      project_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          project_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          project_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          parent_id: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          category: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          notes: string | null
          project_id: string
          user_id: string
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          project_id: string
          user_id: string
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          project_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          project_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
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
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          deliverables: Json | null
          description: string | null
          due_date: string | null
          id: string
          payment_amount: number | null
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_amount?: number | null
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_amount?: number | null
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          artist_id: string | null
          communication_rating: number | null
          created_at: string | null
          id: string
          project_id: string
          quality_rating: number | null
          rating: number | null
          review_text: string | null
          reviewer_id: string
          timeliness_rating: number | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          artist_id?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          project_id: string
          quality_rating?: number | null
          rating?: number | null
          review_text?: string | null
          reviewer_id: string
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          artist_id?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          project_id?: string
          quality_rating?: number | null
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          bpm: number | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          engineer_id: string | null
          genre: string | null
          id: string
          key: string | null
          latest_deliverable_id: string | null
          metadata: Json | null
          mixing_goals: Json | null
          progress_percentage: number | null
          special_instructions: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          latest_deliverable_id?: string | null
          metadata?: Json | null
          mixing_goals?: Json | null
          progress_percentage?: number | null
          special_instructions?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          latest_deliverable_id?: string | null
          metadata?: Json | null
          mixing_goals?: Json | null
          progress_percentage?: number | null
          special_instructions?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_latest_deliverable_id_fkey"
            columns: ["latest_deliverable_id"]
            isOneToOne: false
            referencedRelation: "engineer_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_assets: {
        Row: {
          asset_type: string
          campaign_id: string
          content_text: string | null
          content_url: string | null
          created_at: string | null
          generator_function: string
          id: string
          metadata: Json | null
          status: string | null
        }
        Insert: {
          asset_type: string
          campaign_id: string
          content_text?: string | null
          content_url?: string | null
          created_at?: string | null
          generator_function: string
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Update: {
          asset_type?: string
          campaign_id?: string
          content_text?: string | null
          content_url?: string | null
          created_at?: string | null
          generator_function?: string
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promo_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_campaigns: {
        Row: {
          asset_count: number | null
          character_id: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          genre: string | null
          id: string
          name: string
          phase: string
          published_at: string | null
          status: string
        }
        Insert: {
          asset_count?: number | null
          character_id?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          genre?: string | null
          id?: string
          name: string
          phase: string
          published_at?: string | null
          status?: string
        }
        Update: {
          asset_count?: number | null
          character_id?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          genre?: string | null
          id?: string
          name?: string
          phase?: string
          published_at?: string | null
          status?: string
        }
        Relationships: []
      }
      promo_phase_configs: {
        Row: {
          asset_pipeline: Json
          created_at: string | null
          default_config: Json
          description: string | null
          display_name: string
          id: string
          phase: string
        }
        Insert: {
          asset_pipeline?: Json
          created_at?: string | null
          default_config?: Json
          description?: string | null
          display_name: string
          id?: string
          phase: string
        }
        Update: {
          asset_pipeline?: Json
          created_at?: string | null
          default_config?: Json
          description?: string | null
          display_name?: string
          id?: string
          phase?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          updated_at: string | null
        }
        Insert: {
          action: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_earned: number | null
          commission_paid: boolean | null
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referral_type: string | null
          referred_user_id: string | null
          referrer_id: string
          status: string | null
        }
        Insert: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referral_type?: string | null
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
        }
        Update: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referral_type?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
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
      revenue_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          current_amount: number
          end_date: string | null
          id: string
          is_achieved: boolean | null
          period: string
          start_date: string
          stream_type: string | null
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          current_amount?: number
          end_date?: string | null
          id?: string
          is_achieved?: boolean | null
          period?: string
          start_date?: string
          stream_type?: string | null
          target_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          current_amount?: number
          end_date?: string | null
          id?: string
          is_achieved?: boolean | null
          period?: string
          start_date?: string
          stream_type?: string | null
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_splits: {
        Row: {
          artist_amount: number
          artist_percentage: number | null
          created_at: string
          description: string | null
          engineer_amount: number
          engineer_percentage: number | null
          id: string
          partnership_id: string
          processed_at: string | null
          project_id: string | null
          split_type: string
          status: string | null
          total_amount: number
        }
        Insert: {
          artist_amount?: number
          artist_percentage?: number | null
          created_at?: string
          description?: string | null
          engineer_amount?: number
          engineer_percentage?: number | null
          id?: string
          partnership_id: string
          processed_at?: string | null
          project_id?: string | null
          split_type?: string
          status?: string | null
          total_amount?: number
        }
        Update: {
          artist_amount?: number
          artist_percentage?: number | null
          created_at?: string
          description?: string | null
          engineer_amount?: number
          engineer_percentage?: number | null
          id?: string
          partnership_id?: string
          processed_at?: string | null
          project_id?: string | null
          split_type?: string
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_splits_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_splits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "collaborative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_streams: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          stream_name: string
          stream_type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          stream_name: string
          stream_type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          stream_name?: string
          stream_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          communication_rating: number | null
          created_at: string
          id: string
          is_public: boolean | null
          professionalism_rating: number | null
          quality_rating: number | null
          rating: number
          review_text: string | null
          review_type: string
          reviewed_id: string
          reviewer_id: string
          session_id: string
          updated_at: string
          would_work_again: boolean | null
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating: number
          review_text?: string | null
          review_type: string
          reviewed_id: string
          reviewer_id: string
          session_id: string
          updated_at?: string
          would_work_again?: boolean | null
        }
        Update: {
          communication_rating?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating?: number
          review_text?: string | null
          review_type?: string
          reviewed_id?: string
          reviewer_id?: string
          session_id?: string
          updated_at?: string
          would_work_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
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
          is_pinned: boolean | null
          metadata: Json | null
          session_id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          session_id: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
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
      session_packages: {
        Row: {
          artist_id: string | null
          bit_depth: number | null
          created_at: string
          daw_format: string | null
          engineer_id: string | null
          error_message: string | null
          expires_at: string | null
          file_size: number | null
          id: string
          package_status: string
          package_url: string | null
          project_id: string | null
          sample_rate: number | null
          stem_count: number | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          bit_depth?: number | null
          created_at?: string
          daw_format?: string | null
          engineer_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          id?: string
          package_status?: string
          package_url?: string | null
          project_id?: string | null
          sample_rate?: number | null
          stem_count?: number | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          bit_depth?: number | null
          created_at?: string
          daw_format?: string | null
          engineer_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          id?: string
          package_status?: string
          package_url?: string | null
          project_id?: string | null
          sample_rate?: number | null
          stem_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_packages_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_packages_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_packages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      session_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payee_id: string
          payer_id: string
          released_at: string | null
          session_id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payee_id: string
          payer_id: string
          released_at?: string | null
          session_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payee_id?: string
          payer_id?: string
          released_at?: string | null
          session_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_payments_session_id_fkey"
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
      social_shares: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          engagement_count: number | null
          id: string
          platform: string
          share_url: string | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string | null
          engagement_count?: number | null
          id?: string
          platform: string
          share_url?: string | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          engagement_count?: number | null
          id?: string
          platform?: string
          share_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stem_organization: {
        Row: {
          audio_file_id: string | null
          color_code: string | null
          created_at: string
          group_name: string | null
          id: string
          is_muted: boolean | null
          is_solo: boolean | null
          pan: number | null
          session_package_id: string | null
          stem_name: string
          stem_type: string | null
          track_order: number | null
          volume_db: number | null
        }
        Insert: {
          audio_file_id?: string | null
          color_code?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          is_muted?: boolean | null
          is_solo?: boolean | null
          pan?: number | null
          session_package_id?: string | null
          stem_name: string
          stem_type?: string | null
          track_order?: number | null
          volume_db?: number | null
        }
        Update: {
          audio_file_id?: string | null
          color_code?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          is_muted?: boolean | null
          is_solo?: boolean | null
          pan?: number | null
          session_package_id?: string | null
          stem_name?: string
          stem_type?: string | null
          track_order?: number | null
          volume_db?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stem_organization_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stem_organization_session_package_id_fkey"
            columns: ["session_package_id"]
            isOneToOne: false
            referencedRelation: "session_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_analytics: {
        Row: {
          chat_count: number | null
          gift_count: number | null
          id: string
          reaction_count: number | null
          stream_id: string
          timestamp: string | null
          viewer_count: number | null
        }
        Insert: {
          chat_count?: number | null
          gift_count?: number | null
          id?: string
          reaction_count?: number | null
          stream_id: string
          timestamp?: string | null
          viewer_count?: number | null
        }
        Update: {
          chat_count?: number | null
          gift_count?: number | null
          id?: string
          reaction_count?: number | null
          stream_id?: string
          timestamp?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_analytics_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_followers: {
        Row: {
          created_at: string | null
          creator_id: string
          follower_id: string
          id: string
          notify_live: boolean | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          follower_id: string
          id?: string
          notify_live?: boolean | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          follower_id?: string
          id?: string
          notify_live?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_followers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_gifts: {
        Row: {
          created_at: string | null
          gift_id: string
          id: string
          message: string | null
          quantity: number | null
          sender_id: string | null
          stream_id: string
        }
        Insert: {
          created_at?: string | null
          gift_id: string
          id?: string
          message?: string | null
          quantity?: number | null
          sender_id?: string | null
          stream_id: string
        }
        Update: {
          created_at?: string | null
          gift_id?: string
          id?: string
          message?: string | null
          quantity?: number | null
          sender_id?: string | null
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "live_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_gifts_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      streaming_connections: {
        Row: {
          access_token: string | null
          connection_status: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          platform: string
          profile_data: Json | null
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connection_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform: string
          profile_data?: Json | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connection_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: string
          profile_data?: Json | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaming_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaming_royalties: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          platform: string
          status: string | null
          streams_count: number
          track_id: string | null
          track_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          platform: string
          status?: string | null
          streams_count?: number
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          platform?: string
          status?: string | null
          streams_count?: number
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaming_royalties_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_partnerships: {
        Row: {
          created_at: string | null
          day_rate: number | null
          equipment_list: string[] | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          location_city: string
          location_country: string
          location_state: string | null
          rating_average: number | null
          studio_name: string
          studio_type: string
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_rate?: number | null
          equipment_list?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_city: string
          location_country: string
          location_state?: string | null
          rating_average?: number | null
          studio_name: string
          studio_type: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_rate?: number | null
          equipment_list?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_city?: string
          location_country?: string
          location_state?: string | null
          rating_average?: number | null
          studio_name?: string
          studio_type?: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      studio_sessions: {
        Row: {
          bpm: number | null
          created_at: string
          id: string
          plugins: Json | null
          session_name: string
          tracks: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          id?: string
          plugins?: Json | null
          session_name: string
          tracks: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          id?: string
          plugins?: Json | null
          session_name?: string
          tracks?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          plan_name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          plan_name: string
          price_monthly: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          plan_name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_tracking: {
        Row: {
          activity_type: string
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          notes: string | null
          project_id: string | null
          session_id: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          project_id?: string | null
          session_id?: string | null
          start_time?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          project_id?: string | null
          session_id?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_tracking_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      track_releases: {
        Row: {
          artist_name: string | null
          beat_id: string | null
          cover_art_url: string | null
          created_at: string
          id: string
          isrc_code: string | null
          partnership_id: string
          release_date: string | null
          status: string | null
          streaming_platforms: Json | null
          total_revenue: number | null
          total_streams: number | null
          track_title: string
          upc_code: string | null
          updated_at: string
        }
        Insert: {
          artist_name?: string | null
          beat_id?: string | null
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc_code?: string | null
          partnership_id: string
          release_date?: string | null
          status?: string | null
          streaming_platforms?: Json | null
          total_revenue?: number | null
          total_streams?: number | null
          track_title: string
          upc_code?: string | null
          updated_at?: string
        }
        Update: {
          artist_name?: string | null
          beat_id?: string | null
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc_code?: string | null
          partnership_id?: string
          release_date?: string | null
          status?: string | null
          streaming_platforms?: Json | null
          total_revenue?: number | null
          total_streams?: number | null
          track_title?: string
          upc_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_releases_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "producer_beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_releases_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_steps: {
        Row: {
          action_target: string | null
          action_type: string | null
          created_at: string | null
          description: string
          id: string
          media_url: string | null
          position: string | null
          step_order: number
          target_element: string | null
          title: string
          tutorial_id: string
        }
        Insert: {
          action_target?: string | null
          action_type?: string | null
          created_at?: string | null
          description: string
          id?: string
          media_url?: string | null
          position?: string | null
          step_order: number
          target_element?: string | null
          title: string
          tutorial_id: string
        }
        Update: {
          action_target?: string | null
          action_type?: string | null
          created_at?: string | null
          description?: string
          id?: string
          media_url?: string | null
          position?: string | null
          step_order?: number
          target_element?: string | null
          title?: string
          tutorial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_steps_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          target_roles: string[] | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          target_roles?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          target_roles?: string[] | null
          title?: string
        }
        Relationships: []
      }
      unlockables: {
        Row: {
          ai_reasoning: string | null
          created_at: string
          created_by: string | null
          description: string | null
          feature_flag_key: string | null
          icon_name: string | null
          id: string
          is_unlocked: boolean | null
          metric_type: string
          name: string
          reward_description: string | null
          sort_order: number | null
          target_value: number
          tier: number | null
          unlock_type: string
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feature_flag_key?: string | null
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean | null
          metric_type: string
          name: string
          reward_description?: string | null
          sort_order?: number | null
          target_value: number
          tier?: number | null
          unlock_type: string
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feature_flag_key?: string | null
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean | null
          metric_type?: string
          name?: string
          reward_description?: string | null
          sort_order?: number | null
          target_value?: number
          tier?: number | null
          unlock_type?: string
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coins: {
        Row: {
          balance: number | null
          id: string
          total_purchased: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          total_purchased?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          total_purchased?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_connected: boolean | null
          metadata: Json | null
          provider_id: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          metadata?: Json | null
          provider_id: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          metadata?: Json | null
          provider_id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string
          id: string
          journey_type: string
          metadata: Json | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step: string
          id?: string
          journey_type: string
          metadata?: Json | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          journey_type?: string
          metadata?: Json | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_loyalty: {
        Row: {
          created_at: string
          current_period_points: number | null
          current_tier: string
          id: string
          lifetime_points: number
          metadata: Json | null
          tier_expires_at: string | null
          tier_updated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_points?: number | null
          current_tier?: string
          id?: string
          lifetime_points?: number
          metadata?: Json | null
          tier_expires_at?: string | null
          tier_updated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_points?: number | null
          current_tier?: string
          id?: string
          lifetime_points?: number
          metadata?: Json | null
          tier_expires_at?: string | null
          tier_updated_at?: string | null
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
      user_matches: {
        Row: {
          ai_explanation: string | null
          contacted_at: string | null
          created_at: string
          id: string
          match_criteria: Json | null
          match_reason: string | null
          match_score: number
          matched_user_id: string
          saved: boolean | null
          status: string
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          ai_explanation?: string | null
          contacted_at?: string | null
          created_at?: string
          id?: string
          match_criteria?: Json | null
          match_reason?: string | null
          match_score?: number
          matched_user_id: string
          saved?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          ai_explanation?: string | null
          contacted_at?: string | null
          created_at?: string
          id?: string
          match_criteria?: Json | null
          match_reason?: string | null
          match_score?: number
          matched_user_id?: string
          saved?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
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
      user_preferences: {
        Row: {
          email_notifications: boolean | null
          notification_frequency: string | null
          profile_visibility: string | null
          push_notifications: boolean | null
          show_earnings: boolean | null
          show_email: boolean | null
          show_location: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          email_notifications?: boolean | null
          notification_frequency?: string | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_earnings?: boolean | null
          show_email?: boolean | null
          show_location?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          email_notifications?: boolean | null
          notification_frequency?: string | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_earnings?: boolean | null
          show_email?: boolean | null
          show_location?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_storefronts: {
        Row: {
          banner_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          social_links: Json | null
          storefront_slug: string
          stripe_account_id: string | null
          theme_color: string | null
          total_revenue: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          social_links?: Json | null
          storefront_slug: string
          stripe_account_id?: string | null
          theme_color?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          social_links?: Json | null
          storefront_slug?: string
          stripe_account_id?: string | null
          theme_color?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_count: number | null
          id: string
          last_activity_at: string | null
          longest_count: number | null
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_count?: number | null
          id?: string
          last_activity_at?: string | null
          longest_count?: number | null
          streak_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_count?: number | null
          id?: string
          last_activity_at?: string | null
          longest_count?: number | null
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          price_paid: number | null
          start_date: string | null
          status: string | null
          subscription_tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          price_paid?: number | null
          start_date?: string | null
          status?: string | null
          subscription_tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          price_paid?: number | null
          start_date?: string | null
          status?: string | null
          subscription_tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tracks: {
        Row: {
          artwork_url: string | null
          audio_url: string
          bpm: number | null
          collaboration_credits: Json | null
          created_at: string | null
          description: string | null
          download_count: number | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_for_sale: boolean | null
          is_public: boolean | null
          key_signature: string | null
          license_type: string | null
          play_count: number | null
          price: number | null
          release_date: string | null
          source_premiere_id: string | null
          source_project_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artwork_url?: string | null
          audio_url: string
          bpm?: number | null
          collaboration_credits?: Json | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_for_sale?: boolean | null
          is_public?: boolean | null
          key_signature?: string | null
          license_type?: string | null
          play_count?: number | null
          price?: number | null
          release_date?: string | null
          source_premiere_id?: string | null
          source_project_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artwork_url?: string | null
          audio_url?: string
          bpm?: number | null
          collaboration_credits?: Json | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_for_sale?: boolean | null
          is_public?: boolean | null
          key_signature?: string | null
          license_type?: string | null
          play_count?: number | null
          price?: number | null
          release_date?: string | null
          source_premiere_id?: string | null
          source_project_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tutorial_progress: {
        Row: {
          completed_at: string | null
          current_step: number | null
          id: string
          is_completed: boolean | null
          started_at: string | null
          tutorial_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          tutorial_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          tutorial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_unlockables: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          is_unlocked: boolean | null
          unlockable_id: string
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          is_unlocked?: boolean | null
          unlockable_id: string
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          is_unlocked?: boolean | null
          unlockable_id?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unlockables_unlockable_id_fkey"
            columns: ["unlockable_id"]
            isOneToOne: false
            referencedRelation: "unlockables"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          referral_code: string | null
          role: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          referral_code?: string | null
          role: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          referral_code?: string | null
          role?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      engineer_leaderboard: {
        Row: {
          average_rating: number | null
          completed_projects: number | null
          engineer_id: string | null
          rank: number | null
          total_earnings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      streaming_connections_safe: {
        Row: {
          connection_status: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          platform: string | null
          profile_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          platform?: string | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          platform?: string | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaming_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_points: {
        Args: {
          p_action_description?: string
          p_action_type: string
          p_points: number
          p_user_id: string
        }
        Returns: number
      }
      calculate_bonus_from_rating: {
        Args: { p_base_amount: number; p_project_id: string }
        Returns: number
      }
      calculate_partnership_health: {
        Args: { p_partnership_id: string }
        Returns: number
      }
      calculate_partnership_metrics: {
        Args: { p_partnership_id: string }
        Returns: undefined
      }
      calculate_recognition_tier: {
        Args: { follower_count: number }
        Returns: string
      }
      can_view_profile: { Args: { profile_id: string }; Returns: boolean }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_milestone_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_affiliate_code: { Args: never; Returns: string }
      get_or_create_wallet: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string | null
          daily_purchased: number | null
          daily_purchased_reset_at: string | null
          earned_balance: number | null
          id: string
          purchased_balance: number | null
          total_earned: number | null
          total_gifted: number | null
          total_purchased: number | null
          total_received: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "mixx_wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_security_dashboard_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_course_enrollments: {
        Args: { p_course_id: string }
        Returns: undefined
      }
      process_stream_gift: {
        Args: {
          p_gift_id: string
          p_message?: string
          p_quantity?: number
          p_sender_id: string
          p_stream_id: string
        }
        Returns: string
      }
      update_engineer_leaderboard: { Args: never; Returns: undefined }
      update_engineer_streak: {
        Args: { p_engineer_id: string }
        Returns: undefined
      }
      update_stream_viewer_count: {
        Args: { p_count: number; p_stream_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "artist"
        | "engineer"
        | "producer"
        | "fan"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "artist",
        "engineer",
        "producer",
        "fan",
      ],
    },
  },
} as const
