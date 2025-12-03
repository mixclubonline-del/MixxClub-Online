import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  beats: number[];
  amplitude: number;
  bass: number;
  variant?: 'bars' | 'circle' | 'wave';
  className?: string;
}

export const AudioVisualizer = ({ 
  beats, 
  amplitude, 
  bass,
  variant = 'bars',
  className = ''
}: AudioVisualizerProps) => {
  if (variant === 'circle') {
    return (
      <div className={`relative ${className}`}>
        {/* Bass Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{
            scale: 1 + (bass / 255) * 0.5,
            opacity: 0.3 + (bass / 255) * 0.5
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Frequency Ring */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {beats.map((beat, i) => {
            const angle = (i / beats.length) * Math.PI * 2 - Math.PI / 2;
            const innerRadius = 60;
            const outerRadius = innerRadius + (beat / 255) * 40;
            const x1 = 100 + Math.cos(angle) * innerRadius;
            const y1 = 100 + Math.sin(angle) * innerRadius;
            const x2 = 100 + Math.cos(angle) * outerRadius;
            const y2 = 100 + Math.sin(angle) * outerRadius;
            
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`hsl(${280 + (i / beats.length) * 60}, 100%, 60%)`}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 + (beat / 255) * 0.5 }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (variant === 'wave') {
    const points = beats.map((beat, i) => {
      const x = (i / (beats.length - 1)) * 100;
      const y = 50 - (beat / 255) * 40;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className={`relative ${className}`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(280 100% 60%)" />
              <stop offset="100%" stopColor="hsl(200 100% 60%)" />
            </linearGradient>
          </defs>
          
          {/* Wave fill */}
          <motion.polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#waveGradient)"
            fillOpacity="0.3"
          />
          
          {/* Wave line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Default: bars
  return (
    <div className={`flex items-end justify-center gap-1 ${className}`}>
      {beats.map((beat, i) => {
        const hue = 280 + (i / beats.length) * 60;
        return (
          <motion.div
            key={i}
            className="rounded-t"
            style={{
              width: `${100 / beats.length - 1}%`,
              minWidth: '4px',
              maxWidth: '12px',
              background: `linear-gradient(to top, hsl(${hue} 100% 50%), hsl(${hue + 30} 100% 70%))`,
              boxShadow: `0 0 10px hsl(${hue} 100% 50% / 0.5)`
            }}
            animate={{
              height: `${Math.max((beat / 255) * 100, 5)}%`
            }}
            transition={{ duration: 0.05 }}
          />
        );
      })}
    </div>
  );
};
