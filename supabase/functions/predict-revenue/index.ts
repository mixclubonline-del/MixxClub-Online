import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevenuePredictionRequest {
  days: number; // Number of days to predict (7, 30, or 90)
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

    const { days = 7 }: RevenuePredictionRequest = await req.json();

    // Get historical revenue data from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: historicalData, error } = await supabaseClient
      .from('launch_metrics')
      .select('metric_date, revenue_daily, signups, projects_created, payments_completed')
      .gte('metric_date', startDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!historicalData || historicalData.length === 0) {
      // No historical data, return baseline predictions
      return new Response(
        JSON.stringify({
          predicted_revenue: days * 100,
          confidence: 0.3,
          daily_breakdown: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            predicted_revenue: 100,
            lower_bound: 50,
            upper_bound: 200,
          })),
          growth_rate: 0,
          method: 'baseline',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Calculate average daily revenue
    const totalRevenue = historicalData.reduce((sum, day) => sum + (Number(day.revenue_daily) || 0), 0);
    const avgDailyRevenue = totalRevenue / historicalData.length;

    // Calculate trend (simple linear regression)
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    const n = historicalData.length;

    historicalData.forEach((day, index) => {
      const x = index;
      const y = Number(day.revenue_daily) || 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const growthRate = slope / avgDailyRevenue;

    // Generate predictions
    const predictions = [];
    let totalPredicted = 0;

    for (let i = 0; i < days; i++) {
      const dayIndex = historicalData.length + i;
      const basePrediction = slope * dayIndex + intercept;
      const predicted = Math.max(0, basePrediction);
      const variance = Math.sqrt(
        historicalData.reduce((sum, day) => {
          const expected = slope * historicalData.indexOf(day) + intercept;
          return sum + Math.pow(Number(day.revenue_daily) - expected, 2);
        }, 0) / n
      );

      predictions.push({
        day: i + 1,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted_revenue: Math.round(predicted * 100) / 100,
        lower_bound: Math.max(0, Math.round((predicted - variance) * 100) / 100),
        upper_bound: Math.round((predicted + variance) * 100) / 100,
      });

      totalPredicted += predicted;
    }

    // Calculate confidence based on data consistency
    const recentDays = historicalData.slice(-7);
    const recentAvg = recentDays.reduce((sum, d) => sum + (Number(d.revenue_daily) || 0), 0) / recentDays.length;
    const consistency = 1 - Math.abs(recentAvg - avgDailyRevenue) / (avgDailyRevenue || 1);
    const confidence = Math.min(0.95, Math.max(0.4, consistency));

    console.log(`Predicted ${days}-day revenue: $${totalPredicted.toFixed(2)} (confidence: ${(confidence * 100).toFixed(1)}%)`);

    return new Response(
      JSON.stringify({
        predicted_revenue: Math.round(totalPredicted * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        daily_breakdown: predictions,
        growth_rate: Math.round(growthRate * 10000) / 100, // As percentage
        avg_daily_revenue: Math.round(avgDailyRevenue * 100) / 100,
        historical_days: historicalData.length,
        method: 'linear_regression',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error predicting revenue:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
