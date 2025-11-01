import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface HoverCard3DProps {
  children: ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  glowColor?: string;
}

export const HoverCard3D = ({ 
  children, 
  intensity = 'medium',
  className = '',
  glowColor = 'hsl(15 95% 58%)'
}: HoverCard3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30
  });
  
  // Intensity multipliers
  const intensityMap = {
    low: 0.5,
    medium: 1,
    high: 1.5
  };
  const multiplier = intensityMap[intensity];
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize to -0.5 to 0.5
    const normalizedX = (x / width - 0.5) * multiplier;
    const normalizedY = (y / height - 0.5) * multiplier;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={`relative ${className}`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {/* Glow effect based on tilt */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none -z-10"
        style={{
          boxShadow: useTransform(
            [mouseX, mouseY],
            ([x, y]: any) => {
              const intensity = Math.abs(x as number) + Math.abs(y as number);
              return `0 0 ${30 + intensity * 50}px ${glowColor.replace(')', ` / ${0.3 + intensity * 0.3})`)}, 
                      0 ${10 + intensity * 20}px ${40 + intensity * 60}px ${glowColor.replace(')', ` / ${0.2 + intensity * 0.2})`)}`;
            }
          )
        }}
      />
      
      {/* Content with slight lift */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};
