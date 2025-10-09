import { useState } from 'react';
import { EnhancedVUMeter } from './EnhancedVUMeter';
import { EffectBrowser } from './EffectBrowser';
import { cn } from '@/lib/utils';
import { EffectUnit } from '@/stores/aiStudioStore';

interface MasterChannelStripProps {
  volume: number;
  peakLevel: number;
  onVolumeChange: (volume: number) => void;
  effects?: EffectUnit[];
  onAddEffect?: (effect: EffectUnit) => void;
}

export const MasterChannelStrip = ({
  volume,
  peakLevel,
  onVolumeChange,
  effects = [],
  onAddEffect,
}: MasterChannelStripProps) => {
  const [isDraggingFader, setIsDraggingFader] = useState(false);
  const [effectBrowserOpen, setEffectBrowserOpen] = useState(false);

  const handleFaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingFader(true);
    updateFader(e);
  };

  const handleFaderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingFader) return;
    updateFader(e);
  };

  const updateFader = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    onVolumeChange(newVolume);
  };

  const handleAddEffect = (effectType: EffectUnit['type']) => {
    if (!onAddEffect || effectType === 'mixxtune') return;
    
    const effect: EffectUnit = {
      id: `master-effect-${Date.now()}`,
      name: effectType.toUpperCase(),
      type: effectType,
      enabled: true,
      parameters: getDefaultParameters(effectType),
      rackPosition: effects.length,
    };
    
    onAddEffect(effect);
  };

  const getDefaultParameters = (type: EffectUnit['type']): Record<string, number> => {
    switch (type) {
      case 'eq':
        return { band1: 0.5, band2: 0.5, band3: 0.5, band4: 0.5 };
      case 'compressor':
        return { threshold: 0.6, ratio: 0.3, attack: 0.2, release: 0.4, makeup: 0.5 };
      case 'limiter':
        return { threshold: 0.9, release: 0.5, ceiling: 0.95 };
      default:
        return {};
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 p-1.5 rounded-lg',
        'w-16 h-[360px] relative border-2'
      )}
      style={{
        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--card) / 0.8))',
        boxShadow: 'var(--shadow-glass-lg), 0 0 30px hsl(var(--studio-accent) / 0.6)',
        borderColor: 'hsl(var(--studio-accent))',
      }}
      onMouseUp={() => setIsDraggingFader(false)}
      onMouseLeave={() => setIsDraggingFader(false)}
    >
      {/* Master label */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: 'hsl(var(--studio-accent))',
            boxShadow: '0 0 8px hsl(var(--studio-accent) / 0.8)'
          }}
        />
        <span className="text-[10px] font-bold text-[hsl(var(--studio-accent))] truncate w-full text-center leading-tight">
          MASTER
        </span>
      </div>

      {/* Master insert slots */}
      {onAddEffect && (
        <div className="flex flex-col gap-0.5 w-full">
          {[1, 2].map((slot) => {
            const hasEffect = effects[slot - 1];
            return (
              <button
                key={slot}
                onClick={(e) => {
                  e.stopPropagation();
                  setEffectBrowserOpen(true);
                }}
                className="h-2 rounded flex items-center justify-center cursor-pointer hover:border-[hsl(var(--studio-accent))] transition-colors"
                style={{
                  background: 'hsl(var(--studio-black))',
                  boxShadow: 'var(--shadow-recessed)',
                  border: '1px solid hsl(0 0% 0% / 0.6)',
                }}
              >
                <div 
                  className="w-0.5 h-0.5 rounded-full"
                  style={{
                    background: hasEffect ? 'hsl(var(--led-green))' : 'hsl(var(--led-off))',
                    boxShadow: hasEffect ? 'var(--shadow-glow-led-green)' : 'inset 0 1px 2px hsl(0 0% 0% / 0.5)',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="h-8" /> {/* Spacer for alignment */}

      {/* Master VU Meters - Larger for visibility */}
      <div className="flex gap-1">
        <EnhancedVUMeter 
          level={peakLevel * 0.95} 
          size="sm"
          label="L"
          vertical
          showRMS={false}
          showPeakDb={false}
        />
        <EnhancedVUMeter 
          level={peakLevel} 
          size="sm"
          label="R"
          vertical
          showRMS={false}
          showPeakDb={false}
        />
      </div>

      {/* Master Fader */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div 
          className="relative h-full w-3 rounded cursor-ns-resize"
          style={{
            background: 'var(--fader-gradient)',
            boxShadow: 'var(--shadow-recessed-deep), inset 0 2px 4px hsl(0 0% 0% / 0.5)',
            border: '1px solid hsl(0 0% 0% / 0.6)',
          }}
          onMouseDown={handleFaderMouseDown}
          onMouseMove={handleFaderMouseMove}
        >
          {/* Fader rail highlight */}
          <div className="absolute inset-y-0 left-0 w-px bg-[hsl(0_0%_18%/0.5)]" />
          
          {/* 0dB marker */}
          <div 
            className="absolute left-0 right-0 h-px bg-[hsl(var(--led-yellow))]"
            style={{ top: '20%' }}
          />
          
          {/* Master fader cap - larger and more prominent */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-6 h-4 rounded transition-all',
              isDraggingFader && 'scale-110'
            )}
            style={{
              top: `${(1 - volume) * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(180deg, hsl(var(--studio-accent)), hsl(var(--studio-accent) / 0.7))',
              boxShadow: isDraggingFader 
                ? 'var(--shadow-raised-lg), 0 0 16px hsl(var(--studio-accent) / 0.6)' 
                : 'var(--shadow-raised), 0 0 8px hsl(var(--studio-accent) / 0.4)',
              borderTop: '1px solid hsl(var(--studio-accent) / 0.6)',
              borderBottom: '1px solid hsl(0 0% 5%)',
            }}
          >
            {/* Cap detail lines */}
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2">
              <div className="h-px bg-white/30" />
            </div>
          </div>
        </div>
        <span className="text-[8px] font-mono font-bold text-[hsl(var(--studio-accent))] mt-0.5">
          {Math.round(volume * 100)}
        </span>
      </div>

      {/* Peak indicator */}
      <div className="text-[7px] font-mono text-center w-full">
        <div className="text-[hsl(var(--studio-text-dim))]">
          {peakLevel > 0.95 ? (
            <span className="text-[hsl(var(--led-red))] font-bold animate-pulse">CLIP!</span>
          ) : (
            <span>{(20 * Math.log10(Math.max(0.001, peakLevel))).toFixed(1)} dB</span>
          )}
        </div>
      </div>

      {/* Effect Browser Dialog */}
      {onAddEffect && (
        <EffectBrowser
          isOpen={effectBrowserOpen}
          onClose={() => setEffectBrowserOpen(false)}
          onSelectEffect={handleAddEffect}
          trackId="master"
        />
      )}
    </div>
  );
};
