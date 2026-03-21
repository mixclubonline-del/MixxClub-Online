import React from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStreams, LiveStream } from '@/hooks/useLiveStream';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ReplayCard: React.FC<{ stream: LiveStream }> = ({ stream }) => {
  const navigate = useNavigate();
  const initials = stream.host?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const duration = stream.started_at && stream.ended_at
    ? Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / 60000)
    : null;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:ring-2 ring-primary/50 transition-all group"
      onClick={() => navigate(`/watch/${stream.id}`)}
    >
      <div className="relative aspect-video bg-gradient-to-br from-muted/60 to-muted/20">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Replay badge */}
        <Badge className="absolute top-2 left-2 bg-muted/90 text-muted-foreground backdrop-blur-sm gap-1">
          <Play className="h-3 w-3" />
          Replay
        </Badge>

        {/* Duration */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}m
          </div>
        )}

        {/* Hover play */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={stream.host?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{stream.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{stream.host?.full_name || 'Anonymous'}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {stream.peak_viewers}
              </span>
              {stream.ended_at && (
                <>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(stream.ended_at), { addSuffix: true })}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentStreams: React.FC = () => {
  const { data: streams, isLoading } = useLiveStreams({ isLive: false });

  // Filter to streams that have ended (replays)
  const recentStreams = (streams || [])
    .filter((s) => s.ended_at)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Play className="h-5 w-5 text-muted-foreground" />
          Recent Streams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video" />
              <CardContent className="p-3">
                <div className="flex gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recentStreams.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Play className="h-5 w-5 text-muted-foreground" />
          Recent Streams
        </h2>
        <div className="text-center py-10 text-muted-foreground border border-dashed border-border/50 rounded-xl">
          <Play className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Past stream recordings will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Play className="h-5 w-5 text-muted-foreground" />
        Recent Streams
        <Badge variant="outline" className="ml-1 text-xs">
          {recentStreams.length}
        </Badge>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentStreams.map((stream) => (
          <ReplayCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
};

export default RecentStreams;
