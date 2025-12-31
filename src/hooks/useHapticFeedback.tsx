import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const useHapticFeedback = () => {
  const isNative = Capacitor.isNativePlatform();

  const triggerHaptic = useCallback(async (style: HapticStyle = 'medium') => {
    if (!isNative) {
      // Fallback to Web Vibration API if available
      if ('vibrate' in navigator) {
        const patterns: Record<HapticStyle, number | number[]> = {
          light: 10,
          medium: 25,
          heavy: 50,
          success: [10, 50, 10],
          warning: [25, 50, 25],
          error: [50, 100, 50],
          selection: 5,
        };
        navigator.vibrate(patterns[style]);
      }
      return;
    }

    try {
      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionEnd();
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [isNative]);

  const vibratePattern = useCallback(async (pattern: number[]) => {
    if (!isNative && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
      return;
    }

    if (isNative) {
      // Create pattern with Capacitor
      for (let i = 0; i < pattern.length; i++) {
        if (i % 2 === 0) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
        await new Promise(resolve => setTimeout(resolve, pattern[i]));
      }
    }
  }, [isNative]);

  return {
    triggerHaptic,
    vibratePattern,
    isNative,
  };
};
