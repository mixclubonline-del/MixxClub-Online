import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  PuttinInMetrics,
  PuttinInScore,
  DEPTH_LAYERS,
  getLayerFromScore,
  getNextLayer,
} from '@/types/depth';

const CACHE_KEY = 'mixxclub:puttin-in-score';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedScore {
  metrics: PuttinInMetrics;
  timestamp: number;
  userId: string;
}

/**
 * Read cached score from localStorage (fast mount)
 */
function readCache(userId: string): PuttinInMetrics | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedScore = JSON.parse(raw);
    if (cached.userId !== userId) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached.metrics;
  } catch {
    return null;
  }
}

function writeCache(userId: string, metrics: PuttinInMetrics): void {
  try {
    const entry: CachedScore = { metrics, timestamp: Date.now(), userId };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { }
}

/**
 * usePuttinIn - Track the five pillars of community investment
 * 
 * Time: Hours in the building (page views → approximate hours)
 * Attention: What you follow, watch, engage with (matches, follows)
 * Support: Day 1 status, backing artists early (achievements)
 * Work: What you create and contribute (sessions, projects, deliverables)
 * Love: Community standing, the intangibles (unlocks contributed to)
 * 
 * Reads from real Supabase data, caches in localStorage for fast remount.
 */
export function usePuttinIn() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PuttinInMetrics>({
    time: 0,
    attention: 0,
    support: 0,
    work: 0,
    love: 0,
  });
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Fetch real metrics from Supabase
  useEffect(() => {
    if (!user) {
      setMetrics({ time: 0, attention: 0, support: 0, work: 0, love: 0 });
      setLoading(false);
      fetchedRef.current = false;
      return;
    }

    // Prevent double-fetch in strict mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Instant mount from cache
    const cached = readCache(user.id);
    if (cached) {
      setMetrics(cached);
      setLoading(false);
    }

    // Then fetch real data in background
    const fetchMetrics = async () => {
      try {
        const [
          sessionsResult,
          projectsResult,
          achievementsResult,
          matchesResult,
        ] = await Promise.all([
          // Work: sessions participated in
          supabase
            .from('session_participants')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          // Work: projects 
          supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`),
          // Support: achievements earned
          supabase
            .from('user_achievements')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          // Attention: matches accepted
          supabase
            .from('user_matches')
            .select('id', { count: 'exact', head: true })
            .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
            .eq('status', 'accepted'),
        ]);

        const sessionCount = sessionsResult.count || 0;
        const projectCount = projectsResult.count || 0;
        const achievementCount = achievementsResult.count || 0;
        const matchCount = matchesResult.count || 0;

        // Map real data to the five pillars
        const realMetrics: PuttinInMetrics = {
          time: 2 + Math.floor(sessionCount * 0.5),  // Base 2hrs + session time estimate
          attention: 5 + matchCount * 3,               // Base 5 + matches
          support: achievementCount * 5,                // Achievements = community backing
          work: sessionCount * 5 + projectCount * 10,   // Sessions + projects
          love: Math.floor((sessionCount + projectCount + matchCount) * 0.5), // Community standing
        };

        setMetrics(realMetrics);
        writeCache(user.id, realMetrics);
      } catch (err) {
        // Graceful degradation — keep cached or seed values
        console.warn('Puttin\' In score fetch failed, using fallback:', err);
        if (!cached) {
          // Fall back to base seed values
          setMetrics({ time: 2, attention: 5, support: 0, work: 0, love: 0 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  // Calculate total score with weighted pillars
  const calculateTotal = useCallback((m: PuttinInMetrics): number => {
    return Math.floor(
      m.time * 1 +
      m.attention * 2 +
      m.support * 3 +
      m.work * 4 +
      m.love * 5
    );
  }, []);

  // Build the full score object
  const score: PuttinInScore = {
    total: calculateTotal(metrics),
    breakdown: metrics,
    currentLayer: user ? getLayerFromScore(calculateTotal(metrics)) : 'posted-up',
    nextLayer: user ? getNextLayer(getLayerFromScore(calculateTotal(metrics))) : 'in-the-room',
    progressToNext: 0,
  };

  // Calculate progress to next layer
  if (score.nextLayer) {
    const currentMin = DEPTH_LAYERS[score.currentLayer].minPuttinIn;
    const nextMin = DEPTH_LAYERS[score.nextLayer].minPuttinIn;
    const progress = ((score.total - currentMin) / (nextMin - currentMin)) * 100;
    score.progressToNext = Math.min(100, Math.max(0, progress));
  } else {
    score.progressToNext = 100;
  }

  const trackTime = useCallback(async (minutes: number) => {
    if (!user) return;
    setMetrics(prev => {
      const updated = { ...prev, time: prev.time + minutes / 60 };
      writeCache(user.id, updated);
      return updated;
    });
  }, [user]);

  const trackAttention = useCallback(async (action: 'follow' | 'watch' | 'engage') => {
    if (!user) return;
    const points = action === 'follow' ? 5 : action === 'watch' ? 2 : 1;
    setMetrics(prev => {
      const updated = { ...prev, attention: prev.attention + points };
      writeCache(user.id, updated);
      return updated;
    });
  }, [user]);

  const trackSupport = useCallback(async (_artistId: string) => {
    if (!user) return;
    setMetrics(prev => {
      const updated = { ...prev, support: prev.support + 10 };
      writeCache(user.id, updated);
      return updated;
    });
  }, [user]);

  const trackWork = useCallback(async (type: 'project' | 'session' | 'collab') => {
    if (!user) return;
    const points = type === 'project' ? 10 : type === 'collab' ? 15 : 5;
    setMetrics(prev => {
      const updated = { ...prev, work: prev.work + points };
      writeCache(user.id, updated);
      return updated;
    });
  }, [user]);

  return { metrics, score, loading, trackTime, trackAttention, trackSupport, trackWork };
}
