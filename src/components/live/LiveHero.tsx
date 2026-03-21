import React from 'react';
import { Radio, Eye, Play, Waves } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LiveStream } from '@/hooks/useLiveStream';
import { GoLiveButton } from './GoLiveButton';

interface LiveHeroProps {
  featuredStream?: LiveStream | null;
}

export const LiveHero: React.FC<LiveHeroProps> = ({ featuredStream }) => {
  const navigate = useNavigate();

  if (!featuredStream) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/20 p-10 md:p-16 text-center"
      >
        {/* Animated waveform background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 mx-0.5 rounded-full bg-primary"
              animate={{
                height: [8, 20 + Math.random() * 40, 8],
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                repeat: Infinity,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <Waves className="h-14 w-14 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            The stage is quiet...
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No one is live right now. Be the first to go live and share your craft with the community.
          </p>
          <GoLiveButton />
        </div>
      </motion.div>
    );
  }

  const initials = featuredStream.host?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
      onClick={() => navigate(`/watch/${featuredStream.id}`)}
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-destructive via-primary to-destructive bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite] z-0" />

      <div className="relative z-10 rounded-2xl overflow-hidden bg-background">
        {/* Thumbnail / Visual */}
        <div className="relative aspect-[21/9] bg-gradient-to-br from-primary/20 via-background to-destructive/10">
          {featuredStream.thumbnail_url ? (
            <img
              src={featuredStream.thumbnail_url}
              alt={featuredStream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Animated bars */}
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-t bg-primary/30"
                    animate={{
                      height: [12, 40 + Math.random() * 56, 12],
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.6,
                      repeat: Infinity,
                      delay: i * 0.06,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Live badge */}
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground gap-1.5 px-3 py-1 text-sm font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            LIVE
          </Badge>

          {/* Viewer count */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium">
            <Eye className="h-4 w-4 text-destructive" />
            {featuredStream.viewer_count.toLocaleString()}
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-destructive">
                  <AvatarImage src={featuredStream.host?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {featuredStream.title}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {featuredStream.host?.full_name || 'Anonymous'} ·{' '}
                    <Badge variant="secondary" className="text-xs capitalize">
                      {featuredStream.category}
                    </Badge>
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Play className="h-5 w-5" />
                Watch Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveHero;
