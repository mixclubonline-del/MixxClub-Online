import { useEffect, useState } from 'react';

export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Check if mobile
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobileCheck);

      // Check platform
      const iosCheck = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const androidCheck = /android/i.test(userAgent);
      
      setIsIOS(iosCheck);
      setIsAndroid(androidCheck);

      // Check if running as PWA
      const pwaCheck = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
      setIsPWA(pwaCheck);
    };

    checkDevice();
  }, []);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isPWA,
    isNativeMobile: isMobile && !isPWA
  };
};
