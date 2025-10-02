import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  const trackPageView = (page: string) => {
    // Log for development
    console.log('[Analytics] Page View:', page);
    
    // In production, send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
      });
    }
  };

  const trackEvent = ({ event, properties = {} }: AnalyticsEvent) => {
    console.log('[Analytics] Event:', event, properties);
    
    // In production, send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  };

  const trackConversion = (conversionType: string, value?: number) => {
    console.log('[Analytics] Conversion:', conversionType, value);
    
    trackEvent({
      event: 'conversion',
      properties: {
        conversion_type: conversionType,
        value: value,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const trackSignup = (method: string) => {
    trackEvent({
      event: 'sign_up',
      properties: { method },
    });
  };

  const trackPurchase = (amount: number, packageType: string) => {
    trackEvent({
      event: 'purchase',
      properties: {
        value: amount,
        currency: 'USD',
        package_type: packageType,
      },
    });
    trackConversion('purchase', amount);
  };

  const trackProjectCreated = (projectType: string) => {
    trackEvent({
      event: 'project_created',
      properties: { project_type: projectType },
    });
  };

  const trackFileUpload = (fileType: string, fileSize: number) => {
    trackEvent({
      event: 'file_upload',
      properties: {
        file_type: fileType,
        file_size_mb: (fileSize / (1024 * 1024)).toFixed(2),
      },
    });
  };

  const trackEngagement = (action: string, details?: Record<string, any>) => {
    trackEvent({
      event: 'user_engagement',
      properties: {
        action,
        ...details,
      },
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackConversion,
    trackSignup,
    trackPurchase,
    trackProjectCreated,
    trackFileUpload,
    trackEngagement,
  };
};
