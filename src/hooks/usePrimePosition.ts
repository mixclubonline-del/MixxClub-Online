import { useGlobalPlayer } from '@/contexts/GlobalPlayerContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

/**
 * Hook to calculate proper positioning for floating Prime chat
 * Accounts for music player, mobile bottom nav, and safe areas
 */
export const usePrimePosition = () => {
  const { currentTrack } = useGlobalPlayer();
  const { isPhone, isTablet, isMobile } = useBreakpoint();
  
  // Calculate bottom position — player is now centered, no longer bottom-bar
  let bottomOffset = 24;
  
  // Add offset for mobile bottom nav on phones (68px nav + safe area padding)
  if (isPhone) {
    bottomOffset += 76;
  } else if (isTablet) {
    bottomOffset += 20;
  }
  
  // Right offset - more on mobile for thumb reach
  const rightOffset = isMobile ? 16 : 24;
  
  return {
    bottom: `${bottomOffset}px`,
    right: `${rightOffset}px`,
    hasPlayer: !!currentTrack,
    isMobile: isPhone,
    // For use in inline styles
    style: {
      bottom: `${bottomOffset}px`,
      right: `${rightOffset}px`,
    },
  };
};
