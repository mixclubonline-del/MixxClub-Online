/**
 * ContentCalendar — Tier 4 (Producer) — AI-scheduled content pipeline.
 * 
 * Monthly calendar with optimal posting slots and auto-suggestions.
 * 100 coinz per use. 300 coinz boost for 30-day caption drafts.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, Coins,
    Instagram, Twitter, Music2, Video, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

type ContentType = 'reel' | 'post' | 'story' | 'tweet' | 'tiktok' | 'music';

interface ContentSlot {
    day: number;
    type: ContentType;
    suggestion: string;
    platform: string;
    optimal: boolean;
}

const CONTENT_TYPES: Record<ContentType, { label: string; emoji: string; color: string }> = {
    reel: { label: 'Reel', emoji: '🎬', color: 'bg-pink-500/20 text-pink-400' },
    post: { label: 'Post', emoji: '📸', color: 'bg-blue-500/20 text-blue-400' },
    story: { label: 'Story', emoji: '📱', color: 'bg-purple-500/20 text-purple-400' },
    tweet: { label: 'Tweet', emoji: '🐦', color: 'bg-sky-500/20 text-sky-400' },
    tiktok: { label: 'TikTok', emoji: '📹', color: 'bg-cyan-500/20 text-cyan-400' },
    music: { label: 'Release', emoji: '🎵', color: 'bg-green-500/20 text-green-400' },
};

const SUGGESTIONS: ContentSlot[] = [
    { day: 1, type: 'reel', suggestion: 'Studio session clip — show your process', platform: 'Instagram', optimal: true },
    { day: 3, type: 'tweet', suggestion: 'Ask fans what they want to hear next', platform: 'Twitter', optimal: false },
    { day: 5, type: 'tiktok', suggestion: 'Hook from latest track over trending audio', platform: 'TikTok', optimal: true },
    { day: 7, type: 'post', suggestion: 'Behind-the-scenes photo from studio', platform: 'Instagram', optimal: false },
    { day: 9, type: 'story', suggestion: 'Poll: A-side or B-side? Which drop date?', platform: 'Instagram', optimal: false },
    { day: 11, type: 'reel', suggestion: 'Before/after production transformation', platform: 'Instagram', optimal: true },
    { day: 13, type: 'tweet', suggestion: 'Share a lyric snippet, ask fans to guess the title', platform: 'Twitter', optimal: false },
    { day: 15, type: 'music', suggestion: '🔥 RELEASE DAY — all-platform push', platform: 'All', optimal: true },
    { day: 17, type: 'tiktok', suggestion: 'Fan reaction compilation from release', platform: 'TikTok', optimal: true },
    { day: 19, type: 'post', suggestion: 'Thank you post — first week numbers', platform: 'Instagram', optimal: false },
    { day: 21, type: 'reel', suggestion: 'Acoustic/stripped version of latest release', platform: 'Instagram', optimal: true },
    { day: 24, type: 'story', suggestion: 'Q&A about next project', platform: 'Instagram', optimal: false },
    { day: 27, type: 'tiktok', suggestion: 'Remix challenge with fans', platform: 'TikTok', optimal: true },
    { day: 30, type: 'post', suggestion: 'Monthly wrap — share wins with fans', platform: 'Instagram', optimal: false },
];

const DAYS_IN_MONTH = 30;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function ContentCalendar() {
    const { canAffordBoost, boostModule } = useCareerManager();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.content_calendar;

    const getSlotForDay = (day: number): ContentSlot | undefined => SUGGESTIONS.find(s => s.day === day);
    const contentDays = new Set(SUGGESTIONS.map(s => s.day));
    const contentBattery = Math.round((SUGGESTIONS.length / DAYS_IN_MONTH) * 100);

    const handleBoost = async () => {
        try { await boostModule('content_calendar'); setIsBoosted(true); } catch { /* handled */ }
    };

    return (
        <div className="space-y-4">
            {/* Content Battery */}
            <GlassPanel padding="p-3" accent="rgba(6, 182, 212, 0.1)">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🔋</span>
                        <div>
                            <p className="text-xs font-medium text-foreground">Content Battery</p>
                            <p className="text-[9px] text-muted-foreground">{SUGGESTIONS.length} posts planned this month</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn('text-lg font-bold',
                            contentBattery >= 60 ? 'text-green-400' : contentBattery >= 30 ? 'text-amber-400' : 'text-red-400'
                        )}>{contentBattery}%</p>
                    </div>
                </div>
            </GlassPanel>

            {/* Calendar Grid */}
            <GlassPanel padding="p-4">
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setCurrentMonth(m => (m - 1 + 12) % 12)} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h4 className="text-sm font-semibold text-foreground">{MONTH_NAMES[currentMonth]} 2026</h4>
                    <button onClick={() => setCurrentMonth(m => (m + 1) % 12)} className="text-muted-foreground hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[8px] text-muted-foreground py-0.5">{d}</div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Offset for first day */}
                    {Array.from({ length: 2 }).map((_, i) => <div key={`pad-${i}`} />)}
                    {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                        const day = i + 1;
                        const slot = getSlotForDay(day);
                        const hasContent = contentDays.has(day);
                        const isSelected = selectedDay === day;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={cn(
                                    'relative h-9 rounded-lg text-xs flex flex-col items-center justify-center transition-all',
                                    isSelected ? 'bg-cyan-500/20 border border-cyan-500/30' :
                                        hasContent ? 'bg-white/5 hover:bg-white/10' : 'hover:bg-white/5',
                                    slot?.optimal && 'ring-1 ring-green-500/30'
                                )}
                            >
                                <span className={cn('text-[10px]', hasContent ? 'text-foreground font-medium' : 'text-muted-foreground')}>{day}</span>
                                {slot && <span className="text-[7px]">{CONTENT_TYPES[slot.type].emoji}</span>}
                            </button>
                        );
                    })}
                </div>
            </GlassPanel>

            {/* Selected Day Detail */}
            {selectedDay && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.12)">
                        {getSlotForDay(selectedDay) ? (
                            <>
                                {(() => {
                                    const slot = getSlotForDay(selectedDay)!;
                                    const typeConfig = CONTENT_TYPES[slot.type];
                                    return (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={cn('text-[9px] border-0', typeConfig.color)}>{typeConfig.emoji} {typeConfig.label}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{slot.platform}</span>
                                                {slot.optimal && <Badge className="text-[8px] bg-green-500/10 text-green-400 border-0">🎯 Optimal</Badge>}
                                            </div>
                                            <p className="text-xs text-foreground">{slot.suggestion}</p>
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-[11px] text-muted-foreground">No content scheduled for day {selectedDay}</p>
                                <Button size="sm" variant="outline" className="mt-2 text-[10px] gap-1 border-cyan-500/20 text-cyan-400">
                                    <Plus className="h-3 w-3" /> Add Content
                                </Button>
                            </div>
                        )}
                    </GlassPanel>
                </motion.div>
            )}

            {/* Platform Mix */}
            <GlassPanel padding="p-3">
                <h4 className="text-[10px] text-muted-foreground mb-2">Platform Mix</h4>
                <div className="flex gap-1.5">
                    {Object.entries(CONTENT_TYPES).map(([key, config]) => {
                        const count = SUGGESTIONS.filter(s => s.type === key).length;
                        if (count === 0) return null;
                        return (
                            <Badge key={key} className={cn('text-[9px] border-0', config.color)}>
                                {config.emoji} {count}
                            </Badge>
                        );
                    })}
                </div>
            </GlassPanel>

            {/* Boost */}
            {!isBoosted ? (
                <GlassPanel padding="p-3" accent="rgba(234, 179, 8, 0.1)">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-400" /> {mod.boostDescription}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{mod.boostCost} coinz</p>
                        </div>
                        <Button size="sm" disabled={!canAffordBoost('content_calendar')} onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20">
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            ) : (
                <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.2)">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-2">🗓️ 30-Day Autopilot Active</h4>
                    <p className="text-[10px] text-muted-foreground">AI has generated caption drafts for all 14 scheduled posts. Tap any day to view and edit.</p>
                </GlassPanel>
            )}
        </div>
    );
}
