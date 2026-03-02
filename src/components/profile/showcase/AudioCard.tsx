/**
 * AudioCard — Featured track player with waveform-style visualization.
 * 
 * Shows cover art, track metadata, a progress bar with animated bars,
 * and play/pause control. Designed for profile "now playing" showcase.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, Music, SkipForward } from 'lucide-react';
import type { FeaturedMediaItem } from './types';

interface AudioCardProps {
    track: FeaturedMediaItem;
    accent?: string;
    className?: string;
}

export const AudioCard: React.FC<AudioCardProps> = ({
    track,
    accent = '#f97316',
    className,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(track.metadata?.duration || 0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animFrameRef = useRef<number>(0);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(track.url);
            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current?.duration || 0);
            });
            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
                setProgress(0);
            });
        }

        if (isPlaying) {
            audioRef.current.pause();
            cancelAnimationFrame(animFrameRef.current);
        } else {
            audioRef.current.play().catch(() => { });
            const tick = () => {
                if (audioRef.current) {
                    setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
                }
                animFrameRef.current = requestAnimationFrame(tick);
            };
            tick();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, track.url]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // Generate waveform bars
    const BARS = 40;
    const bars = Array.from({ length: BARS }, (_, i) => {
        // Pseudo-random heights based on index for a natural-looking waveform
        const h = 0.3 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3)) * 0.7;
        const isActive = i / BARS <= progress;
        return { height: h, active: isActive };
    });

    return (
        <div className={cn(
            'relative rounded-2xl overflow-hidden border border-white/8',
            'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
            'backdrop-blur-sm',
            className
        )}>
            <div className="flex items-stretch">
                {/* Cover art */}
                <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 relative overflow-hidden">
                    {track.thumbnailUrl ? (
                        <img
                            src={track.thumbnailUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}10)` }}
                        >
                            <Music className="h-10 w-10 text-white/30" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group/play"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-all scale-90 group-hover/play:scale-100 shadow-xl"
                            style={{ backgroundColor: accent }}
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5 text-white fill-white" />
                            ) : (
                                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                            )}
                        </div>
                    </button>
                </div>

                {/* Track info + waveform */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    {/* Title row */}
                    <div>
                        <h4 className="font-bold text-foreground truncate text-sm md:text-base">
                            {track.title}
                        </h4>
                        {track.metadata?.artist && (
                            <p className="text-xs text-muted-foreground truncate">{track.metadata.artist}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            {track.metadata?.bpm && <span>{track.metadata.bpm} BPM</span>}
                            {track.metadata?.key && <span>· {track.metadata.key}</span>}
                            {track.metadata?.genre && <span>· {track.metadata.genre}</span>}
                        </div>
                    </div>

                    {/* Waveform visualization */}
                    <div className="mt-2 flex items-end gap-[2px] h-8">
                        {bars.map((bar, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-full min-w-[2px]"
                                animate={{
                                    height: `${bar.height * 100}%`,
                                    backgroundColor: bar.active ? accent : 'rgba(255,255,255,0.12)',
                                }}
                                transition={{
                                    height: isPlaying ? { duration: 0.4, delay: i * 0.01 } : { duration: 0.2 },
                                    backgroundColor: { duration: 0.1 },
                                }}
                            />
                        ))}
                    </div>

                    {/* Time */}
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {formatTime(progress * duration)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/5">
                <motion.div
                    className="h-full"
                    style={{ backgroundColor: accent }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </div>
    );
};
