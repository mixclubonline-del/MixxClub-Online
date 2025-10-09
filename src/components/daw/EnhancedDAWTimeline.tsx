import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  AudioLines,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Track, AudioRegion } from "@/stores/aiStudioStore";
import { WebGLWaveformTrack } from "./WebGLWaveformTrack";

interface EnhancedDAWTimelineProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
  currentTime: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  bpm: number;
  onStartRecording: (trackId: string) => void;
  onStopRecording: () => void;
  isRecording: boolean;
  onRegionSelect?: (regionId: string | null) => void;
}

const EnhancedDAWTimeline: React.FC<EnhancedDAWTimelineProps> = ({
  tracks,
  onTracksChange,
  currentTime,
  onTimeChange,
  isPlaying,
  bpm,
  onStartRecording,
  onStopRecording,
  isRecording,
  onRegionSelect
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem('daw-zoom');
    return saved ? parseFloat(saved) : 1;
  });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [trackHeight, setTrackHeight] = useState(80);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [newlyImportedTrack, setNewlyImportedTrack] = useState<string | null>(null);
  
  // Studio One / BandLab inspired styling
  const pixelsPerSecond = 60 * zoom;
  const timeMarkers = Array.from({ length: Math.ceil(300 / zoom) }, (_, i) => i);
  
  // Handle new track animations
  useEffect(() => {
    if (tracks.length > 0) {
      const lastTrack = tracks[tracks.length - 1];
      if (lastTrack.regions && lastTrack.regions.length > 0 && lastTrack.audioBuffer) {
        setNewlyImportedTrack(lastTrack.id);
        setTimeout(() => setNewlyImportedTrack(null), 2000);
      }
    }
  }, [tracks]);

  // Auto-scroll timeline to follow playhead
  useEffect(() => {
    if (!timelineRef.current || !isPlaying) return;
    
    const container = timelineRef.current;
    const headX = currentTime * pixelsPerSecond;
    const viewportWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const viewportEnd = scrollLeft + viewportWidth;
    
    // Keep playhead in the 25-75% range (left-center)
    const leftBound = scrollLeft + viewportWidth * 0.25;
    const rightBound = scrollLeft + viewportWidth * 0.75;
    
    if (headX < leftBound || headX > rightBound) {
      // Smooth scroll to center-left (33% from left edge)
      container.scrollTo({
        left: headX - viewportWidth * 0.33,
        behavior: 'smooth'
      });
    }
  }, [currentTime, isPlaying, pixelsPerSecond]);

  // No more fake waveform generation - using real AudioWaveformRenderer!

  const toggleSolo = (trackId: string) => {
    onTracksChange(
      tracks.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false
      }))
    );
  };

  const toggleMute = (trackId: string) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, mute: !track.mute }
          : track
      )
    );
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, volume: volume / 100 }
          : track
      )
    );
  };

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    onRegionSelect?.(regionId);
  };
  
  // Persist zoom to localStorage
  useEffect(() => {
    localStorage.setItem('daw-zoom', zoom.toString());
  }, [zoom]);

  const deleteTrack = (trackId: string) => {
    onTracksChange(tracks.filter(track => track.id !== trackId));
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 220; // Account for track header width
      const time = Math.max(0, x / pixelsPerSecond);
      onTimeChange(time);
    }
  };

  return (
    <Card className="flex-1 flex flex-col bg-gradient-to-br from-background to-muted/20 border-border/50">
      {/* Enhanced Timeline Header - Studio One inspired */}
      <div className="border-b border-border/30 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <AudioLines className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground/90">Timeline</span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                Professional
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Zoom:</span>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={0.1}
                  max={4}
                  step={0.1}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-8">{zoom.toFixed(1)}x</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Height:</span>
                <Slider
                  value={[trackHeight]}
                  onValueChange={(value) => setTrackHeight(value[0])}
                  min={60}
                  max={150}
                  step={10}
                  className="w-20"
                />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWaveforms(!showWaveforms)}
                className="gap-2"
              >
                {showWaveforms ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Waveforms
              </Button>
            </div>
          </div>
          
          <div className="text-sm font-mono bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20">
            {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
            {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
            {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Track Headers - BandLab inspired */}
        <div className="w-56 border-r border-border/30 bg-gradient-to-b from-card/40 to-card/20">
          <div className="h-16 border-b border-border/30 bg-gradient-to-r from-muted/60 to-muted/40 flex items-center px-4">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Track Control
            </span>
          </div>
          
          {tracks.map((track) => (
            <div 
              key={track.id}
              className={`border-b border-border/30 flex flex-col p-3 transition-all duration-300 ${
                newlyImportedTrack === track.id 
                  ? 'animate-scale-in bg-primary/5 border-primary/30' 
                  : 'hover:bg-muted/20'
              }`}
              style={{ 
                height: `${trackHeight}px`,
                borderLeftColor: track.color, 
                borderLeftWidth: '4px',
                borderLeftStyle: 'solid'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <span className="text-sm font-medium truncate block">{track.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {track.regions.length} region{track.regions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTrack(track.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleSolo(track.id)}
                  className="h-7 w-10 text-xs p-0 transition-all"
                >
                  SOLO
                </Button>
                <Button
                  variant={track.mute ? "destructive" : "ghost"}
                  size="sm"
                  onClick={() => toggleMute(track.id)}
                  className="h-7 w-10 text-xs p-0 transition-all"
                >
                  MUTE
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={
                    track.armed 
                      ? onStopRecording 
                      : () => onStartRecording(track.id)
                  }
                  className={`h-7 w-8 text-xs p-0 transition-all ${
                    track.armed 
                      ? 'bg-destructive text-destructive-foreground animate-pulse-glow' 
                      : 'hover:bg-destructive/20'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 text-muted-foreground" />
                <Slider
                  value={[track.volume * 100]}
                  onValueChange={(value) => updateTrackVolume(track.id, value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round(track.volume * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Timeline Content */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-b from-background to-muted/10" ref={timelineRef}>
          {/* Enhanced Time Ruler */}
          <div 
            className="h-16 border-b border-border/30 bg-gradient-to-b from-muted/40 to-muted/20 flex items-end pb-3 sticky top-0 z-10 backdrop-blur-sm"
            onClick={handleTimelineClick}
          >
            {timeMarkers.map((marker) => (
              <div
                key={marker}
                className="flex flex-col items-start relative"
                style={{ 
                  width: `${pixelsPerSecond}px`,
                  minWidth: `${pixelsPerSecond}px`
                }}
              >
                <div className="text-xs text-muted-foreground px-2 font-mono">
                  {Math.floor(marker / 60)}:{(marker % 60).toString().padStart(2, '0')}
                </div>
                <div className="w-full h-4 border-l border-border/40 relative">
                  {/* Quarter note markers */}
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-px h-2 bg-border/30"
                      style={{ left: `${(i + 1) * (pixelsPerSecond / 4)}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 z-20 pointer-events-none shadow-lg"
            style={{ 
              left: `${currentTime * pixelsPerSecond}px`,
              transform: 'translateX(-1px)',
              filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
            }}
          >
            <div className="w-4 h-4 bg-primary transform -translate-x-1.5 rounded-full shadow-lg border-2 border-background">
              <div className="w-2 h-2 bg-background rounded-full m-0.5"></div>
            </div>
          </div>

          {/* Enhanced Track Lanes */}
          <div className="relative">
            {tracks.map((track, trackIndex) => (
              <div 
                key={track.id}
                className={`border-b border-border/20 relative transition-all duration-300 hover:bg-muted/5 ${
                  newlyImportedTrack === track.id ? 'animate-fade-in' : ''
                }`}
                style={{ height: `${trackHeight}px` }}
                onClick={handleTimelineClick}
              >
                {/* Enhanced Grid Lines */}
                {timeMarkers.map((marker) => (
                  <div
                    key={marker}
                    className="absolute top-0 bottom-0 border-l border-border/10"
                    style={{ left: `${marker * pixelsPerSecond}px` }}
                  />
                ))}

                {/* Enhanced Audio Regions with REAL Waveforms */}
                {track.regions?.map((region) => {
                  const regionWidth = region.duration * pixelsPerSecond;
                  const regionHeight = trackHeight - 16;
                  
                  return (
                    <div
                      key={region.id}
                      className={`absolute top-2 bottom-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group ${
                        selectedRegion === region.id 
                          ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                          : 'hover:shadow-md'
                      } ${newlyImportedTrack === track.id ? 'animate-scale-in' : ''}`}
                      style={{
                        left: `${region.startTime * pixelsPerSecond}px`,
                        width: `${regionWidth}px`,
                        background: `linear-gradient(135deg, ${track.color}, ${track.color}90)`,
                        border: `1px solid ${track.color}40`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegionClick(region.id);
                      }}
                    >
                      <div className="h-full flex flex-col justify-center px-2 relative overflow-hidden">
                        {showWaveforms && track.audioBuffer ? (
                          <WebGLWaveformTrack
                            track={track}
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                            zoom={zoom}
                            height={regionHeight}
                          />
                        ) : showWaveforms ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xs text-white/60 font-medium">No waveform</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xs text-white/90 font-semibold drop-shadow">
                              ♪ Audio
                            </span>
                          </div>
                        )}
                        
                        {/* Region fade indicators */}
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-transparent to-white/20"></div>
                        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-transparent to-white/20"></div>
                      </div>
                    </div>
                  );
                })}

                {/* Enhanced Recording Indicator with pulsing animation */}
                {track.armed && isRecording && (
                  <div 
                    className="absolute top-2 bottom-2 bg-gradient-to-r from-destructive to-destructive/80 rounded-lg border border-destructive/50"
                    style={{
                      left: `${currentTime * pixelsPerSecond}px`,
                      width: `${3 * pixelsPerSecond}px`
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-2 h-2 bg-white rounded-full absolute animate-ping"></div>
                          <div className="w-2 h-2 bg-white rounded-full relative"></div>
                        </div>
                        <span className="text-xs text-white font-bold drop-shadow animate-pulse">RECORDING</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer Controls - Studio One inspired */}
      <div className="border-t border-border/30 bg-gradient-to-r from-card/40 to-card/20 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {tracks.length} track{tracks.length !== 1 ? 's' : ''} • 
              {tracks.reduce((total, track) => total + track.regions.length, 0)} region{tracks.reduce((total, track) => total + track.regions.length, 0) !== 1 ? 's' : ''}
            </div>
            
            {selectedRegion && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Region Selected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2 text-destructive animate-pulse">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse-glow"></div>
                <span className="text-sm font-semibold">Recording...</span>
              </div>
            )}
            
            <div className="text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded">
              {bpm} BPM
            </div>
            
            <div className="text-sm text-muted-foreground">
              Sample Rate: 48kHz
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedDAWTimeline;