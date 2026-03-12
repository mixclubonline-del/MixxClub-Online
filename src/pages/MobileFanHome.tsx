/**
 * MobileFanHome — The Social Discovery Feed
 * 
 * For Fans: live streams, drops, challenges, marketplace.
 * "TikTok meets Bandcamp" — social-first, discovery-driven.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFanStats } from '@/hooks/useFanStats';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Radio, Flame, Trophy, ShoppingBag, Zap,
  ChevronRight, Heart, Compass, Star, Gift,
  Loader2, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Time-of-day greeting ─────────────────────────────────────
function getFanGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `Night owl vibes, ${name} 🦉`;
  if (hour < 12) return `Rise and grind, ${name}`;
  if (hour < 17) return `What's poppin, ${name}`;
  if (hour < 22) return `Evening drop, ${name}`;
  return `Late night discovery, ${name} 🎧`;
}

export default function MobileFanHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, currentTier, isLoading: statsLoading } = useFanStats();
  const { totalBalance } = useMixxWallet();

  const firstName = (user as any)?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Fan';

  // Live streams
  const { data: liveStreams, isLoading: streamsLoading } = useQuery({
    queryKey: ['mobile-live-streams'],
    queryFn: async () => {
      const { data } = await supabase
        .from('live_streams' as any)
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('status', 'live')
        .order('viewer_count', { ascending: false })
        .limit(6);
      return (data as any[]) || [];
    },
    staleTime: 30_000,
  });

  // Community challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['mobile-fan-challenges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 60_000,
  });

  // Trending marketplace
  const { data: trendingItems, isLoading: marketLoading } = useQuery({
    queryKey: ['mobile-trending-marketplace'],
    queryFn: async () => {
      const { data } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(6);
      return data || [];
    },
    staleTime: 60_000,
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const streakDays = stats?.engagement_streak || 0;

  return (
    <div className="min-h-screen bg-background pb-24 overflow-y-auto touch-manipulation">
      <div className="px-4 py-5 space-y-6">

        {/* ─── Greeting + Stats Row ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground">{getFanGreeting(firstName)}</h1>
          <div className="flex items-center gap-3 mt-2">
            {streakDays > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                <Flame className="w-3 h-3 mr-1" />
                {streakDays} day streak
              </Badge>
            )}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {totalBalance.toLocaleString()} Coinz
            </Badge>
            {currentTier && (
              <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/30 text-xs capitalize">
                {currentTier}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* ─── Live Now Strip ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              Live Now
            </h2>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/live')}>
              All <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
          {streamsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="min-w-[150px] h-[120px] rounded-2xl flex-shrink-0" />)}
            </div>
          ) : liveStreams && liveStreams.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {liveStreams.map((stream: any) => (
                <Card
                  key={stream.id}
                  className="min-w-[150px] p-3 border-destructive/20 bg-gradient-to-br from-destructive/5 to-card flex-shrink-0 cursor-pointer active:scale-95 transition-transform touch-manipulation"
                  onClick={() => navigate(`/watch/${stream.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-[10px] text-destructive font-semibold uppercase">Live</span>
                  </div>
                  <p className="text-sm font-medium truncate">{stream.title || 'Live Session'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(stream.profiles as any)?.full_name || 'Creator'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {stream.viewer_count || 0} watching
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center bg-card/50 border-border/30">
              <Radio className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No one's live right now — check back soon</p>
            </Card>
          )}
        </motion.div>

        {/* ─── Community Challenges ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Active Challenges
            </h2>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/community')}>
              All <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
          {challengesLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="space-y-2">
              {challenges.map((challenge: any) => (
                <Card
                  key={challenge.id}
                  className="p-3 border-border/30 bg-card/50 cursor-pointer active:bg-card/80 touch-manipulation"
                  onClick={() => navigate('/community')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {challenge.submission_count} submissions • {challenge.challenge_type}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] ml-2 flex-shrink-0">
                      <Zap className="w-3 h-3 mr-0.5" />
                      Active
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center bg-card/50 border-border/30">
              <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active challenges yet</p>
            </Card>
          )}
        </motion.div>

        {/* ─── Trending in Marketplace ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              Trending
            </h2>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/marketplace')}>
              Shop <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
          {marketLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="min-w-[140px] h-[100px] rounded-2xl flex-shrink-0" />)}
            </div>
          ) : trendingItems && trendingItems.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {trendingItems.map((item: any) => (
                <Card
                  key={item.id}
                  className="min-w-[140px] p-3 border-border/30 bg-card/50 flex-shrink-0 cursor-pointer active:scale-95 transition-transform touch-manipulation"
                  onClick={() => navigate('/marketplace')}
                >
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    ${((item.price_cents || 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {item.view_count || 0} views
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center bg-card/50 border-border/30">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Marketplace is warming up</p>
            </Card>
          )}
        </motion.div>

        {/* ─── Missions Reminder ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="p-4 bg-gradient-to-br from-primary/10 via-card to-secondary/5 border-primary/20 cursor-pointer active:bg-primary/15 touch-manipulation"
            onClick={() => navigate('/fan-hub')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Daily Missions</p>
                <p className="text-xs text-muted-foreground">
                  Earn MixxCoinz & level up your tier
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
