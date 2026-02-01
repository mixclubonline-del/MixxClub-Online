// useFlow Hook - React interface to Prime Fabric Flow System
// This is the ONLY way UI components should initiate navigation

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore, FlowUserContext } from './flowStore';
import { resolveIntent, executeSideEffects, ResolvedRoute } from './flowResolver';
import { FlowIntentType, FlowPayload, FlowPriority, FlowIntent, DISTRICT_ROUTES } from './flowIntents';
import { useAuth } from '@/hooks/useAuth';

export interface UseFlowReturn {
  // Primary navigation method - THE way to navigate
  setIntent: <T extends FlowPayload>(
    type: FlowIntentType,
    payload?: T,
    options?: { priority?: FlowPriority; source?: string }
  ) => void;
  
  // State
  currentIntent: FlowIntent | null;
  pendingIntent: FlowIntent | null;
  flowState: 'idle' | 'resolving' | 'transitioning' | 'blocked';
  isBlocked: boolean;
  blockingReason: string | null;
  userContext: FlowUserContext;
  intentHistory: FlowIntent[];
  
  // Utilities
  canNavigateTo: (districtId: string) => boolean;
  unblock: () => void;
}

/**
 * Main Flow hook - provides the setIntent API for navigation
 */
export function useFlow(): UseFlowReturn {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const currentIntent = useFlowStore((s) => s.currentIntent);
  const pendingIntent = useFlowStore((s) => s.pendingIntent);
  const flowState = useFlowStore((s) => s.flowState);
  const blockingReason = useFlowStore((s) => s.blockingReason);
  const userContext = useFlowStore((s) => s.userContext);
  const intentHistory = useFlowStore((s) => s.intentHistory);
  const storeSetIntent = useFlowStore((s) => s.setIntent);
  const updateUserContext = useFlowStore((s) => s.updateUserContext);
  const setNavigateFn = useFlowStore((s) => s.setNavigateFn);
  const resolveAndNavigate = useFlowStore((s) => s.resolveAndNavigate);
  const blockFlow = useFlowStore((s) => s.blockFlow);
  const unblockFlow = useFlowStore((s) => s.unblockFlow);

  // Inject navigate function into store
  useEffect(() => {
    setNavigateFn(navigate);
  }, [navigate, setNavigateFn]);

  // Sync auth context
  useEffect(() => {
    updateUserContext({
      isAuthenticated: !!user,
      role: userRole as 'artist' | 'engineer' | null,
    });
  }, [user, userRole, updateUserContext]);

  // The primary setIntent function
  const setIntent = useCallback(<T extends FlowPayload>(
    type: FlowIntentType,
    payload?: T,
    options?: { priority?: FlowPriority; source?: string }
  ) => {
    const { priority = 'normal', source = 'useFlow' } = options || {};
    
    // Create and set the intent
    storeSetIntent(type, payload || ({} as T), source, priority);
    
    // Get current context for resolution
    const currentContext = useFlowStore.getState().userContext;
    
    // Create a temporary intent for resolution
    const tempIntent = {
      type,
      payload: payload || {},
      source,
      priority,
      timestamp: Date.now(),
      id: `temp_${Date.now()}`,
    };
    
    // Resolve the intent
    const result = resolveIntent(tempIntent, currentContext);
    
    if (result.blocked) {
      // Block and optionally redirect
      blockFlow(result.reason);
      if (result.redirect) {
        navigate(result.redirect);
      }
    } else {
      // TypeScript narrowing: result is now ResolvedRoute
      const resolved = result as ResolvedRoute;
      // Execute side effects first
      executeSideEffects(resolved);
      // Then navigate
      resolveAndNavigate(resolved.route);
    }
  }, [storeSetIntent, blockFlow, resolveAndNavigate, navigate]);

  // Check if user can navigate to a district
  const canNavigateTo = useCallback((districtId: string): boolean => {
    if (!DISTRICT_ROUTES[districtId]) {
      return false;
    }
    // Currently all districts are accessible if authenticated
    // Future: add role-based or feature-flag checks here
    return userContext.isAuthenticated;
  }, [userContext.isAuthenticated]);

  return {
    setIntent,
    currentIntent,
    pendingIntent,
    flowState,
    isBlocked: flowState === 'blocked',
    blockingReason,
    userContext,
    intentHistory,
    canNavigateTo,
    unblock: unblockFlow,
  };
}

// Convenience hooks for specific use cases
export function useFlowNavigation() {
  const { setIntent } = useFlow();
  
  return {
    // District navigation
    goToDistrict: (districtId: string) => 
      setIntent('ENTER_DISTRICT', { districtId }),
    
    goToCity: (role: 'artist' | 'engineer') => 
      setIntent('ENTER_CITY', { role }),
    
    exitToGate: () => 
      setIntent('EXIT_TO_GATE', {}),
    
    goBack: () => 
      setIntent('GO_BACK', {}),
    
    // Auth
    goToAuth: (mode: 'login' | 'signup' = 'login', redirectAfter?: string) => 
      setIntent('AUTHENTICATE', { mode, redirectAfter }),
    
    completeAuth: (destination?: string, role?: 'artist' | 'engineer') =>
      setIntent('COMPLETE_AUTH', { destination, role }),
    
    // CRM portals
    openArtistCRM: (tab?: string, contact?: string) =>
      setIntent('OPEN_CRM', { role: 'artist', tab, contact }),
    
    openEngineerCRM: (tab?: string, contact?: string) =>
      setIntent('OPEN_CRM', { role: 'engineer', tab, contact }),
    
    // Studio
    openStudio: (projectId?: string) =>
      setIntent('OPEN_STUDIO', { projectId }),
    
    openMastering: () =>
      setIntent('OPEN_STUDIO', { mode: 'mastering' }),
    
    // Browse
    openPricing: () => setIntent('OPEN_PRICING', {}),
    openMarketplace: () => setIntent('OPEN_MARKETPLACE', {}),
    openProfile: () => setIntent('OPEN_PROFILE', {}),
    openSettings: () => setIntent('OPEN_SETTINGS', {}),
    
    // Section browsing
    browseSection: (section: 'how-it-works' | 'about' | 'pricing' | 'faq' | 'careers' | 'contact' | 'legal') =>
      setIntent('BROWSE_SECTION', { section }),
    
    // View specific items
    viewProject: (projectId: string) =>
      setIntent('VIEW_PROJECT', { projectId }),
    
    viewEngineer: (engineerId: string) =>
      setIntent('VIEW_ENGINEER', { engineerId }),
    
    viewStore: (slug: string) =>
      setIntent('VIEW_STORE', { slug }),
    
    // Generic navigation (THE UNIVERSAL FALLBACK)
    // Use this when no semantic intent exists
    navigateTo: (path: string, replace?: boolean) =>
      setIntent('NAVIGATE_TO', { path, replace }),
    
    // Deep links (for external URLs, share links)
    deepLink: (path: string, params?: Record<string, string>) =>
      setIntent('DEEP_LINK', { path, params }),
  };
}

// Export the store for direct access when needed
export { useFlowStore } from './flowStore';
