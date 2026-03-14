/**
 * Studio Hallway A/B Wrapper
 * 
 * Splits traffic 50/50 between the original hallway (control)
 * and the double-door entrance (variant_a).
 */

import { useABVariant } from '@/hooks/useABVariant';
import { StudioHallway } from './StudioHallway';
import { StudioHallwayV2 } from './StudioHallwayV2';

interface StudioHallwayABProps {
  fullscreen?: boolean;
  onEnter?: () => void;
}

export function StudioHallwayAB({ fullscreen, onEnter }: StudioHallwayABProps) {
  const { variant, trackConversion } = useABVariant('hallway_entrance', [
    { name: 'control', weight: 50 },
    { name: 'variant_a', weight: 50 },
  ]);

  if (variant === 'variant_a') {
    return (
      <StudioHallwayV2
        fullscreen={fullscreen}
        onEnter={onEnter}
        trackConversion={trackConversion}
      />
    );
  }

  return <StudioHallway fullscreen={fullscreen} onEnter={onEnter} />;
}
