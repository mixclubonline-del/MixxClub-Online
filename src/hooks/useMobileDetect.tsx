import { useEffect, useState } from 'react';

export type DeviceType = 'phone' | 'tablet' | 'desktop';

export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const screenWidth = window.innerWidth;
      
      // Check if mobile (phones or tablets)
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobileCheck);

      // Check platform
      const iosCheck = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const androidCheck = /android/i.test(userAgent);
      
      setIsIOS(iosCheck);
      setIsAndroid(androidCheck);

      // Differentiate between phone and tablet
      // Tablets: 768px - 1024px with touch capability
      // Phones: < 768px
      const isTabletDevice = mobileCheck && screenWidth >= 768 && screenWidth <= 1024;
      const isPhoneDevice = mobileCheck && screenWidth < 768;
      
      setIsTablet(isTabletDevice);
      setIsPhone(isPhoneDevice);
      
      // Determine device type
      if (isPhoneDevice) {
        setDeviceType('phone');
      } else if (isTabletDevice) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Check if running as PWA
      const pwaCheck = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
      setIsPWA(pwaCheck);
    };

    checkDevice();
    
    // Re-check on resize (for responsive testing)
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isPhone,
    isTablet,
    isIOS,
    isAndroid,
    isPWA,
    deviceType,
    isNativeMobile: isMobile && !isPWA
  };
};
