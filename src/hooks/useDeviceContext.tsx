import { useState, useEffect, useMemo } from 'react';
import {
  detectPlatform,
  detectBrowser,
  isPWA,
  isNativeApp,
  hasTouchScreen,
  hasMousePrecision,
  getPrimaryInput,
  getPixelDensity,
  type Platform,
  type Browser,
  type InputMethod,
} from '@/lib/platform';

export type Breakpoint = 'phone' | 'tablet' | 'laptop' | 'desktop' | 'ultrawide';
export type AspectRatio = 'portrait' | 'landscape' | 'square';
export type PixelDensity = 'standard' | 'retina' | 'hidpi';
export type ExperienceMode = 'touch-mobile' | 'touch-tablet' | 'desktop-compact' | 'desktop-full' | 'ultrawide';

const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  ultrawide: 1920,
} as const;

export interface DeviceContext {
  // Screen & Layout
  breakpoint: Breakpoint;
  screenWidth: number;
  screenHeight: number;
  aspectRatio: AspectRatio;
  pixelDensity: PixelDensity;
  
  // Platform & OS
  platform: Platform;
  browser: Browser;
  isMobile: boolean;
  isNative: boolean;
  isPWA: boolean;
  
  // Input Method
  primaryInput: InputMethod;
  hasTouchscreen: boolean;
  hasMousePrecision: boolean;
  
  // Accessibility & Preferences
  prefersReducedMotion: boolean;
  prefersColorScheme: 'light' | 'dark';
  prefersHighContrast: boolean;
  
  // Derived Experience Modes
  experienceMode: ExperienceMode;
  
  // Convenience booleans
  isPhone: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isUltrawide: boolean;
  isTouch: boolean;
}

const getBreakpoint = (width: number): Breakpoint => {
  if (width < BREAKPOINTS.tablet) return 'phone';
  if (width < BREAKPOINTS.laptop) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  if (width < BREAKPOINTS.ultrawide) return 'desktop';
  return 'ultrawide';
};

const getAspectRatio = (width: number, height: number): AspectRatio => {
  const ratio = width / height;
  if (ratio < 0.9) return 'portrait';
  if (ratio > 1.1) return 'landscape';
  return 'square';
};

const getExperienceMode = (
  breakpoint: Breakpoint,
  hasTouch: boolean,
  hasMouse: boolean
): ExperienceMode => {
  if (breakpoint === 'phone') return 'touch-mobile';
  if (breakpoint === 'tablet') return hasTouch ? 'touch-tablet' : 'desktop-compact';
  if (breakpoint === 'ultrawide') return 'ultrawide';
  if (breakpoint === 'laptop') return 'desktop-compact';
  return 'desktop-full';
};

export const useDeviceContext = (): DeviceContext => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [screenHeight, setScreenHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 768
  );
  
  // Media query states
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersColorScheme, setPrefersColorScheme] = useState<'light' | 'dark'>('dark');
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    // Media query listeners
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    setPrefersReducedMotion(motionQuery.matches);
    setPrefersColorScheme(colorQuery.matches ? 'dark' : 'light');
    setPrefersHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const handleColorChange = (e: MediaQueryListEvent) => setPrefersColorScheme(e.matches ? 'dark' : 'light');
    const handleContrastChange = (e: MediaQueryListEvent) => setPrefersHighContrast(e.matches);

    window.addEventListener('resize', updateDimensions);
    motionQuery.addEventListener('change', handleMotionChange);
    colorQuery.addEventListener('change', handleColorChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      motionQuery.removeEventListener('change', handleMotionChange);
      colorQuery.removeEventListener('change', handleColorChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const context = useMemo<DeviceContext>(() => {
    const breakpoint = getBreakpoint(screenWidth);
    const hasTouchscreen = hasTouchScreen();
    const mousePrecision = hasMousePrecision();
    
    return {
      // Screen & Layout
      breakpoint,
      screenWidth,
      screenHeight,
      aspectRatio: getAspectRatio(screenWidth, screenHeight),
      pixelDensity: getPixelDensity(),
      
      // Platform & OS
      platform: detectPlatform(),
      browser: detectBrowser(),
      isMobile: breakpoint === 'phone' || breakpoint === 'tablet',
      isNative: isNativeApp(),
      isPWA: isPWA(),
      
      // Input Method
      primaryInput: getPrimaryInput(),
      hasTouchscreen,
      hasMousePrecision: mousePrecision,
      
      // Accessibility & Preferences
      prefersReducedMotion,
      prefersColorScheme,
      prefersHighContrast,
      
      // Derived Experience Mode
      experienceMode: getExperienceMode(breakpoint, hasTouchscreen, mousePrecision),
      
      // Convenience booleans
      isPhone: breakpoint === 'phone',
      isTablet: breakpoint === 'tablet',
      isLaptop: breakpoint === 'laptop',
      isDesktop: breakpoint === 'desktop' || breakpoint === 'ultrawide',
      isUltrawide: breakpoint === 'ultrawide',
      isTouch: hasTouchscreen && !mousePrecision,
    };
  }, [screenWidth, screenHeight, prefersReducedMotion, prefersColorScheme, prefersHighContrast]);

  return context;
};
