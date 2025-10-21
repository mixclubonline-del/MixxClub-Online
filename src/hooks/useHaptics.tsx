import { useCallback } from 'react';
import { useMobileDetect } from './useMobileDetect';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHaptics = () => {
  const { isMobile } = useMobileDetect();

  const trigger = useCallback((style: HapticStyle = 'medium') => {
    if (!isMobile) return;

    // Map styles to intensities
    const intensityMap: Record<HapticStyle, number> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: 15,
      warning: 30,
      error: 40
    };

    // Try Capacitor Haptics first
    if ((window as any).Capacitor?.Plugins?.Haptics) {
      const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
      const impactStyle = 
        style === 'light' || style === 'success' ? ImpactStyle.Light :
        style === 'heavy' || style === 'error' ? ImpactStyle.Heavy :
        ImpactStyle.Medium;
      
      Haptics.impact({ style: impactStyle });
    } 
    // Fallback to vibration API
    else if (navigator.vibrate) {
      navigator.vibrate(intensityMap[style]);
    }
  }, [isMobile]);

  return {
    trigger,
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error')
  };
};
