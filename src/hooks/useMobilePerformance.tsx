import { useEffect, useState, useCallback } from 'react';
import { useBreakpoint } from './useBreakpoint';

interface PerformanceConfig {
  /** Reduce animation complexity on mobile */
  reduceAnimations?: boolean;
  /** Use lighter blur effects */
  reducedBlur?: boolean;
  /** Debounce scroll events */
  optimizeScroll?: boolean;
}

interface PerformanceState {
  /** Device prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Device is in low power mode (if detectable) */
  isLowPowerMode: boolean;
  /** Is a slow connection (if detectable) */
  isSlowConnection: boolean;
  /** Combined: should reduce visual complexity */
  shouldReduceComplexity: boolean;
}

export const useMobilePerformance = (config: PerformanceConfig = {}): PerformanceState & {
  animationDuration: (baseMs: number) => number;
  blurAmount: (basePx: number) => number;
} => {
  const { isMobile } = useBreakpoint();
  
  const [state, setState] = useState<PerformanceState>({
    prefersReducedMotion: false,
    isLowPowerMode: false,
    isSlowConnection: false,
    shouldReduceComplexity: false,
  });

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setState(prev => ({
        ...prev,
        prefersReducedMotion: motionQuery.matches,
        shouldReduceComplexity: motionQuery.matches || prev.isLowPowerMode || prev.isSlowConnection,
      }));
    };
    
    updateMotion();
    motionQuery.addEventListener('change', updateMotion);

    // Check connection speed (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const updateConnection = () => {
        const slowTypes = ['slow-2g', '2g', '3g'];
        const isSlow = slowTypes.includes(connection.effectiveType) || connection.saveData;
        setState(prev => ({
          ...prev,
          isSlowConnection: isSlow,
          shouldReduceComplexity: prev.prefersReducedMotion || prev.isLowPowerMode || isSlow,
        }));
      };
      
      updateConnection();
      connection.addEventListener('change', updateConnection);
      
      return () => {
        motionQuery.removeEventListener('change', updateMotion);
        connection.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      motionQuery.removeEventListener('change', updateMotion);
    };
  }, []);

  // Adaptive animation duration
  const animationDuration = useCallback((baseMs: number): number => {
    if (state.prefersReducedMotion) return 0;
    if (state.shouldReduceComplexity || isMobile) return baseMs * 0.6;
    return baseMs;
  }, [state.prefersReducedMotion, state.shouldReduceComplexity, isMobile]);

  // Adaptive blur amount
  const blurAmount = useCallback((basePx: number): number => {
    if (state.shouldReduceComplexity) return Math.min(basePx, 4);
    if (isMobile) return Math.min(basePx, 8);
    return basePx;
  }, [state.shouldReduceComplexity, isMobile]);

  return {
    ...state,
    animationDuration,
    blurAmount,
  };
};

// Hook for optimized scroll handling
export const useOptimizedScroll = (callback: (scrollY: number) => void, throttleMs = 16) => {
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, throttleMs]);
};
