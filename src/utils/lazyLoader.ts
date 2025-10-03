import { lazy, ComponentType } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Enhanced lazy loader with retry logic for failed chunk loads
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: RetryOptions = {}
): React.LazyExoticComponent<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attemptsLeft: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 1) {
              reject(error);
              return;
            }

            console.warn(
              `Chunk load failed, retrying... (${maxRetries - attemptsLeft + 1}/${maxRetries})`,
              error
            );

            setTimeout(() => {
              attemptImport(attemptsLeft - 1);
            }, retryDelay);
          });
      };

      attemptImport(maxRetries);
    });
  });
}

/**
 * Preload a component for faster subsequent loading
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc().catch((error) => {
    console.warn('Preload failed:', error);
  });
}

/**
 * Create a map of routes to preload based on user navigation patterns
 */
export const preloadStrategy = {
  onHover: (importFunc: () => Promise<any>) => {
    return () => preloadComponent(importFunc);
  },
  
  onVisible: (importFunc: () => Promise<any>, element: HTMLElement) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadComponent(importFunc);
            observer.unobserve(element);
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  },
  
  immediate: (importFunc: () => Promise<any>) => {
    preloadComponent(importFunc);
  },
};
