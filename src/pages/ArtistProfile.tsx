import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Star, Music, MapPin, Users,
  Briefcase, Headphones, CheckCircle, Trophy,
  Play, Pause, Send, Mic2, Disc3, Sparkles,
  ExternalLink, TrendingUp,
} from 'lucide-react';

const PROJECT_TYPES = [
  { value: 'single', label: 'Single', icon: Disc3 },
  { value: 'ep', label: 'EP', icon: Music },
  { value: 'album', label: 'Album', icon: Headphones },
  { value: 'feature', label: 'Feature', icon: Mic2 },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
} as const;

export default function ArtistProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  // Collab request state
  const [projectType, setProjectType] = useState('single');
  const [collabMessage, setCollabMessage] = useState('');
  const [collabSuccess, setCollabSuccess] = useState(false);

  // Audio player state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Data queries ──
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['artist-profile', userId],
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

  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('id, file_name, file_path, duration_seconds')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: projects } = useQuery({
    queryKey: ['artist-projects', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at, engineer_id')
        .eq('user_id', userId!)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['artist-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
        .eq('reviewed_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: achievements } = useQuery({
    queryKey: ['artist-achievements', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, title, icon, badge_type, earned_at')
        .eq('user_id', userId!)
        .order('earned_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // ── Collab mutation ──
  const submitCollab = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error('Missing data');
      const { error } = await supabase.from('collaboration_sessions').insert({
        host_user_id: userId,
        title: `${PROJECT_TYPES.find(t => t.value === projectType)?.label || 'Single'} Collaboration`,
        description: collabMessage || null,
        session_type: projectType,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCollabSuccess(true);
      toast.success('Collaboration request sent!');
    },
    onError: () => toast.error('Failed to send request. Try again.'),
  });

  // ── Audio helpers ──
  const getAudioUrl = async (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    const { data } = await supabase.storage.from('audio-files').createSignedUrl(filePath, 3600);
    return data?.signedUrl || '';
  };

  const toggleTrack = async (trackId: string, filePath: string) => {
    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }
    const url = await getAudioUrl(filePath);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      setPlayingTrackId(trackId);
    }
  };

  const formatDuration = (s: number | null) => {
    if (!s) return '—';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

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
            <Mic2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
            <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Artist';
  const genre = (profile as any).genre || null;
  const followerCount = profile.follower_count ?? 0;
  const followingCount = profile.following_count ?? 0;
  const totalXp = (profile as any).total_xp ?? (profile as any).points ?? 0;
  const level = profile.level ?? 1;
  const isVerified = profile.is_verified ?? false;
  const isAvailableForCollab = profile.is_available_for_collab ?? true;
  const tracksCount = tracks?.length ?? 0;
  const completedCount = projects?.length ?? 0;

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
    : 0;

  return (
    <>
      <Helmet>
        <title>{displayName} — Artist | Mixx Club</title>
        <meta name="description" content={`${displayName} — Artist on Mixx Club. ${followerCount} followers, Level ${level}.`} />
      </Helmet>

      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

      <div className="min-h-screen bg-background">
        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="relative overflow-hidden">
          {/* Purple ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(270_70%_50%/0.12)] blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[hsl(280_60%_40%/0.08)] blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-primary/8 blur-[80px]" />
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
              {/* Avatar */}
              <motion.div variants={fadeUp} className="relative">
                <div className={cn(
                  "rounded-full p-1",
                  isAvailableForCollab
                    ? "bg-gradient-to-br from-[hsl(270_70%_50%/0.4)] to-[hsl(280_60%_40%/0.1)] shadow-[0_0_30px_hsl(270_70%_50%/0.15)]"
                    : "bg-gradient-to-br from-border/40 to-border/10"
                )}>
                  <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background">
                    <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="text-3xl font-bold bg-[hsl(270_70%_50%)] text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isAvailableForCollab && (
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[hsl(270_70%_50%)] border-4 border-background animate-pulse" />
                )}
              </motion.div>

              {/* Info */}
              <motion.div variants={fadeUp} className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{displayName}</h1>
                  {isVerified && (
                    <Badge className="bg-[hsl(270_70%_50%/0.1)] text-[hsl(270_70%_60%)] border-[hsl(270_70%_50%/0.3)] text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                  {isAvailableForCollab && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
                      Open to Collabs
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
                  {genre && (
                    <span className="flex items-center gap-1.5">
                      <Music className="w-4 h-4" />{genre}
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
                { icon: Users, label: 'Followers', value: followerCount.toLocaleString(), accent: 'text-[hsl(270_70%_60%)]', glow: 'shadow-[0_0_12px_hsl(270_70%_50%/0.15)]' },
                { icon: Music, label: 'Tracks', value: tracksCount, accent: 'text-[hsl(280_60%_50%)]', glow: 'shadow-[0_0_12px_hsl(280_60%_50%/0.15)]' },
                { icon: CheckCircle, label: 'Projects', value: completedCount, accent: 'text-green-500', glow: 'shadow-[0_0_12px_hsl(142_76%_36%/0.15)]' },
                { icon: TrendingUp, label: 'Level', value: level, accent: 'text-amber-500', glow: 'shadow-[0_0_12px_hsl(45_100%_50%/0.15)]' },
              ].map((s) => (
                <div key={s.label} className={cn('glass-mid rounded-xl p-4 text-center', s.glow)}>
                  <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.accent)} />
                  <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ═══ ACHIEVEMENTS ═══ */}
            {achievements && achievements.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {achievements.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-mid rounded-xl p-4 text-center hover:shadow-[0_0_20px_hsl(270_70%_50%/0.12)] transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-[hsl(270_70%_50%/0.1)] flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-5 h-5 text-[hsl(270_70%_60%)]" />
                      </div>
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{a.badge_type || 'milestone'}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ DISCOGRAPHY / MUSIC PLAYER ═══ */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Headphones className="w-4 h-4" />Discography
              </h3>
              {tracks && tracks.length > 0 ? (
                <div className="glass-mid rounded-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[hsl(270_70%_50%)] via-[hsl(280_60%_50%)] to-[hsl(270_70%_50%/0.4)]" />
                  <div className="divide-y divide-border/30">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => toggleTrack(track.id, track.file_path)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[hsl(270_70%_50%/0.05)] transition-colors text-left"
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                          playingTrackId === track.id
                            ? 'bg-[hsl(270_70%_50%)] text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {playingTrackId === track.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.file_name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatDuration(track.duration_seconds)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-mid rounded-2xl p-8 text-center">
                  <Headphones className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No tracks uploaded yet.</p>
                </div>
              )}
            </motion.div>

            {/* ═══ COLLABORATION HISTORY ═══ */}
            {projects && projects.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />Completed Projects
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {projects.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={`/project/${p.id}`}
                        className="glass-mid rounded-xl flex items-center justify-between p-4 hover:shadow-[0_4px_24px_hsl(270_70%_50%/0.12)] hover:-translate-y-0.5 transition-all group"
                      >
                        <div>
                          <p className="font-medium text-sm group-hover:text-[hsl(270_70%_60%)] transition-colors">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(p.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ REVIEWS ═══ */}
            {reviews && reviews.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />Reviews ({reviews.length})
                  {avgRating > 0 && (
                    <span className="text-xs text-amber-500 font-normal ml-1">★ {avgRating.toFixed(1)}</span>
                  )}
                </h3>
                <div className="space-y-3">
                  {reviews.map((r, i) => {
                    const reviewer = (r as any).profiles;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-mid rounded-xl p-4 flex gap-3"
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={reviewer?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {(reviewer?.full_name || '?').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium">{reviewer?.full_name || 'User'}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={cn(
                                    'w-3 h-3',
                                    idx < (r.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {r.review_text && (
                            <p className="text-sm text-muted-foreground">{r.review_text}</p>
                          )}
                          <p className="text-xs text-muted-foreground/50 mt-1.5">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══ INLINE COLLABORATION REQUEST ═══ */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />Propose Collaboration
              </h3>

              {collabSuccess ? (
                <div className="glass-mid rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Request Sent!</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your collaboration request has been sent to {displayName}. You'll be notified when they respond.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setCollabSuccess(false);
                      setCollabMessage('');
                    }}
                  >
                    Send Another Request
                  </Button>
                </div>
              ) : !user ? (
                <div className="glass-mid rounded-2xl p-8 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground mb-4">Sign in to propose a collaboration with {displayName}.</p>
                  <Button asChild>
                    <Link to="/auth">Sign In to Collaborate</Link>
                  </Button>
                </div>
              ) : (
                <div className="glass-mid rounded-2xl p-6 space-y-5">
                  {/* Project type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Type</label>
                    <RadioGroup
                      value={projectType}
                      onValueChange={setProjectType}
                      className="flex flex-wrap gap-3"
                    >
                      {PROJECT_TYPES.map((t) => (
                        <label
                          key={t.value}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all border text-sm font-medium',
                            projectType === t.value
                              ? 'bg-[hsl(270_70%_50%/0.1)] border-[hsl(270_70%_50%/0.4)] text-[hsl(270_70%_60%)]'
                              : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-[hsl(270_70%_50%/0.2)]'
                          )}
                        >
                          <RadioGroupItem value={t.value} className="sr-only" />
                          <t.icon className="w-4 h-4" />
                          {t.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={collabMessage}
                      onChange={(e) => setCollabMessage(e.target.value)}
                      placeholder={`Tell ${displayName} about the project you have in mind...`}
                      rows={3}
                      className="bg-background/50"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={() => submitCollab.mutate()}
                    disabled={submitCollab.isPending}
                    className="w-full sm:w-auto bg-gradient-to-r from-[hsl(270_70%_50%)] to-[hsl(280_60%_50%)] text-primary-foreground hover:shadow-[0_0_20px_hsl(270_70%_50%/0.4)] hover:scale-105 active:scale-95"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitCollab.isPending ? 'Sending...' : 'Send Collaboration Request'}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
