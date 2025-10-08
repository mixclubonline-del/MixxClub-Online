import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Circle, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickRecordStripProps {
  trackId: string;
  onRecord: () => void;
  onStop: () => void;
  onPlayback: () => void;
  isRecording: boolean;
  hasRecording: boolean;
}

export const QuickRecordStrip = ({
  trackId,
  onRecord,
  onStop,
  onPlayback,
  isRecording,
  hasRecording
}: QuickRecordStripProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [inputGain, setInputGain] = useState(0.7);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      onRecord();
    }
  }, [countdown, onRecord]);

  const startCountdown = () => {
    setCountdown(3);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/30">
      <div className="space-y-6">
        {/* Input Gain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Input Gain</label>
          <Slider
            value={[inputGain]}
            onValueChange={([v]) => setInputGain(v)}
            min={0}
            max={1}
            step={0.01}
            className="touch-manipulation"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-100",
                  inputGain > 0.8 ? "bg-red-500" : inputGain > 0.6 ? "bg-yellow-500" : "bg-green-500"
                )}
                style={{ width: `${inputGain * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono w-12 text-right">
              {Math.round(inputGain * 100)}%
            </span>
          </div>
        </div>

        {/* Countdown Display */}
        {countdown !== null && (
          <div className="flex items-center justify-center">
            <div className="text-7xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Record Button */}
        {!isRecording && !hasRecording && (
          <Button
            onClick={startCountdown}
            disabled={countdown !== null}
            size="lg"
            className={cn(
              "w-full h-20 text-xl font-bold rounded-2xl",
              "bg-gradient-to-br from-red-600 to-red-700",
              "hover:from-red-700 hover:to-red-800",
              "active:scale-95 transition-transform",
              "touch-manipulation"
            )}
          >
            <Circle className="w-8 h-8 mr-3 fill-current" />
            Start Recording
          </Button>
        )}

        {/* Stop Button (when recording) */}
        {isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-500 animate-record-pulse">
              <Circle className="w-6 h-6 fill-current" />
              <span className="text-xl font-bold">RECORDING</span>
            </div>
            <Button
              onClick={onStop}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-bold rounded-xl touch-manipulation"
            >
              Stop Recording
            </Button>
          </div>
        )}

        {/* Playback Controls (after recording) */}
        {hasRecording && !isRecording && (
          <div className="space-y-3">
            <div className="text-center text-sm text-green-500 font-semibold">
              ✓ Recording Complete
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onPlayback}
                size="lg"
                className="flex-1 h-16 text-lg font-bold rounded-xl bg-gradient-to-br from-primary to-cyan-600 touch-manipulation"
              >
                <Play className="w-6 h-6 mr-2" />
                Review Take
              </Button>
              <Button
                onClick={() => {
                  // Reset to allow new recording
                }}
                size="lg"
                variant="outline"
                className="h-16 px-6 rounded-xl touch-manipulation"
              >
                <Trash2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
