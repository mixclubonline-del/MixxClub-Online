// Performance monitoring utilities

export const measurePerformance = (name: string, fn: () => void) => {
  const startTime = performance.now();
  fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  // Log slow operations (> 100ms)
  if (duration > 100) {
    console.warn(`[Performance Warning] ${name} took ${duration.toFixed(2)}ms`);
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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

// Lazy load images with intersection observer
export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target as HTMLImageElement;
        const src = lazyImage.dataset.src;
        if (src) {
          lazyImage.src = src;
          lazyImage.classList.remove('lazy');
          observer.unobserve(lazyImage);
        }
      }
    });
  });

  observer.observe(img);
};

// Cache management
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
};

export const clearCache = (pattern?: RegExp) => {
  if (pattern) {
    Array.from(cache.keys()).forEach((key) => {
      if (pattern.test(key)) cache.delete(key);
    });
  } else {
    cache.clear();
  }
};

// Memory leak prevention - Note: refs are read-only, don't try to set to null
export const cleanupEventListeners = (element: HTMLElement | null) => {
  if (element) {
    const clone = element.cloneNode(true);
    element.parentNode?.replaceChild(clone, element);
  }
};

// Bundle size reporter
export const reportBundleSize = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalSize = resources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0);
    }, 0);

    console.log(`[Bundle] Total transferred: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Report large resources
    const largeResources = resources
      .filter(r => (r.transferSize || 0) > 100000)
      .map(r => ({
        name: r.name.split('/').pop(),
        size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`
      }));

    if (largeResources.length > 0) {
      console.log('[Bundle] Large resources:', largeResources);
    }
  }
};

// Component render tracking
export const trackRender = (componentName: string) => {
  const renderCount = ((window as any).__renderCounts || {});
  renderCount[componentName] = (renderCount[componentName] || 0) + 1;
  (window as any).__renderCounts = renderCount;

  if (renderCount[componentName] > 10) {
    console.warn(`[Render Warning] ${componentName} rendered ${renderCount[componentName]} times`);
  }
};
