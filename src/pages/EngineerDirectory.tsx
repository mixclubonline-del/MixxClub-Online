import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Star, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface EngineerProfile {
  id: string;
  user_id: string;
  specialties: string[];
  rating_average: number;
  total_projects_completed: number;
  platform_usage_score: number;
  collaboration_sessions_count: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function EngineerDirectory() {
  const [engineers, setEngineers] = useState<EngineerProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineer_profiles')
        .select('*')
        .eq('is_available', true)
        .order('platform_usage_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profile data for each engineer
      if (data && data.length > 0) {
        const userIds = data.map(e => e.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        // Merge profiles data
        const engineersWithProfiles = data.map(engineer => ({
          ...engineer,
          profiles: profiles?.find(p => p.id === engineer.user_id) || { full_name: '', avatar_url: '' }
        }));
        
        setEngineers(engineersWithProfiles as any);
      }
    } catch (error) {
      console.error('Error fetching engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = engineers.filter(engineer => {
    const name = engineer.profiles?.full_name?.toLowerCase() || '';
    const specialties = engineer.specialties?.join(' ').toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || specialties.includes(search);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Find Your Perfect Engineer
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            Browse our network of talented engineers specializing in remote collaboration
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading engineers...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEngineers.map((engineer) => (
                <Card key={engineer.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {engineer.profiles?.avatar_url ? (
                        <img 
                          src={engineer.profiles.avatar_url} 
                          alt={engineer.profiles.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {engineer.profiles?.full_name?.charAt(0) || 'E'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{engineer.profiles?.full_name || 'Engineer'}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span>{engineer.rating_average?.toFixed(1) || '0.0'}</span>
                        <span className="ml-2">•</span>
                        <span className="ml-2">{engineer.total_projects_completed || 0} projects</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {engineer.specialties?.slice(0, 3).map((specialty, i) => (
                      <Badge key={i} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Platform Score: {engineer.platform_usage_score || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-primary" />
                      <span>{engineer.collaboration_sessions_count || 0} Remote Sessions</span>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/engineer/${engineer.user_id}`}>View Profile</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredEngineers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No engineers found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}