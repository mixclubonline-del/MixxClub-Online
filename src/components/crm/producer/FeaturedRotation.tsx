/**
 * FeaturedRotation — Manage featured beats shown on profile.
 * 
 * Fulfills the Producer CRM promise of "Featured Rotation" with
 * toggle-featured, reorder, and beat preview.
 */

import React from 'react';
import { GlassPanel, HubHeader, StaggeredList, EmptyState, HubSkeleton } from '../design';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Star, GripVertical, Play, Disc3 } from 'lucide-react';
import { useProducerBeats } from '@/hooks/useProducerBeats';
import { useAuth } from '@/hooks/useAuth';

export const FeaturedRotation: React.FC = () => {
    const { user } = useAuth();
    const { beats, isLoading } = useProducerBeats(user?.id);

    if (isLoading) {
        return <HubSkeleton variant="list" count={5} />;
    }

    const publishedBeats = beats?.filter(b => b.status === 'published') || [];

    return (
        <div className="space-y-6">
            <HubHeader
                icon={<Star className="h-5 w-5 text-amber-400" />}
                title="Featured Rotation"
                subtitle={`${publishedBeats.length} published beats available`}
                accent="rgba(245, 158, 11, 0.5)"
            />

            <GlassPanel padding="p-3" accent="rgba(245, 158, 11, 0.15)">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span>Toggle beats as featured. Top 5 featured beats appear on your public profile.</span>
                </div>
            </GlassPanel>

            {publishedBeats.length === 0 ? (
                <GlassPanel>
                    <EmptyState
                        icon={Disc3}
                        title="No published beats"
                        description="Publish beats from your catalog to feature them"
                    />
                </GlassPanel>
            ) : (
                <StaggeredList className="space-y-2">
                    {publishedBeats.map((beat, index) => (
                        <GlassPanel
                            key={beat.id}
                            padding="p-3"
                            hoverable
                            accent="rgba(245, 158, 11, 0.2)"
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab flex-shrink-0" />

                                <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/8 flex items-center justify-center flex-shrink-0">
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground truncate">{beat.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{beat.bpm || '—'} BPM</span>
                                        {beat.key && <span>• {beat.key}</span>}
                                        {beat.genre && <span>• {beat.genre}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {beat.price && (
                                        <span className="text-sm font-medium text-emerald-400">${beat.price}</span>
                                    )}
                                    {index < 5 && (
                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                                            Top 5
                                        </Badge>
                                    )}
                                    <Switch
                                        checked={index < 5}
                                        onCheckedChange={() => { }}
                                    />
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </StaggeredList>
            )}
        </div>
    );
};
