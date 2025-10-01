import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, identifier } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limit: 5 submissions per 15 minutes
    const RATE_LIMIT = 5;
    const WINDOW_MINUTES = 15;
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    // Check existing rate limit
    const { data: existing, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error('Rate limit fetch error:', fetchError);
      throw fetchError;
    }

    if (existing) {
      if (existing.attempts >= RATE_LIMIT) {
        const resetTime = new Date(new Date(existing.window_start).getTime() + WINDOW_MINUTES * 60 * 1000);
        const minutesUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / 60000);
        
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            message: `Rate limit exceeded. Please try again in ${minutesUntilReset} minutes.`,
            resetAt: resetTime.toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }

      // Increment attempts
      const { error: updateError } = await supabaseClient
        .from('rate_limits')
        .update({ attempts: existing.attempts + 1 })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new rate limit entry
      const { error: insertError } = await supabaseClient
        .from('rate_limits')
        .insert({
          identifier,
          action,
          attempts: 1,
          window_start: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    // Clean up old entries (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await supabaseClient
      .from('rate_limits')
      .delete()
      .lt('window_start', oneHourAgo.toISOString());

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});