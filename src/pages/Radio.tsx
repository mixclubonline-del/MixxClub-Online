import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import { HubBreadcrumb } from '@/components/ui/hub-breadcrumb';
import { HubRecommendations } from '@/components/ui/hub-recommendations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio as RadioIcon, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const genres = [
  { id: 'hip-hop', name: 'Hip-Hop', listeners: 1247, color: 'from-orange-500 to-red-600' },
  { id: 'electronic', name: 'Electronic', listeners: 892, color: 'from-cyan-500 to-blue-600' },
  { id: 'rock', name: 'Rock', listeners: 654, color: 'from-purple-500 to-pink-600' },
  { id: 'jazz', name: 'Jazz', listeners: 432, color: 'from-yellow-500 to-orange-600' },
  { id: 'lofi', name: 'Lo-Fi', listeners: 1823, color: 'from-green-500 to-teal-600' },
  { id: 'ambient', name: 'Ambient', listeners: 567, color: 'from-indigo-500 to-purple-600' }
];

const upcomingShows = [
  { time: '8:00 PM', dj: 'DJ Nexus', show: 'Late Night Beats', genre: 'Electronic' },
  { time: '10:00 PM', dj: 'MC Flow', show: 'Hip-Hop Live', genre: 'Hip-Hop' },
  { time: '12:00 AM', dj: 'Luna Waves', show: 'Midnight Chill', genre: 'Lo-Fi' }
];

const featuredMixes = [
  { title: 'Summer Vibes Mix', artist: 'DJ Solaris', plays: 12453, duration: '1h 23m' },
  { title: 'Underground Techno', artist: 'Pulse', plays: 8932, duration: '58m' },
  { title: 'Chillhop Sessions', artist: 'BeatMaker', plays: 15672, duration: '2h 15m' }
];

export default function Radio() {
  const { systemMode } = usePrime();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    trackEvent('radio_playback', 'engagement', isPlaying ? 'pause' : 'play');
  };

  const handleGenreSelect = (genre: typeof genres[0]) => {
    setSelectedGenre(genre);
    trackEvent('radio_genre_switch', 'engagement', genre.name);
  };

  return (
    <>
      <Helmet>
        <title>MIXXCLUB Radio — 24/7 Live Streaming</title>
        <meta 
          name="description" 
          content="24/7 live streaming radio with multiple genre stations. Discover new music, chat with listeners, and request tracks." 
        />
        <meta name="keywords" content="music radio, live streaming, DJ sets, electronic music, hip-hop radio" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <HubBreadcrumb items={[{ label: 'Radio' }]} />
          
          <PrimeGlow intensity={0.85}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">📻</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-magenta">
                MIXXCLUB Radio
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                24/7 live streaming. Discover new music, connect with listeners, and vibe together.
              </p>
              <div className="text-sm font-mono text-accent-cyan mt-4">
                PRIME STATUS: {systemMode.toUpperCase()}
              </div>
            </div>
          </PrimeGlow>

          {/* Live Player */}
          <Card className="mb-8 bg-gradient-to-br from-card/50 to-card border-accent-purple/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${selectedGenre.color} flex items-center justify-center animate-pulse`}>
                    <RadioIcon className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedGenre.name}</h2>
                    <p className="text-muted-foreground flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {selectedGenre.listeners.toLocaleString()} listening now
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handlePlayPause}
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedGenre.color} hover:scale-110 transition-transform`}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
              </div>
              
              {/* Genre Selector */}
              <div className="flex gap-3 flex-wrap">
                {genres.map((genre) => (
                  <Button
                    key={genre.id}
                    variant={selectedGenre.id === genre.id ? 'default' : 'outline'}
                    onClick={() => handleGenreSelect(genre)}
                    className={selectedGenre.id === genre.id ? `bg-gradient-to-r ${genre.color}` : ''}
                  >
                    {genre.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* DJ Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  DJ Schedule
                </CardTitle>
                <CardDescription>Upcoming live shows today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingShows.map((show, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                    <div>
                      <p className="font-semibold">{show.show}</p>
                      <p className="text-sm text-muted-foreground">with {show.dj}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{show.genre}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{show.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Mixes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Featured Mixes
                </CardTitle>
                <CardDescription>Top community uploads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredMixes.map((mix, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group">
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{mix.title}</p>
                      <p className="text-sm text-muted-foreground">{mix.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{mix.plays.toLocaleString()} plays</p>
                      <p className="text-sm text-muted-foreground">{mix.duration}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Chat CTA */}
          <Card className="mb-12 bg-gradient-to-r from-accent-purple/10 to-accent-magenta/10 border-accent-purple/30">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-accent-purple" />
              <h3 className="text-2xl font-bold mb-2">Join the Live Chat</h3>
              <p className="text-muted-foreground mb-4">
                Connect with other listeners, request songs, and vibe together in real-time
              </p>
              <Button size="lg" className="bg-gradient-to-r from-accent-purple to-accent-magenta">
                Open Chat
              </Button>
            </CardContent>
          </Card>

          <HubRecommendations excludeHref="/radio" />

          <div className="text-center mt-12">
            <a 
              href="/" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent-purple to-accent-magenta text-foreground hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
