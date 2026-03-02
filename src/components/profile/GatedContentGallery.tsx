/**
 * GatedContentGallery — Fan-facing display of an artist's gated content.
 * 
 * Shows locked/unlocked items with prices, previews, and unlock buttons.
 * Goes on the artist's public profile.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Coins, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGatedContent, type GatedItemWithUnlock } from '@/hooks/useGatedContent';
import { useMixxWallet } from '@/hooks/useMixxWallet';

interface GatedContentGalleryProps {
    creatorId: string;
    accent?: string;
}

const TYPE_EMOJIS: Record<string, string> = {
    stems: '🎛️',
    tutorial: '🎓',
    behind_scenes: '🎬',
    early_access: '🚀',
    sample_pack: '🥁',
    preset: '🎨',
    custom: '✨',
};

export function GatedContentGallery({ creatorId, accent }: GatedContentGalleryProps) {
    const { items, unlockItem, isUnlocking } = useGatedContent(creatorId);
    const { canAfford } = useMixxWallet();
    const [unlockingId, setUnlockingId] = useState<string | null>(null);

    if (items.length === 0) return null;

    const handleUnlock = async (itemId: string) => {
        setUnlockingId(itemId);
        try {
            await unlockItem(itemId);
        } finally {
            setUnlockingId(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-foreground">Exclusive Content</h3>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">
                    {items.length}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                            'rounded-xl border p-3 transition-all',
                            item.isUnlocked
                                ? 'bg-violet-500/5 border-violet-500/20'
                                : 'bg-white/[0.02] border-white/8 hover:border-white/15'
                        )}
                    >
                        <div className="flex items-start gap-2.5">
                            <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0',
                                item.isUnlocked ? 'bg-violet-500/20' : 'bg-white/5'
                            )}>
                                {TYPE_EMOJIS[item.content_type] || '✨'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    {item.isUnlocked ? (
                                        <Unlock className="h-3 w-3 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    )}
                                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                </div>

                                {item.description && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}

                                {/* Preview text for locked items */}
                                {!item.isUnlocked && item.preview_text && (
                                    <p className="text-[10px] text-muted-foreground/60 italic mt-1">
                                        "{item.preview_text}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-muted-foreground">
                                        {item.total_unlocks} unlocked
                                    </span>

                                    {item.isUnlocked ? (
                                        <a
                                            href={item.content_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                                        >
                                            Access <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs gap-1 border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                                            onClick={() => handleUnlock(item.id)}
                                            disabled={isUnlocking || !canAfford(item.coinz_price)}
                                        >
                                            {unlockingId === item.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="h-3 w-3" />
                                                    {item.coinz_price.toLocaleString()}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
