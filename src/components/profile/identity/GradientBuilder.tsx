/**
 * GradientBuilder — Build cover gradients with direction + color stops.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ProfileGradient } from './types';
import { GRADIENT_DIRECTIONS, gradientToCSS } from './types';

interface GradientBuilderProps {
    gradient: ProfileGradient;
    onChange: (gradient: ProfileGradient) => void;
}

export const GradientBuilder: React.FC<GradientBuilderProps> = ({ gradient, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Cover Gradient</Label>
                <Switch
                    checked={gradient.enabled}
                    onCheckedChange={(enabled) => onChange({ ...gradient, enabled })}
                />
            </div>

            {gradient.enabled && (
                <>
                    {/* Color stops */}
                    <div className="flex items-center gap-3">
                        <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">From</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={gradient.from}
                                    onChange={(e) => onChange({ ...gradient, from: e.target.value })}
                                    className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                                />
                                <span className="text-xs font-mono text-muted-foreground">{gradient.from}</span>
                            </div>
                        </div>
                        <div className="pt-5 text-muted-foreground">→</div>
                        <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">To</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={gradient.to}
                                    onChange={(e) => onChange({ ...gradient, to: e.target.value })}
                                    className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                                />
                                <span className="text-xs font-mono text-muted-foreground">{gradient.to}</span>
                            </div>
                        </div>
                    </div>

                    {/* Direction */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Direction</Label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {GRADIENT_DIRECTIONS.map((dir) => (
                                <button
                                    key={dir.value}
                                    onClick={() => onChange({ ...gradient, direction: dir.value })}
                                    title={dir.title}
                                    className={`h-9 rounded-lg text-lg transition-all ${gradient.direction === dir.value
                                            ? 'bg-white/15 border border-white/30 text-foreground'
                                            : 'bg-white/[0.03] border border-white/8 text-muted-foreground hover:bg-white/8'
                                        }`}
                                >
                                    {dir.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div
                        className="h-16 rounded-xl border border-white/10"
                        style={{ background: gradientToCSS(gradient) }}
                    />
                </>
            )}
        </div>
    );
};
