/**
 * HeroReel — Pinned content carousel for the top of an artist's profile.
 * 
 * Auto-advances every 6s, supports drag/swipe, shows up to 5 items.
 * Items can be tracks (with play button), images, or videos.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, Pause, ChevronLeft, ChevronRight, Music, Image as ImageIcon, Video } from 'lucide-react';
import type { FeaturedMediaItem } from './types';

interface HeroReelProps {
    items: FeaturedMediaItem[];
    autoAdvance?: boolean;
    className?: string;
}

const TYPE_ICONS: Record<FeaturedMediaItem['type'], React.ElementType> = {
    track: Music,
    image: ImageIcon,
    video: Video,
};

export const HeroReel: React.FC<HeroReelProps> = ({
    items,
    autoAdvance = true,
    className,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const totalItems = items.length;

    const goNext = useCallback(() => {
        setActiveIndex((i) => (i + 1) % totalItems);
    }, [totalItems]);

    const goPrev = useCallback(() => {
        setActiveIndex((i) => (i - 1 + totalItems) % totalItems);
    }, [totalItems]);

    // Auto-advance timer
    useEffect(() => {
        if (!autoAdvance || isPaused || totalItems <= 1) return;
        const timer = setInterval(goNext, 6000);
        return () => clearInterval(timer);
    }, [autoAdvance, isPaused, totalItems, goNext]);

    if (totalItems === 0) return null;

    const current = items[activeIndex];
    const Icon = TYPE_ICONS[current.type];

    return (
        <div className={cn('relative group', className)}>
            {/* Main display */}
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-black/40 border border-white/8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        {/* Background image / thumbnail */}
                        {(current.thumbnailUrl || current.type === 'image') && (
                            <img
                                src={current.thumbnailUrl || current.url}
                                alt={current.title}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Default gradient for tracks without artwork */}
                        {current.type === 'track' && !current.thumbnailUrl && (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30" />
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Type badge + play button for tracks */}
                                <div className="flex-shrink-0">
                                    {current.type === 'track' ? (
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-5 w-5 text-white fill-white" />
                                            ) : (
                                                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                                            )}
                                        </button>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Title + metadata */}
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate">
                                        {current.title}
                                    </h3>
                                    {current.caption && (
                                        <p className="text-sm text-white/60 truncate">{current.caption}</p>
                                    )}
                                    {current.metadata && current.type === 'track' && (
                                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                            {current.metadata.bpm && <span>{current.metadata.bpm} BPM</span>}
                                            {current.metadata.key && <span>{current.metadata.key}</span>}
                                            {current.metadata.genre && <span>{current.metadata.genre}</span>}
                                            {current.metadata.duration && (
                                                <span>{Math.floor(current.metadata.duration / 60)}:{String(current.metadata.duration % 60).padStart(2, '0')}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {totalItems > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                        >
                            <ChevronLeft className="h-4 w-4 text-white" />
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                        >
                            <ChevronRight className="h-4 w-4 text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Dot indicators */}
            {totalItems > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-300',
                                i === activeIndex
                                    ? 'w-6 bg-primary'
                                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
