import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    const { projectId } = await req.json();

    // Verify user is the artist/client
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*, payments(*)')
      .eq('id', projectId)
      .eq('client_id', user.id)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found or unauthorized');
    }

    // Get engineer profile for payout
    const { data: engineerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_id, tier')
      .eq('id', project.engineer_id)
      .single();

    if (!engineerProfile?.stripe_connect_id) {
      throw new Error('Engineer has not set up payouts');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Calculate split based on tier
    const isInnerCircle = engineerProfile.tier === 'inner_circle';
    const engineerPercent = isInnerCircle ? 0.85 : 0.80;
    const platformPercent = 1 - engineerPercent;

    const totalAmount = project.price_cents || 0;
    const engineerAmount = Math.floor(totalAmount * engineerPercent);
    const platformAmount = totalAmount - engineerAmount;

    // Create transfer to engineer
    const transfer = await stripe.transfers.create({
      amount: engineerAmount,
      currency: project.currency || 'usd',
      destination: engineerProfile.stripe_connect_id,
      metadata: {
        project_id: projectId,
        engineer_id: project.engineer_id
      }
    });

    // Update project status and escrow
    await supabaseClient
      .from('projects')
      .update({ 
        status: 'approved',
        escrow: 'released',
        approved_at: new Date().toISOString()
      })
      .eq('id', projectId);

    // Update payment escrow
    await supabaseClient
      .from('payments')
      .update({ escrow: 'released' })
      .eq('project_id', projectId);

    // Create payout record
    await supabaseClient
      .from('payouts')
      .insert({
        project_id: projectId,
        engineer_id: project.engineer_id,
        stripe_transfer_id: transfer.id,
        amount_cents: engineerAmount,
        status: 'pending'
      });

    // Award points to engineer (1:1 ratio)
    await supabaseClient
      .from('points_ledger')
      .insert({
        user_id: project.engineer_id,
        delta_cents: engineerAmount,
        reason: 'Project completion',
        ref_id: projectId
      });

    return new Response(
      JSON.stringify({ success: true, transferId: transfer.id }),
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
