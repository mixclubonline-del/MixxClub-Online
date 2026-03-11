import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProfileActivityFeed } from '@/components/profile/ProfileActivityFeed';
import type { UserActivity } from '@/hooks/usePublicProfile';
import {
  ArrowLeft, Heart, Users, Flame, Trophy,
  Coins, MapPin, Calendar, Crown, Star,
  CheckCircle, Zap, Shield,
} from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
} as const;

const TIER_CONFIG: Record<string, { label: string; icon: typeof Star; color: string }> = {
  newcomer: { label: 'Newcomer', icon: Star, color: 'text-muted-foreground' },
  supporter: { label: 'Supporter', icon: Heart, color: 'text-[hsl(330_80%_60%)]' },
  advocate: { label: 'Advocate', icon: Zap, color: 'text-[hsl(280_70%_60%)]' },
  champion: { label: 'Champion', icon: Shield, color: 'text-[hsl(45_100%_50%)]' },
  legend: { label: 'Legend', icon: Crown, color: 'text-[hsl(38_90%_55%)]' },
};

const RECOGNITION_TIERS: Record<string, { label: string; className: string }> = {
  before_day1: { label: 'Before Day 1', className: 'bg-[hsl(280_70%_50%/0.15)] text-[hsl(280_70%_60%)] border-[hsl(280_70%_50%/0.3)]' },
  day1: { label: 'Day 1', className: 'bg-[hsl(330_80%_50%/0.15)] text-[hsl(330_80%_60%)] border-[hsl(330_80%_50%/0.3)]' },
  early_supporter: { label: 'Early Supporter', className: 'bg-[hsl(45_100%_50%/0.15)] text-[hsl(45_90%_45%)] border-[hsl(45_100%_50%/0.3)]' },
  supporter: { label: 'Supporter', className: 'bg-secondary text-secondary-foreground border-border' },
};

export default function FanProfile() {
  const { userId } = useParams<{ userId: string }>();

  // Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['fan-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fan stats
  const { data: fanStats } = useQuery({
    queryKey: ['fan-profile-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fan_stats')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Day 1 collection
  const { data: day1Artists } = useQuery({
    queryKey: ['fan-day1-collection', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_day1s')
        .select('*, profiles!artist_day1s_artist_id_fkey(full_name, avatar_url, username)')
        .eq('fan_id', userId!)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Activity
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['fan-profile-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as UserActivity[];
    },
    enabled: !!userId,
  });

  // ── Loading ──
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── 404 ──
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <Link to="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Community
          </Link>
          <div className="glass-mid rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Fan Not Found</h1>
            <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Fan';
  const currentTier = fanStats?.current_tier || 'newcomer';
  const tierInfo = TIER_CONFIG[currentTier] || TIER_CONFIG.newcomer;
  const TierIcon = tierInfo.icon;
  const memberSince = new Date(profile.created_at).getFullYear();
  const artistsSupported = fanStats?.artists_supported ?? 0;
  const day1Badges = fanStats?.day1_badges ?? 0;
  const mixxcoinzEarned = fanStats?.mixxcoinz_earned ?? 0;
  const engagementStreak = fanStats?.engagement_streak ?? 0;

  return (
    <>
      <Helmet>
        <title>{displayName} — Fan Profile | Mixx Club</title>
        <meta name="description" content={`${displayName} — ${tierInfo.label} on Mixx Club. ${artistsSupported} artists supported, ${day1Badges} Day 1 badges.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="relative overflow-hidden">
          {/* Pink/magenta ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(330_80%_55%/0.12)] blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[hsl(300_60%_45%/0.08)] blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-[hsl(340_90%_60%/0.06)] blur-[80px]" />
          </div>

          <div className="relative container max-w-5xl mx-auto px-4 pt-6 pb-10">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />Back to Community
            </Link>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col md:flex-row md:items-end gap-6"
            >
              {/* Avatar with gradient ring */}
              <motion.div variants={fadeUp} className="relative">
                <div className="rounded-full p-1 bg-gradient-to-br from-[hsl(330_80%_55%/0.5)] to-[hsl(300_60%_45%/0.15)] shadow-[0_0_30px_hsl(330_80%_55%/0.2)]">
                  <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background">
                    <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="text-3xl font-bold bg-[hsl(330_80%_55%)] text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div variants={fadeUp} className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{displayName}</h1>
                  <Badge className={cn('text-xs border', TIER_CONFIG[currentTier]?.color === 'text-muted-foreground'
                    ? 'bg-secondary text-secondary-foreground border-border'
                    : 'bg-[hsl(330_80%_55%/0.1)] text-[hsl(330_80%_60%)] border-[hsl(330_80%_55%/0.3)]'
                  )}>
                    <TierIcon className="w-3 h-3 mr-1" />{tierInfo.label}
                  </Badge>
                  {(profile.is_verified ?? false) && (
                    <Badge className="bg-[hsl(330_80%_55%/0.1)] text-[hsl(330_80%_60%)] border-[hsl(330_80%_55%/0.3)] text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                </div>
                {profile.username && (
                  <p className="text-muted-foreground text-lg">@{profile.username}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />{profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />Member since {memberSince}
                  </span>
                  {artistsSupported > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />{artistsSupported} artists supported
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl pt-1">{profile.bio}</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <main className="container max-w-5xl mx-auto px-4 pb-16 space-y-8">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
            {/* ═══ STATS BAR ═══ */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: 'Artists Supported', value: artistsSupported, accent: 'text-[hsl(330_80%_60%)]', glow: 'shadow-[0_0_12px_hsl(330_80%_55%/0.15)]' },
                { icon: Trophy, label: 'Day 1 Badges', value: day1Badges, accent: 'text-[hsl(280_70%_60%)]', glow: 'shadow-[0_0_12px_hsl(280_70%_50%/0.15)]' },
                { icon: Coins, label: 'MixxCoinz Earned', value: mixxcoinzEarned.toLocaleString(), accent: 'text-[hsl(45_100%_50%)]', glow: 'shadow-[0_0_12px_hsl(45_100%_50%/0.15)]' },
                { icon: Flame, label: 'Engagement Streak', value: engagementStreak > 0 ? `${engagementStreak}d` : '—', accent: 'text-[hsl(15_90%_55%)]', glow: 'shadow-[0_0_12px_hsl(15_90%_55%/0.15)]' },
              ].map((s) => (
                <div key={s.label} className={cn('glass-mid rounded-xl p-4 text-center', s.glow)}>
                  <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.accent)} />
                  <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ═══ DAY 1 COLLECTION ═══ */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />Day 1 Collection
              </h3>
              {day1Artists && day1Artists.length > 0 ? (
                <div className="glass-mid rounded-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[hsl(330_80%_55%)] via-[hsl(280_70%_60%)] to-[hsl(330_80%_55%/0.4)]" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5">
                    {day1Artists.map((d1: any) => {
                      const artist = d1.profiles;
                      const recTier = RECOGNITION_TIERS[d1.recognition_tier] || RECOGNITION_TIERS.supporter;
                      return (
                        <Link
                          key={d1.id}
                          to={`/artist/${d1.artist_id}`}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[hsl(330_80%_55%/0.05)] transition-colors group"
                        >
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-[hsl(330_80%_55%/0.3)] group-hover:border-[hsl(330_80%_55%/0.6)] transition-colors">
                              <AvatarImage src={artist?.avatar_url || undefined} />
                              <AvatarFallback className="bg-[hsl(330_80%_55%/0.2)] text-[hsl(330_80%_60%)]">
                                {(artist?.full_name || '?').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {/* Milestone indicators */}
                            <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                              {d1.artist_milestone_verified && (
                                <span className="w-4 h-4 rounded-full bg-[hsl(217_91%_60%)] flex items-center justify-center" title="Verified Artist">
                                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                                </span>
                              )}
                              {d1.artist_milestone_10k && (
                                <span className="w-4 h-4 rounded-full bg-[hsl(45_100%_50%)] flex items-center justify-center text-[8px] font-bold text-black" title="10K Milestone">
                                  10K
                                </span>
                              )}
                              {!d1.artist_milestone_10k && d1.artist_milestone_1k && (
                                <span className="w-4 h-4 rounded-full bg-[hsl(142_76%_36%)] flex items-center justify-center text-[8px] font-bold text-white" title="1K Milestone">
                                  1K
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-sm font-medium truncate">{artist?.full_name || 'Artist'}</p>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-1', recTier.className)}>
                              {recTier.label}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="glass-mid rounded-2xl p-8 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No Day 1 badges earned yet. Start supporting artists early!</p>
                </div>
              )}
            </motion.div>

            {/* ═══ COMMUNITY ACTIVITY ═══ */}
            <motion.div variants={fadeUp}>
              <ProfileActivityFeed
                activities={activities || []}
                isLoading={activitiesLoading}
              />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
