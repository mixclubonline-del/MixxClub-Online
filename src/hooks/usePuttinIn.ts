import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  PuttinInMetrics,
  PuttinInScore,
  DEPTH_LAYERS,
  getLayerFromScore,
  getNextLayer,
} from '@/types/depth';

/**
 * usePuttinIn - Track the five pillars of community investment
 * 
 * Time: Hours in the building
 * Attention: What you follow, watch, engage with
 * Support: Day 1 status, backing artists early
 * Work: What you create and contribute
 * Love: Community standing, the intangibles
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

  // Initialize metrics based on auth state
  useEffect(() => {
    if (!user) {
      setMetrics({ time: 0, attention: 0, support: 0, work: 0, love: 0 });
    } else {
      // Start with base metrics for logged-in users
      setMetrics({ time: 2, attention: 5, support: 0, work: 0, love: 0 });
    }
    setLoading(false);
  }, [user]);

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
    setMetrics(prev => ({ ...prev, time: prev.time + minutes / 60 }));
  }, [user]);

  const trackAttention = useCallback(async (action: 'follow' | 'watch' | 'engage') => {
    if (!user) return;
    const points = action === 'follow' ? 5 : action === 'watch' ? 2 : 1;
    setMetrics(prev => ({ ...prev, attention: prev.attention + points }));
  }, [user]);

  const trackSupport = useCallback(async (_artistId: string) => {
    if (!user) return;
    setMetrics(prev => ({ ...prev, support: prev.support + 10 }));
  }, [user]);

  const trackWork = useCallback(async (type: 'project' | 'session' | 'collab') => {
    if (!user) return;
    const points = type === 'project' ? 10 : type === 'collab' ? 15 : 5;
    setMetrics(prev => ({ ...prev, work: prev.work + points }));
  }, [user]);

  return { metrics, score, loading, trackTime, trackAttention, trackSupport, trackWork };
}
