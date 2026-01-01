import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hubEventBus, HubEventType, HubEvent } from '@/lib/hubEventBus';
import { supabase } from '@/integrations/supabase/client';

export type HubType = 'dashboard' | 'clients' | 'projects' | 'opportunities' | 'sessions' | 'revenue' | 'community' | 'growth';

interface CrossHubStats {
  totalClients: number;
  activeDeals: number;
  activeProjects: number;
  pendingMilestones: number;
  unreadMessages: number;
  recentActivities: number;
}

interface HubDataContextValue {
  currentHub: HubType;
  setCurrentHub: (hub: HubType) => void;
  userRole: 'artist' | 'engineer' | null;
  crossHubStats: CrossHubStats;
  refreshStats: () => Promise<void>;
  isLoading: boolean;
  publishEvent: <T = unknown>(type: HubEventType, payload: T) => void;
  recentEvents: HubEvent[];
}

const HubDataContext = createContext<HubDataContextValue | undefined>(undefined);

export function HubDataProvider({ children, userRole }: { children: React.ReactNode; userRole: 'artist' | 'engineer' | null }) {
  const { user } = useAuth();
  const [currentHub, setCurrentHub] = useState<HubType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<HubEvent[]>([]);
  const [crossHubStats, setCrossHubStats] = useState<CrossHubStats>({
    totalClients: 0,
    activeDeals: 0,
    activeProjects: 0,
    pendingMilestones: 0,
    unreadMessages: 0,
    recentActivities: 0,
  });

  // Fetch cross-hub statistics
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      // Fetch all stats in parallel
      const [clientsRes, dealsRes, projectsRes, milestonesRes, messagesRes] = await Promise.all([
        supabase.from('crm_clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('crm_deals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('stage', 'in', '("won","lost")'),
        supabase.from('collaborative_projects').select('id', { count: 'exact', head: true }).not('status', 'eq', 'completed'),
        supabase.from('project_milestones').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('direct_messages').select('id', { count: 'exact', head: true }).eq('recipient_id', user.id).is('read_at', null),
      ]);

      setCrossHubStats({
        totalClients: clientsRes.count || 0,
        activeDeals: dealsRes.count || 0,
        activeProjects: projectsRes.count || 0,
        pendingMilestones: milestonesRes.count || 0,
        unreadMessages: messagesRes.count || 0,
        recentActivities: 0, // Will be calculated from event history
      });
    } catch (error) {
      console.error('Failed to fetch cross-hub stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Subscribe to all hub events
  useEffect(() => {
    const unsubscribe = hubEventBus.subscribe('*', (event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 49)]);
      
      // Auto-refresh stats on certain events
      const refreshTriggers: HubEventType[] = [
        'client:created', 'client:deleted',
        'deal:created', 'deal:won', 'deal:lost',
        'project:created', 'project:completed',
        'milestone:completed',
        'message:received',
      ];
      
      if (refreshTriggers.includes(event.type)) {
        refreshStats();
      }
    });

    return unsubscribe;
  }, [refreshStats]);

  // Publish event helper
  const publishEvent = useCallback(<T = unknown>(type: HubEventType, payload: T) => {
    hubEventBus.publish(type, payload, currentHub);
  }, [currentHub]);

  // Track hub navigation
  const handleSetCurrentHub = useCallback((hub: HubType) => {
    setCurrentHub(hub);
    hubEventBus.publish('navigation:hub_changed', { from: currentHub, to: hub }, 'navigation');
  }, [currentHub]);

  const value = useMemo(() => ({
    currentHub,
    setCurrentHub: handleSetCurrentHub,
    userRole,
    crossHubStats,
    refreshStats,
    isLoading,
    publishEvent,
    recentEvents,
  }), [currentHub, handleSetCurrentHub, userRole, crossHubStats, refreshStats, isLoading, publishEvent, recentEvents]);

  return (
    <HubDataContext.Provider value={value}>
      {children}
    </HubDataContext.Provider>
  );
}

export function useHubData() {
  const context = useContext(HubDataContext);
  if (context === undefined) {
    throw new Error('useHubData must be used within a HubDataProvider');
  }
  return context;
}
