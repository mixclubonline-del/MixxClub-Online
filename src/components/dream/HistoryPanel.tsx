import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Image, Video, Music, Mic, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { GenerationHistoryItem, DreamMode } from '@/hooks/useDreamEngine';

interface HistoryPanelProps {
  history: GenerationHistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onSelect?: (item: GenerationHistoryItem) => void;
}

const modeIcons: Record<DreamMode, React.ReactNode> = {
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  speech: <Mic className="w-4 h-4" />,
  'image-edit': <Image className="w-4 h-4" />,
};

export function HistoryPanel({ history, loading, onRefresh, onSelect }: HistoryPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-2">No generations yet</p>
        <p className="text-sm">Start dreaming to see your history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Generations</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {history.slice(0, 20).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
          >
            <Card
              className="relative aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => onSelect?.(item)}
            >
              {item.result_url ? (
                item.mode === 'video' ? (
                  <video
                    src={item.result_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : item.mode === 'audio' || item.mode === 'speech' ? (
                  <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                    {modeIcons[item.mode]}
                  </div>
                ) : (
                  <img
                    src={item.result_url}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No preview</span>
                </div>
              )}
              
              {/* Mode badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {modeIcons[item.mode]}
                </Badge>
              </div>
              
              {/* Saved indicator */}
              {item.saved_asset_id && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <p className="text-xs text-white text-center line-clamp-3 mb-2">
                  {item.prompt}
                </p>
                <span className="text-xs text-white/70">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
