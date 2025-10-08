import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, AudioLines } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

const TRACK_HEIGHT = 80;

export const StudioTimeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [trackHeight, setTrackHeight] = useState(TRACK_HEIGHT);
  const [showWaveforms, setShowWaveforms] = useState(true);

  const { 
    tracks,
    currentTime, 
    duration,
    tempo,
    isRecording,
    snapEnabled,
    snapMode,
    setCurrentTime,
    updateTrack
  } = useAIStudioStore();

  const pixelsPerSecond = 60 * zoom;
  const timeMarkers = Array.from({ length: Math.ceil(duration / zoom) + 10 }, (_, i) => i);

  const generateWaveformCanvas = (track: any, regionWidth: number) => {
    if (!track.waveformData || !showWaveforms) return null;
    const waveformData = track.waveformData.slice(0, 100);
    return (
      <div className="flex items-center justify-center h-full gap-px opacity-80">
        {waveformData.map((amplitude: number, index: number) => (
          <div key={index} className="bg-white/60 mx-px" style={{ width: `${regionWidth / waveformData.length - 2}px`, height: `${amplitude * (trackHeight - 16)}px`, minHeight: '2px' }} />
        ))}
      </div>
    );
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let clickTime = x / pixelsPerSecond;
    if (snapEnabled) {
      const beatDuration = 60 / tempo;
      const snapDuration = snapMode === 'bars' ? beatDuration * 4 : beatDuration;
      clickTime = Math.round(clickTime / snapDuration) * snapDuration;
    }
    setCurrentTime(Math.max(0, clickTime));
  };

  return (
    <Card className="flex-1 flex flex-col bg-gradient-to-br from-background to-muted/20 border-border/50 overflow-hidden">
      <div className="border-b border-border/30 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <AudioLines className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Timeline</span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Professional</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Zoom:</span>
                <Slider value={[zoom]} onValueChange={(value) => setZoom(value[0])} min={0.1} max={4} step={0.1} className="w-24" />
                <span className="text-xs text-muted-foreground w-8">{zoom.toFixed(1)}x</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowWaveforms(!showWaveforms)} className="gap-2">
                {showWaveforms ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Waveforms
              </Button>
            </div>
          </div>
          <div className="text-sm font-mono bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20">
            {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-auto bg-gradient-to-b from-background to-muted/10" ref={timelineRef}>
        <div className="h-16 border-b border-border/30 bg-gradient-to-b from-muted/40 to-muted/20 flex items-end pb-3 sticky top-0 z-10 backdrop-blur-sm" onClick={handleTimelineClick}>
          {timeMarkers.map((marker) => (
            <div key={marker} className="flex flex-col items-start relative" style={{ width: `${pixelsPerSecond}px`, minWidth: `${pixelsPerSecond}px` }}>
              <div className="text-xs text-muted-foreground px-2 font-mono">{Math.floor(marker / 60)}:{(marker % 60).toString().padStart(2, '0')}</div>
              <div className="w-full h-4 border-l border-border/40 relative">
                {Array.from({ length: 4 }, (_, i) => (<div key={i} className="absolute w-px h-2 bg-border/30" style={{ left: `${(i + 1) * (pixelsPerSecond / 4)}px` }} />))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 z-20 pointer-events-none shadow-lg" style={{ left: `${currentTime * pixelsPerSecond}px`, transform: 'translateX(-1px)', filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }}>
          <div className="w-4 h-4 bg-primary transform -translate-x-1.5 rounded-full shadow-lg border-2 border-background"><div className="w-2 h-2 bg-background rounded-full m-0.5"></div></div>
        </div>
        <div className="relative">
          {tracks.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground"><div className="text-center"><AudioLines className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-lg font-semibold">No tracks in timeline</p><p className="text-sm mt-2">Add a track from the left panel or import audio</p></div></div>
          ) : (
            tracks.map((track) => (
              <div key={track.id} className="border-b border-border/20 relative transition-all duration-300 hover:bg-muted/5" style={{ height: `${trackHeight}px` }} onClick={handleTimelineClick}>
                {timeMarkers.map((marker) => (<div key={marker} className="absolute top-0 bottom-0 border-l border-border/10" style={{ left: `${marker * pixelsPerSecond}px` }} />))}
                {track.regions.map((region) => {
                  const regionWidth = region.duration * pixelsPerSecond;
                  return (
                    <div key={region.id} className="absolute top-2 bottom-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group ring-1 ring-white/10 hover:ring-primary/50" style={{ left: `${region.startTime * pixelsPerSecond}px`, width: `${regionWidth}px`, background: `linear-gradient(135deg, ${track.color}, ${track.color}90)`, border: `1px solid ${track.color}40` }}>
                      <div className="h-full flex flex-col justify-center px-2 relative overflow-hidden">
                        {track.waveformData && showWaveforms ? generateWaveformCanvas(track, regionWidth) : (<div className="flex items-center justify-center h-full"><span className="text-xs text-white/90 font-semibold drop-shadow">♪ Audio</span></div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="border-t border-border/30 bg-gradient-to-r from-card/40 to-card/20 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6"><div className="text-sm text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full"></div>{tracks.length} track{tracks.length !== 1 ? 's' : ''} • {tracks.reduce((total, track) => total + track.regions.length, 0)} region{tracks.reduce((total, track) => total + track.regions.length, 0) !== 1 ? 's' : ''}</div></div>
          <div className="flex items-center gap-4">{isRecording && (<div className="flex items-center gap-2 text-destructive animate-pulse"><div className="w-3 h-3 bg-destructive rounded-full"></div><span className="text-sm font-semibold">Recording...</span></div>)}<div className="text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded">{tempo} BPM</div></div>
        </div>
      </div>
    </Card>
  );
};
