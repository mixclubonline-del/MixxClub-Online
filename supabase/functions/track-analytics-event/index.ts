import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  eventName: string;
  eventData?: Record<string, any>;
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { eventName, eventData, userId }: AnalyticsEvent = await req.json();

    console.log(`[Analytics] Event: ${eventName}`, eventData);

    // Update daily metrics based on event type
    const today = new Date().toISOString().split('T')[0];

    if (eventName === 'qualifier_started') {
      await supabaseClient.rpc('increment_metric', {
        p_date: today,
        p_field: 'qualifier_started',
        p_amount: 1,
      });
    } else if (eventName === 'qualifier_completed') {
      await supabaseClient.rpc('increment_metric', {
        p_date: today,
        p_field: 'qualifier_completed',
        p_amount: 1,
      });
    } else if (eventName === 'account_created') {
      await supabaseClient.rpc('increment_metric', {
        p_date: today,
        p_field: 'signups',
        p_amount: 1,
      });
    } else if (eventName === 'project_created') {
      await supabaseClient.rpc('increment_metric', {
        p_date: today,
        p_field: 'projects_created',
        p_amount: 1,
      });
    } else if (eventName === 'payment_completed') {
      await supabaseClient.rpc('increment_metric', {
        p_date: today,
        p_field: 'payments_completed',
        p_amount: 1,
      });
      
      // Also update revenue
      if (eventData?.amount) {
        await supabaseClient.rpc('increment_metric', {
          p_date: today,
          p_field: 'revenue_daily',
          p_amount: eventData.amount,
        });
      }
    }

    // Send to GA4 if configured (would need GA4 Measurement Protocol API)
    // This is a placeholder for GA4 integration
    // In production, you'd use the GA4 Measurement Protocol

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
