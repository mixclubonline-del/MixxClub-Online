import { useMemo } from 'react';
import { useDeviceContext } from './useDeviceContext';

export interface PerformanceProfile {
  // Visual effects
  enableBlur: boolean;
  enableAnimations: boolean;
  enable3DEffects: boolean;
  enableParticles: boolean;
  enableGlowEffects: boolean;
  
  // Quality settings
  imageQuality: 'low' | 'medium' | 'high' | 'ultra';
  animationDuration: number; // multiplier
  maxVisibleItems: number;
  
  // Performance hints
  useVirtualization: boolean;
  deferNonCritical: boolean;
  reduceRepaints: boolean;
}

export const useContextualPerformance = (): PerformanceProfile => {
  const { 
    breakpoint, 
    prefersReducedMotion, 
    pixelDensity,
    isNative,
    experienceMode,
  } = useDeviceContext();

  const profile = useMemo<PerformanceProfile>(() => {
    // Reduced motion takes priority
    if (prefersReducedMotion) {
      return {
        enableBlur: true,
        enableAnimations: false,
        enable3DEffects: false,
        enableParticles: false,
        enableGlowEffects: true,
        imageQuality: 'high',
        animationDuration: 0,
        maxVisibleItems: 100,
        useVirtualization: true,
        deferNonCritical: false,
        reduceRepaints: true,
      };
    }

    // Mobile phone - balanced performance
    if (experienceMode === 'touch-mobile') {
      return {
        enableBlur: true,
        enableAnimations: true,
        enable3DEffects: false,
        enableParticles: false,
        enableGlowEffects: true,
        imageQuality: pixelDensity === 'hidpi' ? 'high' : 'medium',
        animationDuration: 1,
        maxVisibleItems: 50,
        useVirtualization: true,
        deferNonCritical: true,
        reduceRepaints: true,
      };
    }

    // Tablet - moderate effects
    if (experienceMode === 'touch-tablet') {
      return {
        enableBlur: true,
        enableAnimations: true,
        enable3DEffects: false,
        enableParticles: true,
        enableGlowEffects: true,
        imageQuality: 'high',
        animationDuration: 1,
        maxVisibleItems: 75,
        useVirtualization: true,
        deferNonCritical: false,
        reduceRepaints: false,
      };
    }

    // Desktop compact (laptop) - most effects enabled
    if (experienceMode === 'desktop-compact') {
      return {
        enableBlur: true,
        enableAnimations: true,
        enable3DEffects: true,
        enableParticles: true,
        enableGlowEffects: true,
        imageQuality: 'high',
        animationDuration: 1,
        maxVisibleItems: 100,
        useVirtualization: false,
        deferNonCritical: false,
        reduceRepaints: false,
      };
    }

    // Desktop full / Ultrawide - all effects, ultra quality
    return {
      enableBlur: true,
      enableAnimations: true,
      enable3DEffects: true,
      enableParticles: true,
      enableGlowEffects: true,
      imageQuality: 'ultra',
      animationDuration: 1,
      maxVisibleItems: 200,
      useVirtualization: false,
      deferNonCritical: false,
      reduceRepaints: false,
    };
  }, [experienceMode, prefersReducedMotion, pixelDensity]);

  return profile;
};
