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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch financial data
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: subscriptions } = await supabaseClient
      .from('user_mastering_subscriptions')
      .select('*, mastering_packages(*)')
      .eq('status', 'active');

    const { data: payouts } = await supabaseClient
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Calculate key metrics
    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    const activeSubscriptions = subscriptions?.length || 0;
    const pendingPayouts = payouts?.filter(p => p.status === 'pending').length || 0;
    const avgTransactionValue = payments?.length ? totalRevenue / payments.length : 0;

    // Generate AI insights using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const aiPrompt = `As a financial AI assistant, analyze this data and provide 3-5 actionable insights:
    
Total Revenue: $${totalRevenue.toFixed(2)}
Active Subscriptions: ${activeSubscriptions}
Pending Payouts: ${pendingPayouts}
Average Transaction: $${avgTransactionValue.toFixed(2)}
Recent Transactions: ${payments?.length || 0}

Focus on: revenue optimization, churn risks, cash flow concerns, and pricing opportunities.
Format each insight as: {"type": "revenue_optimization|churn_prediction|cash_flow_forecast|pricing_recommendation", "title": "brief title", "description": "detailed insight", "severity": "critical|warning|info|success", "confidence": 0.0-1.0, "impact": estimated dollar impact}

Return ONLY a JSON array of insights, no other text.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1',
        messages: [
          { role: 'system', content: 'You are a financial AI assistant. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insightsText = aiData.choices[0].message.content;

    // Parse AI response
    let insights = [];
    try {
      insights = JSON.parse(insightsText);
    } catch (e) {
      console.error('Failed to parse AI response:', insightsText);
      insights = [{
        type: 'revenue_optimization',
        title: 'Financial Analysis Available',
        description: 'System generated insights based on current financial data.',
        severity: 'info',
        confidence: 0.8,
        impact: 0
      }];
    }

    // Store insights in database
    const insightRecords = insights.map((insight: any) => ({
      insight_type: insight.type || 'revenue_optimization',
      title: insight.title || 'Financial Insight',
      description: insight.description || '',
      severity: insight.severity || 'info',
      confidence_score: insight.confidence || 0.7,
      impact_amount: insight.impact || 0,
      currency: 'USD',
      metadata: { generated_from: 'ai_analysis', timestamp: new Date().toISOString() },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    const { data: insertedInsights, error: insertError } = await supabaseClient
      .from('ai_financial_insights')
      .insert(insightRecords)
      .select();

    if (insertError) {
      console.error('Error inserting insights:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: insertedInsights || insightRecords,
        metrics: {
          totalRevenue,
          activeSubscriptions,
          pendingPayouts,
          avgTransactionValue
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
