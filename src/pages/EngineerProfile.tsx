import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Helmet } from 'react-helmet-async';
import { EngineerVerificationBadge } from '@/components/EngineerVerificationBadge';
import {
  ArrowLeft, Star, Music, Calendar, MapPin, Clock,
  Briefcase, Headphones, Award, DollarSign, CheckCircle,
  Wrench, ExternalLink,
} from 'lucide-react';

export default function EngineerProfile() {
  const { userId } = useParams<{ userId: string }>();

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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Link to="/engineers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Engineers
          </Link>
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Engineer Not Found</h1>
            <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'Engineer';
  const rating = engineerData?.rating ?? 0;
  const completedProjects = engineerData?.completed_projects ?? 0;
  const yearsExp = engineerData?.years_experience ?? 0;
  const hourlyRate = engineerData?.hourly_rate ?? 0;
  const specialties = engineerData?.specialties ?? [];
  const genres = engineerData?.genres ?? [];
  const equipment = engineerData?.equipment_list ?? [];
  const availability = engineerData?.availability_status ?? 'unavailable';

  const availabilityConfig: Record<string, { label: string; color: string }> = {
    available: { label: 'Available Now', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    busy: { label: 'Currently Busy', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    unavailable: { label: 'Unavailable', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  };
  const avail = availabilityConfig[availability] || availabilityConfig.unavailable;

  return (
    <>
      <Helmet>
        <title>{displayName} — Engineer Profile | Mixx Club</title>
        <meta name="description" content={`${displayName} — ${specialties.slice(0, 3).join(', ')} engineer on Mixx Club. ${completedProjects} projects completed.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Link to="/engineers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Engineers
          </Link>

          {/* Hero */}
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <Badge className={avail.color}>{avail.label}</Badge>
                  </div>
                  {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
                  {profile.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />{profile.location}
                    </p>
                  )}
                  <EngineerVerificationBadge
                    verified={!!engineerData}
                    experience={yearsExp > 0 ? `${yearsExp}+ years` : undefined}
                    completedProjects={completedProjects}
                    rating={rating}
                    size="sm"
                  />
                </div>
                <Button asChild className="self-start sm:self-end">
                  <Link to="/services">Book a Session</Link>
                </Button>
              </div>
              {profile.bio && <p className="mt-4 text-muted-foreground max-w-2xl">{profile.bio}</p>}
            </div>
          </Card>

          {!engineerData && (
            <Card className="p-8 text-center border-dashed">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">This engineer hasn't set up their full profile yet.</p>
            </Card>
          )}

          {engineerData && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Star, label: 'Rating', value: rating > 0 ? rating.toFixed(1) : '—', accent: 'text-amber-500' },
                  { icon: CheckCircle, label: 'Projects', value: completedProjects, accent: 'text-green-500' },
                  { icon: Clock, label: 'Experience', value: yearsExp > 0 ? `${yearsExp}yr` : '—', accent: 'text-blue-500' },
                  { icon: DollarSign, label: 'Hourly', value: hourlyRate > 0 ? `$${hourlyRate}` : 'Contact', accent: 'text-primary' },
                ].map((s) => (
                  <Card key={s.label} className="p-4 text-center">
                    <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.accent}`} />
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </Card>
                ))}
              </div>

              {/* Specialties & Genres */}
              {(specialties.length > 0 || genres.length > 0) && (
                <Card className="p-5 space-y-4">
                  {specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <Headphones className="w-4 h-4" />Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
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
                </Card>
              )}

              {/* Equipment */}
              {equipment.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />Equipment & Tools
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {equipment.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm py-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Portfolio */}
              {portfolio && portfolio.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />Completed Projects
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {portfolio.map((p) => (
                      <Link
                        key={p.id}
                        to={`/project/${p.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{p.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />Client Reviews ({reviews.length})
                  </h3>
                  <div className="space-y-4">
                    {reviews.map((r) => {
                      const client = r.profiles as any;
                      return (
                        <div key={r.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={client?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {(client?.full_name || '?').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{client?.full_name || 'Client'}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`}
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
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(r.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
