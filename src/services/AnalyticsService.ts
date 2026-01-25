/**
 * AnalyticsService
 * Track events and metrics for enterprise accounts and prime content
 */

import { supabase } from "@/integrations/supabase/client";

export interface DailyAnalytics {
  id: string;
  date: string;
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

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

    // Log to console (in production, send to analytics service)
    console.log('[Analytics]', eventData);

    // TODO: Integrate with analytics provider (Google Analytics, Mixpanel, etc.)
    // Example: gtag('event', event.eventName, { ...event.properties, account_id: accountId });
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
    console.log('[Analytics] Identify:', accountId, traits);
    // TODO: Integrate with analytics provider
    // Example: analytics.identify(accountId, traits);
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

  /**
   * Fetch daily analytics stats for the last N days
   */
  static async getDailyStats(days: number = 30): Promise<DailyAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('prime_analytics_daily')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Failed to fetch daily stats:', error);
      return [];
    }

    return data as DailyAnalytics[];
  }

  /**
   * Mock generation for demo purposes
   * Populates the prime_analytics_daily table with random data for the past 7 days
   */
  static async recordMockDailyStats() {
    // Check if we already have recent data to avoid duplicate spam
    const { count } = await supabase
      .from('prime_analytics_daily')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0]);

    if (count && count > 0) return; // Already ran today

    const platforms = ['tiktok', 'instagram', 'youtube_shorts'];
    const mockData = [];
    
    // Generate for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const platform of platforms) {
        mockData.push({
          date: dateStr,
          platform,
          views: Math.floor(Math.random() * 5000) + 500,
          likes: Math.floor(Math.random() * 1000) + 50,
          shares: Math.floor(Math.random() * 200) + 10,
          comments: Math.floor(Math.random() * 100) + 5,
          // We need a dummy content_id or leave it null. Schema says content_id can be null? 
          // Schema: content_id uuid references public.prime_content_queue(id) on delete cascade
          // Wait, content_id is NOT marked "not null" in my schema creation step?
          // Let's check schema. "content_id uuid references..." implies it can be null unless "not null" specified.
          // Ideally we link to actual content, but for aggregate stats visualization we might just want generic entries 
          // OR we fetch some real content IDs first.
        });
      }
    }

    // For simplicity in this demo, let's just insert without content_id if schema allows, 
    // OR fetch a few content IDs.
    const { data: contents } = await supabase.from('prime_content_queue').select('id').limit(5);
    
    if (contents && contents.length > 0) {
       mockData.forEach((row, index) => {
          // cycle through available content IDs
          (row as any).content_id = contents[index % contents.length].id;
       });
    }

    const { error } = await supabase.from('prime_analytics_daily').upsert(mockData, { onConflict: 'content_id, platform, date' });
    
    if (error) {
       console.error("Mock data generation failed:", error);
    } else {
       console.log("Mock analytics data generated");
    }
  }
}

export default AnalyticsService;
