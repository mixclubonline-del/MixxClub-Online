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

    const { provider_id, auth_data } = await req.json();

    // Get provider details
    const { data: provider } = await supabaseClient
      .from('integration_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (!provider) {
      throw new Error('Provider not found');
    }

    // Create or update integration
    const { data: integration, error } = await supabaseClient
      .from('user_integrations')
      .upsert({
        user_id: user.id,
        provider_id: provider_id,
        connection_status: 'connected',
        access_token: auth_data.access_token,
        refresh_token: auth_data.refresh_token,
        token_expires_at: auth_data.expires_at,
        api_key: auth_data.api_key,
        connection_metadata: auth_data.metadata || {},
        last_sync_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(integration),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
