import React from 'react';
import { useDiscoverTracks } from '@/hooks/useMusicCatalogue';
import { useGlobalPlayer, Track } from '@/contexts/GlobalPlayerContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Music2, Loader2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface NewReleasesFeedProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showAll?: boolean;
}

export const NewReleasesFeed: React.FC<NewReleasesFeedProps> = ({
  title = "New Releases",
  subtitle = "Fresh tracks from the community",
  limit = 8,
  showAll = false,
}) => {
  const { data: tracks, isLoading } = useDiscoverTracks({ limit, sortBy: 'recent' });
  const { play, addToQueue, currentTrack, isPlaying } = useGlobalPlayer();

  const handlePlay = (track: any) => {
    const playerTrack: Track = {
      id: track.id,
      title: track.title,
      artist: track.profiles?.full_name || 'Unknown Artist',
      artistId: track.user_id,
      audioUrl: track.audio_url,
      artworkUrl: track.artwork_url,
      duration: track.duration_seconds || 0,
      genre: track.genre,
    };
    play(playerTrack);
  };

  const handleAddToQueue = (track: any) => {
    const playerTrack: Track = {
      id: track.id,
      title: track.title,
      artist: track.profiles?.full_name || 'Unknown Artist',
      artistId: track.user_id,
      audioUrl: track.audio_url,
      artworkUrl: track.artwork_url,
      duration: track.duration_seconds || 0,
      genre: track.genre,
    };
    addToQueue(playerTrack);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold mb-2">No tracks yet</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to release music on the platform!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {title}
          </h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {showAll && (
          <Button variant="outline" size="sm">
            See All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isTrackPlaying = isCurrentTrack && isPlaying;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handlePlay(track)}
              >
                <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5">
                  {track.artwork_url ? (
                    <img 
                      src={track.artwork_url} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Button
                      size="icon"
                      className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(track);
                      }}
                    >
                      {isTrackPlaying ? (
                        <div className="flex gap-0.5">
                          <span className="w-1 h-4 bg-current animate-pulse" />
                          <span className="w-1 h-4 bg-current animate-pulse delay-75" />
                          <span className="w-1 h-4 bg-current animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                  </div>

                  {/* Genre badge */}
                  {track.genre && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-black/60 text-white rounded-full backdrop-blur-sm">
                        {track.genre}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm truncate" title={track.title}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    Unknown Artist
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NewReleasesFeed;
