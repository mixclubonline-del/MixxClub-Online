import React from 'react';
import { Radio, Eye, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStreams, LiveStream } from '@/hooks/useLiveStream';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { GoLiveButton } from './GoLiveButton';

interface WhosLiveWidgetProps {
  limit?: number;
  compact?: boolean;
}

const LiveStreamRow: React.FC<{ stream: LiveStream; onClick: () => void }> = ({ stream, onClick }) => {
  const initials = stream.host?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-destructive">
          <AvatarImage src={stream.host?.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{stream.host?.full_name || 'Anonymous'}</p>
        <p className="text-xs text-muted-foreground truncate">{stream.title}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        {stream.viewer_count}
      </div>
    </div>
  );
};

export const WhosLiveWidget: React.FC<WhosLiveWidgetProps> = ({ limit = 3, compact = false }) => {
  const { navigateTo } = useFlowNavigation();
  const { data: streams, isLoading } = useLiveStreams({ isLive: true });

  const displayStreams = streams?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardHeader className={compact ? 'p-0 pb-3' : ''}>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="h-4 w-4 text-destructive" />
            Who's Live
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'p-3' : ''}>
      <CardHeader className={compact ? 'p-0 pb-3' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="h-4 w-4 text-destructive animate-pulse" />
            Who's Live
            {displayStreams.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {streams?.length || 0}
              </Badge>
            )}
          </CardTitle>
          {displayStreams.length > 0 && streams && streams.length > limit && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => navigateTo('/live')}
            >
              See All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? 'p-0' : ''}>
        {displayStreams.length === 0 ? (
          <div className="text-center py-4">
            <Radio className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No one is live right now</p>
            <GoLiveButton className="text-xs" />
          </div>
        ) : (
          <div className="space-y-1">
            {displayStreams.map((stream) => (
              <LiveStreamRow
                key={stream.id}
                stream={stream}
                onClick={() => navigateTo(`/watch/${stream.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhosLiveWidget;
