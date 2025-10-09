import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Magnet, ArrowRightFromLine, Navigation, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track, AudioRegion, useAIStudioStore } from '@/stores/aiStudioStore';
import { TrackControls } from './TrackControls';
import { RegionContextMenu } from './RegionContextMenu';
import { MusicalRuler } from './MusicalRuler';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMusicalQuantization } from '@/hooks/useMusicalQuantization';
import { TransientDetector, Transient } from '@/audio/analysis/TransientDetector';
import { ZeroCrossingDetector } from '@/audio/analysis/ZeroCrossingDetector';
import { TransientMarkers } from './TransientMarkers';
import { useSmartCursor } from '@/hooks/useSmartCursor';
import { useRippleEdit } from '@/hooks/useRippleEdit';
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
  const [trackTransients, setTrackTransients] = useState<Map<string, Transient[]>>(new Map());

  const trackHeaderWidth = 180;
  const pixelsPerSecond = 100 * zoom;
  
  // Get store actions
  const scrollMode = useAIStudioStore((state) => state.scrollMode);
  const snapEnabled = useAIStudioStore((state) => state.snapEnabled);
  const snapMode = useAIStudioStore((state) => state.snapMode);
  const rippleMode = useAIStudioStore((state) => state.rippleMode);
  const tempo = useAIStudioStore((state) => state.tempo);
  const selectedRegions = useAIStudioStore((state) => state.selectedRegions);
  const setScrollMode = useAIStudioStore((state) => state.setScrollMode);
  const setSnapEnabled = useAIStudioStore((state) => state.setSnapEnabled);
  const setSnapMode = useAIStudioStore((state) => state.setSnapMode);
  const setRippleMode = useAIStudioStore((state) => state.setRippleMode);
  const selectRegion = useAIStudioStore((state) => state.selectRegion);
  const clearSelection = useAIStudioStore((state) => state.clearSelection);
  const splitRegion = useAIStudioStore((state) => state.splitRegion);
  const duplicateRegion = useAIStudioStore((state) => state.duplicateRegion);
  const removeRegion = useAIStudioStore((state) => state.removeRegion);
  const updateRegion = useAIStudioStore((state) => state.updateRegion);
  
  // Musical quantization and precision tools
  const { quantizeTime, getSnapLabel } = useMusicalQuantization();
  const { cursorState, updateCursor, resetCursor } = useSmartCursor();
  const { deleteRegionWithRipple } = useRippleEdit();

  // Detect transients when tracks load
  useEffect(() => {
    const detectTransients = async () => {
      const newTransients = new Map<string, Transient[]>();
      
      for (const track of tracks) {
        if (track.audioBuffer && !trackTransients.has(track.id)) {
          const transients = TransientDetector.detect(
            track.audioBuffer,
            0.3, // Moderate sensitivity
            0.05 // 50ms minimum between transients
          );
          newTransients.set(track.id, transients);
          console.log(`Detected ${transients.length} transients in track ${track.name}`);
        }
      }

      if (newTransients.size > 0) {
        setTrackTransients(prev => new Map([...prev, ...newTransients]));
      }
    };

    detectTransients();
  }, [tracks]);

  // Enhanced quantization with transient/zero-crossing snap
  const enhancedQuantizeTime = useCallback((time: number, trackId?: string): number => {
    if (!snapEnabled) return time;

    // Snap to transient
    if (snapMode === 'transient' && trackId) {
      const transients = trackTransients.get(trackId);
      if (transients && transients.length > 0) {
        const nearest = TransientDetector.findNearest(transients, time, 0.15);
        if (nearest) {
          console.log(`Snapped to transient at ${nearest.time}s`);
          return nearest.time;
        }
      }
    }

    // Snap to zero crossing
    if (snapMode === 'zero-crossing' && trackId) {
      const track = tracks.find(t => t.id === trackId);
      if (track?.audioBuffer) {
        const snapped = ZeroCrossingDetector.snapToZeroCrossing(
          track.audioBuffer,
          time,
          0.01 // 10ms max distance
        );
        console.log(`Snapped to zero crossing: ${time}s -> ${snapped}s`);
        return snapped;
      }
    }

    // Use regular musical quantization
    return quantizeTime(time);
  }, [snapEnabled, snapMode, trackTransients, tracks, quantizeTime]);

  // Generate fallback waveform if real data not available
  const generateFallbackWaveform = (type: Track['type']) => {
    const points = 100;
    const data: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const t = i / points;
      let value = Math.random() * 0.5 + 0.3;
      
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

  const getWaveformData = (track: Track): number[] => {
    if (track.waveformData && track.waveformData.length > 0) {
      return Array.from(track.waveformData);
    }
    return generateFallbackWaveform(track.type);
  };

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

  // Auto-scroll effect
  

  useEffect(() => {
    if (!isPlaying || scrollMode === 'none' || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const playheadX = currentTime * pixelsPerSecond;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    if (scrollMode === 'continuous') {
      const targetScroll = playheadX - containerWidth / 2;
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    } else if (scrollMode === 'page') {
      if (playheadX > scrollLeft + containerWidth * 0.8) {
        container.scrollTo({ left: playheadX - containerWidth * 0.2, behavior: 'smooth' });
      }
    }
  }, [currentTime, isPlaying, scrollMode, pixelsPerSecond]);
  
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

    ctx.fillStyle = 'hsl(var(--studio-black))';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = 'hsl(var(--studio-border))';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < duration; i += 4) {
      const x = i * pixelsPerSecond;
      if (x > rect.width) break;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    tracks.forEach((track, index) => {
      const trackY = index * trackHeight;
      const trackColor = getTrackColor(track.type);
      
      ctx.fillStyle = hoveredTrack === track.id ? 'hsl(220, 16%, 20%)' : 'hsl(220, 18%, 16%)';
      ctx.fillRect(0, trackY, rect.width, trackHeight);

      track.regions.forEach((region) => {
        const regionX = region.startTime * pixelsPerSecond;
        const regionWidth = region.duration * pixelsPerSecond;
        const isSelected = selectedRegions.has(region.id);
        const isHovered = hoveredRegion === region.id;
        
        ctx.fillStyle = isSelected ? 'hsl(220, 20%, 30%)' : isHovered ? 'hsl(220, 18%, 24%)' : 'hsl(220, 18%, 20%)';
        ctx.fillRect(regionX, trackY + 4, regionWidth, trackHeight - 8);
        
        const waveformData = getWaveformData(track);
        const gradient = ctx.createLinearGradient(regionX, trackY, regionX, trackY + trackHeight);
        const rgb = getRgbFromHsl(trackColor);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(regionX, trackY + trackHeight / 2);
        
        const regionSamples = Math.floor(regionWidth);
        const audioDuration = track.audioBuffer?.duration || region.duration;
        
        for (let x = 0; x < regionSamples; x++) {
          const pixelTime = x / pixelsPerSecond;
          const sourceTime = region.sourceStartOffset + pixelTime;
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
        
        ctx.strokeStyle = isSelected ? 'hsl(var(--studio-accent))' : trackColor;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(regionX, trackY + 4, regionWidth, trackHeight - 8);
      });

      ctx.strokeStyle = 'hsl(220, 14%, 28%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trackY + trackHeight);
      ctx.lineTo(rect.width, trackY + trackHeight);
      ctx.stroke();
    });

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

  const handleRegionClick = useCallback((regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const multiSelect = e.metaKey || e.ctrlKey;
    selectRegion(regionId, multiSelect);
  }, [selectRegion]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedRegions.size === 0) return;
      
      if (e.key === 's' || e.key === 'S') {
        selectedRegions.forEach(regionId => splitRegion(regionId, currentTime));
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        selectedRegions.forEach(regionId => duplicateRegion(regionId));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Use ripple-aware delete
        selectedRegions.forEach(regionId => deleteRegionWithRipple(regionId));
        clearSelection();
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegions, currentTime, splitRegion, duplicateRegion, deleteRegionWithRipple, clearSelection]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
    
    const rawTime = x / pixelsPerSecond;
    const trackIndex2 = Math.floor(y / trackHeight);
    const trackId = trackIndex2 >= 0 && trackIndex2 < tracks.length ? tracks[trackIndex2].id : undefined;
    const quantizedTime = enhancedQuantizeTime(rawTime, trackId);
    onTimeChange(Math.max(0, Math.min(duration, quantizedTime)));
    clearSelection();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const trackIndex = Math.floor(y / trackHeight);
    
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      setHoveredTrack(track.id);
      
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
      style={{ background: 'hsl(220, 20%, 14%)' }}
    >
      {/* Timeline Header */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{
          background: 'var(--panel-gradient)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="h-7 w-7">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] font-mono text-[hsl(var(--studio-text-dim))] min-w-[2.5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(4, zoom + 0.5))} className="h-7 w-7">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          
          <div className="w-px h-5 bg-[hsl(220,14%,28%)] mx-1" />
          
          {/* Snap Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={snapEnabled ? "default" : "ghost"} size="sm" className="h-7 px-2 gap-1">
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
              <DropdownMenuItem onClick={() => setSnapMode('transient')}>
                Transient 🎯
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSnapMode('zero-crossing')}>
                Zero-Crossing ⚡
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Scroll Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={scrollMode !== 'none' ? "default" : "ghost"} size="sm" className="h-7 px-2 gap-1">
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

          {/* Ripple Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={rippleMode !== 'off' ? "default" : "ghost"} size="sm" className="h-7 px-2 gap-1">
                <Workflow className="w-3 h-3" />
                <span className="text-[10px]">
                  {rippleMode === 'all' ? 'Ripple All' : rippleMode === 'selected' ? 'Ripple Sel' : 'No Ripple'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRippleMode('off')}>No Ripple</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRippleMode('selected')}>Ripple Selected Tracks</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRippleMode('all')}>Ripple All Tracks</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">Track Height</span>
          <input
            type="range"
            min="60"
            max="200"
            value={trackHeight}
            onChange={(e) => setTrackHeight(parseInt(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track Headers */}
        <div 
          className="flex-shrink-0 overflow-y-auto border-r"
          style={{ 
            width: trackHeaderWidth,
            borderColor: 'hsl(220, 14%, 28%)',
          }}
        >
          {tracks.map((track) => (
            <div key={track.id} style={{ height: trackHeight }}>
              <TrackControls
                track={track}
                onUpdate={(updates) => onTrackUpdate(track.id, updates)}
                onDelete={() => onDeleteTrack(track.id)}
                onToggleRecordArm={() => onToggleRecordArm(track.id)}
                isRecordArmed={recordArmedTracks.has(track.id)}
                onOpenEffects={() => onOpenTrackEffects(track.id)}
              />
            </div>
          ))}
        </div>

        {/* Timeline Canvas */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto relative"
        >
          <div 
            style={{ 
              width: duration * pixelsPerSecond,
              height: tracks.length * trackHeight,
              position: 'relative',
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
              style={{
                width: duration * pixelsPerSecond,
                height: tracks.length * trackHeight,
                display: 'block',
              }}
            />

            {/* Transient Markers Overlay */}
            {tracks.map((track, index) => {
              const transients = trackTransients.get(track.id);
              if (!transients || transients.length === 0) return null;

              return (
                <div
                  key={`transients-${track.id}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: index * trackHeight,
                    width: duration * pixelsPerSecond,
                    height: trackHeight,
                    pointerEvents: 'none',
                  }}
                >
                  <TransientMarkers
                    transients={transients}
                    startTime={0}
                    duration={duration}
                    width={duration * pixelsPerSecond}
                    height={trackHeight}
                  />
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Musical Ruler */}
      <MusicalRuler
        duration={duration}
        currentTime={currentTime}
        pixelsPerSecond={pixelsPerSecond}
        tempo={tempo}
        onTimeChange={onTimeChange}
      />
    </div>
  );
};
