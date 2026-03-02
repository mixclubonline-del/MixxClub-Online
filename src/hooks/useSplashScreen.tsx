import { useState, useEffect } from "react";

export const useSplashScreen = (minDuration = 500) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scene = params.get('scene')?.toLowerCase();
    const isDeepLinkedScene = scene === 'demo' || scene === 'info';
    const isDirectImmersiveRoute = window.location.pathname === '/demo' || window.location.pathname === '/insider-demo';

    if (isDeepLinkedScene || isDirectImmersiveRoute) {
      setShowSplash(false);
      setIsReady(true);
      return;
    }

    // Check if splash has been shown in this session
    const hasShownSplash = sessionStorage.getItem('splash-shown');
    
    if (hasShownSplash) {
      setShowSplash(false);
      setIsReady(true);
      return;
    }

    // Ensure minimum duration
    const timer = setTimeout(() => {
      setIsReady(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash-shown', 'true');
    setShowSplash(false);
  };

  return { showSplash, isReady, handleSplashComplete };
};
