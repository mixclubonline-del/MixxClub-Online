import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { forecastType = 'revenue', days = 30 } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch historical data
    const { data: historicalRevenue } = await supabaseClient
      .from('revenue_analytics')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(12);

    const { data: recentPayments } = await supabaseClient
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Generate AI forecast using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const historicalData = {
      monthlyRevenue: historicalRevenue?.map(r => ({
        month: r.period_start,
        mrr: r.mrr,
        arr: r.arr
      })) || [],
      recentTransactions: recentPayments?.length || 0,
      totalRecent: recentPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
    };

    const aiPrompt = `As a financial forecasting AI, predict ${forecastType} for the next ${days} days based on this historical data:

Historical Monthly Revenue: ${JSON.stringify(historicalData.monthlyRevenue)}
Recent 90-day Transactions: ${historicalData.recentTransactions}
Recent 90-day Total: $${historicalData.totalRecent.toFixed(2)}

Provide forecasts for key dates (7, 14, 30, 60, 90 days from now).
For each forecast include: predicted_value, confidence_interval_lower, confidence_interval_upper, model_accuracy (0-1), and key factors.

Return ONLY a JSON array of forecasts with this structure:
[{"days_ahead": 7, "predicted_value": 1000, "lower": 900, "upper": 1100, "accuracy": 0.85, "factors": ["trend", "seasonality"]}]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1',
        messages: [
          { role: 'system', content: 'You are a financial forecasting expert. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const forecastText = aiData.choices[0].message.content;

    let forecasts = [];
    try {
      forecasts = JSON.parse(forecastText);
    } catch (e) {
      console.error('Failed to parse AI forecast:', forecastText);
      // Fallback: simple linear projection
      const avgRecent = historicalData.totalRecent / 90;
      forecasts = [7, 14, 30, 60, 90].map(d => ({
        days_ahead: d,
        predicted_value: avgRecent * d,
        lower: avgRecent * d * 0.85,
        upper: avgRecent * d * 1.15,
        accuracy: 0.7,
        factors: ['linear_projection']
      }));
    }

    // Store forecasts in database
    const forecastRecords = forecasts.map((f: any) => ({
      forecast_type: forecastType,
      forecast_date: new Date(Date.now() + f.days_ahead * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_value: f.predicted_value || 0,
      confidence_interval_lower: f.lower || 0,
      confidence_interval_upper: f.upper || 0,
      model_accuracy: f.accuracy || 0.7,
      factors: f.factors || []
    }));

    const { data: insertedForecasts, error: insertError } = await supabaseClient
      .from('financial_forecasts')
      .upsert(forecastRecords, {
        onConflict: 'forecast_type,forecast_date',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('Error inserting forecasts:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        forecasts: insertedForecasts || forecastRecords
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating forecast:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
