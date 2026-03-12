import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 50;

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', event);
    }

    // Flush queue if it gets too large
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }

    // In production, send to your analytics service
    // Production analytics integration point
  }

  pageView(path: string, properties?: Record<string, any>) {
    this.track('page_view', {
      path,
      ...properties,
    });
  }

  userAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  error(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  performance(metric: string, value: number, context?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...context,
    });
  }

  // Convenience methods for common events
  trackEvent(eventName: string, properties?: Record<string, any>) {
    this.track(eventName, properties);
  }

  trackSignup(method: string, role?: string) {
    this.track('signup', { method, role });
  }

  trackPurchase(amount: number, projectId?: string) {
    this.track('purchase', { amount, projectId });
  }

  // Energy analytics methods
  trackEnergyTransition(from: string, to: string, durationMs: number, trigger?: string) {
    this.track('energy_transition', { from, to, durationMs, trigger });
  }

  trackEnergyDuration(energy: string, seconds: number) {
    this.track('energy_duration', { energy, seconds });
  }

  trackEnergyFlow(sessionData: Record<string, unknown>) {
    this.track('energy_flow_summary', sessionData);
  }

  // Depth analytics methods
  trackDepthLayerChange(from: string, to: string, score: number) {
    this.track('depth_layer_change', { from, to, score });
  }

  trackMilestoneReached(layer: string, score: number) {
    this.track('milestone_reached', { layer, score });
  }

  private flush() {
    // Production batch analytics send point

    this.queue = [];
  }

  // Call this when user navigates away or app closes
  cleanup() {
    this.flush();
  }
}

export const analytics = new AnalyticsService();

// Hook for easy access to analytics
export const useAnalytics = () => {
  return analytics;
};

// Hook for automatic page view tracking
export const usePageTracking = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    analytics.pageView(location.pathname, {
      userId: user?.id,
      search: location.search,
    });
  }, [location.pathname, location.search, user?.id]);
};

// Hook for tracking component mount/unmount
export const useComponentTracking = (componentName: string) => {
  useEffect(() => {
    const startTime = Date.now();
    analytics.track('component_mounted', { componentName });

    return () => {
      const duration = Date.now() - startTime;
      analytics.track('component_unmounted', { 
        componentName,
        duration,
      });
    };
  }, [componentName]);
};

// Hook for tracking user interactions
export const useInteractionTracking = () => {
  const trackClick = (element: string, properties?: Record<string, any>) => {
    analytics.userAction('click', { element, ...properties });
  };

  const trackFormSubmit = (formName: string, properties?: Record<string, any>) => {
    analytics.userAction('form_submit', { formName, ...properties });
  };

  const trackSearch = (query: string, results?: number) => {
    analytics.userAction('search', { query, results });
  };

  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
  };
};
