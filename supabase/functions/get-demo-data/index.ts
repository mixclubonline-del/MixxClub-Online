import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

interface RequestBody {
  type?: 'all' | 'engineers' | 'sessions' | 'activity' | 'stats';
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require authentication - this reads platform data
    const auth = await requireAuth(req);
    if ('error' in auth) return authErrorResponse(auth, corsHeaders);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: RequestBody = await req.json().catch(() => ({}));
    const type = body.type || 'all';

    console.log(`[get-demo-data] Fetching type: ${type}`);

    const response: Record<string, any> = {};

    // Fetch engineers with profiles
    if (type === 'all' || type === 'engineers') {
      const { data: engineers, error: engError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          bio,
          avatar_url,
          role,
          location,
          is_verified,
          points,
          level,
          engineer_profiles!inner (
            hourly_rate,
            years_experience,
            specialties,
            genres,
            rating,
            completed_projects,
            availability_status
          )
        `)
        .eq('role', 'engineer')
        .order('points', { ascending: false })
        .limit(20);

      if (engError) {
        console.error('[get-demo-data] Engineers error:', engError);
      }

      response.engineers = (engineers || []).map((eng: any) => ({
        id: eng.id,
        full_name: eng.full_name,
        email: eng.email,
        bio: eng.bio,
        avatar_url: eng.avatar_url,
        role: eng.role,
        specialties: eng.engineer_profiles?.specialties || [],
        hourly_rate: eng.engineer_profiles?.hourly_rate || 0,
        years_experience: eng.engineer_profiles?.years_experience || 0,
        genres: eng.engineer_profiles?.genres || [],
        rating: eng.engineer_profiles?.rating || 4.5,
        completed_projects: eng.engineer_profiles?.completed_projects || 0,
        availability_status: eng.engineer_profiles?.availability_status || 'available',
        points: eng.points || 0,
        level: eng.level || 1
      }));
    }

    // Fetch active/scheduled sessions
    if (type === 'all' || type === 'sessions') {
      const { data: sessions, error: sessError } = await supabase
        .from('collaboration_sessions')
        .select(`
          id,
          title,
          description,
          status,
          session_type,
          visibility,
          audio_quality,
          created_at,
          host:profiles!collaboration_sessions_host_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .in('status', ['active', 'scheduled'])
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(15);

      if (sessError) {
        console.error('[get-demo-data] Sessions error:', sessError);
      }

      response.sessions = (sessions || []).map((sess: any) => ({
        id: sess.id,
        title: sess.title,
        description: sess.description,
        status: sess.status,
        session_type: sess.session_type,
        visibility: sess.visibility,
        audio_quality: sess.audio_quality,
        budget_range: '$50-$200',
        genre: 'Hip-Hop',
        created_at: sess.created_at,
        host: {
          name: sess.host?.full_name || 'Anonymous',
          avatar: sess.host?.avatar_url || ''
        }
      }));
    }

    // Fetch recent activity
    if (type === 'all' || type === 'activity') {
      const { data: activities, error: actError } = await supabase
        .from('activity_feed')
        .select(`
          id,
          activity_type,
          title,
          description,
          created_at,
          user:profiles!activity_feed_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (actError) {
        console.error('[get-demo-data] Activity error:', actError);
      }

      response.activity = (activities || []).map((act: any) => {
        const createdAt = new Date(act.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        let timeAgo = 'just now';
        if (diffHours >= 24) {
          const days = Math.floor(diffHours / 24);
          timeAgo = days === 1 ? '1 day ago' : `${days} days ago`;
        } else if (diffHours >= 1) {
          timeAgo = `${diffHours}h ago`;
        } else {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          timeAgo = diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
        }

        return {
          type: act.activity_type,
          message: `${act.user?.full_name || 'Someone'} ${act.title.toLowerCase()}`,
          time: timeAgo,
          icon: act.user?.avatar_url || ''
        };
      });
    }

    // Calculate live platform stats
    if (type === 'all' || type === 'stats') {
      // Count engineers
      const { count: engineerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'engineer');

      // Count active sessions
      const { count: activeSessionCount } = await supabase
        .from('collaboration_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'scheduled']);

      // Count completed projects (use engineer_profiles completed_projects sum)
      const { data: projectData } = await supabase
        .from('engineer_profiles')
        .select('completed_projects');
      
      const totalProjects = (projectData || []).reduce((sum: number, ep: any) => 
        sum + (ep.completed_projects || 0), 0
      );

      // Sum earnings from wallets
      const { data: walletData } = await supabase
        .from('mixx_wallets')
        .select('lifetime_earned');
      
      const totalEarnings = (walletData || []).reduce((sum: number, w: any) => 
        sum + (w.lifetime_earned || 0), 0
      );

      response.stats = {
        totalEngineers: engineerCount || 0,
        activeSession: activeSessionCount || 0,
        projectsCompleted: totalProjects,
        totalEarnings: totalEarnings
      };
    }

    console.log('[get-demo-data] Response ready:', {
      engineers: response.engineers?.length,
      sessions: response.sessions?.length,
      activity: response.activity?.length,
      stats: response.stats
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[get-demo-data] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to fetch demo data',
      engineers: [],
      sessions: [],
      activity: [],
      stats: {
        totalEngineers: 0,
        activeSession: 0,
        projectsCompleted: 0,
        totalEarnings: 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
