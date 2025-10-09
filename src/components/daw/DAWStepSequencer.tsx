import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Step {
  active: boolean;
  velocity: number;
}

export const DAWStepSequencer = () => {
  const [steps, setSteps] = useState<Step[]>(
    Array(16).fill(null).map(() => ({ active: false, velocity: 100 }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleStep = (index: number) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, active: !step.active } : step
    ));
  };

  return (
    <div className="bg-gradient-to-b from-[hsl(230,35%,10%)] to-[hsl(230,30%,8%)] border border-[hsl(var(--primary)/0.2)] rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold tracking-wide text-primary">STEP SEQUENCER</h3>
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-7"
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-16 gap-1 mb-4">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => toggleStep(index)}
            className={cn(
              'aspect-square rounded transition-all relative',
              step.active
                ? 'bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)] shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
                : 'bg-[hsl(230,35%,14%)] hover:bg-[hsl(230,35%,18%)]',
              currentStep === index && isPlaying && 'ring-2 ring-primary'
            )}
          >
            {step.active && (
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary/30"
                style={{ height: `${step.velocity}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Swing</label>
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Gate</label>
          <Slider
            defaultValue={[75]}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
