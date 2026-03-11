import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Helmet } from 'react-helmet-async';
import { EngineerVerificationBadge } from '@/components/EngineerVerificationBadge';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Star, Music, MapPin, Clock,
  Briefcase, Headphones, DollarSign, CheckCircle,
  Wrench, ExternalLink, Play, Pause, CalendarIcon,
  Monitor, Send, Disc3, Mic, Volume2,
} from 'lucide-react';

// Known DAWs to extract from equipment list
const KNOWN_DAWS = [
  'Pro Tools', 'Logic Pro', 'Ableton', 'FL Studio',
  'Studio One', 'Cubase', 'Reaper', 'Bitwig', 'Reason',
];

const SESSION_TYPES = [
  { value: 'mixing', label: 'Mixing', icon: Disc3 },
  { value: 'mastering', label: 'Mastering', icon: Volume2 },
  { value: 'consultation', label: 'Consultation', icon: Mic },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
} as const;

export default function EngineerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  // ── Booking state ──
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sessionType, setSessionType] = useState('mixing');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── Audio player state ──
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Data queries ──
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['engineer-profile', userId],
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

  const { data: engineerData } = useQuery({
    queryKey: ['engineer-data', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_profiles')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['engineer-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_reviews')
        .select('*, profiles!engineer_reviews_client_id_fkey(full_name, avatar_url)')
        .eq('engineer_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['engineer-portfolio', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
        .eq('engineer_id', userId!)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: sampleTracks } = useQuery({
    queryKey: ['engineer-samples', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('id, file_name, file_path, duration_seconds')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // ── Booking mutation ──
  const bookSession = useMutation({
    mutationFn: async () => {
      if (!user || !userId || !selectedDate) throw new Error('Missing data');
      const { error } = await supabase.from('collaboration_sessions').insert({
        host_user_id: userId,
        title: `${SESSION_TYPES.find(t => t.value === sessionType)?.label || 'Mixing'} Session`,
        description: bookingMessage || null,
        scheduled_start: selectedDate.toISOString(),
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBookingSuccess(true);
      toast.success('Session request sent!');
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
          <Link to="/engineers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Engineers
          </Link>
          <div className="glass-mid rounded-2xl p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Engineer Not Found</h1>
            <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Engineer';
  const rating = engineerData?.rating ?? 0;
  const completedProjects = engineerData?.completed_projects ?? 0;
  const yearsExp = engineerData?.years_experience ?? 0;
  const hourlyRate = engineerData?.hourly_rate ?? 0;
  const specialties: string[] = (engineerData?.specialties as string[]) ?? [];
  const genres: string[] = (engineerData?.genres as string[]) ?? [];
  const equipment: string[] = (engineerData?.equipment_list as string[]) ?? [];
  const availability = engineerData?.availability_status ?? 'unavailable';

  // Parse DAWs from equipment
  const daws = equipment.filter(item =>
    KNOWN_DAWS.some(daw => item.toLowerCase().includes(daw.toLowerCase()))
  );
  const studioGear = equipment.filter(item =>
    !KNOWN_DAWS.some(daw => item.toLowerCase().includes(daw.toLowerCase()))
  );

  const availabilityConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
    available: {
      label: 'Available Now',
      dotClass: 'bg-green-500 animate-pulse',
      badgeClass: 'bg-green-500/10 text-green-400 border-green-500/30',
    },
    busy: {
      label: 'Currently Busy',
      dotClass: 'bg-amber-500',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    unavailable: {
      label: 'Unavailable',
      dotClass: 'bg-red-500/60',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
  };
  const avail = availabilityConfig[availability] || availabilityConfig.unavailable;

  return (
    <>
      <Helmet>
        <title>{displayName} — Engineer | Mixx Club</title>
        <meta name="description" content={`${displayName} — ${specialties.slice(0, 3).join(', ')} engineer on Mixx Club. ${completedProjects} projects completed.`} />
      </Helmet>

      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

      <div className="min-h-screen bg-background">
        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="relative overflow-hidden">
          {/* Ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-accent/8 blur-[120px]" />
          </div>

          <div className="relative container max-w-5xl mx-auto px-4 pt-6 pb-10">
            <Link
              to="/engineers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />Back to Engineers
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
                  availability === 'available'
                    ? "bg-gradient-to-br from-green-500/40 to-green-500/10 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                    : "bg-gradient-to-br from-border/40 to-border/10"
                )}>
                  <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background">
                    <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {availability === 'available' && (
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4 border-background animate-pulse" />
                )}
              </motion.div>

              {/* Info */}
              <motion.div variants={fadeUp} className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{displayName}</h1>
                  <Badge className={cn('text-xs', avail.badgeClass)}>
                    <span className={cn('w-2 h-2 rounded-full mr-1.5', avail.dotClass)} />
                    {avail.label}
                  </Badge>
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
                  <EngineerVerificationBadge
                    verified={!!engineerData}
                    experience={yearsExp > 0 ? `${yearsExp}+ years` : undefined}
                    completedProjects={completedProjects}
                    rating={rating}
                    size="sm"
                  />
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl pt-1">{profile.bio}</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <main className="container max-w-5xl mx-auto px-4 pb-16 space-y-8">
          {!engineerData && (
            <div className="glass-mid rounded-2xl p-8 text-center">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">This engineer hasn't set up their full profile yet.</p>
            </div>
          )}

          {engineerData && (
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
              {/* ═══ STATS BAR ═══ */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Star, label: 'Rating', value: rating > 0 ? rating.toFixed(1) : '—', accent: 'text-amber-500', glow: 'shadow-[0_0_12px_hsl(45_100%_50%/0.15)]' },
                  { icon: CheckCircle, label: 'Projects', value: completedProjects, accent: 'text-green-500', glow: 'shadow-[0_0_12px_hsl(142_76%_36%/0.15)]' },
                  { icon: Clock, label: 'Experience', value: yearsExp > 0 ? `${yearsExp} yr` : '—', accent: 'text-blue-400', glow: 'shadow-[0_0_12px_hsl(217_91%_60%/0.15)]' },
                  { icon: DollarSign, label: 'Hourly', value: hourlyRate > 0 ? `$${hourlyRate}` : 'Contact', accent: 'text-primary', glow: 'shadow-[0_0_12px_hsl(var(--primary)/0.15)]' },
                ].map((s) => (
                  <div key={s.label} className={cn('glass-mid rounded-xl p-4 text-center', s.glow)}>
                    <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.accent)} />
                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* ═══ SPECIALTIES & GENRES ═══ */}
              {(specialties.length > 0 || genres.length > 0) && (
                <motion.div variants={fadeUp} className="glass-mid rounded-2xl p-6 space-y-4">
                  {specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <Headphones className="w-4 h-4" />Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((s) => (
                          <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {genres.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <Music className="w-4 h-4" />Genres
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((g) => (
                          <Badge key={g} variant="outline">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ DAW & EQUIPMENT ═══ */}
              {equipment.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-4">
                  {daws.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />DAW Setup
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {daws.map((daw) => (
                          <div
                            key={daw}
                            className="glass-mid rounded-xl p-4 text-center hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-shadow"
                          >
                            <Monitor className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">{daw}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studioGear.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />Studio Gear
                      </h3>
                      <div className="glass-mid rounded-2xl p-5">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {studioGear.map((item) => (
                            <div key={item} className="flex items-center gap-2.5 text-sm py-1.5">
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ SAMPLE WORK PLAYER ═══ */}
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Headphones className="w-4 h-4" />Sample Work
                </h3>
                {sampleTracks && sampleTracks.length > 0 ? (
                  <div className="glass-mid rounded-2xl overflow-hidden">
                    {/* Decorative waveform bar */}
                    <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary/40" />
                    <div className="divide-y divide-border/30">
                      {sampleTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => toggleTrack(track.id, track.file_path)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/5 transition-colors text-left"
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                            playingTrackId === track.id
                              ? 'bg-primary text-primary-foreground'
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
                    <p className="text-sm text-muted-foreground">No sample tracks uploaded yet.</p>
                  </div>
                )}
              </motion.div>

              {/* ═══ PORTFOLIO ═══ */}
              {portfolio && portfolio.length > 0 && (
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />Completed Projects
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {portfolio.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link
                          to={`/project/${p.id}`}
                          className="glass-mid rounded-xl flex items-center justify-between p-4 hover:shadow-[0_4px_24px_hsl(var(--primary)/0.12)] hover:-translate-y-0.5 transition-all group"
                        >
                          <div>
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{p.title}</p>
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
                    <Star className="w-4 h-4" />Client Reviews ({reviews.length})
                  </h3>
                  <div className="space-y-3">
                    {reviews.map((r, i) => {
                      const client = r.profiles as any;
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
                            <AvatarImage src={client?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-muted">
                              {(client?.full_name || '?').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium">{client?.full_name || 'Client'}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={cn(
                                      'w-3 h-3',
                                      idx < r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'
                                    )}
                                  />
                                ))}
                              </div>
                              {r.is_verified && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Verified</Badge>
                              )}
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

              {/* ═══ INLINE BOOKING ═══ */}
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />Book a Session
                </h3>

                {bookingSuccess ? (
                  <div className="glass-mid rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Request Sent!</h4>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Your session request has been sent to {displayName}. You'll be notified when they respond.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setBookingSuccess(false);
                        setSelectedDate(undefined);
                        setBookingMessage('');
                      }}
                    >
                      Book Another Session
                    </Button>
                  </div>
                ) : !user ? (
                  <div className="glass-mid rounded-2xl p-8 text-center">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground mb-4">Sign in to book a session with {displayName}.</p>
                    <Button asChild>
                      <Link to="/auth">Sign In to Book</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="glass-mid rounded-2xl p-6 space-y-5">
                    {/* Session type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Session Type</label>
                      <RadioGroup
                        value={sessionType}
                        onValueChange={setSessionType}
                        className="flex flex-wrap gap-3"
                      >
                        {SESSION_TYPES.map((t) => (
                          <label
                            key={t.value}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all border text-sm font-medium',
                              sessionType === t.value
                                ? 'bg-primary/10 border-primary/40 text-primary'
                                : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/20'
                            )}
                          >
                            <RadioGroupItem value={t.value} className="sr-only" />
                            <t.icon className="w-4 h-4" />
                            {t.label}
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full sm:w-auto justify-start text-left font-normal',
                              !selectedDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message (optional)</label>
                      <Textarea
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                        placeholder={`Tell ${displayName} about your project...`}
                        rows={3}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      onClick={() => bookSession.mutate()}
                      disabled={!selectedDate || bookSession.isPending}
                      className="w-full sm:w-auto"
                      variant="glow"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {bookSession.isPending ? 'Sending...' : 'Request Session'}
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
