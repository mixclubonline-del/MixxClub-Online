// Facebook Pixel integration

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with actual Pixel ID

// Initialize Facebook Pixel
export const initFBPixel = () => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
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
