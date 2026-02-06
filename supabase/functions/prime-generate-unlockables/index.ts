import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitHeaders } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Rate limiting - stricter limits since it modifies DB with service role
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    
    const rateLimit = await checkRateLimit(clientIP, {
      maxRequests: 5,
      windowMs: 300000, // 5 minutes - stricter because it modifies database
      keyPrefix: 'unlockables'
    }, supabaseUrl, supabaseKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders(rateLimit), 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current platform stats for context - extended for all roles
    const [
      profilesResult,
      sessionsResult,
      projectsResult,
      producerBeatsResult,
      beatPurchasesResult,
      fanStatsResult,
      artistDay1sResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('producer_beats').select('id', { count: 'exact', head: true }),
      supabase.from('beat_purchases').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('fan_stats').select('*'),
      supabase.from('artist_day1s').select('id', { count: 'exact', head: true }),
    ]);

    const fanStats = fanStatsResult.data || [];
    
    // Helper functions for fan stat aggregation
    const aggregateFanStat = (field: string): number => {
      return fanStats.reduce((sum, stat) => sum + (stat[field] || 0), 0);
    };
    
    const maxFanStat = (field: string): number => {
      if (fanStats.length === 0) return 0;
      return Math.max(...fanStats.map(stat => stat[field] || 0));
    };

    const platformStats = {
      userCount: profilesResult.count || 0,
      sessionCount: sessionsResult.count || 0,
      projectCount: projectsResult.count || 0,
      beatsUploaded: producerBeatsResult.count || 0,
      beatsSold: beatPurchasesResult.count || 0,
      totalDay1Badges: artistDay1sResult.count || 0,
      totalArtistsSupported: aggregateFanStat('artists_supported'),
      maxEngagementStreak: maxFanStat('engagement_streak'),
      maxLongestStreak: maxFanStat('longest_streak'),
      totalMixxcoinzEarned: aggregateFanStat('mixxcoinz_earned'),
    };

    // Get existing unlockables
    const { data: existingUnlockables } = await supabase
      .from('unlockables')
      .select('*')
      .order('tier', { ascending: true });

    // Calculate progress for each unlockable
    const unlockablesWithProgress = await Promise.all(
      (existingUnlockables || []).map(async (unlockable) => {
        let currentValue = 0;

        switch (unlockable.metric_type) {
          // Community metrics
          case 'user_count':
            currentValue = platformStats.userCount;
            break;
          case 'sessions_completed':
            currentValue = platformStats.sessionCount;
            break;
          case 'projects_delivered':
            currentValue = platformStats.projectCount;
            break;
          
          // Producer metrics
          case 'beats_uploaded':
            currentValue = platformStats.beatsUploaded;
            break;
          case 'beats_sold':
            currentValue = platformStats.beatsSold;
            break;
          
          // Fan metrics
          case 'day1_badges':
            currentValue = platformStats.totalDay1Badges;
            break;
          case 'engagement_streak':
            currentValue = platformStats.maxEngagementStreak;
            break;
          case 'artists_supported':
            currentValue = platformStats.totalArtistsSupported;
            break;
          case 'longest_streak':
            currentValue = platformStats.maxLongestStreak;
            break;
          case 'mixxcoinz_earned':
            currentValue = platformStats.totalMixxcoinzEarned;
            break;
            
          default:
            currentValue = 0;
        }

        const progressPercentage = Math.min(
          Math.round((currentValue / unlockable.target_value) * 100),
          100
        );

        // Check if should unlock
        const shouldUnlock = currentValue >= unlockable.target_value && !unlockable.is_unlocked;

        if (shouldUnlock) {
          await supabase
            .from('unlockables')
            .update({
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            })
            .eq('id', unlockable.id);
        }

        return {
          ...unlockable,
          current_value: currentValue,
          progress_percentage: progressPercentage,
          is_unlocked: unlockable.is_unlocked || shouldUnlock,
        };
      })
    );

    // Group by type - extended for all 5 types
    const grouped = {
      community: unlockablesWithProgress.filter(u => u.unlock_type === 'community'),
      artist: unlockablesWithProgress.filter(u => u.unlock_type === 'artist'),
      engineer: unlockablesWithProgress.filter(u => u.unlock_type === 'engineer'),
      producer: unlockablesWithProgress.filter(u => u.unlock_type === 'producer'),
      fan: unlockablesWithProgress.filter(u => u.unlock_type === 'fan'),
    };

    return new Response(
      JSON.stringify({
        success: true,
        platformStats,
        unlockables: grouped,
        totalUnlockables: unlockablesWithProgress.length,
        unlockedCount: unlockablesWithProgress.filter(u => u.is_unlocked).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in prime-generate-unlockables:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
