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
      achievement_progress: {
        Row: {
          achievement_type: string
          completed_at: string | null
          current_progress: number | null
          id: string
          progress_metadata: Json | null
          started_at: string | null
          target_progress: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          progress_metadata?: Json | null
          started_at?: string | null
          target_progress: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          progress_metadata?: Json | null
          started_at?: string | null
          target_progress?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      add_on_purchases: {
        Row: {
          add_on_id: string
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          project_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          add_on_id: string
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          project_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          add_on_id?: string
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          project_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "add_on_purchases_add_on_id_fkey"
            columns: ["add_on_id"]
            isOneToOne: false
            referencedRelation: "add_on_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "add_on_purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      add_on_services: {
        Row: {
          created_at: string | null
          currency: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          price: number
          processing_time_minutes: number | null
          service_description: string | null
          service_name: string
          service_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          price: number
          processing_time_minutes?: number | null
          service_description?: string | null
          service_name: string
          service_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          price?: number
          processing_time_minutes?: number | null
          service_description?: string | null
          service_name?: string
          service_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_calendar_events: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          priority: string | null
          recurrence_rule: string | null
          reminder_date: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          priority?: string | null
          recurrence_rule?: string | null
          reminder_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          priority?: string | null
          recurrence_rule?: string | null
          reminder_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          amount: number
          commission_type: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payout_date: string | null
          referral_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          commission_type: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payout_date?: string | null
          referral_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          commission_type?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payout_date?: string | null
          referral_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "distribution_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_audio_profiles: {
        Row: {
          ai_model_version: string | null
          analysis_version: string
          audio_file_id: string
          beat_grid: Json | null
          chord_progression: Json | null
          confidence_scores: Json | null
          created_at: string | null
          crest_factor: number | null
          dynamic_range: number | null
          frequency_balance: Json | null
          frequency_distribution: Json | null
          genre_prediction: Json | null
          harmonic_complexity: number | null
          harmonic_content: Json | null
          id: string
          improvement_suggestions: Json | null
          key_signature: string | null
          loudness_lufs: number | null
          mastering_quality_score: number | null
          mixing_balance_score: number | null
          mood_analysis: Json | null
          peak_level: number | null
          phase_correlation: number | null
          problem_frequencies: Json | null
          processing_time_ms: number | null
          rhythm_patterns: Json | null
          rms_level: number | null
          scale_type: string | null
          spatial_distribution: Json | null
          spectral_centroid: number | null
          spectral_flux: number | null
          spectral_rolloff: number | null
          stereo_width: number | null
          style_references: Json | null
          tempo_bpm: number | null
          time_signature: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model_version?: string | null
          analysis_version?: string
          audio_file_id: string
          beat_grid?: Json | null
          chord_progression?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          crest_factor?: number | null
          dynamic_range?: number | null
          frequency_balance?: Json | null
          frequency_distribution?: Json | null
          genre_prediction?: Json | null
          harmonic_complexity?: number | null
          harmonic_content?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          key_signature?: string | null
          loudness_lufs?: number | null
          mastering_quality_score?: number | null
          mixing_balance_score?: number | null
          mood_analysis?: Json | null
          peak_level?: number | null
          phase_correlation?: number | null
          problem_frequencies?: Json | null
          processing_time_ms?: number | null
          rhythm_patterns?: Json | null
          rms_level?: number | null
          scale_type?: string | null
          spatial_distribution?: Json | null
          spectral_centroid?: number | null
          spectral_flux?: number | null
          spectral_rolloff?: number | null
          stereo_width?: number | null
          style_references?: Json | null
          tempo_bpm?: number | null
          time_signature?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_model_version?: string | null
          analysis_version?: string
          audio_file_id?: string
          beat_grid?: Json | null
          chord_progression?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          crest_factor?: number | null
          dynamic_range?: number | null
          frequency_balance?: Json | null
          frequency_distribution?: Json | null
          genre_prediction?: Json | null
          harmonic_complexity?: number | null
          harmonic_content?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          key_signature?: string | null
          loudness_lufs?: number | null
          mastering_quality_score?: number | null
          mixing_balance_score?: number | null
          mood_analysis?: Json | null
          peak_level?: number | null
          phase_correlation?: number | null
          problem_frequencies?: Json | null
          processing_time_ms?: number | null
          rhythm_patterns?: Json | null
          rms_level?: number | null
          scale_type?: string | null
          spatial_distribution?: Json | null
          spectral_centroid?: number | null
          spectral_flux?: number | null
          spectral_rolloff?: number | null
          stereo_width?: number | null
          style_references?: Json | null
          tempo_bpm?: number | null
          time_signature?: string | null
          updated_at?: string | null
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
          artist_id: string
          artist_interested: boolean | null
          compatibility_score: number
          complementary_skills: Json | null
          created_at: string | null
          engineer_id: string
          engineer_interested: boolean | null
          expires_at: string | null
          genre_match_score: number | null
          id: string
          match_factors: Json | null
          match_status: string | null
          shared_characteristics: Json | null
          style_match_score: number | null
          technical_match_score: number | null
          viewed_by_artist: boolean | null
          viewed_by_engineer: boolean | null
        }
        Insert: {
          artist_id: string
          artist_interested?: boolean | null
          compatibility_score: number
          complementary_skills?: Json | null
          created_at?: string | null
          engineer_id: string
          engineer_interested?: boolean | null
          expires_at?: string | null
          genre_match_score?: number | null
          id?: string
          match_factors?: Json | null
          match_status?: string | null
          shared_characteristics?: Json | null
          style_match_score?: number | null
          technical_match_score?: number | null
          viewed_by_artist?: boolean | null
          viewed_by_engineer?: boolean | null
        }
        Update: {
          artist_id?: string
          artist_interested?: boolean | null
          compatibility_score?: number
          complementary_skills?: Json | null
          created_at?: string | null
          engineer_id?: string
          engineer_interested?: boolean | null
          expires_at?: string | null
          genre_match_score?: number | null
          id?: string
          match_factors?: Json | null
          match_status?: string | null
          shared_characteristics?: Json | null
          style_match_score?: number | null
          technical_match_score?: number | null
          viewed_by_artist?: boolean | null
          viewed_by_engineer?: boolean | null
        }
        Relationships: []
      }
      ai_financial_insights: {
        Row: {
          action_metadata: Json | null
          action_taken: boolean | null
          confidence_score: number | null
          created_at: string | null
          currency: string | null
          description: string
          expires_at: string | null
          id: string
          impact_amount: number | null
          insight_type: string
          metadata: Json | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_metadata?: Json | null
          action_taken?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          description: string
          expires_at?: string | null
          id?: string
          impact_amount?: number | null
          insight_type: string
          metadata?: Json | null
          severity?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_metadata?: Json | null
          action_taken?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          impact_amount?: number | null
          insight_type?: string
          metadata?: Json | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_mastering_presets: {
        Row: {
          compression_settings: Json
          created_at: string | null
          eq_curve: Json
          genre_optimized: string | null
          id: string
          is_public: boolean | null
          last_updated_at: string | null
          limiting_settings: Json
          model_confidence: number | null
          preset_name: string
          saturation_settings: Json | null
          stereo_enhancement: Json | null
          success_rate: number | null
          times_used: number | null
          training_samples: number | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          compression_settings: Json
          created_at?: string | null
          eq_curve: Json
          genre_optimized?: string | null
          id?: string
          is_public?: boolean | null
          last_updated_at?: string | null
          limiting_settings: Json
          model_confidence?: number | null
          preset_name: string
          saturation_settings?: Json | null
          stereo_enhancement?: Json | null
          success_rate?: number | null
          times_used?: number | null
          training_samples?: number | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          compression_settings?: Json
          created_at?: string | null
          eq_curve?: Json
          genre_optimized?: string | null
          id?: string
          is_public?: boolean | null
          last_updated_at?: string | null
          limiting_settings?: Json
          model_confidence?: number | null
          preset_name?: string
          saturation_settings?: Json | null
          stereo_enhancement?: Json | null
          success_rate?: number | null
          times_used?: number | null
          training_samples?: number | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: []
      }
      ai_match_analysis: {
        Row: {
          analysis_type: string
          audio_file_id: string
          complexity_score: number | null
          created_at: string | null
          detected_genre: string | null
          full_analysis: Json | null
          id: string
          instrumentation: Json | null
          key_signature: string | null
          mixing_quality: Json | null
          mood_score: Json | null
          technical_quality: number | null
          tempo_bpm: number | null
          updated_at: string | null
          user_id: string
          vocal_presence: number | null
        }
        Insert: {
          analysis_type?: string
          audio_file_id: string
          complexity_score?: number | null
          created_at?: string | null
          detected_genre?: string | null
          full_analysis?: Json | null
          id?: string
          instrumentation?: Json | null
          key_signature?: string | null
          mixing_quality?: Json | null
          mood_score?: Json | null
          technical_quality?: number | null
          tempo_bpm?: number | null
          updated_at?: string | null
          user_id: string
          vocal_presence?: number | null
        }
        Update: {
          analysis_type?: string
          audio_file_id?: string
          complexity_score?: number | null
          created_at?: string | null
          detected_genre?: string | null
          full_analysis?: Json | null
          id?: string
          instrumentation?: Json | null
          key_signature?: string | null
          mixing_quality?: Json | null
          mood_score?: Json | null
          technical_quality?: number | null
          tempo_bpm?: number | null
          updated_at?: string | null
          user_id?: string
          vocal_presence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_analysis_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_mixing_suggestions: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          applied_by: string | null
          audio_file_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          parameters: Json | null
          session_id: string
          suggestion_description: string | null
          suggestion_title: string
          suggestion_type: string
          user_feedback: string | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          audio_file_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          parameters?: Json | null
          session_id: string
          suggestion_description?: string | null
          suggestion_title: string
          suggestion_type: string
          user_feedback?: string | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          audio_file_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          parameters?: Json | null
          session_id?: string
          suggestion_description?: string | null
          suggestion_title?: string
          suggestion_type?: string
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_mixing_suggestions_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mixing_suggestions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          current_day_count: number | null
          current_hour_count: number | null
          day_reset_at: string | null
          hour_reset_at: string | null
          id: string
          integration_provider_id: string | null
          is_throttled: boolean | null
          rate_limit_tier: string
          requests_per_day: number
          requests_per_hour: number
          throttle_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_day_count?: number | null
          current_hour_count?: number | null
          day_reset_at?: string | null
          hour_reset_at?: string | null
          id?: string
          integration_provider_id?: string | null
          is_throttled?: boolean | null
          rate_limit_tier?: string
          requests_per_day: number
          requests_per_hour: number
          throttle_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_day_count?: number | null
          current_hour_count?: number | null
          day_reset_at?: string | null
          hour_reset_at?: string | null
          id?: string
          integration_provider_id?: string | null
          is_throttled?: boolean | null
          rate_limit_tier?: string
          requests_per_day?: number
          requests_per_hour?: number
          throttle_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_integration_provider_id_fkey"
            columns: ["integration_provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      application_templates: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          experience_summary: string | null
          id: string
          is_default: boolean | null
          portfolio_links: Json | null
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          experience_summary?: string | null
          id?: string
          is_default?: boolean | null
          portfolio_links?: Json | null
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          experience_summary?: string | null
          id?: string
          is_default?: boolean | null
          portfolio_links?: Json | null
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attorney_notifications: {
        Row: {
          attorney_email: string
          attorney_name: string | null
          created_at: string | null
          document_id: string | null
          email_error: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          notification_type: string
          responded: boolean | null
          responded_at: string | null
          response_notes: string | null
        }
        Insert: {
          attorney_email: string
          attorney_name?: string | null
          created_at?: string | null
          document_id?: string | null
          email_error?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          notification_type: string
          responded?: boolean | null
          responded_at?: string | null
          response_notes?: string | null
        }
        Update: {
          attorney_email?: string
          attorney_name?: string | null
          created_at?: string | null
          document_id?: string | null
          email_error?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          notification_type?: string
          responded?: boolean | null
          responded_at?: string | null
          response_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attorney_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
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
      battle_tournaments: {
        Row: {
          bracket_data: Json | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          end_date: string | null
          entry_fee: number | null
          id: string
          max_participants: number | null
          prize_pool: number | null
          rules: Json | null
          start_date: string
          status: string
          tournament_name: string
          tournament_type: string
          updated_at: string | null
        }
        Insert: {
          bracket_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          end_date?: string | null
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date: string
          status?: string
          tournament_name: string
          tournament_type?: string
          updated_at?: string | null
        }
        Update: {
          bracket_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          end_date?: string | null
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string
          status?: string
          tournament_name?: string
          tournament_type?: string
          updated_at?: string | null
        }
        Relationships: []
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
          battle_type: string | null
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          league: string | null
          prize_pool: number | null
          rapper1: string
          rapper2: string
          stems_required: boolean | null
          title: string
          updated_at: string
          video_id: string
          views_count: number | null
          votes_count: number | null
        }
        Insert: {
          battle_type?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          league?: string | null
          prize_pool?: number | null
          rapper1: string
          rapper2: string
          stems_required?: boolean | null
          title: string
          updated_at?: string
          video_id: string
          views_count?: number | null
          votes_count?: number | null
        }
        Update: {
          battle_type?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          league?: string | null
          prize_pool?: number | null
          rapper1?: string
          rapper2?: string
          stems_required?: boolean | null
          title?: string
          updated_at?: string
          video_id?: string
          views_count?: number | null
          votes_count?: number | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          assessment_scores: Json | null
          certificate_url: string | null
          certification_name: string
          certification_type: string
          course_id: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_verified: boolean | null
          issued_at: string | null
          skills_verified: string[] | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          assessment_scores?: Json | null
          certificate_url?: string | null
          certification_name: string
          certification_type: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          issued_at?: string | null
          skills_verified?: string[] | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          assessment_scores?: Json | null
          certificate_url?: string | null
          certification_name?: string
          certification_type?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          issued_at?: string | null
          skills_verified?: string[] | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_messages: {
        Row: {
          chatbot_type: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chatbot_type: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chatbot_type?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "collaboration_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      community_milestones: {
        Row: {
          created_at: string | null
          current_value: number
          display_order: number | null
          feature_key: string
          icon_name: string | null
          id: string
          is_unlocked: boolean
          milestone_description: string | null
          milestone_name: string
          milestone_type: string
          reward_description: string | null
          target_value: number
          unlocked_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          display_order?: number | null
          feature_key: string
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean
          milestone_description?: string | null
          milestone_name: string
          milestone_type: string
          reward_description?: string | null
          target_value: number
          unlocked_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          display_order?: number | null
          feature_key?: string
          icon_name?: string | null
          id?: string
          is_unlocked?: boolean
          milestone_description?: string | null
          milestone_name?: string
          milestone_type?: string
          reward_description?: string | null
          target_value?: number
          unlocked_at?: string | null
          updated_at?: string | null
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
      course_lessons: {
        Row: {
          content_data: Json | null
          content_type: string
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          lesson_number: number
          resources: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content_data?: Json | null
          content_type?: string
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_number: number
          resources?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content_data?: Json | null
          content_type?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_number?: number
          resources?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
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
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          instructor_id: string
          is_free: boolean | null
          is_published: boolean | null
          learning_outcomes: string[] | null
          prerequisites: string[] | null
          preview_video_url: string | null
          price: number | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          total_enrollments: number | null
          total_lessons: number | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          instructor_id: string
          is_free?: boolean | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          preview_video_url?: string | null
          price?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          total_enrollments?: number | null
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          instructor_id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          preview_video_url?: string | null
          price?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          total_enrollments?: number | null
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      discount_codes: {
        Row: {
          applicable_to: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      distribution_analytics: {
        Row: {
          created_at: string | null
          date: string
          earnings: number | null
          id: string
          listeners: number | null
          metadata: Json | null
          platform: string
          playlist_adds: number | null
          release_id: string | null
          saves: number | null
          streams: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          earnings?: number | null
          id?: string
          listeners?: number | null
          metadata?: Json | null
          platform: string
          playlist_adds?: number | null
          release_id?: string | null
          saves?: number | null
          streams?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          earnings?: number | null
          id?: string
          listeners?: number | null
          metadata?: Json | null
          platform?: string
          playlist_adds?: number | null
          release_id?: string | null
          saves?: number | null
          streams?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_analytics_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_packages: {
        Row: {
          billing_cycle: string
          created_at: string | null
          currency: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          package_description: string | null
          package_name: string
          price: number
          releases_per_year: number
          stores_included: Json | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          package_description?: string | null
          package_name: string
          price: number
          releases_per_year: number
          stores_included?: Json | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          package_description?: string | null
          package_name?: string
          price?: number
          releases_per_year?: number
          stores_included?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      distribution_referrals: {
        Row: {
          clicked_at: string | null
          commission_earned: number | null
          commission_status: string | null
          created_at: string | null
          distributor_id: string
          distributor_name: string
          id: string
          metadata: Json | null
          referral_code: string | null
          signed_up: boolean | null
          signed_up_at: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          commission_earned?: number | null
          commission_status?: string | null
          created_at?: string | null
          distributor_id: string
          distributor_name: string
          id?: string
          metadata?: Json | null
          referral_code?: string | null
          signed_up?: boolean | null
          signed_up_at?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          commission_earned?: number | null
          commission_status?: string | null
          created_at?: string | null
          distributor_id?: string
          distributor_name?: string
          id?: string
          metadata?: Json | null
          referral_code?: string | null
          signed_up?: boolean | null
          signed_up_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      engineer_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_rarity: Database["public"]["Enums"]["badge_rarity"] | null
          badge_type: string
          criteria_met: Json | null
          display_order: number | null
          earned_at: string | null
          engineer_id: string
          icon_name: string | null
          id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_rarity?: Database["public"]["Enums"]["badge_rarity"] | null
          badge_type: string
          criteria_met?: Json | null
          display_order?: number | null
          earned_at?: string | null
          engineer_id: string
          icon_name?: string | null
          id?: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_rarity?: Database["public"]["Enums"]["badge_rarity"] | null
          badge_type?: string
          criteria_met?: Json | null
          display_order?: number | null
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
          {
            foreignKeyName: "engineer_badges_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_earnings: {
        Row: {
          base_amount: number
          bonus_amount: number | null
          created_at: string | null
          engineer_id: string
          id: string
          notes: string | null
          payment_method: string | null
          payout_date: string | null
          project_id: string | null
          status: string
          stripe_transfer_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          base_amount?: number
          bonus_amount?: number | null
          created_at?: string | null
          engineer_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payout_date?: string | null
          project_id?: string | null
          status?: string
          stripe_transfer_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          base_amount?: number
          bonus_amount?: number | null
          created_at?: string | null
          engineer_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payout_date?: string | null
          project_id?: string | null
          status?: string
          stripe_transfer_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_earnings_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_earnings_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_earnings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_leaderboard: {
        Row: {
          average_rating: number | null
          completed_projects: number | null
          engineer_id: string
          id: string
          leaderboard_type: string | null
          period: string | null
          period_end: string | null
          period_start: string | null
          rank: number | null
          total_bonuses: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          completed_projects?: number | null
          engineer_id: string
          id?: string
          leaderboard_type?: string | null
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          total_bonuses?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          completed_projects?: number | null
          engineer_id?: string
          id?: string
          leaderboard_type?: string | null
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          total_bonuses?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_leaderboard_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_leaderboard_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_preset_packs: {
        Row: {
          created_at: string | null
          daw_compatibility: string[] | null
          demo_audio_url: string | null
          engineer_id: string
          file_formats: string[] | null
          genre_optimized: string[] | null
          id: string
          installation_guide: string | null
          marketplace_item_id: string
          pack_description: string | null
          pack_name: string
          plugin_compatibility: Json | null
          preset_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daw_compatibility?: string[] | null
          demo_audio_url?: string | null
          engineer_id: string
          file_formats?: string[] | null
          genre_optimized?: string[] | null
          id?: string
          installation_guide?: string | null
          marketplace_item_id: string
          pack_description?: string | null
          pack_name: string
          plugin_compatibility?: Json | null
          preset_count: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daw_compatibility?: string[] | null
          demo_audio_url?: string | null
          engineer_id?: string
          file_formats?: string[] | null
          genre_optimized?: string[] | null
          id?: string
          installation_guide?: string | null
          marketplace_item_id?: string
          pack_description?: string | null
          pack_name?: string
          plugin_compatibility?: Json | null
          preset_count?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_preset_packs_marketplace_item_id_fkey"
            columns: ["marketplace_item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_profiles: {
        Row: {
          certifications: string[] | null
          collaboration_sessions_count: number | null
          created_at: string
          equipment_list: string[] | null
          featured_engineer: boolean | null
          id: string
          is_available: boolean | null
          mastering_rate_per_song: number | null
          mixing_rate_per_song: number | null
          onboarding_profile_id: string | null
          platform_usage_score: number | null
          portfolio_links: string[] | null
          rating_average: number | null
          remote_work_percentage: number | null
          rush_fee_percentage: number | null
          specialties: string[] | null
          tools_mastered: Json | null
          total_projects_completed: number | null
          total_reviews: number | null
          turnaround_days: number | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          certifications?: string[] | null
          collaboration_sessions_count?: number | null
          created_at?: string
          equipment_list?: string[] | null
          featured_engineer?: boolean | null
          id?: string
          is_available?: boolean | null
          mastering_rate_per_song?: number | null
          mixing_rate_per_song?: number | null
          onboarding_profile_id?: string | null
          platform_usage_score?: number | null
          portfolio_links?: string[] | null
          rating_average?: number | null
          remote_work_percentage?: number | null
          rush_fee_percentage?: number | null
          specialties?: string[] | null
          tools_mastered?: Json | null
          total_projects_completed?: number | null
          total_reviews?: number | null
          turnaround_days?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          certifications?: string[] | null
          collaboration_sessions_count?: number | null
          created_at?: string
          equipment_list?: string[] | null
          featured_engineer?: boolean | null
          id?: string
          is_available?: boolean | null
          mastering_rate_per_song?: number | null
          mixing_rate_per_song?: number | null
          onboarding_profile_id?: string | null
          platform_usage_score?: number | null
          portfolio_links?: string[] | null
          rating_average?: number | null
          remote_work_percentage?: number | null
          rush_fee_percentage?: number | null
          specialties?: string[] | null
          tools_mastered?: Json | null
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
      engineer_skill_assessments: {
        Row: {
          assessment_type: string
          created_at: string | null
          engineer_id: string
          genre_specialties: Json | null
          id: string
          last_assessed: string | null
          match_compatibility_score: number | null
          portfolio_analysis: Json | null
          skill_level: string
          technical_scores: Json | null
          updated_at: string | null
          verified_by_ai: boolean | null
        }
        Insert: {
          assessment_type: string
          created_at?: string | null
          engineer_id: string
          genre_specialties?: Json | null
          id?: string
          last_assessed?: string | null
          match_compatibility_score?: number | null
          portfolio_analysis?: Json | null
          skill_level?: string
          technical_scores?: Json | null
          updated_at?: string | null
          verified_by_ai?: boolean | null
        }
        Update: {
          assessment_type?: string
          created_at?: string | null
          engineer_id?: string
          genre_specialties?: Json | null
          id?: string
          last_assessed?: string | null
          match_compatibility_score?: number | null
          portfolio_analysis?: Json | null
          skill_level?: string
          technical_scores?: Json | null
          updated_at?: string | null
          verified_by_ai?: boolean | null
        }
        Relationships: []
      }
      engineer_streaks: {
        Row: {
          current_streak: number | null
          engineer_id: string
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          current_streak?: number | null
          engineer_id: string
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          current_streak?: number | null
          engineer_id?: string
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_streaks_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_streaks_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_tiers: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          engineer_id: string
          id: string
          platform_bonus_percentage: number | null
          requirements: Json | null
          revenue_split_percentage: number
          tier_name: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          engineer_id: string
          id?: string
          platform_bonus_percentage?: number | null
          requirements?: Json | null
          revenue_split_percentage: number
          tier_name: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          engineer_id?: string
          id?: string
          platform_bonus_percentage?: number | null
          requirements?: Json | null
          revenue_split_percentage?: number
          tier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineer_tiers_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_tiers_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      financial_actions_log: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          executed_by: string | null
          id: string
          insight_id: string | null
          result: Json | null
          status: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          insight_id?: string | null
          result?: Json | null
          status?: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          insight_id?: string | null
          result?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_actions_log_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "ai_financial_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_forecasts: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string | null
          factors: Json | null
          forecast_date: string
          forecast_type: string
          id: string
          model_accuracy: number | null
          predicted_value: number
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date: string
          forecast_type: string
          id?: string
          model_accuracy?: number | null
          predicted_value: number
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date?: string
          forecast_type?: string
          id?: string
          model_accuracy?: number | null
          predicted_value?: number
        }
        Relationships: []
      }
      hybrid_bookings: {
        Row: {
          attendees: Json | null
          booking_type: string
          created_at: string | null
          duration_hours: number
          engineer_id: string | null
          engineer_payment: number | null
          equipment_needed: Json | null
          id: string
          project_id: string | null
          session_date: string
          session_notes: string | null
          special_requests: string | null
          status: string
          studio_id: string
          studio_payment: number | null
          total_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendees?: Json | null
          booking_type?: string
          created_at?: string | null
          duration_hours?: number
          engineer_id?: string | null
          engineer_payment?: number | null
          equipment_needed?: Json | null
          id?: string
          project_id?: string | null
          session_date: string
          session_notes?: string | null
          special_requests?: string | null
          status?: string
          studio_id: string
          studio_payment?: number | null
          total_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendees?: Json | null
          booking_type?: string
          created_at?: string | null
          duration_hours?: number
          engineer_id?: string | null
          engineer_payment?: number | null
          equipment_needed?: Json | null
          id?: string
          project_id?: string | null
          session_date?: string
          session_notes?: string | null
          special_requests?: string | null
          status?: string
          studio_id?: string
          studio_payment?: number | null
          total_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hybrid_bookings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hybrid_bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studio_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_profiles: {
        Row: {
          average_rating: number | null
          bio: string | null
          created_at: string | null
          expertise_areas: string[] | null
          id: string
          is_verified: boolean | null
          social_links: Json | null
          total_courses: number | null
          total_students: number | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
          social_links?: Json | null
          total_courses?: number | null
          total_students?: number | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
          social_links?: Json | null
          total_courses?: number | null
          total_students?: number | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      integration_providers: {
        Row: {
          api_version: string | null
          auth_type: string
          created_at: string | null
          documentation_url: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          logo_url: string | null
          provider_description: string | null
          provider_name: string
          provider_type: string
          rate_limits: Json | null
          required_scopes: string[] | null
          setup_instructions: Json | null
          updated_at: string | null
          webhook_support: boolean | null
        }
        Insert: {
          api_version?: string | null
          auth_type: string
          created_at?: string | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          logo_url?: string | null
          provider_description?: string | null
          provider_name: string
          provider_type: string
          rate_limits?: Json | null
          required_scopes?: string[] | null
          setup_instructions?: Json | null
          updated_at?: string | null
          webhook_support?: boolean | null
        }
        Update: {
          api_version?: string | null
          auth_type?: string
          created_at?: string | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          logo_url?: string | null
          provider_description?: string | null
          provider_name?: string
          provider_type?: string
          rate_limits?: Json | null
          required_scopes?: string[] | null
          setup_instructions?: Json | null
          updated_at?: string | null
          webhook_support?: boolean | null
        }
        Relationships: []
      }
      integration_usage_logs: {
        Row: {
          action_metadata: Json | null
          action_type: string
          api_response: Json | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
          user_integration_id: string
        }
        Insert: {
          action_metadata?: Json | null
          action_type: string
          api_response?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status: string
          user_integration_id: string
        }
        Update: {
          action_metadata?: Json | null
          action_type?: string
          api_response?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          user_integration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_usage_logs_user_integration_id_fkey"
            columns: ["user_integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
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
          is_premium: boolean | null
          payment_status: string | null
          posting_fee: number | null
          service_type: string
          status: string
          stems_prepared: boolean | null
          stripe_payment_intent_id: string | null
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
          is_premium?: boolean | null
          payment_status?: string | null
          posting_fee?: number | null
          service_type?: string
          status?: string
          stems_prepared?: boolean | null
          stripe_payment_intent_id?: string | null
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
          is_premium?: boolean | null
          payment_status?: string | null
          posting_fee?: number | null
          service_type?: string
          status?: string
          stems_prepared?: boolean | null
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      label_partnerships: {
        Row: {
          contact_email: string | null
          created_at: string | null
          featured: boolean | null
          genres_specialized: string[] | null
          id: string
          is_active: boolean | null
          label_description: string | null
          label_name: string
          logo_url: string | null
          partnership_tier: string
          social_links: Json | null
          success_stories: Json | null
          total_artists: number | null
          updated_at: string | null
          website_url: string | null
          years_established: number | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          featured?: boolean | null
          genres_specialized?: string[] | null
          id?: string
          is_active?: boolean | null
          label_description?: string | null
          label_name: string
          logo_url?: string | null
          partnership_tier?: string
          social_links?: Json | null
          success_stories?: Json | null
          total_artists?: number | null
          updated_at?: string | null
          website_url?: string | null
          years_established?: number | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          featured?: boolean | null
          genres_specialized?: string[] | null
          id?: string
          is_active?: boolean | null
          label_description?: string | null
          label_name?: string
          logo_url?: string | null
          partnership_tier?: string
          social_links?: Json | null
          success_stories?: Json | null
          total_artists?: number | null
          updated_at?: string | null
          website_url?: string | null
          years_established?: number | null
        }
        Relationships: []
      }
      label_service_requests: {
        Row: {
          artist_id: string
          artist_links: Json | null
          audio_samples: string[] | null
          created_at: string | null
          id: string
          label_id: string
          label_response: string | null
          request_message: string
          responded_at: string | null
          service_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          artist_links?: Json | null
          audio_samples?: string[] | null
          created_at?: string | null
          id?: string
          label_id: string
          label_response?: string | null
          request_message: string
          responded_at?: string | null
          service_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          artist_links?: Json | null
          audio_samples?: string[] | null
          created_at?: string | null
          id?: string
          label_id?: string
          label_response?: string | null
          request_message?: string
          responded_at?: string | null
          service_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_service_requests_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "label_partnerships"
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
          base_price: number | null
          created_at: string | null
          features: string[] | null
          id: string
          is_available: boolean | null
          label_id: string
          pricing_model: string
          requirements: string[] | null
          revenue_split_percentage: number | null
          service_description: string | null
          service_name: string
          service_type: string
          turnaround_days: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          is_available?: boolean | null
          label_id: string
          pricing_model?: string
          requirements?: string[] | null
          revenue_split_percentage?: number | null
          service_description?: string | null
          service_name: string
          service_type: string
          turnaround_days?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          is_available?: boolean | null
          label_id?: string
          pricing_model?: string
          requirements?: string[] | null
          revenue_split_percentage?: number | null
          service_description?: string | null
          service_name?: string
          service_type?: string
          turnaround_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_services_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "label_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          attorney_email: string | null
          attorney_name: string | null
          attorney_notes: string | null
          attorney_reviewed: boolean | null
          attorney_reviewed_at: string | null
          content: string
          created_at: string | null
          created_by: string | null
          document_type: string
          docusign_completed_at: string | null
          docusign_document_url: string | null
          docusign_envelope_id: string | null
          docusign_sent_at: string | null
          docusign_status: string | null
          effective_date: string | null
          id: string
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          attorney_email?: string | null
          attorney_name?: string | null
          attorney_notes?: string | null
          attorney_reviewed?: boolean | null
          attorney_reviewed_at?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          document_type: string
          docusign_completed_at?: string | null
          docusign_document_url?: string | null
          docusign_envelope_id?: string | null
          docusign_sent_at?: string | null
          docusign_status?: string | null
          effective_date?: string | null
          id?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          attorney_email?: string | null
          attorney_name?: string | null
          attorney_notes?: string | null
          attorney_reviewed?: boolean | null
          attorney_reviewed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          docusign_completed_at?: string | null
          docusign_document_url?: string | null
          docusign_envelope_id?: string | null
          docusign_sent_at?: string | null
          docusign_status?: string | null
          effective_date?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          lesson_id: string
          notes: string | null
          progress_percentage: number | null
          status: string
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          lesson_id: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "user_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          category_description: string | null
          category_name: string
          created_at: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category_description?: string | null
          category_name: string
          created_at?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category_description?: string | null
          category_name?: string
          created_at?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_earnings: {
        Row: {
          created_at: string | null
          gross_amount: number
          id: string
          item_id: string
          net_amount: number
          payout_date: string | null
          payout_status: string
          platform_fee: number
          purchase_id: string
          seller_id: string
          stripe_transfer_id: string | null
        }
        Insert: {
          created_at?: string | null
          gross_amount: number
          id?: string
          item_id: string
          net_amount: number
          payout_date?: string | null
          payout_status?: string
          platform_fee: number
          purchase_id: string
          seller_id: string
          stripe_transfer_id?: string | null
        }
        Update: {
          created_at?: string | null
          gross_amount?: number
          id?: string
          item_id?: string
          net_amount?: number
          payout_date?: string | null
          payout_status?: string
          platform_fee?: number
          purchase_id?: string
          seller_id?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_earnings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_earnings_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "marketplace_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          average_rating: number | null
          category_id: string | null
          color_options: Json | null
          compatibility: Json | null
          created_at: string | null
          demo_video_url: string | null
          design_file_url: string | null
          download_count: number | null
          featured: boolean | null
          file_path: string | null
          file_size: number | null
          id: string
          is_free: boolean | null
          is_published: boolean | null
          item_description: string | null
          item_name: string
          item_type: string
          mockup_images: Json | null
          physical_product: boolean | null
          preview_audio_path: string | null
          price: number
          printful_product_id: number | null
          printful_variant_id: number | null
          published_at: string | null
          seller_id: string
          size_options: Json | null
          tags: string[] | null
          technical_specs: Json | null
          thumbnail_url: string | null
          total_revenue: number | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          color_options?: Json | null
          compatibility?: Json | null
          created_at?: string | null
          demo_video_url?: string | null
          design_file_url?: string | null
          download_count?: number | null
          featured?: boolean | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          item_description?: string | null
          item_name: string
          item_type: string
          mockup_images?: Json | null
          physical_product?: boolean | null
          preview_audio_path?: string | null
          price?: number
          printful_product_id?: number | null
          printful_variant_id?: number | null
          published_at?: string | null
          seller_id: string
          size_options?: Json | null
          tags?: string[] | null
          technical_specs?: Json | null
          thumbnail_url?: string | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          color_options?: Json | null
          compatibility?: Json | null
          created_at?: string | null
          demo_video_url?: string | null
          design_file_url?: string | null
          download_count?: number | null
          featured?: boolean | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          item_description?: string | null
          item_name?: string
          item_type?: string
          mockup_images?: Json | null
          physical_product?: boolean | null
          preview_audio_path?: string | null
          price?: number
          printful_product_id?: number | null
          printful_variant_id?: number | null
          published_at?: string | null
          seller_id?: string
          size_options?: Json | null
          tags?: string[] | null
          technical_specs?: Json | null
          thumbnail_url?: string | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_sales?: number | null
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
        ]
      }
      marketplace_purchases: {
        Row: {
          buyer_id: string
          cart_items: Json | null
          discount_amount: number | null
          download_expires_at: string | null
          download_url: string | null
          id: string
          item_id: string
          payment_method: string | null
          payment_status: string
          purchase_price: number
          purchased_at: string | null
          shipping_cost: number | null
          stripe_payment_id: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
        }
        Insert: {
          buyer_id: string
          cart_items?: Json | null
          discount_amount?: number | null
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          item_id: string
          payment_method?: string | null
          payment_status?: string
          purchase_price: number
          purchased_at?: string | null
          shipping_cost?: number | null
          stripe_payment_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Update: {
          buyer_id?: string
          cart_items?: Json | null
          discount_amount?: number | null
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          item_id?: string
          payment_method?: string | null
          payment_status?: string
          purchase_price?: number
          purchased_at?: string | null
          shipping_cost?: number | null
          stripe_payment_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          item_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          item_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          item_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
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
      media_library: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      merch_products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          printful_id: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          printful_id: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          printful_id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merch_variants: {
        Row: {
          color: string | null
          created_at: string | null
          currency: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          printful_variant_id: string
          product_id: string | null
          size: string | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          printful_variant_id: string
          product_id?: string | null
          size?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          printful_variant_id?: string
          product_id?: string | null
          size?: string | null
          sku?: string | null
          updated_at?: string | null
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
      milestone_contributors: {
        Row: {
          contribution_count: number
          first_contribution_at: string | null
          id: string
          last_contribution_at: string | null
          milestone_id: string
          user_id: string
        }
        Insert: {
          contribution_count?: number
          first_contribution_at?: string | null
          id?: string
          last_contribution_at?: string | null
          milestone_id: string
          user_id: string
        }
        Update: {
          contribution_count?: number
          first_contribution_at?: string | null
          id?: string
          last_contribution_at?: string | null
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_contributors_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "community_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_progress_log: {
        Row: {
          created_at: string | null
          id: string
          increment_amount: number
          milestone_id: string
          new_value: number
          previous_value: number
          reason: string | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          increment_amount: number
          milestone_id: string
          new_value: number
          previous_value: number
          reason?: string | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          increment_amount?: number
          milestone_id?: string
          new_value?: number
          previous_value?: number
          reason?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_progress_log_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "community_milestones"
            referencedColumns: ["id"]
          },
        ]
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
      monthly_awards: {
        Row: {
          award_category: string
          award_description: string | null
          award_value: number
          awarded_at: string | null
          created_at: string | null
          id: string
          period_month: number
          period_year: number
          winner_id: string
        }
        Insert: {
          award_category: string
          award_description?: string | null
          award_value?: number
          awarded_at?: string | null
          created_at?: string | null
          id?: string
          period_month: number
          period_year: number
          winner_id: string
        }
        Update: {
          award_category?: string
          award_description?: string | null
          award_value?: number
          awarded_at?: string | null
          created_at?: string | null
          id?: string
          period_month?: number
          period_year?: number
          winner_id?: string
        }
        Relationships: []
      }
      music_releases: {
        Row: {
          apple_music_url: string | null
          artist_name: string
          artwork_url: string | null
          created_at: string | null
          distributor_id: string
          distributor_name: string
          distributor_type: string | null
          earnings_data: Json | null
          id: string
          isrc_codes: Json | null
          metadata: Json | null
          notes: string | null
          platforms: Json | null
          project_id: string | null
          release_date: string | null
          release_title: string
          release_type: string | null
          spotify_url: string | null
          status: string | null
          streaming_stats: Json | null
          subscription_id: string | null
          upc_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apple_music_url?: string | null
          artist_name: string
          artwork_url?: string | null
          created_at?: string | null
          distributor_id: string
          distributor_name: string
          distributor_type?: string | null
          earnings_data?: Json | null
          id?: string
          isrc_codes?: Json | null
          metadata?: Json | null
          notes?: string | null
          platforms?: Json | null
          project_id?: string | null
          release_date?: string | null
          release_title: string
          release_type?: string | null
          spotify_url?: string | null
          status?: string | null
          streaming_stats?: Json | null
          subscription_id?: string | null
          upc_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apple_music_url?: string | null
          artist_name?: string
          artwork_url?: string | null
          created_at?: string | null
          distributor_id?: string
          distributor_name?: string
          distributor_type?: string | null
          earnings_data?: Json | null
          id?: string
          isrc_codes?: Json | null
          metadata?: Json | null
          notes?: string | null
          platforms?: Json | null
          project_id?: string | null
          release_date?: string | null
          release_title?: string
          release_type?: string | null
          spotify_url?: string | null
          status?: string | null
          streaming_stats?: Json | null
          subscription_id?: string | null
          upc_code?: string | null
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
        ]
      }
      notification_preferences: {
        Row: {
          collaboration_invites: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          payment_notifications: boolean | null
          project_updates: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collaboration_invites?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_notifications?: boolean | null
          project_updates?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collaboration_invites?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_notifications?: boolean | null
          project_updates?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_profiles: {
        Row: {
          artist_engineer_agreement_accepted: boolean | null
          artist_engineer_agreement_accepted_at: string | null
          availability: Json | null
          bio: string | null
          created_at: string
          current_step: number
          daw_preference: string | null
          equipment: Json | null
          experience_level: string | null
          financial_agreement_accepted: boolean | null
          financial_agreement_accepted_at: string | null
          genre: string | null
          hourly_rate: number | null
          id: string
          onboarding_completed: boolean
          payout_preference: string | null
          portfolio_links: Json | null
          revenue_split_percentage: number | null
          services_offered: Json | null
          stage_name: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          artist_engineer_agreement_accepted?: boolean | null
          artist_engineer_agreement_accepted_at?: string | null
          availability?: Json | null
          bio?: string | null
          created_at?: string
          current_step?: number
          daw_preference?: string | null
          equipment?: Json | null
          experience_level?: string | null
          financial_agreement_accepted?: boolean | null
          financial_agreement_accepted_at?: string | null
          genre?: string | null
          hourly_rate?: number | null
          id?: string
          onboarding_completed?: boolean
          payout_preference?: string | null
          portfolio_links?: Json | null
          revenue_split_percentage?: number | null
          services_offered?: Json | null
          stage_name?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          artist_engineer_agreement_accepted?: boolean | null
          artist_engineer_agreement_accepted_at?: string | null
          availability?: Json | null
          bio?: string | null
          created_at?: string
          current_step?: number
          daw_preference?: string | null
          equipment?: Json | null
          experience_level?: string | null
          financial_agreement_accepted?: boolean | null
          financial_agreement_accepted_at?: string | null
          genre?: string | null
          hourly_rate?: number | null
          id?: string
          onboarding_completed?: boolean
          payout_preference?: string | null
          portfolio_links?: Json | null
          revenue_split_percentage?: number | null
          services_offered?: Json | null
          stage_name?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      order_fulfillment: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          printful_order_id: string | null
          printful_status: string | null
          purchase_id: string
          shipped_at: string | null
          shipping_address_id: string | null
          shipping_status: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          printful_order_id?: string | null
          printful_status?: string | null
          purchase_id: string
          shipped_at?: string | null
          shipping_address_id?: string | null
          shipping_status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          printful_order_id?: string | null
          printful_status?: string | null
          purchase_id?: string
          shipped_at?: string | null
          shipping_address_id?: string | null
          shipping_status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillment_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "marketplace_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillment_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string | null
          crypto_charge_code: string | null
          crypto_charge_id: string | null
          crypto_payment_data: Json | null
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
          crypto_charge_code?: string | null
          crypto_charge_id?: string | null
          crypto_payment_data?: Json | null
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
          crypto_charge_code?: string | null
          crypto_charge_id?: string | null
          crypto_payment_data?: Json | null
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
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      payout_requests: {
        Row: {
          amount: number
          engineer_id: string
          id: string
          notes: string | null
          payment_method: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          engineer_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          engineer_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_bonuses: {
        Row: {
          awarded_at: string | null
          bonus_amount: number
          bonus_type: string
          description: string | null
          engineer_id: string
          id: string
          project_id: string | null
          status: string | null
        }
        Insert: {
          awarded_at?: string | null
          bonus_amount: number
          bonus_type: string
          description?: string | null
          engineer_id: string
          id?: string
          project_id?: string | null
          status?: string | null
        }
        Update: {
          awarded_at?: string | null
          bonus_amount?: number
          bonus_type?: string
          description?: string | null
          engineer_id?: string
          id?: string
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_bonuses_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_bonuses_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_bonuses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_usage_tracking: {
        Row: {
          ai_tools_used: boolean | null
          created_at: string | null
          engineer_id: string
          id: string
          integration_bonus_earned: number | null
          platform_completion_percentage: number | null
          project_id: string | null
          remote_session_used: boolean | null
          tools_used: Json
          updated_at: string | null
        }
        Insert: {
          ai_tools_used?: boolean | null
          created_at?: string | null
          engineer_id: string
          id?: string
          integration_bonus_earned?: number | null
          platform_completion_percentage?: number | null
          project_id?: string | null
          remote_session_used?: boolean | null
          tools_used?: Json
          updated_at?: string | null
        }
        Update: {
          ai_tools_used?: boolean | null
          created_at?: string | null
          engineer_id?: string
          id?: string
          integration_bonus_earned?: number | null
          platform_completion_percentage?: number | null
          project_id?: string | null
          remote_session_used?: boolean | null
          tools_used?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_usage_tracking_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_usage_tracking_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_usage_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_submissions: {
        Row: {
          created_at: string | null
          curator_email: string | null
          id: string
          metadata: Json | null
          pitch_message: string | null
          platform: string
          playlist_curator: string | null
          playlist_name: string
          playlist_url: string | null
          release_id: string | null
          response_date: string | null
          submission_date: string | null
          submission_status: string | null
          track_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          curator_email?: string | null
          id?: string
          metadata?: Json | null
          pitch_message?: string | null
          platform: string
          playlist_curator?: string | null
          playlist_name: string
          playlist_url?: string | null
          release_id?: string | null
          response_date?: string | null
          submission_date?: string | null
          submission_status?: string | null
          track_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          curator_email?: string | null
          id?: string
          metadata?: Json | null
          pitch_message?: string | null
          platform?: string
          playlist_curator?: string | null
          playlist_name?: string
          playlist_url?: string | null
          release_id?: string | null
          response_date?: string | null
          submission_date?: string | null
          submission_status?: string | null
          track_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_submissions_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_shares: {
        Row: {
          access_count: number | null
          created_at: string | null
          created_by: string
          expires_at: string
          failed_attempts: number | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          notes: string | null
          password_hash: string
          presentation_type: string
          recipient_email: string | null
          recipient_name: string | null
          share_token: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          created_by: string
          expires_at: string
          failed_attempts?: number | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          notes?: string | null
          password_hash: string
          presentation_type?: string
          recipient_email?: string | null
          recipient_name?: string | null
          share_token: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          created_by?: string
          expires_at?: string
          failed_attempts?: number | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          notes?: string | null
          password_hash?: string
          presentation_type?: string
          recipient_email?: string | null
          recipient_name?: string | null
          share_token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_connect_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_connect_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_connect_account_id?: string | null
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
            foreignKeyName: "progress_updates_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      project_agreements: {
        Row: {
          agreement_status: string
          artist_id: string
          artist_signature_ip: string | null
          artist_signed_at: string | null
          created_at: string
          engineer_id: string | null
          engineer_signature_ip: string | null
          engineer_signed_at: string | null
          engineer_split_percent: number
          id: string
          project_id: string
          scope_of_work: string
          updated_at: string
        }
        Insert: {
          agreement_status?: string
          artist_id: string
          artist_signature_ip?: string | null
          artist_signed_at?: string | null
          created_at?: string
          engineer_id?: string | null
          engineer_signature_ip?: string | null
          engineer_signed_at?: string | null
          engineer_split_percent?: number
          id?: string
          project_id: string
          scope_of_work: string
          updated_at?: string
        }
        Update: {
          agreement_status?: string
          artist_id?: string
          artist_signature_ip?: string | null
          artist_signed_at?: string | null
          created_at?: string
          engineer_id?: string | null
          engineer_signature_ip?: string | null
          engineer_signed_at?: string | null
          engineer_split_percent?: number
          id?: string
          project_id?: string
          scope_of_work?: string
          updated_at?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          artist_id: string | null
          communication_rating: number | null
          created_at: string
          engineer_id: string | null
          id: string
          is_public: boolean | null
          project_id: string
          quality_rating: number | null
          rating: number
          review_text: string | null
          reviewed_id: string
          reviewer_id: string
          timeliness_rating: number | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          artist_id?: string | null
          communication_rating?: number | null
          created_at?: string
          engineer_id?: string | null
          id?: string
          is_public?: boolean | null
          project_id: string
          quality_rating?: number | null
          rating: number
          review_text?: string | null
          reviewed_id: string
          reviewer_id: string
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          artist_id?: string | null
          communication_rating?: number | null
          created_at?: string
          engineer_id?: string | null
          id?: string
          is_public?: boolean | null
          project_id?: string
          quality_rating?: number | null
          rating?: number
          review_text?: string | null
          reviewed_id?: string
          reviewer_id?: string
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
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
      project_templates: {
        Row: {
          checklist_items: Json | null
          created_at: string | null
          created_by: string | null
          default_budget: number | null
          estimated_duration_days: number | null
          id: string
          is_public: boolean | null
          required_files: Json | null
          service_type: string
          template_description: string | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          checklist_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_budget?: number | null
          estimated_duration_days?: number | null
          id?: string
          is_public?: boolean | null
          required_files?: Json | null
          service_type: string
          template_description?: string | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          checklist_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_budget?: number | null
          estimated_duration_days?: number | null
          id?: string
          is_public?: boolean | null
          required_files?: Json | null
          service_type?: string
          template_description?: string | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_start_date: string | null
          budget: number | null
          client_id: string
          created_at: string
          deadline: string | null
          description: string | null
          engineer_id: string | null
          estimated_completion_date: string | null
          id: string
          metadata: Json | null
          progress_percentage: number | null
          status: Database["public"]["Enums"]["project_status"]
          time_tracked_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_start_date?: string | null
          budget?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          metadata?: Json | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          time_tracked_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_start_date?: string | null
          budget?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          engineer_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          metadata?: Json | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          time_tracked_minutes?: number | null
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
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      remote_session_analytics: {
        Row: {
          client_satisfaction: number | null
          created_at: string | null
          duration_minutes: number | null
          engineer_id: string
          id: string
          session_id: string
          success_rating: number | null
          tools_used: Json | null
        }
        Insert: {
          client_satisfaction?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          engineer_id: string
          id?: string
          session_id: string
          success_rating?: number | null
          tools_used?: Json | null
        }
        Update: {
          client_satisfaction?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          engineer_id?: string
          id?: string
          session_id?: string
          success_rating?: number | null
          tools_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_session_analytics_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_session_analytics_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_session_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
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
          contraction_mrr: number | null
          created_at: string | null
          customer_acquisition_cost: number | null
          customer_lifetime_value: number | null
          expansion_mrr: number | null
          id: string
          mrr: number | null
          new_customers: number | null
          new_mrr: number | null
          period_end: string
          period_start: string
          revenue_by_geography: Json | null
          revenue_by_service: Json | null
        }
        Insert: {
          arr?: number | null
          average_revenue_per_user?: number | null
          churn_mrr?: number | null
          churn_rate?: number | null
          churned_customers?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          customer_acquisition_cost?: number | null
          customer_lifetime_value?: number | null
          expansion_mrr?: number | null
          id?: string
          mrr?: number | null
          new_customers?: number | null
          new_mrr?: number | null
          period_end: string
          period_start: string
          revenue_by_geography?: Json | null
          revenue_by_service?: Json | null
        }
        Update: {
          arr?: number | null
          average_revenue_per_user?: number | null
          churn_mrr?: number | null
          churn_rate?: number | null
          churned_customers?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          customer_acquisition_cost?: number | null
          customer_lifetime_value?: number | null
          expansion_mrr?: number | null
          id?: string
          mrr?: number | null
          new_customers?: number | null
          new_mrr?: number | null
          period_end?: string
          period_start?: string
          revenue_by_geography?: Json | null
          revenue_by_service?: Json | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
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
      saved_payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      share_link_security_logs: {
        Row: {
          alerted_at: string | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          ip_address: string
          last_attempt_at: string | null
          share_id: string | null
        }
        Insert: {
          alerted_at?: string | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          ip_address: string
          last_attempt_at?: string | null
          share_id?: string | null
        }
        Update: {
          alerted_at?: string | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          ip_address?: string
          last_attempt_at?: string | null
          share_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_link_security_logs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "presentation_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string | null
          postal_code: string
          state_province: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code: string
          state_province: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string
          state_province?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      showcase_audio_samples: {
        Row: {
          after_file_name: string
          after_file_path: string
          before_file_name: string
          before_file_path: string
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          genre: string | null
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          after_file_name: string
          after_file_path: string
          before_file_name: string
          before_file_path: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          after_file_name?: string
          after_file_path?: string
          before_file_name?: string
          before_file_path?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      streaming_connections: {
        Row: {
          analytics_data: Json | null
          artist_profile_id: string | null
          artist_profile_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          platform_name: string
          top_tracks: Json | null
          total_listeners: number | null
          total_streams: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          analytics_data?: Json | null
          artist_profile_id?: string | null
          artist_profile_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform_name: string
          top_tracks?: Json | null
          total_listeners?: number | null
          total_streams?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          analytics_data?: Json | null
          artist_profile_id?: string | null
          artist_profile_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform_name?: string
          top_tracks?: Json | null
          total_listeners?: number | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      studio_partnerships: {
        Row: {
          address: string | null
          amenities: Json | null
          availability_calendar: Json | null
          contact_email: string | null
          contact_phone: string | null
          coordinates: Json | null
          created_at: string | null
          day_rate: number | null
          equipment_list: Json | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          location_city: string
          location_country: string
          location_state: string | null
          partner_since: string | null
          photos: Json | null
          rating_average: number | null
          revenue_share_percentage: number | null
          room_types: Json | null
          studio_name: string
          studio_type: string
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          availability_calendar?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string | null
          day_rate?: number | null
          equipment_list?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_city: string
          location_country: string
          location_state?: string | null
          partner_since?: string | null
          photos?: Json | null
          rating_average?: number | null
          revenue_share_percentage?: number | null
          room_types?: Json | null
          studio_name: string
          studio_type?: string
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          availability_calendar?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string | null
          day_rate?: number | null
          equipment_list?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location_city?: string
          location_country?: string
          location_state?: string | null
          partner_since?: string | null
          photos?: Json | null
          rating_average?: number | null
          revenue_share_percentage?: number | null
          room_types?: Json | null
          studio_name?: string
          studio_type?: string
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string | null
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
            foreignKeyName: "tasks_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      time_tracking_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          is_billable: boolean | null
          project_id: string
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_billable?: boolean | null
          project_id: string
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_billable?: boolean | null
          project_id?: string
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_tracking_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string | null
          current_round: number | null
          engineer_id: string | null
          entry_status: string
          id: string
          losses: number | null
          seed_number: number | null
          submission_file_id: string | null
          submitted_at: string | null
          total_score: number | null
          tournament_id: string
          user_id: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          current_round?: number | null
          engineer_id?: string | null
          entry_status?: string
          id?: string
          losses?: number | null
          seed_number?: number | null
          submission_file_id?: string | null
          submitted_at?: string | null
          total_score?: number | null
          tournament_id: string
          user_id: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          current_round?: number | null
          engineer_id?: string | null
          entry_status?: string
          id?: string
          losses?: number | null
          seed_number?: number | null
          submission_file_id?: string | null
          submitted_at?: string | null
          total_score?: number | null
          tournament_id?: string
          user_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_submission_file_id_fkey"
            columns: ["submission_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "battle_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_distribution_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          package_id: string
          releases_used: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id: string
          releases_used?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id?: string
          releases_used?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_distribution_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "distribution_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_enrollments: {
        Row: {
          certificate_id: string | null
          certificate_issued: boolean | null
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          certificate_id?: string | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      user_integrations: {
        Row: {
          access_token_encrypted: string | null
          connection_metadata: Json | null
          connection_status: string
          created_at: string | null
          error_log: Json | null
          id: string
          last_sync_at: string | null
          provider_id: string
          refresh_token_encrypted: string | null
          sync_frequency: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connection_metadata?: Json | null
          connection_status?: string
          created_at?: string | null
          error_log?: Json | null
          id?: string
          last_sync_at?: string | null
          provider_id: string
          refresh_token_encrypted?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connection_metadata?: Json | null
          connection_status?: string
          created_at?: string | null
          error_log?: Json | null
          id?: string
          last_sync_at?: string | null
          provider_id?: string
          refresh_token_encrypted?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
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
      user_organizations: {
        Row: {
          created_at: string
          member_role: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          member_role?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          member_role?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_commands_log: {
        Row: {
          audio_file_id: string | null
          command_text: string
          command_type: string
          error_message: string | null
          executed_successfully: boolean | null
          id: string
          parameters: Json | null
          processing_time_ms: number | null
          session_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          audio_file_id?: string | null
          command_text: string
          command_type: string
          error_message?: string | null
          executed_successfully?: boolean | null
          id?: string
          parameters?: Json | null
          processing_time_ms?: number | null
          session_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          audio_file_id?: string | null
          command_text?: string
          command_type?: string
          error_message?: string | null
          executed_successfully?: boolean | null
          id?: string
          parameters?: Json | null
          processing_time_ms?: number | null
          session_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_commands_log_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_commands_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_providers: {
        Row: {
          api_endpoint: string | null
          api_key_required: boolean | null
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          pricing_model: Json | null
          provider_name: string
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          pricing_model?: Json | null
          provider_name: string
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          pricing_model?: Json | null
          provider_name?: string
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      connection_monitor: {
        Row: {
          active_connections: number | null
          idle_connections: number | null
          idle_in_transaction: number | null
          longest_idle_seconds: number | null
          total_connections: number | null
          waiting_connections: number | null
        }
        Relationships: []
      }
      database_health_monitor: {
        Row: {
          dead_row_percent: number | null
          dead_rows: number | null
          last_analyze: string | null
          last_autoanalyze: string | null
          last_autovacuum: string | null
          last_vacuum: string | null
          row_count: number | null
          schemaname: unknown | null
          size_bytes: number | null
          table_name: unknown | null
          total_size: string | null
          vacuum_status: string | null
        }
        Relationships: []
      }
      index_usage_stats: {
        Row: {
          index_size: string | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          times_used: number | null
          tuples_fetched: number | null
          tuples_read: number | null
          usage_level: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
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
          full_name?: string | null
          id?: string | null
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
          full_name?: string | null
          id?: string | null
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      calculate_bonus_from_rating: {
        Args: { p_base_amount: number; p_project_id: string }
        Returns: number
      }
      calculate_monthly_awards: {
        Args: { p_month: number; p_year: number }
        Returns: undefined
      }
      check_and_award_badges: {
        Args: { p_engineer_id: string }
        Returns: undefined
      }
      cleanup_old_audit_logs: {
        Args: { days_to_keep?: number }
        Returns: {
          deleted_count: number
          newest_deleted: string
          oldest_deleted: string
        }[]
      }
      cleanup_old_chatbot_messages: {
        Args: { days_to_keep?: number }
        Returns: {
          deleted_count: number
          newest_deleted: string
          oldest_deleted: string
        }[]
      }
      cleanup_old_notifications: {
        Args: { days_to_keep?: number }
        Returns: {
          deleted_count: number
          newest_deleted: string
          oldest_deleted: string
        }[]
      }
      create_admin_alert: {
        Args: {
          p_alert_type: string
          p_message: string
          p_metadata?: Json
          p_severity: string
          p_title: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_related_id?: string
          p_related_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_community_milestones_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          contributor_count: number
          current_value: number
          feature_key: string
          is_unlocked: boolean
          milestone_description: string
          milestone_name: string
          progress_percentage: number
          target_value: number
          unlocked_at: string
        }[]
      }
      has_distribution_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_mastering_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_mixing_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_session_host: {
        Args: { session_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_session_participant: {
        Args: { session_uuid: string; user_uuid: string }
        Returns: boolean
      }
      run_maintenance_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: {
          execution_time_ms: number
          records_deleted: number
          status: string
          task_name: string
        }[]
      }
      update_achievement_progress: {
        Args: {
          p_achievement_type: string
          p_increment?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_engineer_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_engineer_streak: {
        Args: { p_engineer_id: string }
        Returns: undefined
      }
      update_milestone_progress: {
        Args: {
          p_feature_key: string
          p_increment?: number
          p_reason?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      update_revenue_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      badge_rarity: "common" | "rare" | "epic" | "legendary"
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
      badge_rarity: ["common", "rare", "epic", "legendary"],
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
