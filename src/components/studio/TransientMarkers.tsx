import React from 'react';
import { Transient } from '@/audio/analysis/TransientDetector';

interface TransientMarkersProps {
  transients: Transient[];
  startTime: number;
  duration: number;
  width: number;
  height: number;
  showLabels?: boolean;
}

/**
 * Visual markers showing detected transients on waveform
 * Red vertical lines indicate transient peaks (drum hits, note attacks)
 */
export const TransientMarkers: React.FC<TransientMarkersProps> = ({
  transients,
  startTime,
  duration,
  width,
  height,
  showLabels = false,
}) => {
  const endTime = startTime + duration;
  const pixelsPerSecond = width / duration;

  // Filter transients within visible range
  const visibleTransients = transients.filter(
    t => t.time >= startTime && t.time <= endTime
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 10 }}
    >
      {visibleTransients.map((transient, index) => {
        const x = (transient.time - startTime) * pixelsPerSecond;
        const opacity = 0.4 + (transient.magnitude * 0.6); // Scale opacity by strength

        return (
          <g key={`${transient.sampleIndex}-${index}`}>
            {/* Vertical line marker */}
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              opacity={opacity}
            />
            
            {/* Small dot at top */}
            <circle
              cx={x}
              cy={4}
              r={3}
              fill="hsl(var(--destructive))"
              opacity={opacity}
            />

            {/* Optional label showing magnitude */}
            {showLabels && (
              <text
                x={x + 4}
                y={12}
                fill="hsl(var(--destructive))"
                fontSize="9"
                opacity={opacity}
              >
                {transient.magnitude.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
