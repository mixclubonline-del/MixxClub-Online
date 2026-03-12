import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PremiereRecord {
  id: string;
  total_votes: number;
  average_rating: number;
  play_count: number;
  premiere_date: string;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting trending score calculation...');

    // Get all live premieres from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: premieres, error: fetchError } = await supabase
      .from('premieres')
      .select('id, total_votes, average_rating, play_count, premiere_date, status')
      .eq('status', 'live')
      .gte('premiere_date', thirtyDaysAgo.toISOString()) as { data: PremiereRecord[] | null, error: any };

    if (fetchError) {
      console.error('Error fetching premieres:', fetchError);
      throw fetchError;
    }

    if (!premieres || premieres.length === 0) {
      console.log('No premieres to process');
      return new Response(
        JSON.stringify({ message: 'No premieres to process', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${premieres.length} premieres...`);

    // Calculate trending scores for each premiere
    const updates = premieres.map((premiere) => {
      const hoursSincePremiere = 
        (Date.now() - new Date(premiere.premiere_date).getTime()) / (1000 * 60 * 60);
      
      // Exponential decay with 48-hour half-life
      const timeDecay = Math.exp(-0.014 * Math.max(hoursSincePremiere, 1));
      
      // Vote score weighted by recency
      const voteScore = premiere.total_votes * timeDecay;
      
      // Rating boost (higher ratings get more weight)
      const ratingBoost = (premiere.average_rating || 0) / 5.0;
      
      // Play count boost (logarithmic scaling)
      const playBoost = Math.log(Math.max(premiere.play_count, 1) + 1) * 0.5;
      
      // Final trending score
      const trendingScore = (voteScore * (1 + ratingBoost)) + playBoost;

      return {
        id: premiere.id,
        trending_score: Math.round(trendingScore * 100) / 100,
      };
    });

    // Update all premieres with their new trending scores
    const updatePromises = updates.map((update) =>
      supabase
        .from('premieres')
        .update({ trending_score: update.trending_score })
        .eq('id', update.id)
    );

    await Promise.all(updatePromises);

    // Calculate weekly rankings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weeklyPremieres, error: weeklyError } = await supabase
      .from('premieres')
      .select('id')
      .eq('status', 'live')
      .gte('premiere_date', sevenDaysAgo.toISOString())
      .order('trending_score', { ascending: false })
      .limit(100);

    if (!weeklyError && weeklyPremieres) {
      const weeklyRankUpdates = weeklyPremieres.map((p, index) =>
        supabase
          .from('premieres')
          .update({ weekly_rank: index + 1 })
          .eq('id', p.id)
      );
      await Promise.all(weeklyRankUpdates);
      console.log(`Updated weekly rankings for ${weeklyPremieres.length} premieres`);
    }

    // Calculate monthly rankings (last 30 days)
    const { data: monthlyPremieres, error: monthlyError } = await supabase
      .from('premieres')
      .select('id')
      .eq('status', 'live')
      .gte('premiere_date', thirtyDaysAgo.toISOString())
      .order('trending_score', { ascending: false })
      .limit(100);

    if (!monthlyError && monthlyPremieres) {
      const monthlyRankUpdates = monthlyPremieres.map((p, index) =>
        supabase
          .from('premieres')
          .update({ monthly_rank: index + 1 })
          .eq('id', p.id)
      );
      await Promise.all(monthlyRankUpdates);
      console.log(`Updated monthly rankings for ${monthlyPremieres.length} premieres`);
    }

    console.log(`Successfully updated trending scores for ${updates.length} premieres`);

    return new Response(
      JSON.stringify({
        message: 'Trending scores updated successfully',
        updated: updates.length,
        weeklyRanked: weeklyPremieres?.length || 0,
        monthlyRanked: monthlyPremieres?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
