interface PlayheadProps {
  currentTime: number;
  zoom: number;
}

export const Playhead = ({ currentTime, zoom }: PlayheadProps) => {
  const position = currentTime * zoom;

  return (
    <div 
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${position}px` }}
    >
      {/* Playhead line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-500 to-transparent shadow-lg shadow-cyan-500/50" />
      
      {/* Playhead handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3">
        <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-lg">
          <path 
            d="M 6 0 L 12 6 L 6 12 L 0 6 Z" 
            fill="hsl(180, 100%, 50%)"
            stroke="hsl(180, 100%, 70%)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </div>
  );
};
