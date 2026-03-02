/**
 * StoryUpdates — Ephemeral 24h story-style updates.
 * 
 * Displays story bubbles that auto-expire after 24h.
 * Supports text, image, and audio snippets.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, MessageCircle, Camera, Mic, Clock } from 'lucide-react';
import type { StoryUpdate } from './types';

interface StoryUpdatesProps {
    stories: StoryUpdate[];
    className?: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h`;
}

function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt).getTime() < Date.now();
}

const TYPE_ICONS = {
    text: MessageCircle,
    image: Camera,
    audio: Mic,
};

export const StoryUpdates: React.FC<StoryUpdatesProps> = ({ stories, className }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const activeStories = stories.filter(s => !isExpired(s.expiresAt));

    if (activeStories.length === 0) return null;

    const expandedStory = activeStories.find(s => s.id === expandedId);

    return (
        <div className={cn('space-y-3', className)}>
            {/* Story bubbles row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {activeStories.map((story, i) => {
                    const Icon = TYPE_ICONS[story.type];
                    return (
                        <motion.button
                            key={story.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
                            className={cn(
                                'relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all',
                                'ring-2 ring-offset-2 ring-offset-background',
                                expandedId === story.id ? 'ring-primary scale-105' : 'ring-primary/40 hover:ring-primary/70'
                            )}
                        >
                            {story.type === 'image' ? (
                                <img src={story.content} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-white/70" />
                                </div>
                            )}

                            {/* Time badge */}
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-mono">
                                {timeAgo(story.createdAt)}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Expanded story */}
            <AnimatePresence>
                {expandedStory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="relative rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
                            {expandedStory.type === 'image' && (
                                <img
                                    src={expandedStory.content}
                                    alt=""
                                    className="w-full max-h-64 object-cover"
                                />
                            )}

                            <div className="p-4">
                                {expandedStory.type === 'text' && (
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {expandedStory.content}
                                    </p>
                                )}

                                {expandedStory.type === 'audio' && (
                                    <audio
                                        src={expandedStory.content}
                                        controls
                                        className="w-full h-10"
                                    />
                                )}

                                {expandedStory.caption && (
                                    <p className="text-xs text-muted-foreground mt-2">{expandedStory.caption}</p>
                                )}

                                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{timeAgo(expandedStory.createdAt)} ago</span>
                                    <span>· expires in {timeAgo(expandedStory.expiresAt)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setExpandedId(null)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
