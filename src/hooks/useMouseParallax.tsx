import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

export const useMouseParallax = (intensity: number = 1) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const normalizedX = ((x / window.innerWidth) * 2 - 1) * intensity;
      const normalizedY = ((y / window.innerHeight) * 2 - 1) * intensity;

      setMousePosition({ x, y, normalizedX, normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return mousePosition;
};
