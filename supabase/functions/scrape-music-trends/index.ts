const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendSource {
  name: string;
  url: string;
  category: 'news' | 'social' | 'industry' | 'charts';
}

const TREND_SOURCES: TrendSource[] = [
  { name: 'Billboard', url: 'billboard.com', category: 'charts' },
  { name: 'Pitchfork', url: 'pitchfork.com', category: 'news' },
  { name: 'Complex Music', url: 'complex.com/music', category: 'news' },
  { name: 'Hypebeast Music', url: 'hypebeast.com/music', category: 'news' },
  { name: 'DJ Booth', url: 'djbooth.net', category: 'industry' },
  { name: 'Music Business Worldwide', url: 'musicbusinessworldwide.com', category: 'industry' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { 
      query = 'music production mixing mastering audio engineering trends 2025',
      limit = 10,
      categories = ['news', 'industry', 'charts']
    } = body;

    console.log('Searching for music industry trends:', query);

    // Use Firecrawl search to find trending content
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        limit: limit,
        scrapeOptions: {
          formats: ['markdown', 'links'],
        },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process and categorize results
    const trends = (searchData.data || []).map((result: any, index: number) => {
      // Determine category based on URL
      let category = 'general';
      const url = result.url?.toLowerCase() || '';
      
      if (url.includes('billboard') || url.includes('chart')) category = 'charts';
      else if (url.includes('complex') || url.includes('pitchfork') || url.includes('hypebeast')) category = 'news';
      else if (url.includes('business') || url.includes('industry') || url.includes('djbooth')) category = 'industry';
      else if (url.includes('twitter') || url.includes('instagram') || url.includes('tiktok')) category = 'social';

      return {
        id: `trend-${index + 1}`,
        title: result.title || 'Untitled',
        description: result.description || '',
        url: result.url,
        category,
        content_preview: result.markdown?.substring(0, 500) || '',
        scraped_at: new Date().toISOString(),
      };
    });

    // Generate content ideas based on trends
    const contentIdeas = generateContentIdeas(trends);

    console.log(`Found ${trends.length} trending topics`);

    return new Response(
      JSON.stringify({
        success: true,
        trends,
        contentIdeas,
        meta: {
          query,
          total_results: trends.length,
          scraped_at: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping trends:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape trends';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateContentIdeas(trends: any[]): any[] {
  const ideas: any[] = [];
  
  trends.forEach((trend, index) => {
    // Generate social post ideas
    ideas.push({
      type: 'social_post',
      platform: 'twitter',
      trend_source: trend.title,
      idea: `Thread: What ${trend.title} means for independent artists and engineers`,
      hashtags: ['#MusicProduction', '#AudioEngineering', '#MixClub', '#MusicIndustry'],
    });

    if (index < 5) {
      // Top 5 get Instagram treatment
      ideas.push({
        type: 'social_post',
        platform: 'instagram',
        trend_source: trend.title,
        idea: `Carousel: Breaking down the latest in ${trend.category} - ${trend.title}`,
        hashtags: ['#MusicProducer', '#MixingEngineer', '#StudioLife', '#MixClub'],
      });
    }

    if (index < 3) {
      // Top 3 get video content ideas
      ideas.push({
        type: 'video_content',
        platform: 'tiktok',
        trend_source: trend.title,
        idea: `Quick take: Our Prime AI's perspective on "${trend.title}"`,
        format: 'short-form',
      });
    }
  });

  // Add evergreen content ideas
  ideas.push({
    type: 'blog_post',
    trend_source: 'aggregated',
    idea: 'Weekly Music Industry Roundup: Top trends affecting creators this week',
    format: 'long-form',
  });

  return ideas;
}
