/**
 * StatusSystem — Rich studio presence indicator.
 * 
 * Shows current status (Available, In Session, Mixing, etc.),
 * mood indicator, and custom status text.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { StudioStatus } from './types';
import { STATUS_MODES, MOOD_OPTIONS } from './types';

interface StatusSystemProps {
    status: StudioStatus;
    onChange?: (status: StudioStatus) => void;
    editable?: boolean;
    compact?: boolean;
}

export const StatusSystem: React.FC<StatusSystemProps> = ({
    status,
    onChange,
    editable = false,
    compact = false,
}) => {
    const currentMode = STATUS_MODES.find(m => m.value === status.mode) || STATUS_MODES[0];
    const currentMood = MOOD_OPTIONS.find(m => m.value === status.mood);

    // Display-only mode
    if (!editable) {
        return (
            <div className={cn('flex items-center gap-2', compact ? 'gap-1.5' : 'gap-2')}>
                <div
                    className={cn('rounded-full', compact ? 'w-2 h-2' : 'w-2.5 h-2.5')}
                    style={{ backgroundColor: currentMode.color }}
                />
                <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
                    {currentMode.emoji} {currentMode.label}
                </span>
                {currentMood && (
                    <span className="text-xs text-muted-foreground">
                        · {currentMood.emoji} {currentMood.label}
                    </span>
                )}
                {status.customText && (
                    <span className="text-xs text-muted-foreground italic truncate">
                        — "{status.customText}"
                    </span>
                )}
            </div>
        );
    }

    // Editor mode
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Studio Status</Label>

            {/* Mode selector */}
            <div className="grid grid-cols-3 gap-2">
                {STATUS_MODES.map((mode) => (
                    <button
                        key={mode.value}
                        onClick={() => onChange?.({ ...status, mode: mode.value })}
                        className={cn(
                            'flex items-center gap-2 p-2.5 rounded-xl text-left transition-all',
                            status.mode === mode.value
                                ? 'bg-white/10 border border-white/30'
                                : 'bg-white/[0.03] border border-white/8 hover:bg-white/8'
                        )}
                    >
                        <span className="text-lg">{mode.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Mood */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mood</Label>
                <div className="flex gap-1.5">
                    {MOOD_OPTIONS.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => onChange?.({ ...status, mood: status.mood === mood.value ? undefined : mood.value })}
                            className={cn(
                                'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all',
                                status.mood === mood.value
                                    ? 'bg-white/10 border border-white/30'
                                    : 'bg-white/[0.03] border border-white/8 hover:bg-white/8'
                            )}
                        >
                            <span className="text-lg">{mood.emoji}</span>
                            <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom text */}
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Status Message</Label>
                <Input
                    value={status.customText || ''}
                    onChange={(e) => onChange?.({ ...status, customText: e.target.value })}
                    placeholder="What are you working on?"
                    maxLength={80}
                    className="h-9 bg-white/5 border-white/10 text-sm"
                />
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <StatusSystem status={status} compact />
            </div>
        </div>
    );
};
