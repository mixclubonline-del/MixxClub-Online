/**
 * BackgroundPatternSelector — Choose subtle background patterns.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ProfileBackground } from './types';
import { patternToCSS } from './types';

interface BackgroundPatternSelectorProps {
    background: ProfileBackground;
    onChange: (background: ProfileBackground) => void;
}

const PATTERNS: { value: ProfileBackground['pattern']; label: string; icon: string }[] = [
    { value: 'none', label: 'None', icon: '○' },
    { value: 'dots', label: 'Dots', icon: '⠿' },
    { value: 'grid', label: 'Grid', icon: '▦' },
    { value: 'waves', label: 'Lines', icon: '≋' },
    { value: 'noise', label: 'Grain', icon: '░' },
];

export const BackgroundPatternSelector: React.FC<BackgroundPatternSelectorProps> = ({
    background,
    onChange,
}) => {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Background Pattern</Label>

            <div className="flex gap-2">
                {PATTERNS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => onChange({ ...background, pattern: p.value })}
                        className={cn(
                            'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all',
                            background.pattern === p.value
                                ? 'bg-white/10 border border-white/30'
                                : 'bg-white/[0.03] border border-white/8 hover:bg-white/8'
                        )}
                    >
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[10px] text-muted-foreground">{p.label}</span>
                    </button>
                ))}
            </div>

            {background.pattern !== 'none' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Opacity</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(background.opacity * 100)}%</span>
                    </div>
                    <Slider
                        value={[background.opacity]}
                        onValueChange={([v]) => onChange({ ...background, opacity: v })}
                        min={0.02}
                        max={0.25}
                        step={0.01}
                        className="w-full"
                    />

                    {/* Pattern preview */}
                    <div
                        className="h-12 rounded-lg border border-white/10 bg-black"
                        style={{
                            backgroundImage: patternToCSS(background),
                            backgroundSize: background.pattern === 'dots' ? '20px 20px' : '40px 40px',
                        }}
                    />
                </div>
            )}
        </div>
    );
};
