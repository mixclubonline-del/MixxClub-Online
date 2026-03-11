import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Star, Music, MapPin, Users,
  Briefcase, Headphones, CheckCircle, DollarSign,
  Play, Pause, Send, Disc3, ShoppingBag,
  ExternalLink, Tag, Clock, Zap, LinkIcon,
} from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
} as const;

export default function ProducerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  // Beat inquiry state
  const [inquiryGenre, setInquiryGenre] = useState('');
  const [inquiryRef, setInquiryRef] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Audio player state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Data queries ──
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['producer-profile', userId],
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

  const { data: beats } = useQuery({
    queryKey: ['producer-beats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producer_beats')
        .select('id, title, bpm, key_signature, genre, price_cents, license_type, preview_url, audio_url, is_published, created_at, user_id, cover_image_url, downloads, exclusive_price_cents')
        .eq('user_id', userId!)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: producerStats } = useQuery({
    queryKey: ['producer-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producer_stats')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: partnerships } = useQuery({
    queryKey: ['producer-partnerships', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('id, artist_id, status, total_revenue, created_at, profiles!partnerships_artist_id_fkey(full_name, avatar_url)')
        .eq('producer_id', userId!)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // ── Inquiry mutation ──
  const submitInquiry = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error('Missing data');
      const { error } = await supabase.from('collaboration_sessions').insert({
        host_user_id: userId,
        title: `Custom Beat Request${inquiryGenre ? ` — ${inquiryGenre}` : ''}`,
        description: [
          inquiryMessage,
          inquiryRef ? `Reference: ${inquiryRef}` : '',
          inquiryGenre ? `Genre: ${inquiryGenre}` : '',
        ].filter(Boolean).join('\n'),
        session_type: 'beat_inquiry',
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setInquirySuccess(true);
      toast.success('Beat inquiry sent!');
    },
    onError: () => toast.error('Failed to send inquiry. Try again.'),
  });

  // ── Audio helpers ──
  const getBeatAudioUrl = (beat: any) => {
    const url = beat.preview_url || beat.audio_url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return null;
  };

  const toggleBeat = async (beatId: string, beat: any) => {
    if (playingTrackId === beatId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }
    let url = beat.preview_url || beat.audio_url;
    if (!url) return;
    if (!url.startsWith('http')) {
      const { data } = await supabase.storage.from('audio-files').createSignedUrl(url, 3600);
      url = data?.signedUrl || '';
    }
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      setPlayingTrackId(beatId);
    }
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
          <Link to="/beats" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Beat Marketplace
          </Link>
          <div className="glass-mid rounded-2xl p-12 text-center">
            <Disc3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Producer Not Found</h1>
            <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Producer';
  const genre = (profile as any).genre || null;
  const isVerified = profile.is_verified ?? false;
  const beatsCount = beats?.length ?? 0;
  const totalSales = producerStats?.total_sales ?? 0;
  const totalRevenueCents = producerStats?.total_revenue_cents ?? 0;
  const avgRating = producerStats?.avg_rating ?? 0;
  const memberSince = new Date(profile.created_at).getFullYear();
  const yearsActive = new Date().getFullYear() - memberSince;

  // Extract unique license types from beats
  const licenseTypes = new Set<string>();
  beats?.forEach(b => {
    if (b.license_type) licenseTypes.add(b.license_type);
  });

  return (
    <>
      <Helmet>
        <title>{displayName} — Producer | Mixx Club</title>
        <meta name="description" content={`${displayName} — Producer on Mixx Club. ${beatsCount} beats available, ${totalSales} sales.`} />
      </Helmet>

      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

      <div className="min-h-screen bg-background">
        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="relative overflow-hidden">
          {/* Amber ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(38_90%_50%/0.12)] blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[hsl(30_80%_40%/0.08)] blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-[hsl(45_100%_50%/0.06)] blur-[80px]" />
          </div>

          <div className="relative container max-w-5xl mx-auto px-4 pt-6 pb-10">
            <Link
              to="/beats"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />Back to Beat Marketplace
            </Link>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col md:flex-row md:items-end gap-6"
            >
              {/* Avatar */}
              <motion.div variants={fadeUp} className="relative">
                <div className="rounded-full p-1 bg-gradient-to-br from-[hsl(38_90%_50%/0.4)] to-[hsl(30_80%_40%/0.1)] shadow-[0_0_30px_hsl(38_90%_50%/0.15)]">
                  <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background">
                    <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="text-3xl font-bold bg-[hsl(38_90%_50%)] text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div variants={fadeUp} className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{displayName}</h1>
                  {isVerified && (
                    <Badge className="bg-[hsl(38_90%_50%/0.1)] text-[hsl(38_90%_55%)] border-[hsl(38_90%_50%/0.3)] text-xs">
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
                  {genre && (
                    <span className="flex items-center gap-1.5">
                      <Music className="w-4 h-4" />{genre}
                    </span>
                  )}
                  {beatsCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Disc3 className="w-4 h-4" />{beatsCount} beats available
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
                { icon: Disc3, label: 'Beats', value: beatsCount, accent: 'text-[hsl(38_90%_55%)]', glow: 'shadow-[0_0_12px_hsl(38_90%_50%/0.15)]' },
                { icon: ShoppingBag, label: 'Total Sales', value: totalSales, accent: 'text-green-500', glow: 'shadow-[0_0_12px_hsl(142_76%_36%/0.15)]' },
                { icon: Star, label: 'Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', accent: 'text-amber-500', glow: 'shadow-[0_0_12px_hsl(45_100%_50%/0.15)]' },
                { icon: Clock, label: 'Years Active', value: yearsActive > 0 ? `${yearsActive}+` : 'New', accent: 'text-blue-400', glow: 'shadow-[0_0_12px_hsl(217_91%_60%/0.15)]' },
              ].map((s) => (
                <div key={s.label} className={cn('glass-mid rounded-xl p-4 text-center', s.glow)}>
                  <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.accent)} />
                  <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ═══ BEAT CATALOG ═══ */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Headphones className="w-4 h-4" />Beat Catalog
              </h3>
              {beats && beats.length > 0 ? (
                <div className="glass-mid rounded-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[hsl(38_90%_50%)] via-[hsl(45_100%_50%)] to-[hsl(38_90%_50%/0.4)]" />
                  <div className="divide-y divide-border/30">
                    {beats.map((beat) => (
                      <div
                        key={beat.id}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(38_90%_50%/0.05)] transition-colors"
                      >
                        <button
                          onClick={() => toggleBeat(beat.id, beat)}
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                            playingTrackId === beat.id
                              ? 'bg-[hsl(38_90%_50%)] text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {playingTrackId === beat.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{beat.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {beat.bpm && (
                              <span className="text-xs text-muted-foreground">{beat.bpm} BPM</span>
                            )}
                            {beat.key_signature && (
                              <span className="text-xs text-muted-foreground">• {beat.key_signature}</span>
                            )}
                            {beat.genre && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{beat.genre}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {beat.price_cents != null && beat.price_cents > 0 ? (
                            <p className="text-sm font-semibold text-[hsl(38_90%_55%)]">
                              ${(beat.price_cents / 100).toFixed(0)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Contact</p>
                          )}
                          {beat.license_type && (
                            <p className="text-[10px] text-muted-foreground capitalize">{beat.license_type}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-mid rounded-2xl p-8 text-center">
                  <Disc3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No beats published yet.</p>
                </div>
              )}
            </motion.div>

            {/* ═══ LICENSE TIERS ═══ */}
            {licenseTypes.size > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />Available License Types
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from(licenseTypes).map((lt) => (
                    <div
                      key={lt}
                      className="glass-mid rounded-xl p-4 text-center hover:shadow-[0_0_20px_hsl(38_90%_50%/0.12)] transition-shadow"
                    >
                      <DollarSign className="w-5 h-5 mx-auto mb-2 text-[hsl(38_90%_55%)]" />
                      <p className="text-sm font-medium capitalize">{lt.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ COLLABORATION CREDITS ═══ */}
            {partnerships && partnerships.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />Artist Collaborations
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {partnerships.map((p: any, i: number) => {
                    const artist = p.profiles;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="glass-mid rounded-xl flex items-center gap-3 p-4 hover:shadow-[0_4px_24px_hsl(38_90%_50%/0.12)] transition-all"
                      >
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={artist?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {(artist?.full_name || '?').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{artist?.full_name || 'Artist'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.status} partnership</p>
                        </div>
                        <Zap className="w-4 h-4 text-[hsl(38_90%_55%)]" />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══ INLINE BEAT INQUIRY ═══ */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />Request Custom Beat
              </h3>

              {inquirySuccess ? (
                <div className="glass-mid rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Inquiry Sent!</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your beat inquiry has been sent to {displayName}. You'll be notified when they respond.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setInquirySuccess(false);
                      setInquiryGenre('');
                      setInquiryRef('');
                      setInquiryMessage('');
                    }}
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : !user ? (
                <div className="glass-mid rounded-2xl p-8 text-center">
                  <Briefcase className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground mb-4">Sign in to request a custom beat from {displayName}.</p>
                  <Button asChild>
                    <Link to="/auth">Sign In to Inquire</Link>
                  </Button>
                </div>
              ) : (
                <div className="glass-mid rounded-2xl p-6 space-y-5">
                  {/* Genre */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre / Style</label>
                    <Input
                      value={inquiryGenre}
                      onChange={(e) => setInquiryGenre(e.target.value)}
                      placeholder="e.g. Trap, R&B, Boom Bap, Drill"
                    />
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />Reference Track URL (optional)
                    </label>
                    <Input
                      value={inquiryRef}
                      onChange={(e) => setInquiryRef(e.target.value)}
                      placeholder="https://youtube.com/... or https://soundcloud.com/..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Details</label>
                    <Textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder={`Describe the vibe, tempo, mood, budget, or anything else ${displayName} should know...`}
                      rows={3}
                      className="bg-background/50"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={() => submitInquiry.mutate()}
                    disabled={submitInquiry.isPending}
                    className="w-full sm:w-auto bg-gradient-to-r from-[hsl(38_90%_50%)] to-[hsl(45_100%_50%)] text-primary-foreground hover:shadow-[0_0_20px_hsl(38_90%_50%/0.4)] hover:scale-105 active:scale-95"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitInquiry.isPending ? 'Sending...' : 'Send Beat Inquiry'}
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
