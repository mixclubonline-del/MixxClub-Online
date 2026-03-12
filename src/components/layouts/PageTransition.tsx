import { ReactNode, TransitionEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');
  const previousPathRef = useRef(location.pathname);
  const fallbackTimerRef = useRef<number | null>(null);

  const clearFallback = () => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearFallback();
  }, []);

  useEffect(() => {
    if (location.pathname === previousPathRef.current) return;

    previousPathRef.current = location.pathname;
    setTransitionStage('fade-out');

    // Hard fallback: never allow fade-out to persist
    clearFallback();
    fallbackTimerRef.current = window.setTimeout(() => {
      setTransitionStage('fade-in');
    }, 350);
  }, [location.pathname]);

  const onAnimationEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      transitionStage === 'fade-out' &&
      (event.propertyName === 'opacity' || event.propertyName === 'transform')
    ) {
      clearFallback();
      setTransitionStage('fade-in');
    }
  };

  return (
    <div
      className={`h-full transition-all duration-300 ${
        transitionStage === 'fade-out' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      onTransitionEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};
