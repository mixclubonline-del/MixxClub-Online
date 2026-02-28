import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { projectId, amount } = await req.json();

    if (!projectId || !amount) {
      throw new Error('Missing required fields: projectId, amount');
    }

    // Get project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('title, client_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Create Coinbase Commerce charge
    const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY');
    if (!coinbaseApiKey) {
      throw new Error('Coinbase Commerce API key not configured');
    }

    const chargeData = {
      name: `Mixxclub - ${project.title}`,
      description: `Payment for project: ${project.title}`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount.toString(),
        currency: 'USD',
      },
      metadata: {
        project_id: projectId,
        user_id: user.id,
        client_id: project.client_id,
      },
      redirect_url: `${req.headers.get('origin')}/project/${projectId}?payment=success`,
      cancel_url: `${req.headers.get('origin')}/project/${projectId}?payment=cancelled`,
    };

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': coinbaseApiKey,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Coinbase API error:', error);
      throw new Error('Failed to create crypto checkout');
    }

    const charge = await response.json();

    // Store payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        amount: amount,
        payment_method: 'crypto',
        status: 'pending',
        crypto_charge_id: charge.data.id,
        crypto_charge_code: charge.data.code,
      });

    if (paymentError) {
      console.error('Failed to store payment record:', paymentError);
    }

    return new Response(
      JSON.stringify({
        hosted_url: charge.data.hosted_url,
        charge_id: charge.data.id,
        charge_code: charge.data.code,
      }),
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
        status: 400,
      }
    );
  }
});
