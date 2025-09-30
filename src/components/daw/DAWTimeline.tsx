import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import type { Track, AudioRegion } from "@/pages/HybridDAW";

interface DAWTimelineProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
  currentTime: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  bpm: number;
  onStartRecording: (trackId: string) => void;
  onStopRecording: () => void;
  isRecording: boolean;
}

const DAWTimeline: React.FC<DAWTimelineProps> = ({
  tracks,
  onTracksChange,
  currentTime,
  onTimeChange,
  isPlaying,
  bpm,
  onStartRecording,
  onStopRecording,
  isRecording
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Generate time markers
  const timeMarkers = Array.from({ length: 20 }, (_, i) => i);
  const pixelsPerSecond = 50 * zoom;
  
  // Handle track solo
  const toggleSolo = (trackId: string) => {
    onTracksChange(
      tracks.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false
      }))
    );
  };

  // Handle track mute
  const toggleMute = (trackId: string) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, mute: !track.mute }
          : track
      )
    );
  };

  // Handle track volume
  const updateTrackVolume = (trackId: string, volume: number) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, volume: volume / 100 }
          : track
      )
    );
  };

  // Handle region drag (simplified)
  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  // Delete track
  const deleteTrack = (trackId: string) => {
    onTracksChange(tracks.filter(track => track.id !== trackId));
  };

  // Timeline click handler
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 200; // Account for track header width
      const time = Math.max(0, x / pixelsPerSecond);
      onTimeChange(time);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Timeline Header */}
      <div className="border-b border-border bg-card/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Timeline View</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Zoom:</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="text-sm font-mono bg-card/50 px-3 py-1 rounded-lg">
            {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
            {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
            {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 border-r border-border bg-card/20">
          <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4">
            <span className="text-sm font-medium">Tracks</span>
          </div>
          
          {tracks.map((track) => (
            <div 
              key={track.id}
              className="h-20 border-b border-border/50 flex flex-col p-2"
              style={{ borderLeftColor: track.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate flex-1">{track.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTrack(track.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleSolo(track.id)}
                  className="h-6 w-8 text-xs p-0"
                >
                  S
                </Button>
                <Button
                  variant={track.mute ? "destructive" : "ghost"}
                  size="sm"
                  onClick={() => toggleMute(track.id)}
                  className="h-6 w-8 text-xs p-0"
                >
                  M
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={
                    track.isRecording 
                      ? onStopRecording 
                      : () => onStartRecording(track.id)
                  }
                  className={`h-6 w-8 text-xs p-0 ${
                    track.isRecording 
                      ? 'bg-destructive text-destructive-foreground animate-pulse' 
                      : ''
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <Volume2 className="w-3 h-3 text-muted-foreground" />
                <Slider
                  value={[track.volume * 100]}
                  onValueChange={(value) => updateTrackVolume(track.id, value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1 h-4"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 relative overflow-auto" ref={timelineRef}>
          {/* Time Ruler */}
          <div 
            className="h-12 border-b border-border bg-muted/30 flex items-end pb-2 sticky top-0 z-10"
            onClick={handleTimelineClick}
          >
            {timeMarkers.map((marker) => (
              <div
                key={marker}
                className="flex flex-col items-start"
                style={{ 
                  width: `${pixelsPerSecond}px`,
                  minWidth: `${pixelsPerSecond}px`
                }}
              >
                <div className="text-xs text-muted-foreground px-1">
                  {marker}s
                </div>
                <div className="w-full h-2 border-l border-border/50"></div>
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
            style={{ 
              left: `${currentTime * pixelsPerSecond}px`,
              transform: 'translateX(-1px)'
            }}
          >
            <div className="w-3 h-3 bg-primary transform -translate-x-1 rounded-full"></div>
          </div>

          {/* Track Lanes */}
          <div className="relative">
            {tracks.map((track, trackIndex) => (
              <div 
                key={track.id}
                className="h-20 border-b border-border/30 relative"
                onClick={handleTimelineClick}
              >
                {/* Grid Lines */}
                {timeMarkers.map((marker) => (
                  <div
                    key={marker}
                    className="absolute top-0 bottom-0 border-l border-border/20"
                    style={{ left: `${marker * pixelsPerSecond}px` }}
                  />
                ))}

                {/* Audio Regions */}
                {track.regions.map((region) => (
                  <div
                    key={region.id}
                    className={`absolute top-2 bottom-2 rounded-md cursor-pointer transition-all duration-200 hover:opacity-80 ${
                      selectedRegion === region.id 
                        ? 'ring-2 ring-primary' 
                        : ''
                    }`}
                    style={{
                      left: `${region.start * pixelsPerSecond}px`,
                      width: `${(region.end - region.start) * pixelsPerSecond}px`,
                      backgroundColor: track.color,
                      opacity: 0.7
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegionClick(region.id);
                    }}
                  >
                    <div className="h-full flex items-center px-2">
                      <div className="flex-1 h-8 bg-black/20 rounded-sm flex items-center justify-center">
                        <span className="text-xs text-white/80 font-mono">
                          ♪ Audio
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recording Indicator */}
                {track.isRecording && (
                  <div 
                    className="absolute top-2 bottom-2 bg-destructive/70 rounded-md animate-pulse"
                    style={{
                      left: `${currentTime * pixelsPerSecond}px`,
                      width: `${2 * pixelsPerSecond}px`
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">REC</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-border bg-card/30 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} • 
            {tracks.reduce((total, track) => total + track.regions.length, 0)} region{tracks.reduce((total, track) => total + track.regions.length, 0) !== 1 ? 's' : ''}
          </div>
          
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              {bpm} BPM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAWTimeline;