import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2, Music } from "lucide-react";

interface AudioVersion {
  id: string;
  name: string;
  url: string;
  date: string;
  description: string;
  improvements: string[];
}

interface AudioVersionComparisonProps {
  versions: AudioVersion[];
  className?: string;
}

export const AudioVersionComparison = ({ versions, className }: AudioVersionComparisonProps) => {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVersionChange = (versionIndex: number) => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentVersion(versionIndex);
    setCurrentTime(0);
    
    // If it was playing, resume with new version
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!versions.length) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No audio versions available for comparison</p>
      </Card>
    );
  }

  const currentVersionData = versions[currentVersion];

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version Comparison</h3>
        <Badge variant="outline">{versions.length} versions</Badge>
      </div>

      {/* Version Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {versions.map((version, index) => (
          <button
            key={version.id}
            onClick={() => handleVersionChange(index)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 ${
              index === currentVersion
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <div className="font-medium text-sm">{version.name}</div>
            <div className="text-xs text-muted-foreground">{version.date}</div>
          </button>
        ))}
      </div>

      {/* Audio Player */}
      <div className="space-y-4">
        <audio
          ref={audioRef}
          src={currentVersionData.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            className="flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Current Version Details */}
      <div className="space-y-3">
        <div>
          <h4 className="font-medium">{currentVersionData.name}</h4>
          <p className="text-sm text-muted-foreground">{currentVersionData.description}</p>
        </div>

        {currentVersionData.improvements.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2">Improvements in this version:</h5>
            <div className="flex flex-wrap gap-1">
              {currentVersionData.improvements.map((improvement, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {improvement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>
    </Card>
  );
};