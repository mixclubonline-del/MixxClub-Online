import { SplineLoader } from './SplineLoader';
import { use3DQuality } from '@/hooks/use3DQuality';

interface SplineBackgroundProps {
  scene: string;
  className?: string;
  overlay?: boolean;
}

export const SplineBackground = ({ scene, className = '', overlay = true }: SplineBackgroundProps) => {
  const { quality } = use3DQuality();

  if (quality === 'low') {
    return (
      <div className={`absolute inset-0 bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background ${className}`} />
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <SplineLoader
        scene={scene}
        className="w-full h-full"
        fallback={
          <div className="w-full h-full bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background" />
        }
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      )}
    </div>
  );
};
