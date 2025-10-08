import { motion } from 'framer-motion';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

interface ConnectionPathProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color1: string;
  color2: string;
  particleCount?: number;
}

export default function ConnectionPath({
  x1, y1, x2, y2, color1, color2, particleCount = 8
}: ConnectionPathProps) {
  const audioState = useAudioReactivity({ simulationMode: true });
  
  // Calculate control points for smooth curve
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Perpendicular offset for curve
  const offsetX = -dy / distance * 50;
  const offsetY = dx / distance * 50;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;
  
  const pathD = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  const pathLength = distance * 1.3; // Approximate curved path length

  return (
    <g>
      {/* Glow layer */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#gradient-${x1}-${y1})`}
        strokeWidth="2"
        opacity="0.3"
        filter="blur(20px)"
        animate={{
          opacity: audioState.isPlaying ? [0.3, 0.6, 0.3] : 0.3
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Main path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#gradient-${x1}-${y1})`}
        strokeWidth="2"
        opacity="0.6"
        filter="blur(2px)"
        animate={{
          strokeWidth: audioState.isPlaying ? [2, 3, 2] : 2
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id={`gradient-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Traveling particles */}
      {Array.from({ length: particleCount }, (_, i) => {
        const speed = audioState.isPlaying ? 3 - (audioState.amplitude / 100) : 4;
        const delay = (i / particleCount) * speed;
        
        return (
          <motion.circle
            key={i}
            r="3"
            fill="white"
            filter="blur(2px)"
            animate={{
              offsetDistance: ['0%', '100%'],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: speed,
              delay: delay,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              offsetPath: `path('${pathD}')`,
              boxShadow: '0 0 20px white'
            }}
          >
            <animateMotion dur={`${speed}s`} repeatCount="indefinite" begin={`${delay}s`}>
              <mpath href={`#path-${x1}-${y1}`} />
            </animateMotion>
          </motion.circle>
        );
      })}

      {/* Hidden path for animateMotion */}
      <path id={`path-${x1}-${y1}`} d={pathD} fill="none" stroke="none" />
    </g>
  );
}
