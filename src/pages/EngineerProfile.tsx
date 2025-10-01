import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { EngineerReviews } from "@/components/review/EngineerReviews";
import { 
  Star, 
  Award, 
  TrendingUp, 
  Video, 
  Zap,
  CheckCircle2,
  MapPin,
  Clock
} from "lucide-react";

export default function EngineerProfile() {
  const { userId } = useParams();
  const [engineer, setEngineer] = useState<any>(null);
  const [tier, setTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEngineerProfile();
    }
  }, [userId]);

  const fetchEngineerProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('engineer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch profile data separately
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio')
        .eq('id', userId)
        .single();

      const { data: tierData } = await supabase
        .from('engineer_tiers')
        .select('*')
        .eq('engineer_id', userId)
        .order('revenue_split_percentage', { ascending: false })
        .limit(1)
        .maybeSingle();

      setEngineer({ ...profileData, profiles: userData });
      setTier(tierData);
    } catch (error) {
      console.error('Error fetching engineer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl pt-32 px-4 text-center">
          <p className="text-muted-foreground">Loading engineer profile...</p>
        </div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl pt-32 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Engineer Not Found</h1>
          <p className="text-muted-foreground">This engineer profile doesn't exist or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header Card */}
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {engineer.profiles?.avatar_url ? (
                  <img 
                    src={engineer.profiles.avatar_url} 
                    alt={engineer.profiles.full_name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-primary">
                    {engineer.profiles?.full_name?.charAt(0) || 'E'}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{engineer.profiles?.full_name || 'Engineer'}</h1>
                    {tier && (
                      <Badge className="mb-2 capitalize">{tier.tier_name} Tier - {tier.revenue_split_percentage}% Split</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-bold">{engineer.rating_average?.toFixed(1) || '0.0'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-bold mb-1">{engineer.total_projects_completed || 0}</div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-bold mb-1">{engineer.platform_usage_score || 0}</div>
                    <p className="text-xs text-muted-foreground">Platform Score</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-bold mb-1">{engineer.collaboration_sessions_count || 0}</div>
                    <p className="text-xs text-muted-foreground">Remote Sessions</p>
                  </div>
                </div>

                {engineer.profiles?.bio && (
                  <p className="text-muted-foreground">{engineer.profiles.bio}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Specialties */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {engineer.specialties?.map((specialty: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-sm">{specialty}</Badge>
              )) || <p className="text-muted-foreground">No specialties listed</p>}
            </div>
          </Card>

          {/* Platform Integration Showcase */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Platform Mastery
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Platform Usage Score</p>
                  <p className="text-sm text-muted-foreground">{engineer.platform_usage_score || 0}/100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Remote Collaboration</p>
                  <p className="text-sm text-muted-foreground">{engineer.collaboration_sessions_count || 0} successful sessions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Remote Work Rate</p>
                  <p className="text-sm text-muted-foreground">{engineer.remote_work_percentage?.toFixed(0) || 0}% on-platform</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Tools Mastered</p>
                  <p className="text-sm text-muted-foreground">{engineer.tools_mastered?.length || 0} integrated tools</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Details */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Service Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {engineer.mixing_rate_per_song && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Mixing Rate</p>
                    <p className="text-sm text-muted-foreground">${engineer.mixing_rate_per_song} per song</p>
                  </div>
                </div>
              )}
              {engineer.mastering_rate_per_song && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Mastering Rate</p>
                    <p className="text-sm text-muted-foreground">${engineer.mastering_rate_per_song} per song</p>
                  </div>
                </div>
              )}
              {engineer.turnaround_days && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Turnaround Time</p>
                    <p className="text-sm text-muted-foreground">{engineer.turnaround_days} days</p>
                  </div>
                </div>
              )}
              {engineer.years_experience && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Experience</p>
                    <p className="text-sm text-muted-foreground">{engineer.years_experience} years</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Reviews Section */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Client Reviews
            </h2>
            <EngineerReviews engineerId={userId!} />
          </Card>

          {/* CTA */}
          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Work Together?</h3>
            <p className="text-muted-foreground mb-6">
              Start a remote collaboration session and bring your music to life
            </p>
            <Button size="lg" className="px-12">
              Contact Engineer
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}