import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';
import FanDashboard from '@/components/premieres/FanDashboard';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Music, 
  Users, 
  Star, 
  Play, 
  Clock,
  Flame,
  Trophy
} from 'lucide-react';

interface TrendingPremiere {
  id: string;
  title: string;
  description: string;
  artwork_url: string;
  genre: string;
  total_votes: number;
  play_count: number;
  trending_score: number;
}

interface PlatformStats {
  totalPremieres: number;
  totalVotes: number;
  totalPlays: number;
  activeFans: number;
}

export default function Crowd() {
  const { accentColor, systemMode } = usePrime();
  const { user } = useAuth();
  const [trendingTracks, setTrendingTracks] = useState<TrendingPremiere[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalPremieres: 0,
    totalVotes: 0,
    totalPlays: 0,
    activeFans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrowdData();
  }, []);

  const fetchCrowdData = async () => {
    try {
      // Fetch trending tracks
      const { data: premieres } = await supabase
        .from('premieres')
        .select('id, title, description, artwork_url, genre, total_votes, play_count, trending_score')
        .eq('status', 'live')
        .order('trending_score', { ascending: false })
        .limit(6);

      if (premieres) {
        setTrendingTracks(premieres as TrendingPremiere[]);
        
        // Calculate platform stats from data
        const totalVotes = premieres.reduce((sum, p) => sum + (p.total_votes || 0), 0);
        const totalPlays = premieres.reduce((sum, p) => sum + (p.play_count || 0), 0);
        
        setStats({
          totalPremieres: premieres.length,
          totalVotes,
          totalPlays,
          activeFans: Math.floor(totalVotes * 0.7), // Estimate
        });
      }
    } catch (error) {
      console.error('Error fetching crowd data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>The Crowd — MixClub Online</title>
        <meta 
          name="description" 
          content="Fan zone for music lovers. Vote on tracks, discover new artists, and earn rewards for your engagement." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.6}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🎧</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">
                The Crowd
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Fan zone where your voice matters. Vote on tracks, discover new music, and earn rewards for participation.
              </p>
              <div className="text-sm font-mono text-accent-cyan mt-4">
                PRIME STATUS: {systemMode.toUpperCase()}
              </div>
            </div>
          </PrimeGlow>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-card/30 backdrop-blur border-primary/20">
              <CardContent className="p-4 text-center">
                <Music className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{stats.totalPremieres}</p>
                <p className="text-sm text-muted-foreground">Live Premieres</p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 backdrop-blur border-primary/20">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-3xl font-bold">{stats.totalVotes.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 backdrop-blur border-primary/20">
              <CardContent className="p-4 text-center">
                <Play className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold">{stats.totalPlays.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 backdrop-blur border-primary/20">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-3xl font-bold">{stats.activeFans}</p>
                <p className="text-sm text-muted-foreground">Active Fans</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Trending Tracks - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Trending Now
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <a href="/premieres">View All</a>
                </Button>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-card/30 animate-pulse h-32" />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {trendingTracks.map((track, index) => (
                    <Card 
                      key={track.id} 
                      className="bg-card/30 backdrop-blur border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                    >
                      <CardContent className="p-4 flex gap-4">
                        <div className="relative">
                          <img 
                            src={track.artwork_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80'} 
                            alt={track.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{track.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {track.genre}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {track.trending_score?.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {track.total_votes} votes
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {track.play_count?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Curated Playlists Section */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Curated Playlists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Trap Essentials', count: 24, icon: '🔥' },
                      { name: 'Late Night Vibes', count: 18, icon: '🌙' },
                      { name: 'Rising Stars', count: 12, icon: '⭐' },
                    ].map((playlist) => (
                      <div 
                        key={playlist.name}
                        className="p-4 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer text-center"
                      >
                        <div className="text-2xl mb-2">{playlist.icon}</div>
                        <p className="font-medium text-sm">{playlist.name}</p>
                        <p className="text-xs text-muted-foreground">{playlist.count} tracks</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Fan Dashboard & Activity */}
            <div className="space-y-6">
              {/* Fan Dashboard */}
              <FanDashboard />

              {/* Activity Feed */}
              <Card className="bg-card/30 backdrop-blur border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIActivityFeed />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center space-x-4">
            <a 
              href="/premieres" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-blue text-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all font-medium"
            >
              🎵 Track Premieres
            </a>
            <a 
              href="/network" 
              className="inline-block px-8 py-4 rounded-full bg-card/30 border border-white/10 text-foreground hover:bg-card/50 transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
