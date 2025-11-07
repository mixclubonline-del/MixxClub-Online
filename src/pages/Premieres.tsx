import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PremiereCard from '@/components/premieres/PremiereCard';
import FanDashboard from '@/components/premieres/FanDashboard';
import LeaderboardView from '@/components/premieres/LeaderboardView';
import { Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Premiere {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  artwork_url: string;
  genre: string;
  bpm: number;
  premiere_date: string;
  status: string;
  total_votes: number;
  average_rating: number;
  play_count: number;
  artist_id: string;
  engineer_id: string;
  artist_profile?: any;
}

export default function Premieres() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('live');
  const [premieres, setPremieres] = useState<Premiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTrending, setUpdatingTrending] = useState(false);

  useEffect(() => {
    fetchPremieres();
  }, [activeTab]);

  const fetchPremieres = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('premieres')
        .select(`
          *,
          artist_profile:profiles!artist_id (
            display_name,
            avatar_url
          )
        `)
        .order('premiere_date', { ascending: false });

      if (activeTab === 'live') {
        query = query.eq('status', 'live');
      } else if (activeTab === 'trending') {
        query = query
          .eq('status', 'live')
          .gte('premiere_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('total_votes', { ascending: false });
      } else if (activeTab === 'upcoming') {
        query = query.eq('status', 'scheduled');
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setPremieres((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading premieres",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTrendingScores = async () => {
    setUpdatingTrending(true);
    try {
      const { error } = await supabase.functions.invoke('calculate-trending');
      
      if (error) throw error;
      
      toast({
        title: "Trending scores updated!",
        description: "Leaderboard rankings have been refreshed.",
      });
      
      // Refresh the current view
      if (activeTab === 'trending' || activeTab === 'leaderboard') {
        fetchPremieres();
      }
    } catch (error: any) {
      toast({
        title: "Failed to update trending",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingTrending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Premieres — MixClub Online</title>
        <meta 
          name="description" 
          content="Discover and vote on newly mixed tracks. Support artists and earn rewards." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-6xl">🎵</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={updateTrendingScores}
                disabled={updatingTrending}
                className="ml-4"
              >
                <TrendingUp className={`h-4 w-4 mr-2 ${updatingTrending ? 'animate-spin' : ''}`} />
                {updatingTrending ? 'Updating...' : 'Update Rankings'}
              </Button>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">
              Track Premieres
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Be the first to hear freshly mixed tracks. Vote, discover, and earn rewards.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="live">🔴 Live Now</TabsTrigger>
                  <TabsTrigger value="trending">🔥 Trending</TabsTrigger>
                  <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
                  <TabsTrigger value="upcoming">⏰ Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="live" className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : premieres.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No live premieres at the moment. Check back soon!
                    </div>
                  ) : (
                    premieres.map((premiere) => (
                      <PremiereCard key={premiere.id} premiere={premiere} onUpdate={fetchPremieres} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="trending" className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : premieres.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No trending tracks right now. Be an early voter!
                    </div>
                  ) : (
                    premieres.map((premiere) => (
                      <PremiereCard key={premiere.id} premiere={premiere} onUpdate={fetchPremieres} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-6">
                  <LeaderboardView />
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : premieres.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No upcoming premieres scheduled.
                    </div>
                  ) : (
                    premieres.map((premiere) => (
                      <PremiereCard key={premiere.id} premiere={premiere} onUpdate={fetchPremieres} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {user && (
              <div className="lg:sticky lg:top-24 lg:self-start">
                <FanDashboard />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
