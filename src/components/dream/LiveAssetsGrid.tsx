import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { AssetContext } from '@/hooks/useDreamEngine';

interface LiveAssetsGridProps {
  contexts: AssetContext[];
  liveAssets: Map<string, { id: string; url: string }>;
  loading: boolean;
  onAssetClick?: (context: string, asset: { id: string; url: string } | null) => void;
}

export function LiveAssetsGrid({ contexts, liveAssets, loading, onAssetClick }: LiveAssetsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {contexts.map((ctx) => {
        // Find any live asset that starts with this prefix
        const liveAsset = Array.from(liveAssets.entries()).find(
          ([key]) => key.startsWith(ctx.context_prefix)
        );
        const hasLive = !!liveAsset;

        return (
          <Card
            key={ctx.id}
            className={`relative aspect-square overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
              hasLive ? 'ring-1 ring-green-500/30' : 'ring-1 ring-border/30'
            }`}
            onClick={() => onAssetClick?.(ctx.context_prefix, liveAsset ? { id: liveAsset[1].id, url: liveAsset[1].url } : null)}
          >
            {hasLive && liveAsset ? (
              <img
                src={liveAsset[1].url}
                alt={ctx.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              {hasLive ? (
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
              ) : (
                <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
              )}
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs font-medium text-white truncate">{ctx.name}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
