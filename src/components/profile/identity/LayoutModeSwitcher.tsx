/**
 * LayoutModeSwitcher — Choose profile layout mode.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ProfileLayout } from './types';
import { LAYOUT_MODES } from './types';
import { LayoutGrid, Square, Columns, Grid3x3 } from 'lucide-react';

interface LayoutModeSwitcherProps {
    selected: ProfileLayout;
    onChange: (layout: ProfileLayout) => void;
}

const LAYOUT_ICONS: Record<ProfileLayout, React.ElementType> = {
    card: Square,
    fullbleed: LayoutGrid,
    split: Columns,
    bento: Grid3x3,
};

export const LayoutModeSwitcher: React.FC<LayoutModeSwitcherProps> = ({ selected, onChange }) => {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Profile Layout</Label>

            <div className="grid grid-cols-2 gap-2">
                {LAYOUT_MODES.map((mode) => {
                    const Icon = LAYOUT_ICONS[mode.value];
                    return (
                        <button
                            key={mode.value}
                            onClick={() => onChange(mode.value)}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-xl text-left transition-all',
                                selected === mode.value
                                    ? 'bg-white/10 border border-white/30'
                                    : 'bg-white/[0.03] border border-white/8 hover:bg-white/8'
                            )}
                        >
                            <Icon className={cn(
                                'w-5 h-5 mt-0.5 flex-shrink-0',
                                selected === mode.value ? 'text-primary' : 'text-muted-foreground'
                            )} />
                            <div>
                                <p className="text-sm font-medium text-foreground">{mode.label}</p>
                                <p className="text-[11px] text-muted-foreground leading-tight">{mode.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
