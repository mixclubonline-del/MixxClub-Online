import React from 'react';
import { Radio, Users, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLiveStreams, LiveStream } from '@/hooks/useLiveStream';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { GoLiveButton } from './GoLiveButton';
import { Skeleton } from '@/components/ui/skeleton';

interface LiveCardProps {
  stream: LiveStream;
  onClick: () => void;
}

const LiveCard: React.FC<LiveCardProps> = ({ stream, onClick }) => {
  const initials = stream.host?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Radio className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {/* Live Badge */}
        {stream.is_live && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        )}

        {/* Viewer Count */}
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {stream.viewer_count}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium">Watch Now</span>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={stream.host?.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{stream.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {stream.host?.full_name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs capitalize">
                {stream.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LiveCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-video" />
    <CardContent className="p-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface LiveFeedProps {
  category?: string;
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  category,
  limit = 6,
  showHeader = true,
  compact = false,
}) => {
  const { navigateTo } = useFlowNavigation();
  const { data: streams, isLoading } = useLiveStreams({ 
    category, 
    isLive: true 
  });

  const displayStreams = streams?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-bold">Live Now</h2>
            </div>
          </div>
        )}
        <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <LiveCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (displayStreams.length === 0) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Live Now</h2>
            </div>
          </div>
        )}
        <Card className="p-8 text-center">
          <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No one is live right now</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to go live and share with the community!
          </p>
          <GoLiveButton />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive animate-pulse" />
            <h2 className="text-xl font-bold">Live Now</h2>
            <Badge variant="destructive" className="ml-2">
              {displayStreams.length}
            </Badge>
          </div>
          {streams && streams.length > limit && (
            <button
              onClick={() => navigateTo('/live')}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {displayStreams.map((stream) => (
          <LiveCard
            key={stream.id}
            stream={stream}
            onClick={() => navigateTo(`/watch/${stream.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
