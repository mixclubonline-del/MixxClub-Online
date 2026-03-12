import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fade-out');

      // Fallback: force transition complete if transitionEnd doesn't fire
      const fallback = setTimeout(() => {
        setTransitionStage('fade-in');
        setDisplayLocation(location);
      }, 400);

      return () => clearTimeout(fallback);
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fade-out') {
      setTransitionStage('fade-in');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`h-full transition-all duration-300 ${
        transitionStage === 'fade-out' 
          ? 'opacity-0 scale-95' 
          : 'opacity-100 scale-100'
      }`}
      onTransitionEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};
