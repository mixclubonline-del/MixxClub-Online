/**
 * Image optimization utilities
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export const optimizeImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  // For Supabase storage URLs, you can add transformation parameters
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    
    return `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
  }
  
  return url;
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map((size) => `${optimizeImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webp = new Image();
    webp.onload = webp.onerror = () => {
      resolve(webp.height === 2);
    };
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Lazy load background images
 */
export const lazyLoadBackground = (element: HTMLElement, imageUrl: string): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            element.style.backgroundImage = `url(${imageUrl})`;
            element.classList.add('loaded');
          };
          img.src = imageUrl;
          observer.unobserve(element);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(element);
};

/**
 * Prefetch critical resources
 */
export const prefetchResource = (url: string, type: 'style' | 'script' | 'image' = 'script'): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Preload critical resources (higher priority than prefetch)
 */
export const preloadResource = (url: string, type: 'style' | 'script' | 'image' = 'script'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};
