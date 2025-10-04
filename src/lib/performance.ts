// Performance optimization utilities

// Debounce function - limits function execution
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function - ensures function runs at most once per interval
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (img: HTMLImageElement) => {
  const src = img.getAttribute('data-src');
  if (!src) return;
  
  img.src = src;
  img.removeAttribute('data-src');
};

// Preload critical assets
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Check if element is in viewport
export const isInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Measure Web Vitals
export const measureWebVitals = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      // First Contentful Paint
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      // Time to Interactive
      TTI: navigation.domInteractive - navigation.fetchStart,
      // DOM Content Loaded
      DCL: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      // Load Complete
      Load: navigation.loadEventEnd - navigation.fetchStart,
    };
  }
  return null;
};

// Report Web Vitals to analytics
export const reportWebVitals = (metric: { name: string; value: number }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      non_interaction: true,
    });
  }
};
