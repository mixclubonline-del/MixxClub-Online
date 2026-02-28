/**
 * VelvetCurve - Mixxclub's Psychoacoustic Comfort Engine Plugin
 * 
 * "We measure serenity, not sharpness."
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { useVelvetCurve } from '@/hooks/useVelvetCurve';
import { GenrePreset, GENRE_PRESETS } from '@/audio/context/GenreContext';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Sparkles, 
  Waves, 
  Wind,
  Activity,
  Pause,
  Play
} from 'lucide-react';

interface VelvetCurveProps {
  isOpen: boolean;
  onClose: () => void;
}

const VelvetCurve = ({ isOpen, onClose }: VelvetCurveProps) => {
  const {
    settings,
    setParameter,
    currentGenre,
    applyGenrePreset,
    availableGenres,
    isBreathingEnabled,
    toggleBreathing,
    beatPhase,
    fourAnchors,
    gainReduction,
    isActive,
    toggleActive,
  } = useVelvetCurve();
  
  const [showGenres, setShowGenres] = useState(false);
  
  // Four Anchors visualization
  const AnchorBar = ({ 
    value, 
    label, 
    icon: Icon, 
    color 
  }: { 
    value: number; 
    label: string; 
    icon: React.ComponentType<any>; 
    color: string;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="relative w-8 h-24 rounded-full bg-background/50 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: `${value}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground/80" />
        </div>
      </div>
      <div className="text-xs font-mono text-foreground/70">{value}</div>
    </div>
  );
  
  // Beat phase indicator
  const BeatPhaseRing = () => (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="4"
        />
        {/* Active phase ring */}
        <motion.circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${beatPhase * 220} 220`}
          animate={{ 
            strokeDasharray: `${beatPhase * 220} 220`,
            filter: isBreathingEnabled ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : 'none'
          }}
          transition={{ duration: 0.05 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full"
          onClick={toggleBreathing}
        >
          {isBreathingEnabled ? (
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <Pause className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
  
  // Gain reduction meter
  const GainReductionMeter = () => (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">GR</div>
      <div className="relative w-3 h-16 rounded-full bg-background/50 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 right-0 bg-amber-500 rounded-full"
          animate={{ height: `${gainReduction * 100}%` }}
        />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground">
        -{(gainReduction * 20).toFixed(1)}dB
      </div>
    </div>
  );
  
  return (
    <PluginWindow
      title="VELVET CURVE"
      category="mastering"
      isOpen={isOpen}
      onClose={onClose}
      width={480}
      height={520}
    >
      <div className="flex flex-col gap-4 p-4">
        {/* Header with genre selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground/90">
              Psychoacoustic Comfort Engine
            </span>
          </div>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowGenres(!showGenres)}
            >
              {GENRE_PRESETS[currentGenre].name}
            </Button>
            
            {showGenres && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-xl p-1 min-w-[140px]"
              >
                {availableGenres.map((genre) => (
                  <Button
                    key={genre}
                    variant={genre === currentGenre ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      applyGenrePreset(genre);
                      setShowGenres(false);
                    }}
                  >
                    {GENRE_PRESETS[genre].name}
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Four Anchors Visualization */}
        <div className="flex items-center justify-center gap-6 py-2">
          <AnchorBar value={fourAnchors.body} label="Body" icon={Waves} color="hsl(262, 100%, 65%)" />
          <AnchorBar value={fourAnchors.soul} label="Soul" icon={Heart} color="hsl(330, 80%, 60%)" />
          <AnchorBar value={fourAnchors.silk} label="Silk" icon={Sparkles} color="hsl(200, 100%, 65%)" />
          <AnchorBar value={fourAnchors.air} label="Air" icon={Wind} color="hsl(180, 100%, 60%)" />
        </div>
        
        {/* Central Velvet Amount + Beat Sync */}
        <div className="flex items-center justify-center gap-8">
          <GainReductionMeter />
          
          <div className="flex flex-col items-center gap-2">
            <PluginKnob
              label="VELVET"
              value={settings.velvetAmount}
              min={0}
              max={1}
              onChange={(v) => setParameter('velvetAmount', v)}
              size="xl"
              displayValue={(v) => `${Math.round(v * 100)}%`}
              aiSuggested={false}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Beat Sync</div>
            <BeatPhaseRing />
          </div>
        </div>
        
        {/* Parameter Knobs */}
        <div className="grid grid-cols-4 gap-4 py-2">
          <PluginKnob
            label="Warmth"
            value={settings.warmth}
            min={0}
            max={1}
            onChange={(v) => setParameter('warmth', v)}
            size="md"
            displayValue={(v) => `${Math.round(v * 100)}%`}
          />
          <PluginKnob
            label="Power"
            value={settings.power}
            min={0}
            max={1}
            onChange={(v) => setParameter('power', v)}
            size="md"
            displayValue={(v) => `${Math.round(v * 100)}%`}
          />
          <PluginKnob
            label="Silk Edge"
            value={settings.silkEdge}
            min={0}
            max={1}
            onChange={(v) => setParameter('silkEdge', v)}
            size="md"
            displayValue={(v) => `${Math.round(v * 100)}%`}
          />
          <PluginKnob
            label="Emotion"
            value={settings.emotion}
            min={0}
            max={1}
            onChange={(v) => setParameter('emotion', v)}
            size="md"
            displayValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
        
        {/* Quick Genre Presets */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-border/50">
          {['trap', 'drill', 'rnb', 'reggaeton', 'afrobeat'].map((genre) => (
            <Button
              key={genre}
              variant={currentGenre === genre ? 'default' : 'outline'}
              size="sm"
              className="text-[10px] h-7 px-2"
              onClick={() => applyGenrePreset(genre as GenrePreset)}
            >
              {GENRE_PRESETS[genre as GenrePreset].name}
            </Button>
          ))}
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
          <span>"{GENRE_PRESETS[currentGenre].description}"</span>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="text-[10px] h-6"
            onClick={toggleActive}
          >
            {isActive ? 'Active' : 'Bypassed'}
          </Button>
        </div>
      </div>
    </PluginWindow>
  );
};

export default VelvetCurve;
