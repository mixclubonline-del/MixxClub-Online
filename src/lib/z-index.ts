/**
 * Centralized z-index scale for consistent overlay layering
 * 
 * Layer 0 (0-10): Base content, backgrounds
 * Layer 1 (20-30): Elevated cards, tooltips
 * Layer 2 (40): Fixed headers (GlobalHeader)
 * Layer 3 (50): Primary overlays (Dialogs, Sheets, Popovers)
 * Layer 4 (60): Navigation elements (MobileBottomNav, RadialNav button)
 * Layer 5 (70): Full-screen overlays (CityMapOverlay, RadialNav open menu)
 * Layer 6 (80): Critical UI (Toasts, Alerts)
 * Layer 7 (90): Legal/Consent banners (highest priority)
 */

export const Z_INDEX = {
  // Layer 0: Base
  base: 0,
  
  // Layer 1: Elevated
  elevated: 20,
  tooltip: 30,
  
  // Layer 2: Fixed headers
  header: 40,
  
  // Layer 2.5: Music player (below dialogs)
  musicPlayer: 45,
  
  // Layer 3: Primary overlays
  dropdown: 50,
  popover: 50,
  dialog: 50,
  sheet: 50,
  
  // Layer 3.5: Floating chat (above dialogs, but below nav)
  floatingChat: 55,
  
  // Layer 4: Navigation
  navigation: 60,
  mobileNav: 60,
  radialButton: 60,
  
  // Layer 5: Full-screen overlays
  fullscreenOverlay: 70,
  radialMenu: 70,
  cityMap: 75,
  
  // Layer 6: Critical
  toast: 80,
  alert: 80,
  
  // Layer 7: Legal/Consent (always on top)
  cookieConsent: 90,
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX;
