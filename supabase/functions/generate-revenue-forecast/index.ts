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

    // Get historical financial data
    const { data: snapshots } = await supabaseClient
      .from('financial_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: true })
      .limit(90);

    if (!snapshots || snapshots.length < 7) {
      throw new Error('Insufficient historical data for forecasting');
    }

    // Simple moving average forecast
    const recentRevenues = snapshots.slice(-30).map(s => s.total_revenue);
    const avgRevenue = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
    
    // Calculate trend
    const firstHalf = recentRevenues.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
    const secondHalf = recentRevenues.slice(15).reduce((a, b) => a + b, 0) / 15;
    const trend = (secondHalf - firstHalf) / firstHalf;

    // Generate forecast for next 30 days
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + 30);
    
    const predictedRevenue = avgRevenue * (1 + trend);
    const confidence = Math.max(0.3, Math.min(0.9, 1 - Math.abs(trend)));

    const { data: forecast, error } = await supabaseClient
      .from('revenue_forecasts')
      .insert({
        user_id: user.id,
        forecast_period: '30_days',
        forecast_date: forecastDate.toISOString().split('T')[0],
        predicted_revenue: predictedRevenue,
        confidence_level: confidence,
        forecast_model: 'moving_average_with_trend',
        contributing_factors: {
          avg_revenue: avgRevenue,
          trend_percentage: trend * 100,
          data_points: snapshots.length
        }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(forecast),
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
