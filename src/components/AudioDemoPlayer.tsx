import { useState } from 'react';
import { Play, Pause, Upload, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export const AudioDemoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Try AI Enhancement</h3>
        {isProcessing && (
          <div className="flex items-center gap-2 text-primary text-sm">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI Processing...</span>
          </div>
        )}
      </div>

      {/* Waveform Visualization */}
      <div className="relative h-24 bg-background/50 rounded-lg mb-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = isProcessing 
              ? Math.random() * 60 + 20 
              : Math.sin(i * 0.2) * 20 + 30;
            return (
              <div
                key={i}
                className="flex-1 bg-primary/40 rounded-full transition-all duration-300"
                style={{
                  height: `${height}%`,
                  animation: isProcessing ? `pulse 0.${i % 9}s ease-in-out infinite` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full w-10 h-10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <div className="text-sm text-muted-foreground">
            Demo Track.wav
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={handleProcess}
            disabled={isProcessing}
          >
            <Sparkles className="w-4 h-4" />
            Enhance with AI
          </Button>
        </div>
      </div>
    </div>
  );
};
