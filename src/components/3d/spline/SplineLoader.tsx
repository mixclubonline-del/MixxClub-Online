import { Suspense, lazy, useState } from 'react';
import { Loader2 } from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineLoaderProps {
  scene: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
}

export const SplineLoader = ({ scene, fallback, onLoad, className = '' }: SplineLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-b from-background to-muted ${className}`}>
        {fallback || (
          <div className="text-muted-foreground text-sm">
            3D scene unavailable
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <Spline
          scene={scene}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Suspense>
    </div>
  );
};
