import { useGlobalPlayer } from '@/contexts/GlobalPlayerContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

/**
 * Hook to calculate proper bottom positioning for floating Prime chat
 * Accounts for music player and mobile bottom nav
 */
export const usePrimePosition = () => {
  const { currentTrack } = useGlobalPlayer();
  const { isPhone } = useBreakpoint();
  
  // Base position
  let bottomValue = 24; // 1.5rem = 24px
  
  // Add space for mobile bottom nav (64px)
  if (isPhone) {
    bottomValue += 64;
  }
  
  // Add space for music player when active (~100px)
  if (currentTrack) {
    bottomValue += 100;
  }
  
  return {
    bottom: `${bottomValue}px`,
    hasPlayer: !!currentTrack,
    isMobile: isPhone,
  };
};
