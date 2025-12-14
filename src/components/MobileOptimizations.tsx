import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export const MobileOptimizations = () => {
  const { isMobile } = useBreakpoint();
  
  // Apply mobile optimizations when on mobile devices
  useMobileOptimization({
    enableHaptics: true,
    enablePullToRefresh: true,
    enableSwipeGestures: true,
  });
  
  return null;
};

// Export haptic trigger for use in components
export { useMobileOptimization } from '@/hooks/useMobileOptimization';
