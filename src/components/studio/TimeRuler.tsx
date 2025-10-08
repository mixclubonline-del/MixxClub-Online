import { useMemo } from 'react';

interface TimeRulerProps {
  duration: number;
  zoom: number;
  tempo: number;
  snapMode: 'bars' | 'beats' | 'quarter' | 'eighth' | 'sixteenth';
}

export const TimeRuler = ({ duration, zoom, tempo, snapMode }: TimeRulerProps) => {
  const markers = useMemo(() => {
    const beatDuration = 60 / tempo;
    const interval = snapMode === 'bars' ? beatDuration * 4 : beatDuration;
    const count = Math.ceil(duration / interval);
    
    return Array.from({ length: count }, (_, i) => {
      const time = i * interval;
      const isBar = i % 4 === 0;
      
      return {
        time,
        label: formatTime(time, tempo, snapMode),
        isBar,
      };
    });
  }, [duration, tempo, snapMode]);

  return (
    <div className="sticky top-0 z-20 h-10 bg-[#0f1419] border-b border-white/10 flex items-end">
      {markers.map((marker) => (
        <div
          key={marker.time}
          className="absolute bottom-0 flex flex-col items-start"
          style={{ left: `${marker.time * zoom}px` }}
        >
          <div 
            className={`w-px ${marker.isBar ? 'h-3 bg-white/30' : 'h-2 bg-white/15'}`}
          />
          <span 
            className={`text-[10px] ml-1 ${
              marker.isBar ? 'text-white/60 font-medium' : 'text-white/30'
            }`}
          >
            {marker.label}
          </span>
        </div>
      ))}
    </div>
  );
};

function formatTime(seconds: number, tempo: number, snapMode: string): string {
  if (snapMode === 'bars' || snapMode === 'beats') {
    const beatDuration = 60 / tempo;
    const bar = Math.floor(seconds / (beatDuration * 4)) + 1;
    const beat = Math.floor((seconds % (beatDuration * 4)) / beatDuration) + 1;
    return `${bar}.${beat}`;
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
