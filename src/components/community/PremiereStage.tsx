import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ThumbsUp, Music2, TrendingUp, Users, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const PremiereStage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: premieres, isLoading } = useQuery({
    queryKey: ['featured-premieres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premieres')
        .select('*')
        .eq('status', 'live')
        .order('total_votes', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  const featuredPremiere = premieres?.[0];
  const trendingPremieres = premieres?.slice(1) || [];

  // Animated waveform bars
  const waveformBars = [...Array(40)].map((_, i) => ({
    height: 20 + Math.random() * 60,
    delay: i * 0.02
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music2 className="w-8 h-8 text-accent-cyan" />
          <h2 className="text-2xl font-bold">Premiere Stage</h2>
        </div>
        <Link to="/premieres">
          <Button variant="outline" size="sm" className="gap-2">
            All Premieres
            <TrendingUp className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Featured Premiere */}
      {featuredPremiere ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-cyan/10 via-card to-primary/10 border border-accent-cyan/20"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="relative p-6">
            {/* Now Playing Badge */}
            <Badge className="absolute top-4 right-4 bg-green-500/20 text-green-400 border-green-500/30 gap-1">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              NOW LIVE
            </Badge>

            <div className="grid md:grid-cols-[200px_1fr] gap-6">
              {/* Artwork */}
              <motion.div
                className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-accent-cyan/30 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
              >
                {featuredPremiere.artwork_url ? (
                  <img 
                    src={featuredPremiere.artwork_url} 
                    alt={featuredPremiere.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music2 className="w-16 h-16 text-muted-foreground" />
                )}
                
                {/* Play Overlay */}
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </div>
                </motion.button>
              </motion.div>

              {/* Track Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{featuredPremiere.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {featuredPremiere.description || 'Freshly mixed and mastered on MixClub'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{featuredPremiere.genre || 'Hip-Hop'}</Badge>
                    {featuredPremiere.bpm && (
                      <Badge variant="outline">{featuredPremiere.bpm} BPM</Badge>
                    )}
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="h-16 flex items-end gap-[2px] mb-4 overflow-hidden">
                  {waveformBars.map((bar, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-accent-cyan to-primary rounded-t"
                      initial={{ height: 4 }}
                      animate={{ 
                        height: isPlaying ? [bar.height * 0.3, bar.height, bar.height * 0.5] : 4 
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isPlaying ? Infinity : 0,
                        delay: bar.delay,
                        repeatType: 'reverse'
                      }}
                    />
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {featuredPremiere.total_votes || 0} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones className="w-4 h-4" />
                      {featuredPremiere.play_count || 0} plays
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      Vote
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-8 rounded-2xl bg-card/30 border border-white/5 text-center">
          <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No live premieres right now</p>
        </div>
      )}

      {/* Trending Chart */}
      {trendingPremieres.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending This Week
          </h3>
          <div className="space-y-2">
            {trendingPremieres.map((premiere, i) => (
              <motion.div
                key={premiere.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-card/30 border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="text-2xl font-bold text-muted-foreground w-8">
                  #{i + 2}
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent-cyan/30 flex items-center justify-center flex-shrink-0">
                  {premiere.artwork_url ? (
                    <img 
                      src={premiere.artwork_url} 
                      alt={premiere.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Music2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{premiere.title}</div>
                  <div className="text-sm text-muted-foreground">{premiere.genre || 'Hip-Hop'}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-primary">{premiere.total_votes || 0}</div>
                  <div className="text-muted-foreground">votes</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiereStage;
