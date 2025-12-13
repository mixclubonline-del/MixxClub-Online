import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current platform stats for context
    const [profilesResult, sessionsResult, projectsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
    ]);

    const platformStats = {
      userCount: profilesResult.count || 0,
      sessionCount: sessionsResult.count || 0,
      projectCount: projectsResult.count || 0,
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
          case 'user_count':
            currentValue = platformStats.userCount;
            break;
          case 'sessions_completed':
            currentValue = platformStats.sessionCount;
            break;
          case 'projects_delivered':
            currentValue = platformStats.projectCount;
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

    // Group by type
    const grouped = {
      community: unlockablesWithProgress.filter(u => u.unlock_type === 'community'),
      artist: unlockablesWithProgress.filter(u => u.unlock_type === 'artist'),
      engineer: unlockablesWithProgress.filter(u => u.unlock_type === 'engineer'),
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
