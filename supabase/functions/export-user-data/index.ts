import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getCorsHeaders, validateAdminOrigin } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Exporting data for user:', user.id);

    // Fetch all user data
    const [
      profile,
      projects,
      audioFiles,
      payments,
      jobApplications,
      notifications,
      achievements,
      certifications,
    ] = await Promise.all([
      supabaseClient.from('profiles').select('*').eq('id', user.id).single(),
      supabaseClient.from('projects').select('*').or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`),
      supabaseClient.from('audio_files').select('*').eq('uploaded_by', user.id),
      supabaseClient.from('payments').select('*').eq('user_id', user.id),
      supabaseClient.from('job_applications').select('*').eq('engineer_id', user.id),
      supabaseClient.from('notifications').select('*').eq('user_id', user.id),
      supabaseClient.from('achievements').select('*').eq('user_id', user.id),
      supabaseClient.from('certifications').select('*').eq('user_id', user.id),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profile.data,
      projects: projects.data || [],
      audioFiles: audioFiles.data || [],
      payments: payments.data || [],
      jobApplications: jobApplications.data || [],
      notifications: notifications.data || [],
      achievements: achievements.data || [],
      certifications: certifications.data || [],
    };

    console.log('Data export completed successfully');

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
