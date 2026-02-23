/**
 * FontPicker — Choose heading and body fonts from curated list.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProfileFont } from './types';
import { AVAILABLE_FONTS } from './types';

interface FontPickerProps {
    font: ProfileFont;
    onChange: (font: ProfileFont) => void;
}

const SIZE_OPTIONS: { value: ProfileFont['size']; label: string }[] = [
    { value: 'sm', label: 'Compact' },
    { value: 'md', label: 'Standard' },
    { value: 'lg', label: 'Large' },
];

export const FontPicker: React.FC<FontPickerProps> = ({ font, onChange }) => {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Typography</Label>

            <div className="grid grid-cols-2 gap-3">
                {/* Heading font */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Heading</Label>
                    <Select value={font.heading} onValueChange={(v) => onChange({ ...font, heading: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_FONTS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    <span style={{ fontFamily: f.value }}>{f.label}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">· {f.style}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Body font */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Body</Label>
                    <Select value={font.body} onValueChange={(v) => onChange({ ...font, body: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_FONTS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    <span style={{ fontFamily: f.value }}>{f.label}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">· {f.style}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Size */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Size</Label>
                <div className="flex gap-1.5">
                    {SIZE_OPTIONS.map((size) => (
                        <button
                            key={size.value}
                            onClick={() => onChange({ ...font, size: size.value })}
                            className={cn(
                                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                                font.size === size.value
                                    ? 'bg-white/15 border border-white/30 text-foreground'
                                    : 'bg-white/[0.03] border border-white/8 text-muted-foreground hover:bg-white/8'
                            )}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-1">
                <p
                    className={cn(
                        'font-bold text-foreground',
                        font.size === 'sm' ? 'text-lg' : font.size === 'lg' ? 'text-3xl' : 'text-2xl'
                    )}
                    style={{ fontFamily: font.heading }}
                >
                    Your Artist Name
                </p>
                <p
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: font.body }}
                >
                    This is how your bio text will look on your profile page.
                </p>
            </div>
        </div>
    );
};
