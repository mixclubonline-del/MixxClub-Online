import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Magnet, ArrowRightFromLine, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track, AudioRegion, useAIStudioStore } from '@/stores/aiStudioStore';
import { TrackControls } from './TrackControls';
import { RegionContextMenu } from './RegionContextMenu';
import { MusicalRuler } from './MusicalRuler';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMusicalQuantization } from '@/hooks/useMusicalQuantization';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WaveformTimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTrackUpdate: (id: string, updates: Partial<Track>) => void;
  recordArmedTracks: Set<string>;
  onToggleRecordArm: (trackId: string) => void;
  onOpenTrackEffects: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const WaveformTimeline = ({
  tracks,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onTrackUpdate,
  recordArmedTracks,
  onToggleRecordArm,
  onOpenTrackEffects,
  onDeleteTrack,
}: WaveformTimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [trackHeight, setTrackHeight] = useState(80);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const trackHeaderWidth = 180;
  const pixelsPerSecond = 100 * zoom;
  
  // Get store actions
  const scrollMode = useAIStudioStore((state) => state.scrollMode);
  const snapEnabled = useAIStudioStore((state) => state.snapEnabled);
  const snapMode = useAIStudioStore((state) => state.snapMode);
  const tempo = useAIStudioStore((state) => state.tempo);
  const selectedRegions = useAIStudioStore((state) => state.selectedRegions);
  const setScrollMode = useAIStudioStore((state) => state.setScrollMode);
  const setSnapEnabled = useAIStudioStore((state) => state.setSnapEnabled);
  const setSnapMode = useAIStudioStore((state) => state.setSnapMode);
  const selectRegion = useAIStudioStore((state) => state.selectRegion);
  const clearSelection = useAIStudioStore((state) => state.clearSelection);
  const splitRegion = useAIStudioStore((state) => state.splitRegion);
  const duplicateRegion = useAIStudioStore((state) => state.duplicateRegion);
  const removeRegion = useAIStudioStore((state) => state.removeRegion);
  const updateRegion = useAIStudioStore((state) => state.updateRegion);
  
  // Musical quantization
  const { quantizeTime, getSnapLabel } = useMusicalQuantization();

  // Generate fallback waveform if real data not available
  const generateFallbackWaveform = (type: Track['type']) => {
    const points = 100;
    const data: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const t = i / points;
      let value = Math.random() * 0.5 + 0.3;
      
      // Add some shape based on track type
      if (type === 'drums') {
        value = Math.abs(Math.sin(t * 20)) * 0.8 + 0.2;
      } else if (type === 'bass') {
        value = Math.abs(Math.sin(t * 10)) * 0.6 + 0.3;
      } else if (type === 'vocal') {
        value = Math.sin(t * 15) * 0.4 + 0.6;
      }
      
      data.push(Math.min(1, Math.max(0, value)));
    }
    
    return data;
  };

  // Convert Float32Array to regular array for rendering
  const getWaveformData = (track: Track): number[] => {
    if (track.waveformData && track.waveformData.length > 0) {
      // Use real waveform data from audio buffer
      return Array.from(track.waveformData);
    }
    // Fallback to generated waveform
    return generateFallbackWaveform(track.type);
  };

  // Get color for track type - Purple to Cyan gradient spectrum
  const getTrackColor = (type: Track['type']) => {
    const colors: Record<Track['type'], string> = {
      vocal: 'hsl(185, 100%, 50%)',
      drums: 'hsl(300, 90%, 65%)',
      bass: 'hsl(270, 100%, 70%)',
      keys: 'hsl(45, 95%, 55%)',
      guitar: 'hsl(330, 90%, 60%)',
      other: 'hsl(210, 100%, 55%)',
    };
    return colors[type] || colors.other;
  };

  // Helper to convert HSL to RGB for gradient
  const getRgbFromHsl = (hslString: string) => {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return { r: 255, g: 255, b: 255 };
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Auto-scroll to follow playhead
  useEffect(() => {
    if (!isPlaying || scrollMode === 'none' || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const playheadX = currentTime * pixelsPerSecond;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    if (scrollMode === 'continuous') {
      // Keep playhead centered
      const targetScroll = playheadX - containerWidth / 2;
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    } else if (scrollMode === 'page') {
      // Jump scroll when playhead reaches 80% of visible area
      if (playheadX > scrollLeft + containerWidth * 0.8) {
        container.scrollTo({ left: playheadX - containerWidth * 0.2, behavior: 'smooth' });
      }
    }
  }, [currentTime, isPlaying, scrollMode, pixelsPerSecond]);
  
  // Draw waveforms and regions on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--studio-black))';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid lines (measures)
    ctx.strokeStyle = 'hsl(var(--studio-border))';
    ctx.lineWidth = 1;
    
    const measureWidth = pixelsPerSecond * 4; // 4 seconds per measure at 120 BPM
    for (let i = 0; i < duration; i += 4) {
      const x = i * pixelsPerSecond;
      if (x > rect.width) break;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    // Draw tracks and regions
    tracks.forEach((track, index) => {
      const trackY = index * trackHeight;
      const trackColor = getTrackColor(track.type);
      
      // Draw track background
      ctx.fillStyle = hoveredTrack === track.id 
        ? 'hsl(220, 16%, 20%)' 
        : 'hsl(220, 18%, 16%)';
      ctx.fillRect(0, trackY, rect.width, trackHeight);

      // Draw regions
      track.regions.forEach((region) => {
        const regionX = region.startTime * pixelsPerSecond;
        const regionWidth = region.duration * pixelsPerSecond;
        const isSelected = selectedRegions.has(region.id);
        const isHovered = hoveredRegion === region.id;
        
        // Region background
        ctx.fillStyle = isSelected 
          ? 'hsl(220, 20%, 30%)' 
          : isHovered 
          ? 'hsl(220, 18%, 24%)' 
          : 'hsl(220, 18%, 20%)';
        ctx.fillRect(regionX, trackY + 4, regionWidth, trackHeight - 8);
        
        // Draw waveform within region bounds - use REAL waveform data with proper sync
        const waveformData = getWaveformData(track);
        const gradient = ctx.createLinearGradient(regionX, trackY, regionX, trackY + trackHeight);
        const rgb = getRgbFromHsl(trackColor);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(regionX, trackY + trackHeight / 2);
        
        // Calculate proper sample mapping - map region pixels to waveform samples
        const regionSamples = Math.floor(regionWidth);
        const audioDuration = track.audioBuffer?.duration || region.duration;
        
        for (let x = 0; x < regionSamples; x++) {
          // Time within the region (in seconds)
          const pixelTime = x / pixelsPerSecond;
          // Time in the source audio buffer
          const sourceTime = region.sourceStartOffset + pixelTime;
          // Map to waveform data index (0 to waveformData.length)
          const sourceProgress = sourceTime / audioDuration;
          const dataIndex = Math.floor(sourceProgress * waveformData.length);
          const amplitude = (waveformData[Math.max(0, Math.min(waveformData.length - 1, dataIndex))] || 0) * region.gain;
          const y = trackY + (trackHeight / 2) - (amplitude * (trackHeight - 8) * 0.3);
          ctx.lineTo(regionX + x, y);
        }
        
        for (let x = regionSamples - 1; x >= 0; x--) {
          const pixelTime = x / pixelsPerSecond;
          const sourceTime = region.sourceStartOffset + pixelTime;
          const sourceProgress = sourceTime / audioDuration;
          const dataIndex = Math.floor(sourceProgress * waveformData.length);
          const amplitude = (waveformData[Math.max(0, Math.min(waveformData.length - 1, dataIndex))] || 0) * region.gain;
          const y = trackY + (trackHeight / 2) + (amplitude * (trackHeight - 8) * 0.3);
          ctx.lineTo(regionX + x, y);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Fade in/out overlays
        if (region.fadeIn.duration > 0) {
          const fadeWidth = region.fadeIn.duration * pixelsPerSecond;
          const fadeGrad = ctx.createLinearGradient(regionX, 0, regionX + fadeWidth, 0);
          fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
          fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = fadeGrad;
          ctx.fillRect(regionX, trackY + 4, fadeWidth, trackHeight - 8);
        }
        
        if (region.fadeOut.duration > 0) {
          const fadeWidth = region.fadeOut.duration * pixelsPerSecond;
          const fadeGrad = ctx.createLinearGradient(regionX + regionWidth - fadeWidth, 0, regionX + regionWidth, 0);
          fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
          ctx.fillStyle = fadeGrad;
          ctx.fillRect(regionX + regionWidth - fadeWidth, trackY + 4, fadeWidth, trackHeight - 8);
        }
        
        // Region border
        ctx.strokeStyle = isSelected ? 'hsl(var(--studio-accent))' : trackColor;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(regionX, trackY + 4, regionWidth, trackHeight - 8);
      });

      // Draw track separator
      ctx.strokeStyle = 'hsl(220, 14%, 28%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trackY + trackHeight);
      ctx.lineTo(rect.width, trackY + trackHeight);
      ctx.stroke();
    });

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    if (playheadX >= 0 && playheadX <= rect.width) {
      ctx.strokeStyle = 'hsl(var(--studio-accent))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, rect.height);
      ctx.stroke();
    }
  }, [tracks, currentTime, duration, zoom, trackHeight, pixelsPerSecond, hoveredTrack, hoveredRegion, selectedRegions]);

  // Handle region selection
  const handleRegionClick = useCallback((regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const multiSelect = e.metaKey || e.ctrlKey;
    selectRegion(regionId, multiSelect);
  }, [selectRegion]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedRegions.size === 0) return;
      
      if (e.key === 's' || e.key === 'S') {
        // Split selected regions at playhead
        selectedRegions.forEach(regionId => splitRegion(regionId, currentTime));
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        // Duplicate selected regions
        selectedRegions.forEach(regionId => duplicateRegion(regionId));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected regions
        selectedRegions.forEach(regionId => removeRegion(regionId));
        clearSelection();
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegions, currentTime, splitRegion, duplicateRegion, removeRegion, clearSelection]);

  // Handle click to seek with quantization
  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a region
    const trackIndex = Math.floor(y / trackHeight);
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      const clickTime = x / pixelsPerSecond;
      
      const clickedRegion = track.regions.find(r => 
        clickTime >= r.startTime && clickTime <= r.startTime + r.duration
      );
      
      if (clickedRegion) {
        handleRegionClick(clickedRegion.id, e);
        return;
      }
    }
    
    // Otherwise seek with quantization
    const rawTime = x / pixelsPerSecond;
    const quantizedTime = quantizeTime(rawTime);
    onTimeChange(Math.max(0, Math.min(duration, quantizedTime)));
    clearSelection();
  };

  // Handle track and region hover
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const trackIndex = Math.floor(y / trackHeight);
    
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      setHoveredTrack(track.id);
      
      // Check if hovering over a region
      const hoverTime = x / pixelsPerSecond;
      const hovered = track.regions.find(r => 
        hoverTime >= r.startTime && hoverTime <= r.startTime + r.duration
      );
      setHoveredRegion(hovered?.id || null);
    } else {
      setHoveredTrack(null);
      setHoveredRegion(null);
    }
  };

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'hsl(220, 20%, 14%)',
      }}
    >
      {/* Timeline Header - Simplified */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{
          background: 'var(--panel-gradient)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
            className="h-7 w-7"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] font-mono text-[hsl(var(--studio-text-dim))] min-w-[2.5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.min(4, zoom + 0.5))}
            className="h-7 w-7"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          
          <div className="w-px h-5 bg-[hsl(220,14%,28%)] mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={snapEnabled ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 gap-1"
              >
                <Magnet className="w-3 h-3" />
                <span className="text-[10px]">{getSnapLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSnapEnabled(!snapEnabled)}>
                {snapEnabled ? 'Disable' : 'Enable'} Snap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('bars')}>Bars</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('beats')}>Beats</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('quarter')}>1/4 Note</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('eighth')}>1/8 Note</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('sixteenth')}>1/16 Note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={scrollMode !== 'none' ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span className="text-[10px]">
                  {scrollMode === 'continuous' ? 'Follow' : scrollMode === 'page' ? 'Page' : 'Static'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setScrollMode('none')}>Static</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScrollMode('page')}>Page Scroll</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScrollMode('continuous')}>Follow Playhead</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
            Track Height
          </span>
          <input
            type="range"
            min="60"
            max="120"
            value={trackHeight}
            onChange={(e) => setTrackHeight(Number(e.target.value))}
            className="w-24 accent-[hsl(var(--studio-accent))]"
          />
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Musical Ruler */}
        <div className="flex border-b border-[hsl(var(--studio-border))]">
          <div className="flex-shrink-0" style={{ width: trackHeaderWidth }} />
          <div className="flex-1 overflow-hidden">
            <div style={{ width: duration * pixelsPerSecond }}>
              <MusicalRuler
                duration={duration}
                tempo={tempo}
                pixelsPerSecond={pixelsPerSecond}
                currentTime={currentTime}
                onTimeChange={onTimeChange}
              />
            </div>
          </div>
        </div>

        {/* Track Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Track Headers */}
          <div className="flex-shrink-0 bg-[hsl(var(--studio-panel))] border-r border-[hsl(var(--studio-border))]" style={{ width: trackHeaderWidth }}>
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "flex items-center px-3 border-b border-[hsl(var(--studio-border))] transition",
                hoveredTrack === track.id && "bg-[hsl(var(--studio-panel-raised))]"
              )}
              style={{ height: trackHeight }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getTrackColor(track.type) }}
                />
                <span className="text-xs font-medium text-[hsl(var(--studio-text))] truncate">
                  {track.name}
                </span>
              </div>
              
              <TrackControls
                track={track}
                isRecordArmed={recordArmedTracks.has(track.id)}
                onToggleRecordArm={() => onToggleRecordArm(track.id)}
                onOpenEffects={() => onOpenTrackEffects(track.id)}
                onDelete={() => onDeleteTrack(track.id)}
                onUpdate={(updates) => onTrackUpdate(track.id, updates)}
              />
            </div>
          ))}
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollContainerRef}>
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ 
              height: tracks.length * trackHeight,
              minWidth: Math.max(800, duration * pixelsPerSecond)
            }}
            onClick={handleTimelineClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoveredTrack(null);
              setHoveredRegion(null);
            }}
          />
        </div>
      </div>

      {/* Time Ruler */}
      <div className="h-8 bg-[hsl(var(--studio-panel))] border-t border-[hsl(var(--studio-border))] flex items-center px-4">
        <div className="flex-shrink-0" style={{ width: trackHeaderWidth }} />
        <div className="flex-1 relative">
          {Array.from({ length: Math.ceil(duration / 4) }).map((_, i) => {
            const time = i * 4;
            const x = time * pixelsPerSecond;
            return (
              <div
                key={i}
                className="absolute text-xs font-mono text-[hsl(var(--studio-text-dim))]"
                style={{ left: x }}
              >
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};
