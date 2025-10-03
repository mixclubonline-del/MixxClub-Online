import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  const trackEvent = async ({ event, properties = {} }: AnalyticsEvent) => {
    console.log('[Analytics] Event:', event, properties);
    
    // Send to GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }

    // Send to backend for database tracking
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: event,
          eventData: properties,
          userId: user?.id,
        },
      });
    } catch (error) {
      console.error('Failed to track event:', error);
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

  // Qualifier tracking
  const trackQualifierStarted = () => {
    trackEvent({
      event: 'qualifier_started',
      properties: {},
    });
  };

  const trackQualifierStepCompleted = (stepNumber: number, stepData: any) => {
    trackEvent({
      event: 'qualifier_step_completed',
      properties: { step: stepNumber, data: stepData },
    });
  };

  const trackQualifierCompleted = (selections: any) => {
    trackEvent({
      event: 'qualifier_completed',
      properties: selections,
    });
  };

  const trackEngineerMatchesViewed = (matchCount: number) => {
    trackEvent({
      event: 'engineer_matches_viewed',
      properties: { match_count: matchCount },
    });
  };

  const trackSignupFromQualifier = (source: string) => {
    trackEvent({
      event: 'signup_from_qualifier',
      properties: { source },
    });
  };

  // Conversion tracking
  const trackAccountCreated = (userType: string, source: string) => {
    trackEvent({
      event: 'account_created',
      properties: { user_type: userType, source },
    });
  };

  const trackPaymentCompleted = (amount: number, paymentMethod: string, packageType: string) => {
    trackEvent({
      event: 'payment_completed',
      properties: { amount, payment_method: paymentMethod, package_type: packageType },
    });
  };

  const trackEngineerBooked = (engineerId: string, matchScore: number) => {
    trackEvent({
      event: 'engineer_booked',
      properties: { engineer_id: engineerId, match_score: matchScore },
    });
  };

  // Engagement tracking
  const trackPricingTierClicked = (tier: string) => {
    trackEvent({
      event: 'pricing_tier_clicked',
      properties: { tier },
    });
  };

  const trackPackageBuilderUsed = (selections: any) => {
    trackEvent({
      event: 'package_builder_used',
      properties: selections,
    });
  };

  const trackExitPopupShown = (trigger: string) => {
    trackEvent({
      event: 'exit_popup_shown',
      properties: { trigger },
    });
  };

  const trackSubscriptionCTAViewed = (placement: string) => {
    trackEvent({
      event: 'subscription_cta_viewed',
      properties: { placement },
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
    // Qualifier tracking
    trackQualifierStarted,
    trackQualifierStepCompleted,
    trackQualifierCompleted,
    trackEngineerMatchesViewed,
    trackSignupFromQualifier,
    // Conversion tracking
    trackAccountCreated,
    trackPaymentCompleted,
    trackEngineerBooked,
    // Engagement tracking
    trackPricingTierClicked,
    trackPackageBuilderUsed,
    trackExitPopupShown,
    trackSubscriptionCTAViewed,
  };
};
