// Google Analytics 4 integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual GA4 ID

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (!window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track conversions
export const trackConversion = (
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency: string = 'USD'
) => {
  if (!window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: `${conversionId}/${conversionLabel}`,
    value: value,
    currency: currency,
  });
};

// E-commerce tracking
export const trackPurchase = (transaction: {
  transactionId: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  if (!window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: transaction.transactionId,
    value: transaction.value,
    currency: transaction.currency || 'USD',
    items: transaction.items,
  });
};

// Track user signup
export const trackSignup = (method: string) => {
  if (!window.gtag) return;
  window.gtag('event', 'sign_up', {
    method: method,
  });
};

// Track login
export const trackLogin = (method: string) => {
  if (!window.gtag) return;
  window.gtag('event', 'login', {
    method: method,
  });
};
