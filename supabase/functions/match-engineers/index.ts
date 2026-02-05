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
  id: string;
  user_id: string;
  specialties: string[];
  years_experience: number;
  rating: number;
  completed_projects: number;
  hourly_rate: number;
  availability_status: string;
  portfolio_url: string | null;
  genres: string[];
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
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
    const { data: engineers, error: engineerError } = await supabaseClient
      .from('engineer_profiles')
      .select(`
        id,
        user_id,
        specialties,
        years_experience,
        rating,
        completed_projects,
        hourly_rate,
        availability_status,
        portfolio_url,
        genres
      `)
      .eq('availability_status', 'available')
      .gte('hourly_rate', budget.min)
      .lte('hourly_rate', budget.max)
      .order('rating', { ascending: false })
      .limit(20);

    if (engineerError) {
      console.error('[INTERNAL] Database query error:', engineerError);
      return new Response(
        JSON.stringify({ error: 'Failed to find matching engineers. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch profiles separately to get names (use service role for public data)
    const userIds = (engineers || []).map((e: any) => e.user_id);
    console.log('[DEBUG] Fetching profiles for user IDs:', userIds.length);
    
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('[DEBUG] Profiles fetch error:', profilesError);
    } else {
      console.log('[DEBUG] Fetched profiles:', profiles?.length || 0);
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Calculate match scores
    const scoredEngineers = (engineers || []).map((engineer: EngineerProfile) => {
      let score = 0;
      const profile = profileMap.get(engineer.user_id);

      // Budget match (40%)
      const engineerRate = engineer.hourly_rate || 0;
      const budgetMid = (budget.min + budget.max) / 2;
      const budgetDiff = Math.abs(engineerRate - budgetMid);
      const maxDiff = budget.max - budget.min;
      const budgetScore = maxDiff > 0 ? (1 - budgetDiff / maxDiff) * 40 : 40;
      score += budgetScore;

      // Genre compatibility (30%) - check both genres and specialties
      const engineerGenres = [...(engineer.genres || []), ...(engineer.specialties || [])];
      const matchingGenres = genres.filter((g) =>
        engineerGenres.some((eg) => eg.toLowerCase().includes(g.toLowerCase()))
      );
      const genreScore = genres.length > 0 ? (matchingGenres.length / genres.length) * 30 : 15;
      score += genreScore;

      // Availability (15%)
      score += engineer.availability_status === 'available' ? 15 : 0;

      // Rating (15%)
      const ratingScore = ((engineer.rating || 4) / 5) * 15;
      score += ratingScore;

      return {
        engineerId: engineer.user_id,
        engineerName: profile?.full_name || 'Unknown Engineer',
        avatarUrl: profile?.avatar_url,
        specialties: engineer.specialties || [],
        genres: engineer.genres || [],
        experience: engineer.years_experience || 0,
        rating: engineer.rating || 0,
        completedProjects: engineer.completed_projects || 0,
        hourlyRate: engineer.hourly_rate || 0,
        matchScore: Math.round(score),
        matchingGenres,
        portfolioUrl: engineer.portfolio_url,
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
