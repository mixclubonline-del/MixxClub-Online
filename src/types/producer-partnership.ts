/**
 * Producer↔Artist Partnership Types
 * Extends the base partnership model to support producer collaborations,
 * track releases, and beat royalty tracking.
 */

export type ProducerPartnershipStatus = 'proposed' | 'negotiating' | 'accepted' | 'active' | 'paused' | 'completed' | 'dissolved';
export type TrackReleaseStatus = 'unreleased' | 'pending' | 'released' | 'archived';
export type RoyaltyStatus = 'pending' | 'processed' | 'paid';
export type StreamingPlatform = 'spotify' | 'apple_music' | 'youtube' | 'tidal' | 'amazon_music' | 'deezer' | 'soundcloud' | 'other';

/**
 * Producer Partnership (Producer↔Artist collaboration)
 */
export interface ProducerPartnership {
  id: string;
  producer_id: string;
  artist_id: string;
  beat_id?: string;
  partnership_type: 'producer_artist';
  status: ProducerPartnershipStatus;
  producer_percentage: number;
  artist_percentage: number;
  total_revenue: number;
  producer_earnings: number;
  artist_earnings: number;
  created_at: string;
  accepted_at?: string;
  notes?: string;
  // Joined relations
  producer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  artist?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  beat?: {
    id: string;
    title: string;
    cover_art_url?: string;
    audio_url?: string;
  };
}

/**
 * Track Release - A song created using a licensed beat
 */
export interface TrackRelease {
  id: string;
  partnership_id: string;
  beat_id?: string;
  track_title: string;
  artist_name?: string;
  release_date?: string;
  streaming_platforms: Record<StreamingPlatform, string>;
  isrc_code?: string;
  upc_code?: string;
  cover_art_url?: string;
  status: TrackReleaseStatus;
  total_streams: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  partnership?: ProducerPartnership;
  beat?: {
    id: string;
    title: string;
    cover_art_url?: string;
  };
}

/**
 * Beat Royalty - Revenue from streaming a released track
 */
export interface BeatRoyalty {
  id: string;
  partnership_id: string;
  track_release_id?: string;
  beat_id?: string;
  period_start: string;
  period_end: string;
  platform?: StreamingPlatform;
  stream_count: number;
  gross_revenue: number;
  producer_amount: number;
  artist_amount: number;
  platform_fee: number;
  producer_percentage: number;
  artist_percentage: number;
  status: RoyaltyStatus;
  paid_at?: string;
  created_at: string;
  // Joined relations
  track_release?: TrackRelease;
  partnership?: ProducerPartnership;
}

/**
 * Royalty Summary for dashboard display
 */
export interface RoyaltySummary {
  totalRoyalties: number;
  thisMonthRoyalties: number;
  lastMonthRoyalties: number;
  pendingPayouts: number;
  totalStreams: number;
  topPerformingTracks: TrackRelease[];
  royaltiesByPlatform: {
    platform: StreamingPlatform;
    amount: number;
    streams: number;
  }[];
  monthlyTrend: {
    month: string;
    revenue: number;
    streams: number;
  }[];
}

/**
 * Collaboration Request (Artist requesting to use a beat)
 */
export interface CollabRequest {
  id: string;
  producer_id: string;
  artist_id: string;
  beat_id: string;
  proposed_producer_percentage: number;
  proposed_artist_percentage: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'negotiating';
  created_at: string;
  responded_at?: string;
  // Joined
  artist?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  beat?: {
    id: string;
    title: string;
    cover_art_url?: string;
    price_cents: number;
  };
}

/**
 * Input types for creating/updating
 */
export interface CreateProducerPartnershipInput {
  artist_id: string;
  beat_id?: string;
  producer_percentage: number;
  notes?: string;
}

export interface CreateTrackReleaseInput {
  partnership_id: string;
  beat_id?: string;
  track_title: string;
  artist_name?: string;
  release_date?: string;
  streaming_platforms?: Record<string, string>;
  isrc_code?: string;
  upc_code?: string;
  cover_art_url?: string;
  status?: TrackReleaseStatus;
}

export interface RecordRoyaltyInput {
  partnership_id: string;
  track_release_id?: string;
  beat_id?: string;
  period_start: string;
  period_end: string;
  platform?: StreamingPlatform;
  stream_count?: number;
  gross_revenue: number;
}
