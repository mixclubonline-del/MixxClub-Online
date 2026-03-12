import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    
    if (import.meta.env.DEV) {
      console.debug(`⚡ ${componentName} mounted in ${mountTime}ms`);
    }

    return () => {
      if (import.meta.env.DEV) {
        console.debug(`⚡ ${componentName} unmounted after ${renderCountRef.current} renders`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = Date.now() - lastRenderTimeRef.current;
    lastRenderTimeRef.current = Date.now();

    // Warn about slow renders
    if (renderTime > 16 && import.meta.env.DEV) {
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime}ms`);
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
};

// Hook to measure code execution time
export const useExecutionTime = (fn: () => void, dependencies: any[], label: string) => {
  useEffect(() => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    }
  }, dependencies);
};