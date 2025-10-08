import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SplineLoaderProps {
  scene: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
}

// Lightweight placeholder loader that avoids bundling Spline runtime to keep builds lean.
// It renders a graceful fallback container (or an iframe if a full embed URL is provided).
export const SplineLoader = ({ scene, fallback, onLoad, className = '' }: SplineLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Heuristic: if the scene is a full Spline embed URL (my.spline.design), use iframe; otherwise show fallback
  const isEmbeddable = /my\.spline\.design\//.test(scene);

  useEffect(() => {
    // Simulate quick load for fallback visuals
    const t = setTimeout(() => {
      setIsLoading(false);
      onLoad?.();
    }, 300);
    return () => clearTimeout(t);
  }, [onLoad]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-b from-background to-muted ${className}`}>
        {fallback || (
          <div className="text-muted-foreground text-sm">3D scene unavailable</div>
        )}
      </div>
    );
  }

  if (!isEmbeddable) {
    // Graceful lightweight fallback (no Spline runtime)
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <div className="w-full h-full bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background" />
      </div>
    );
  }

  // If a proper embed URL is given, render an iframe (still lightweight compared to bundling runtime)
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <iframe
        src={scene}
        className="w-full h-full border-0"
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => setHasError(true)}
        allow="fullscreen; autoplay"
        title="Spline Scene"
      />
    </div>
  );
};

