import { useParams } from 'react-router-dom';
import { useStream, useStreamGifts, useUserCoins, useLiveGifts } from '@/hooks/useLiveStream';
import { StreamChat } from './StreamChat';
import { GlassPanel } from '@/components/crm/design';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Eye, Heart, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveStreamView() {
  const { streamId } = useParams<{ streamId: string }>();
  const { data: stream, isLoading } = useStream(streamId);
  const gifts = useStreamGifts(streamId);
  const { data: availableGifts } = useLiveGifts();
  const { balance, sendGift } = useUserCoins();
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stream || !streamId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Stream not found</h2>
        <p className="text-muted-foreground">This stream may have ended or doesn't exist.</p>
      </div>
    );
  }

  const hostInitials = stream.host?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video area */}
        <div className="lg:col-span-2 space-y-4">
          <GlassPanel padding="p-0" className="overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              {stream.playback_url ? (
                <video
                  src={stream.playback_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  controls
                />
              ) : (
                <div className="text-center">
                  <Radio className="h-16 w-16 text-primary/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Stream preview unavailable</p>
                </div>
              )}

              {/* Live badge */}
              {stream.is_live && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}

              {/* Viewer count */}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {stream.viewer_count.toLocaleString()}
              </div>

              {/* Gift animations */}
              <AnimatePresence>
                {gifts.map(g => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 50, x: Math.random() * 200 }}
                    animate={{ opacity: 1, y: -100 }}
                    exit={{ opacity: 0, y: -200 }}
                    transition={{ duration: 2 }}
                    className="absolute bottom-20 left-10 text-3xl pointer-events-none"
                  >
                    {g.gift?.emoji || '🎁'} 
                    <span className="text-sm text-white drop-shadow-lg ml-1">
                      {g.sender?.full_name}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassPanel>

          {/* Stream info */}
          <GlassPanel padding="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={stream.host?.avatar_url || undefined} />
                  <AvatarFallback>{hostInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold truncate">{stream.title}</h1>
                  <p className="text-sm text-muted-foreground">{stream.host?.full_name || 'Anonymous'}</p>
                  {stream.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{stream.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Follow
                </Button>
                <Button size="sm" onClick={() => setShowGiftPicker(!showGiftPicker)}>
                  <Gift className="h-4 w-4 mr-1" />
                  Gift
                </Button>
              </div>
            </div>

            {/* Gift picker */}
            <AnimatePresence>
              {showGiftPicker && availableGifts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Your balance: {balance} coins</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableGifts.map(gift => (
                        <Button
                          key={gift.id}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={balance < gift.coin_cost}
                          onClick={() => {
                            sendGift.mutate({ streamId: streamId!, giftId: gift.id });
                            setShowGiftPicker(false);
                          }}
                        >
                          <span className="text-lg">{gift.emoji}</span>
                          <span className="text-xs">{gift.coin_cost}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPanel>
        </div>

        {/* Chat sidebar */}
        <div className="lg:col-span-1">
          <GlassPanel padding="p-0" className="h-[600px] flex flex-col">
            <div className="p-3 border-b border-border/30">
              <h3 className="font-semibold text-sm">Live Chat</h3>
            </div>
            <div className="flex-1 min-h-0">
              <StreamChat streamId={streamId!} />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
