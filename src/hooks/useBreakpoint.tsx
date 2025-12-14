import { useEffect, useState } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const updateBreakpoint = () => {
      const w = window.innerWidth;
      setWidth(w);
      
      if (w < BREAKPOINTS.tablet) {
        setBreakpoint('phone');
      } else if (w < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    width,
    isPhone: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobile: breakpoint === 'phone' || breakpoint === 'tablet',
    isTouch: breakpoint !== 'desktop',
  };
};
