// Facebook Pixel integration

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

// Get from environment or use empty string if not configured
export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '';

// Initialize Facebook Pixel
export const initFBPixel = () => {
  if (typeof window === 'undefined') return;
  
  // Don't initialize if pixel ID is not configured
  if (!FB_PIXEL_ID) {
    console.warn('Facebook Pixel ID not configured');
    return;
  }

  // Validate pixel ID format (15-16 digits)
  const pixelIdRegex = /^[0-9]{15,16}$/;
  if (!pixelIdRegex.test(FB_PIXEL_ID)) {
    console.error('Invalid Facebook Pixel ID format');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.onload = () => {
    if (window.fbq) {
      window.fbq('init', FB_PIXEL_ID);
      window.fbq('track', 'PageView');
    }
  };
  // Initialize fbq queue before script loads
  if (!window.fbq) {
    const fbq = function(...args: any[]) { (fbq as any).queue.push(args); } as any;
    fbq.queue = [] as any[];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;
  }
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />`;
  document.body.appendChild(noscript);
};

// Track custom events
export const trackFBEvent = (eventName: string, data?: object) => {
  if (!window.fbq) return;
  window.fbq('track', eventName, data);
};

// Track standard events
export const trackFBAddToCart = (value: number, currency: string = 'USD') => {
  if (!window.fbq) return;
  window.fbq('track', 'AddToCart', { value, currency });
};

export const trackFBPurchase = (value: number, currency: string = 'USD') => {
  if (!window.fbq) return;
  window.fbq('track', 'Purchase', { value, currency });
};

export const trackFBLead = () => {
  if (!window.fbq) return;
  window.fbq('track', 'Lead');
};

export const trackFBCompleteRegistration = () => {
  if (!window.fbq) return;
  window.fbq('track', 'CompleteRegistration');
};
