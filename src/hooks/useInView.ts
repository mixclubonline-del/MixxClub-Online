import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInViewOptions {
  /** Only trigger once (default: true) */
  once?: boolean;
  /** IntersectionObserver threshold (default: 0.15) */
  threshold?: number;
  /** IntersectionObserver rootMargin (default: '-80px') */
  rootMargin?: string;
}

/**
 * Lightweight Intersection Observer hook — replaces Framer Motion whileInView.
 * Returns a ref to attach to the target element and a boolean indicating visibility.
 *
 * Usage:
 *   const [ref, isInView] = useInView({ once: true });
 *   <div ref={ref} className={isInView ? 'animate-reveal' : 'opacity-0'}>
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [React.RefObject<T>, boolean] {
  const { once = true, threshold = 0.15, rootMargin = '-80px' } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsInView(false);
        }
      });
    },
    [once]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold, rootMargin]);

  return [ref as React.RefObject<T>, isInView];
}
