import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radio, Users, Heart, Share2, Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStream, useStreamFollow } from '@/hooks/useLiveStream';
import { LiveChat } from '@/components/live/LiveChat';
import { GiftPicker } from '@/components/live/GiftPicker';
import { GiftAnimation } from '@/components/live/GiftAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const WatchStreamPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { data: stream, isLoading } = useStream(streamId);
  const { isFollowing, toggleFollow } = useStreamFollow(stream?.host_id);
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  const hostInitials = stream?.host?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const handleShare = async () => {
    try {
      await navigator.share({
        title: stream?.title,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-[600px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Stream Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This stream may have ended or doesn't exist.
          </p>
          <Button onClick={() => navigate('/live')}>Browse Live Streams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gift Animations */}
      {streamId && <GiftAnimation streamId={streamId} />}

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/live')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {stream.is_live ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="text-center">
                    <Radio className="h-16 w-16 mx-auto text-primary animate-pulse mb-4" />
                    <p className="text-lg font-medium">Stream is live!</p>
                    <p className="text-sm text-muted-foreground">
                      Video player will be integrated with WebRTC/LiveKit
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Stream has ended</p>
                  </div>
                </div>
              )}

              {/* Live Badge */}
              {stream.is_live && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}

              {/* Viewer Count */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {stream.viewer_count} watching
              </div>
            </div>

            {/* Stream Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{stream.title}</h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Host Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={stream.host?.avatar_url || undefined} />
                    <AvatarFallback>{hostInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {stream.host?.full_name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {stream.category}
                    </div>
                  </div>
                  <Button
                    variant={isFollowing ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => toggleFollow.mutate()}
                    disabled={toggleFollow.isPending}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`}
                    />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>

              {stream.description && (
                <p className="text-muted-foreground">{stream.description}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Peak viewers: {stream.peak_viewers}</span>
                <span>Gifts: ${stream.total_gifts_value.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="h-[600px]">
            {streamId && (
              <LiveChat
                streamId={streamId}
                className="h-full"
                onGiftClick={() => setShowGiftPicker(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Gift Picker */}
      {streamId && (
        <GiftPicker
          open={showGiftPicker}
          onOpenChange={setShowGiftPicker}
          streamId={streamId}
        />
      )}
    </div>
  );
};

export default WatchStreamPage;
