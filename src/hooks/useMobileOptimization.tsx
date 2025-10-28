import { useEffect, useState } from 'react';
import { useMobileDetect } from './useMobileDetect';

interface MobileOptimizationConfig {
  enableHaptics?: boolean;
  enablePullToRefresh?: boolean;
  enableSwipeGestures?: boolean;
  optimizeImages?: boolean;
}

export const useMobileOptimization = (config: MobileOptimizationConfig = {}) => {
  const { isMobile, isPWA } = useMobileDetect();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsReady(true);
      return;
    }

    // Apply mobile optimizations
    const applyOptimizations = async () => {
      // Disable zoom on inputs
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      // Add touch-action CSS for better touch handling
      document.body.style.touchAction = 'pan-y pinch-zoom';

      // Optimize scrolling (webkit specific)
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Ensure body can scroll
      document.body.style.overflowY = 'auto';

      // Prevent pull-to-refresh if disabled
      if (!config.enablePullToRefresh) {
        document.body.style.overscrollBehavior = 'none';
      }

      setIsReady(true);
    };

    applyOptimizations();

    return () => {
      // Cleanup
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isMobile, config]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!config.enableHaptics || !isMobile) return;

    // Use Capacitor Haptics if available
    if ((window as any).Capacitor?.Plugins?.Haptics) {
      const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
      const impactStyle = style === 'light' ? ImpactStyle.Light : 
                         style === 'heavy' ? ImpactStyle.Heavy : 
                         ImpactStyle.Medium;
      Haptics.impact({ style: impactStyle });
    } else if (navigator.vibrate) {
      // Fallback to vibration API
      const duration = style === 'light' ? 10 : style === 'heavy' ? 50 : 25;
      navigator.vibrate(duration);
    }
  };

  return {
    isReady,
    triggerHaptic,
    isMobile,
    isPWA
  };
};
