import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  budgetRange: string;
  genres: string[];
  projectType: string;
  location?: string;
}

interface EngineerProfile {
  user_id: string;
  specialties: string[];
  years_of_experience: number;
  rating_average: number;
  total_reviews: number;
  hourly_rate: number;
  is_available: boolean;
  portfolio_links: any;
  profile: {
    full_name: string;
    avatar_url?: string;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { budgetRange, genres, projectType }: MatchRequest = await req.json();

    // Define budget ranges
    const budgetRanges: { [key: string]: { min: number; max: number } } = {
      'under-50': { min: 0, max: 50 },
      '50-100': { min: 50, max: 100 },
      '100-300': { min: 100, max: 300 },
      '300-500': { min: 300, max: 500 },
      '500+': { min: 500, max: 10000 },
    };

    const budget = budgetRanges[budgetRange] || { min: 0, max: 10000 };

    // Query engineer profiles
    const { data: engineers, error } = await supabaseClient
      .from('engineer_profiles')
      .select(`
        user_id,
        specialties,
        years_of_experience,
        rating_average,
        total_reviews,
        hourly_rate,
        is_available,
        portfolio_links,
        profile:profiles!engineer_profiles_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('is_available', true)
      .gte('hourly_rate', budget.min)
      .lte('hourly_rate', budget.max)
      .order('rating_average', { ascending: false })
      .limit(20);

    if (error) {
      // Log full error server-side only
      console.error('[INTERNAL] Database query error:', error);
      // Return generic error to client
      return new Response(
        JSON.stringify({ error: 'Failed to find matching engineers. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate match scores
    const scoredEngineers = (engineers as EngineerProfile[]).map((engineer) => {
      let score = 0;

      // Budget match (40%)
      const engineerRate = engineer.hourly_rate;
      const budgetMid = (budget.min + budget.max) / 2;
      const budgetDiff = Math.abs(engineerRate - budgetMid);
      const maxDiff = budget.max - budget.min;
      const budgetScore = maxDiff > 0 ? (1 - budgetDiff / maxDiff) * 40 : 40;
      score += budgetScore;

      // Genre compatibility (30%)
      const engineerGenres = engineer.specialties || [];
      const matchingGenres = genres.filter((g) =>
        engineerGenres.some((eg) => eg.toLowerCase() === g.toLowerCase())
      );
      const genreScore = genres.length > 0 ? (matchingGenres.length / genres.length) * 30 : 15;
      score += genreScore;

      // Availability (15%)
      score += engineer.is_available ? 15 : 0;

      // Rating/reviews (15%)
      const ratingScore = (engineer.rating_average / 5) * 10;
      const reviewScore = Math.min(engineer.total_reviews / 10, 1) * 5;
      score += ratingScore + reviewScore;

      const profileData = Array.isArray(engineer.profile) ? engineer.profile[0] : engineer.profile;

      return {
        engineerId: engineer.user_id,
        engineerName: profileData?.full_name || 'Unknown',
        avatarUrl: profileData?.avatar_url,
        specialties: engineer.specialties,
        experience: engineer.years_of_experience,
        rating: engineer.rating_average,
        totalReviews: engineer.total_reviews,
        hourlyRate: engineer.hourly_rate,
        matchScore: Math.round(score),
        matchingGenres,
        portfolioLinks: engineer.portfolio_links || [],
      };
    });

    // Sort by match score and return top 8
    const topMatches = scoredEngineers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    return new Response(JSON.stringify({ matches: topMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Log full error server-side only
    console.error('[INTERNAL] Error in match-engineers function:', error);
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
