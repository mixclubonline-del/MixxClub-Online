/**
 * Scene State Store
 * 
 * Zustand store for platform-agnostic world state.
 * Connects to Supabase realtime for live data.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { 
  WorldState, 
  StudioRoom, 
  StudioRoomState,
  CommunityPulse, 
  CommunityUnlockable,
  FeaturedSession,
  SceneEvent
} from '@/types/scene';

// ============================================
// STORE INTERFACE
// ============================================

interface SceneStore {
  // State
  studios: StudioRoom[];
  communityPulse: CommunityPulse;
  featuredSession: FeaturedSession | null;
  isConnected: boolean;
  lastSyncAt: string | null;
  recentEvents: SceneEvent[];
  
  // Actions
  initialize: () => Promise<void>;
  cleanup: () => void;
  
  // Studio actions
  updateStudio: (studioId: string, updates: Partial<StudioRoom>) => void;
  setStudios: (studios: StudioRoom[]) => void;
  
  // Community actions
  updateCommunityPulse: (pulse: Partial<CommunityPulse>) => void;
  
  // Featured session actions
  setFeaturedSession: (session: FeaturedSession | null) => void;
  rotateFeaturedSession: () => void;
  
  // Event handling
  publishEvent: (event: Omit<SceneEvent, 'id' | 'timestamp'>) => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialCommunityPulse: CommunityPulse = {
  totalUsers: 0,
  totalSessions: 0,
  totalProjects: 0,
  activeSessionsCount: 0,
  activeUsersNow: 0,
  unlockables: [],
  nextUnlock: null,
};

const initialState: Omit<WorldState, 'activeStudios' | 'emptyStudios' | 'publicStudios'> = {
  studios: [],
  communityPulse: initialCommunityPulse,
  featuredSession: null,
  isConnected: false,
  lastSyncAt: null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapSessionToStudio(session: any): StudioRoom {
  const sessionState = session.session_state as Record<string, unknown> | null;
  
  let state: StudioRoomState = 'idle';
  if (session.status === 'active') {
    if (sessionState?.recording) state = 'recording';
    else if (sessionState?.mixing) state = 'mixing';
    else if (sessionState?.playback) state = 'playback';
    else state = 'active';
  } else if (session.status === 'scheduled') {
    state = 'waiting';
  }
  
  return {
    id: session.id,
    sessionId: session.id,
    title: session.title || session.session_name || 'Untitled Session',
    state,
    hostId: session.host_user_id,
    hostName: null, // Will be enriched separately
    hostAvatar: null,
    participantCount: 1, // At minimum, the host
    maxParticipants: session.max_participants || 10,
    visibility: session.visibility || 'public',
    genre: null, // From session metadata if available
    audioQuality: session.audio_quality || 'high',
    createdAt: session.created_at,
    activityLevel: state === 'recording' ? 100 : state === 'active' ? 75 : 25,
  };
}

// ============================================
// STORE CREATION
// ============================================

let sessionsChannel: ReturnType<typeof supabase.channel> | null = null;
let featuredRotationInterval: NodeJS.Timeout | null = null;

export const useSceneStore = create<SceneStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,
    recentEvents: [],
    
    // Note: Derived state is computed via selectors, not getters
    // Using getters in Zustand with subscribeWithSelector causes issues
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    initialize: async () => {
      try {
        // Fetch initial data in parallel
        const [sessionsResult, profilesCount, projectsCount] = await Promise.all([
          supabase
            .from('collaboration_sessions')
            .select('*')
            .in('status', ['active', 'scheduled']),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('projects')
            .select('id', { count: 'exact', head: true }),
        ]);
        
        const sessions = sessionsResult.data || [];
        const studios = sessions.map(mapSessionToStudio);
        
        // Calculate active sessions
        const activeSessionsCount = studios.filter(s => s.state !== 'idle' && s.state !== 'waiting').length;
        
        set({
          studios,
          communityPulse: {
            ...get().communityPulse,
            totalUsers: profilesCount.count || 0,
            totalSessions: sessions.length,
            totalProjects: projectsCount.count || 0,
            activeSessionsCount,
            activeUsersNow: Math.max(1, Math.floor(activeSessionsCount * 2.5)), // Estimate
          },
          isConnected: true,
          lastSyncAt: new Date().toISOString(),
        });
        
        // Set up realtime subscription
        sessionsChannel = supabase
          .channel('scene-sessions')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'collaboration_sessions',
            },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;
              
              if (eventType === 'INSERT' && newRecord) {
                const newStudio = mapSessionToStudio(newRecord);
                set(state => ({
                  studios: [...state.studios, newStudio],
                  communityPulse: {
                    ...state.communityPulse,
                    totalSessions: state.communityPulse.totalSessions + 1,
                    activeSessionsCount: state.communityPulse.activeSessionsCount + 
                      (newStudio.state !== 'idle' ? 1 : 0),
                  },
                }));
                get().publishEvent({ type: 'session_started', data: { studio: newStudio } });
              }
              
              if (eventType === 'UPDATE' && newRecord) {
                const updatedStudio = mapSessionToStudio(newRecord);
                set(state => ({
                  studios: state.studios.map(s => 
                    s.id === updatedStudio.id ? updatedStudio : s
                  ),
                }));
              }
              
              if (eventType === 'DELETE' && oldRecord) {
                set(state => ({
                  studios: state.studios.filter(s => s.id !== oldRecord.id),
                  communityPulse: {
                    ...state.communityPulse,
                    activeSessionsCount: Math.max(0, state.communityPulse.activeSessionsCount - 1),
                  },
                }));
                get().publishEvent({ type: 'session_ended', data: { sessionId: oldRecord.id } });
              }
            }
          )
          .subscribe();
        
        // Start featured session rotation
        get().rotateFeaturedSession();
        featuredRotationInterval = setInterval(() => {
          get().rotateFeaturedSession();
        }, 45000); // Rotate every 45 seconds
        
      } catch (error) {
        console.error('Failed to initialize scene store:', error);
        set({ isConnected: false });
      }
    },
    
    cleanup: () => {
      if (sessionsChannel) {
        supabase.removeChannel(sessionsChannel);
        sessionsChannel = null;
      }
      if (featuredRotationInterval) {
        clearInterval(featuredRotationInterval);
        featuredRotationInterval = null;
      }
      set({ isConnected: false });
    },
    
    // ========================================
    // STUDIO ACTIONS
    // ========================================
    
    updateStudio: (studioId, updates) => {
      set(state => ({
        studios: state.studios.map(s =>
          s.id === studioId ? { ...s, ...updates } : s
        ),
      }));
    },
    
    setStudios: (studios) => {
      set({ studios });
    },
    
    // ========================================
    // COMMUNITY ACTIONS
    // ========================================
    
    updateCommunityPulse: (pulse) => {
      set(state => ({
        communityPulse: { ...state.communityPulse, ...pulse },
      }));
    },
    
    // ========================================
    // FEATURED SESSION ACTIONS
    // ========================================
    
    setFeaturedSession: (session) => {
      set({ featuredSession: session });
    },
    
    rotateFeaturedSession: () => {
      const { studios, featuredSession } = get();
      const publicActive = studios.filter(
        s => s.visibility === 'public' && s.state !== 'idle'
      );
      
      if (publicActive.length === 0) {
        set({ featuredSession: null });
        return;
      }
      
      // Find next session in rotation
      const currentIndex = featuredSession?.rotationIndex ?? -1;
      const nextIndex = (currentIndex + 1) % publicActive.length;
      const nextRoom = publicActive[nextIndex];
      
      set({
        featuredSession: {
          room: nextRoom,
          spotlightedAt: new Date().toISOString(),
          rotationIndex: nextIndex,
        },
      });
    },
    
    // ========================================
    // EVENT HANDLING
    // ========================================
    
    publishEvent: (event) => {
      const fullEvent: SceneEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      
      set(state => ({
        recentEvents: [fullEvent, ...state.recentEvents.slice(0, 49)], // Keep last 50
      }));
    },
  }))
);

// ============================================
// MEMOIZED SELECTORS (stable references to prevent infinite loops)
// ============================================

// Cache for selectActiveStudios
let _activeStudiosCache: StudioRoom[] = [];
let _activeStudiosSource: StudioRoom[] | null = null;

export const selectActiveStudios = (state: SceneStore): StudioRoom[] => {
  // Return cached result if source array reference unchanged
  if (state.studios === _activeStudiosSource) {
    return _activeStudiosCache;
  }
  _activeStudiosSource = state.studios;
  _activeStudiosCache = state.studios.filter(s => s.state !== 'idle');
  return _activeStudiosCache;
};

// Cache for selectPublicStudios
let _publicStudiosCache: StudioRoom[] = [];
let _publicStudiosSource: StudioRoom[] | null = null;

export const selectPublicStudios = (state: SceneStore): StudioRoom[] => {
  if (state.studios === _publicStudiosSource) {
    return _publicStudiosCache;
  }
  _publicStudiosSource = state.studios;
  _publicStudiosCache = state.studios.filter(s => s.visibility === 'public');
  return _publicStudiosCache;
};

// Cache for selectCommunityProgress
type CommunityProgressResult = { name: string; progress: number; remaining: number } | null;
let _communityProgressCache: CommunityProgressResult = null;
let _communityProgressSource: CommunityUnlockable | null | undefined = undefined;

export const selectCommunityProgress = (state: SceneStore): CommunityProgressResult => {
  const nextUnlock = state.communityPulse.nextUnlock;
  
  // Return cached result if nextUnlock reference unchanged
  if (nextUnlock === _communityProgressSource) {
    return _communityProgressCache;
  }
  _communityProgressSource = nextUnlock;
  
  if (!nextUnlock) {
    _communityProgressCache = null;
    return null;
  }
  
  _communityProgressCache = {
    name: nextUnlock.name,
    progress: nextUnlock.progress,
    remaining: nextUnlock.thresholdValue - nextUnlock.currentValue,
  };
  return _communityProgressCache;
};
