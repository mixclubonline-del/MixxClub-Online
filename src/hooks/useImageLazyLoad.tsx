import { useEffect, useRef } from 'react';

export const useImageLazyLoad = () => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target as HTMLImageElement;
            const src = lazyImage.dataset.src;
            
            if (src) {
              lazyImage.src = src;
              lazyImage.classList.remove('lazy');
              lazyImage.classList.add('loaded');
              observer.unobserve(lazyImage);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
      }
    );

    observer.observe(img);

    return () => {
      if (img) observer.unobserve(img);
    };
  }, []);

  return imgRef;
};
