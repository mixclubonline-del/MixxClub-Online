import { Play, Pause, Volume2, Settings, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface MobileControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSettings: () => void;
  onShare: () => void;
  onExport: () => void;
}

export const MobileControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onSettings,
  onShare,
  onExport
}: MobileControlsProps) => {
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 p-4 rounded-t-xl shadow-lg bg-background/95 backdrop-blur-sm border-t z-50 md:hidden">
      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={([value]) => onSeek(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            variant="default"
            onClick={onPlayPause}
            className="h-12 w-12 rounded-full"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowVolume(!showVolume)}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onSettings}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onExport}>
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Volume Slider */}
      {showVolume && (
        <div className="mt-4 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([value]) => onVolumeChange(value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{volume}%</span>
        </div>
      )}
    </Card>
  );
};
