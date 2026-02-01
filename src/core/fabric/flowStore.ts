// Flow Store - Zustand state management for Prime Fabric navigation
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FlowIntent, FlowPayload, createIntent, FlowIntentType, FlowPriority } from './flowIntents';
import { hubEventBus } from '@/lib/hubEventBus';

// User context for guards
export interface FlowUserContext {
  role: 'artist' | 'engineer' | null;
  isAuthenticated: boolean;
  lastDistrict: string | null;
}

// Flow states
export type FlowStateType = 'idle' | 'resolving' | 'transitioning' | 'blocked';

// Blocking reasons
export type FlowBlockReason = 
  | 'auth_required' 
  | 'role_mismatch' 
  | 'permission_denied' 
  | 'invalid_intent'
  | 'network_error';

// Store shape
export interface FlowStoreState {
  // Current state
  currentIntent: FlowIntent | null;
  pendingIntent: FlowIntent | null;
  intentHistory: FlowIntent[];
  resolvedRoute: string | null;
  flowState: FlowStateType;
  blockingReason: FlowBlockReason | null;
  userContext: FlowUserContext;
  
  // Navigation function (injected by FlowProvider)
  navigateFn: ((path: string) => void) | null;
}

export interface FlowStoreActions {
  // Intent management
  setIntent: <T extends FlowPayload>(
    type: FlowIntentType,
    payload: T,
    source?: string,
    priority?: FlowPriority
  ) => void;
  clearIntent: () => void;
  
  // Flow control
  blockFlow: (reason: FlowBlockReason) => void;
  unblockFlow: () => void;
  startTransition: () => void;
  endTransition: () => void;
  
  // Context management
  updateUserContext: (ctx: Partial<FlowUserContext>) => void;
  setNavigateFn: (fn: (path: string) => void) => void;
  
  // Resolution
  resolveAndNavigate: (route: string) => void;
}

export type FlowStore = FlowStoreState & FlowStoreActions;

const MAX_HISTORY_SIZE = 50;

export const useFlowStore = create<FlowStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentIntent: null,
    pendingIntent: null,
    intentHistory: [],
    resolvedRoute: null,
    flowState: 'idle',
    blockingReason: null,
    userContext: {
      role: null,
      isAuthenticated: false,
      lastDistrict: null,
    },
    navigateFn: null,
    
    // Set a navigation intent
    setIntent: (type, payload, source = 'unknown', priority = 'normal') => {
      const intent = createIntent(type, payload, source, priority);
      
      // Publish intent set event
      hubEventBus.publish('flow:intent_set', {
        type: intent.type,
        payload: intent.payload,
        source: intent.source,
        id: intent.id,
      }, 'flowStore');
      
      set({
        pendingIntent: intent,
        flowState: 'resolving',
        blockingReason: null,
      });
    },
    
    // Clear pending intent
    clearIntent: () => {
      set({
        pendingIntent: null,
        flowState: 'idle',
        blockingReason: null,
      });
    },
    
    // Block flow with reason
    blockFlow: (reason) => {
      const { pendingIntent } = get();
      
      // Publish blocked event
      hubEventBus.publish('flow:intent_blocked', {
        intent: pendingIntent,
        reason,
      }, 'flowStore');
      
      set({
        flowState: 'blocked',
        blockingReason: reason,
      });
    },
    
    // Unblock and resume
    unblockFlow: () => {
      set({
        flowState: 'idle',
        blockingReason: null,
      });
    },
    
    // Start transition animation
    startTransition: () => {
      const { pendingIntent } = get();
      
      hubEventBus.publish('flow:transition_started', {
        intent: pendingIntent,
      }, 'flowStore');
      
      set({ flowState: 'transitioning' });
    },
    
    // End transition
    endTransition: () => {
      const { pendingIntent, intentHistory } = get();
      
      hubEventBus.publish('flow:transition_completed', {
        intent: pendingIntent,
      }, 'flowStore');
      
      // Move pending to current, add to history
      if (pendingIntent) {
        set({
          currentIntent: pendingIntent,
          pendingIntent: null,
          flowState: 'idle',
          intentHistory: [
            pendingIntent,
            ...intentHistory.slice(0, MAX_HISTORY_SIZE - 1),
          ],
        });
      } else {
        set({ flowState: 'idle' });
      }
    },
    
    // Update user context
    updateUserContext: (ctx) => {
      set((state) => ({
        userContext: { ...state.userContext, ...ctx },
      }));
    },
    
    // Set navigation function (from FlowProvider)
    setNavigateFn: (fn) => {
      set({ navigateFn: fn });
    },
    
    // Resolve intent and navigate
    resolveAndNavigate: (route) => {
      const { navigateFn, pendingIntent, userContext } = get();
      
      // Publish resolved event
      hubEventBus.publish('flow:intent_resolved', {
        intent: pendingIntent,
        route,
      }, 'flowStore');
      
      // Update last district if navigating to one
      if (route.startsWith('/city/')) {
        const districtId = route.split('/')[2];
        set((state) => ({
          userContext: { ...state.userContext, lastDistrict: districtId },
          resolvedRoute: route,
        }));
      } else {
        set({ resolvedRoute: route });
      }
      
      // Start transition
      get().startTransition();
      
      // Navigate after brief delay for animation
      setTimeout(() => {
        if (navigateFn) {
          navigateFn(route);
        }
        get().endTransition();
      }, 100);
    },
  }))
);

// Selector hooks for optimized re-renders
export const useFlowState = () => useFlowStore((s) => s.flowState);
export const useFlowBlocked = () => useFlowStore((s) => s.flowState === 'blocked');
export const useBlockingReason = () => useFlowStore((s) => s.blockingReason);
export const useFlowUserContext = () => useFlowStore((s) => s.userContext);
export const useCurrentIntent = () => useFlowStore((s) => s.currentIntent);
export const usePendingIntent = () => useFlowStore((s) => s.pendingIntent);
