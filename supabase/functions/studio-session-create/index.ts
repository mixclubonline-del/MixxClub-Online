import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { 
      session_name, 
      session_type, 
      is_public, 
      max_participants,
      project_id 
    } = await req.json();

    const { data, error } = await supabaseClient
      .from('studio_sessions')
      .insert({
        host_id: user.id,
        session_name,
        session_type,
        is_public: is_public ?? false,
        max_participants: max_participants ?? 8,
        project_id,
        status: 'active',
        webrtc_room_id: crypto.randomUUID()
      })
      .select()
      .single();

    if (error) throw error;

    // Add host as first participant
    await supabaseClient
      .from('studio_participants')
      .insert({
        session_id: data.id,
        user_id: user.id,
        role: 'host',
        is_active: true
      });

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
