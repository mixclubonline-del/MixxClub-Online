/**
 * AnalyticsService
 * Track events and metrics for enterprise accounts
 */

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export class AnalyticsService {
  /**
   * Track an event
   */
  static trackEvent(accountId: string, event: AnalyticsEvent): void {
    const eventData = {
      account_id: accountId,
      event_name: event.eventName,
      properties: event.properties || {},
      timestamp: event.timestamp || new Date(),
    };

    if (import.meta.env.DEV) {
      console.debug('[Analytics]', eventData);
    }
  }

  /**
   * Track page view
   */
  static trackPageView(accountId: string, pagePath: string, pageTitle?: string): void {
    this.trackEvent(accountId, {
      eventName: 'page_view',
      properties: {
        page_path: pagePath,
        page_title: pageTitle,
      },
    });
  }

  /**
   * Track user action
   */
  static trackAction(
    accountId: string,
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    this.trackEvent(accountId, {
      eventName: action,
      properties: {
        category,
        label,
        value,
      },
    });
  }

  /**
   * Identify user/account
   */
  static identify(accountId: string, traits: Record<string, any>): void {
    if (import.meta.env.DEV) {
      console.debug('[Analytics] Identify:', accountId, traits);
    }
  }

  /**
   * Track revenue event
   */
  static trackRevenue(
    accountId: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): void {
    this.trackEvent(accountId, {
      eventName: 'revenue',
      properties: {
        amount,
        currency,
        transaction_id: transactionId,
      },
    });
  }
}

export default AnalyticsService;
