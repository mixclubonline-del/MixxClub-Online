/**
 * Studio Hallway — Double-Door Entrance (V2)
 * 
 * Previously an A/B test; V2 (double-door with auth-gated role doors)
 * is now the canonical hallway experience.
 */

import { StudioHallwayV2 } from './StudioHallwayV2';

interface StudioHallwayABProps {
  fullscreen?: boolean;
  onEnter?: () => void;
}

export function StudioHallwayAB({ fullscreen, onEnter }: StudioHallwayABProps) {
  return (
    <StudioHallwayV2
      fullscreen={fullscreen}
      onEnter={onEnter}
    />
  );
}
