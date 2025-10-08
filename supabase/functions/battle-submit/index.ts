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
      battle_id,
      submission_name,
      audio_url,
      description,
      technical_notes
    } = await req.json();

    // Verify battle is open for submissions
    const { data: battle, error: battleError } = await supabaseClient
      .from('mix_battles')
      .select('*')
      .eq('id', battle_id)
      .single();

    if (battleError) throw battleError;

    if (battle.status !== 'open') {
      throw new Error('Battle is not open for submissions');
    }

    if (new Date(battle.submission_deadline) < new Date()) {
      throw new Error('Submission deadline has passed');
    }

    // Check if max participants reached
    if (battle.max_participants) {
      const { count } = await supabaseClient
        .from('battle_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('battle_id', battle_id);

      if (count && count >= battle.max_participants) {
        throw new Error('Battle has reached maximum participants');
      }
    }

    // Create or update submission
    const { data: submission, error: submissionError } = await supabaseClient
      .from('battle_submissions')
      .upsert({
        battle_id,
        user_id: user.id,
        submission_name,
        audio_url,
        description,
        technical_notes
      }, {
        onConflict: 'battle_id,user_id'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    return new Response(
      JSON.stringify(submission),
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
