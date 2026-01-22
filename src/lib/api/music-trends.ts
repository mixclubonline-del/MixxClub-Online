import { supabase } from '@/integrations/supabase/client';

export interface MusicTrend {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'news' | 'social' | 'industry' | 'charts' | 'general';
  content_preview: string;
  scraped_at: string;
}

export interface ContentIdea {
  type: 'social_post' | 'video_content' | 'blog_post';
  platform?: string;
  trend_source: string;
  idea: string;
  hashtags?: string[];
  format?: string;
}

export interface TrendsResponse {
  success: boolean;
  trends?: MusicTrend[];
  contentIdeas?: ContentIdea[];
  meta?: {
    query: string;
    total_results: number;
    scraped_at: string;
  };
  error?: string;
}

export interface ScrapeTrendsOptions {
  query?: string;
  limit?: number;
  categories?: ('news' | 'social' | 'industry' | 'charts')[];
}

export const musicTrendsApi = {
  /**
   * Scrape trending music industry topics for content ideas
   */
  async scrapeTrends(options?: ScrapeTrendsOptions): Promise<TrendsResponse> {
    const { data, error } = await supabase.functions.invoke('scrape-music-trends', {
      body: options || {},
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Get trends filtered by category
   */
  async getTrendsByCategory(category: string): Promise<TrendsResponse> {
    return this.scrapeTrends({
      query: `music ${category} trends 2025`,
      categories: [category as any],
    });
  },

  /**
   * Get hip-hop specific trends (for MixClub's focus)
   */
  async getHipHopTrends(): Promise<TrendsResponse> {
    return this.scrapeTrends({
      query: 'hip hop rap music production mixing trends 2025',
      limit: 15,
    });
  },

  /**
   * Get audio engineering trends
   */
  async getEngineeringTrends(): Promise<TrendsResponse> {
    return this.scrapeTrends({
      query: 'audio engineering mixing mastering techniques trends 2025',
      limit: 10,
    });
  },
};
