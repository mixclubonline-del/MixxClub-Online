/**
 * AvatarFrameSelector — Choose from achievement ring styles.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { AvatarFrame } from './types';
import { AVATAR_FRAMES } from './types';

interface AvatarFrameSelectorProps {
    selected: AvatarFrame;
    onChange: (frame: AvatarFrame) => void;
    avatarUrl?: string | null;
}

export const AvatarFrameSelector: React.FC<AvatarFrameSelectorProps> = ({
    selected,
    onChange,
    avatarUrl,
}) => {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Avatar Frame</Label>

            <div className="grid grid-cols-3 gap-3">
                {AVATAR_FRAMES.map((frame) => (
                    <button
                        key={frame.value}
                        onClick={() => onChange(frame.value)}
                        className={cn(
                            'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                            selected === frame.value
                                ? 'bg-white/10 border border-white/30'
                                : 'bg-white/[0.03] border border-white/8 hover:bg-white/8'
                        )}
                    >
                        <div className={cn('w-14 h-14 rounded-full overflow-hidden', frame.cssClass)}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-lg">
                                    🎵
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">{frame.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
