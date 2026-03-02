/**
 * ColorSystemPicker — Primary, secondary, accent color controls with live preview.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ProfileColors } from './types';

interface ColorSystemPickerProps {
    colors: ProfileColors;
    onChange: (colors: ProfileColors) => void;
}

const COLOR_PRESETS: { label: string; colors: ProfileColors }[] = [
    { label: 'MixxClub', colors: { primary: '#f97316', secondary: '#8b5cf6', accent: '#06b6d4' } },
    { label: 'Midnight', colors: { primary: '#6366f1', secondary: '#ec4899', accent: '#14b8a6' } },
    { label: 'Blaze', colors: { primary: '#ef4444', secondary: '#f59e0b', accent: '#22c55e' } },
    { label: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f43f5e' } },
    { label: 'Forest', colors: { primary: '#22c55e', secondary: '#84cc16', accent: '#f97316' } },
    { label: 'Monochrome', colors: { primary: '#e2e8f0', secondary: '#94a3b8', accent: '#f8fafc' } },
    { label: 'Neon', colors: { primary: '#a855f7', secondary: '#06b6d4', accent: '#f43f5e' } },
    { label: 'Rose Gold', colors: { primary: '#f43f5e', secondary: '#e879f9', accent: '#fbbf24' } },
];

export const ColorSystemPicker: React.FC<ColorSystemPickerProps> = ({ colors, onChange }) => {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Color Palette</Label>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => onChange(preset.colors)}
                        className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-all"
                    >
                        <div className="flex gap-0.5">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{preset.label}</span>
                    </button>
                ))}
            </div>

            {/* Custom pickers */}
            <div className="grid grid-cols-3 gap-3">
                {([
                    { key: 'primary' as const, label: 'Primary' },
                    { key: 'secondary' as const, label: 'Secondary' },
                    { key: 'accent' as const, label: 'Accent' },
                ]).map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors[key]}
                                onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
                                className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                            />
                            <Input
                                value={colors[key]}
                                onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
                                className="h-8 text-xs font-mono bg-white/5 border-white/10"
                                maxLength={7}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Live swatch preview */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.secondary }} />
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
            </div>
        </div>
    );
};
