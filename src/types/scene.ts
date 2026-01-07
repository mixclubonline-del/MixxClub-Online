/**
 * Scene System Types
 * 
 * Platform-agnostic world state definitions.
 * These types define WHAT the world contains, not HOW it renders.
 */

// ============================================
// STUDIO ROOM TYPES
// ============================================

export type StudioRoomState = 
  | 'idle'       // Room exists, no active session
  | 'waiting'    // Session created, waiting for participants
  | 'active'     // Session in progress
  | 'recording'  // Actively recording
  | 'mixing'     // Mixing/editing in progress
  | 'playback';  // Playing back audio

export interface StudioRoom {
  id: string;
  sessionId: string | null;
  title: string;
  state: StudioRoomState;
  hostId: string | null;
  hostName: string | null;
  hostAvatar: string | null;
  participantCount: number;
  maxParticipants: number;
  visibility: 'public' | 'private' | 'invite_only';
  genre: string | null;
  audioQuality: string | null;
  createdAt: string;
  activityLevel: number; // 0-100, based on recent activity
}

// ============================================
// COMMUNITY PULSE TYPES
// ============================================

export type UnlockableType = 
  | 'feature'      // Platform feature unlock
  | 'wing'         // New area/section of the complex
  | 'celebration'  // Community milestone celebration
  | 'tool';        // New tool/capability

export interface CommunityUnlockable {
  id: string;
  name: string;
  description: string | null;
  thresholdType: 'users' | 'sessions' | 'tracks' | 'projects' | 'earnings';
  thresholdValue: number;
  currentValue: number;
  progress: number; // 0-100
  isUnlocked: boolean;
  unlockedAt: string | null;
  unlockOrder: number;
  visualAssetId: string | null;
  unlockableType: UnlockableType;
}

export interface CommunityPulse {
  totalUsers: number;
  totalSessions: number;
  totalProjects: number;
  activeSessionsCount: number;
  activeUsersNow: number; // Estimated based on recent activity
  unlockables: CommunityUnlockable[];
  nextUnlock: CommunityUnlockable | null;
}

// ============================================
// FEATURED SESSION TYPES
// ============================================

export interface FeaturedSession {
  room: StudioRoom;
  spotlightedAt: string;
  rotationIndex: number;
}

// ============================================
// WORLD STATE
// ============================================

export interface WorldState {
  // Core data
  studios: StudioRoom[];
  communityPulse: CommunityPulse;
  featuredSession: FeaturedSession | null;
  
  // Connection state
  isConnected: boolean;
  lastSyncAt: string | null;
  
  // Derived state
  activeStudios: StudioRoom[];
  emptyStudios: StudioRoom[];
  publicStudios: StudioRoom[];
}

// ============================================
// SCENE EVENTS
// ============================================

export type SceneEventType = 
  | 'session_started'
  | 'session_ended'
  | 'participant_joined'
  | 'participant_left'
  | 'recording_started'
  | 'recording_stopped'
  | 'unlock_achieved'
  | 'milestone_reached';

export interface SceneEvent {
  id: string;
  type: SceneEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============================================
// RENDERER INTERFACE
// ============================================

/**
 * Any renderer (2D, 3D, native) must implement this interface.
 * This ensures the scene system can swap renderers without changing logic.
 */
export interface SceneRenderer {
  render(state: WorldState): void;
  handleEvent(event: SceneEvent): void;
  dispose(): void;
}
