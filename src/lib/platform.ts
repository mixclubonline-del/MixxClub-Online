/**
 * Platform Detection Utilities
 * Provides OS, browser, and capability detection
 */

export type Platform = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chromeos' | 'unknown';
export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera' | 'samsung' | 'unknown';
export type InputMethod = 'touch' | 'mouse' | 'stylus' | 'keyboard';

interface PlatformInfo {
  platform: Platform;
  browser: Browser;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isNative: boolean;
  isPWA: boolean;
}

/**
 * Detect the current platform/OS
 */
export const detectPlatform = (): Platform => {
  // Modern API first
  const uaData = (navigator as any).userAgentData;
  if (uaData?.platform) {
    const platform = uaData.platform.toLowerCase();
    if (platform.includes('mac')) return 'macos';
    if (platform.includes('win')) return 'windows';
    if (platform.includes('linux')) return 'linux';
    if (platform.includes('chrome')) return 'chromeos';
    if (platform.includes('android')) return 'android';
  }

  // Fallback to userAgent
  const ua = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/windows/.test(ua)) return 'windows';
  if (/cros/.test(ua)) return 'chromeos';
  if (/linux/.test(ua)) return 'linux';
  
  return 'unknown';
};

/**
 * Detect the current browser
 */
export const detectBrowser = (): Browser => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/edg/.test(ua)) return 'edge';
  if (/opr|opera/.test(ua)) return 'opera';
  if (/samsungbrowser/.test(ua)) return 'samsung';
  if (/chrome/.test(ua)) return 'chrome';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari';
  if (/firefox/.test(ua)) return 'firefox';
  
  return 'unknown';
};

/**
 * Check if running as a PWA
 */
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if running inside Capacitor native app
 */
export const isNativeApp = (): boolean => {
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Check if device has touch capability
 */
export const hasTouchScreen = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
};

/**
 * Check if device has mouse precision
 */
export const hasMousePrecision = (): boolean => {
  return window.matchMedia('(pointer: fine)').matches;
};

/**
 * Check if device supports hover
 */
export const supportsHover = (): boolean => {
  return window.matchMedia('(hover: hover)').matches;
};

/**
 * Get the primary input method
 */
export const getPrimaryInput = (): InputMethod => {
  const hasTouch = hasTouchScreen();
  const hasMouse = hasMousePrecision();
  
  // Stylus detection (limited support)
  if (navigator.maxTouchPoints === 1 && hasMouse) {
    return 'stylus';
  }
  
  // Touch-only device
  if (hasTouch && !hasMouse) {
    return 'touch';
  }
  
  // Mouse available (even on touch devices)
  if (hasMouse) {
    return 'mouse';
  }
  
  return 'touch';
};

/**
 * Get device pixel ratio for retina detection
 */
export const getPixelDensity = (): 'standard' | 'retina' | 'hidpi' => {
  const dpr = window.devicePixelRatio || 1;
  if (dpr >= 3) return 'hidpi';
  if (dpr >= 2) return 'retina';
  return 'standard';
};

/**
 * Get modifier key for current platform
 */
export const getModifierKey = (): { key: string; symbol: string } => {
  const platform = detectPlatform();
  if (platform === 'macos' || platform === 'ios') {
    return { key: 'meta', symbol: '⌘' };
  }
  return { key: 'ctrl', symbol: 'Ctrl' };
};

/**
 * Format keyboard shortcut for current platform
 */
export const formatShortcut = (keys: string[]): string => {
  const { symbol } = getModifierKey();
  return keys
    .map(key => {
      if (key === 'mod') return symbol;
      if (key === 'shift') return '⇧';
      if (key === 'alt') return detectPlatform() === 'macos' ? '⌥' : 'Alt';
      if (key === 'enter') return '↵';
      if (key === 'escape') return 'Esc';
      if (key === 'backspace') return '⌫';
      if (key === 'delete') return '⌦';
      if (key === 'tab') return '⇥';
      if (key === 'space') return '␣';
      if (key === 'up') return '↑';
      if (key === 'down') return '↓';
      if (key === 'left') return '←';
      if (key === 'right') return '→';
      return key.toUpperCase();
    })
    .join(detectPlatform() === 'macos' ? '' : '+');
};

/**
 * Get comprehensive platform info
 */
export const getPlatformInfo = (): PlatformInfo => {
  const platform = detectPlatform();
  const isMobileDevice = platform === 'ios' || platform === 'android';
  
  // Tablet detection via screen size
  const screenWidth = window.innerWidth;
  const isTabletSize = screenWidth >= 768 && screenWidth < 1024;
  
  return {
    platform,
    browser: detectBrowser(),
    isMobile: isMobileDevice && !isTabletSize,
    isTablet: isMobileDevice && isTabletSize,
    isDesktop: !isMobileDevice,
    isNative: isNativeApp(),
    isPWA: isPWA(),
  };
};
