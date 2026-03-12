import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get last 30 days of metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: metrics, error } = await supabaseClient
      .from('launch_metrics')
      .select('*')
      .gte('metric_date', startDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return new Response(
        JSON.stringify({
          summary: 'No data available yet',
          metrics: {
            total_qualifiers: 0,
            total_signups: 0,
            total_revenue: 0,
            conversion_rate: 0,
          },
          insights: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Calculate totals
    const totals = metrics.reduce(
      (acc, day) => ({
        qualifier_started: acc.qualifier_started + (day.qualifier_started || 0),
        qualifier_completed: acc.qualifier_completed + (day.qualifier_completed || 0),
        signups: acc.signups + (day.signups || 0),
        projects: acc.projects + (day.projects_created || 0),
        payments: acc.payments + (day.payments_completed || 0),
        revenue: acc.revenue + (Number(day.revenue_daily) || 0),
        ad_spend: acc.ad_spend + (Number(day.ad_spend_daily) || 0),
      }),
      { qualifier_started: 0, qualifier_completed: 0, signups: 0, projects: 0, payments: 0, revenue: 0, ad_spend: 0 }
    );

    // Calculate conversion funnel
    const qualifierToSignup = totals.qualifier_completed > 0 ? (totals.signups / totals.qualifier_completed) * 100 : 0;
    const signupToProject = totals.signups > 0 ? (totals.projects / totals.signups) * 100 : 0;
    const projectToPayment = totals.projects > 0 ? (totals.payments / totals.projects) * 100 : 0;
    const overallConversion = totals.qualifier_started > 0 ? (totals.payments / totals.qualifier_started) * 100 : 0;

    // Calculate ROI
    const roi = totals.ad_spend > 0 ? ((totals.revenue - totals.ad_spend) / totals.ad_spend) * 100 : 0;
    const cpa = totals.signups > 0 ? totals.ad_spend / totals.signups : 0;
    const ltv = totals.signups > 0 ? totals.revenue / totals.signups : 0;

    // Generate insights
    const insights = [];

    if (qualifierToSignup < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Qualifier Conversion',
        message: `Only ${qualifierToSignup.toFixed(1)}% of qualifier completers are signing up. Target: 40%+`,
        recommendation: 'A/B test the results page, add social proof, or simplify signup process.',
      });
    }

    if (signupToProject < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Project Creation Rate',
        message: `Only ${signupToProject.toFixed(1)}% of signups create projects. Target: 70%+`,
        recommendation: 'Improve onboarding flow, add project creation prompts, or offer first-project discounts.',
      });
    }

    if (roi > 100) {
      insights.push({
        type: 'success',
        title: 'Excellent ROI',
        message: `Current ROI is ${roi.toFixed(0)}%. Consider scaling ad spend.`,
        recommendation: 'Increase budget on best-performing channels while maintaining quality.',
      });
    } else if (roi < 50 && totals.ad_spend > 100) {
      insights.push({
        type: 'error',
        title: 'Low ROI',
        message: `ROI is only ${roi.toFixed(0)}%. Ads may not be profitable.`,
        recommendation: 'Pause underperforming campaigns, refine targeting, or improve landing pages.',
      });
    }

    if (ltv > cpa * 3) {
      insights.push({
        type: 'success',
        title: 'Healthy LTV:CAC Ratio',
        message: `LTV ($${ltv.toFixed(2)}) is ${(ltv / cpa).toFixed(1)}x higher than CAC ($${cpa.toFixed(2)})`,
        recommendation: 'Great unit economics! Focus on scaling acquisition.',
      });
    }

    // Recent trend analysis
    const recentDays = metrics.slice(-7);
    const recentRevenue = recentDays.reduce((sum, d) => sum + (Number(d.revenue_daily) || 0), 0);
    const previousWeek = metrics.slice(-14, -7);
    const previousRevenue = previousWeek.reduce((sum, d) => sum + (Number(d.revenue_daily) || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    if (revenueGrowth > 20) {
      insights.push({
        type: 'success',
        title: 'Strong Growth Trend',
        message: `Revenue grew ${revenueGrowth.toFixed(1)}% week-over-week`,
        recommendation: 'Momentum is building! Maintain current strategy and monitor quality.',
      });
    } else if (revenueGrowth < -10) {
      insights.push({
        type: 'warning',
        title: 'Revenue Decline',
        message: `Revenue decreased ${Math.abs(revenueGrowth).toFixed(1)}% week-over-week`,
        recommendation: 'Investigate: seasonality, ad fatigue, competition, or quality issues.',
      });
    }

    console.log(`Analyzed ${metrics.length} days of launch metrics`);

    return new Response(
      JSON.stringify({
        summary: `${metrics.length}-day analysis with $${totals.revenue.toFixed(2)} revenue from ${totals.signups} signups`,
        period: {
          start: metrics[0].metric_date,
          end: metrics[metrics.length - 1].metric_date,
          days: metrics.length,
        },
        totals,
        funnel: {
          qualifier_to_signup: Math.round(qualifierToSignup * 10) / 10,
          signup_to_project: Math.round(signupToProject * 10) / 10,
          project_to_payment: Math.round(projectToPayment * 10) / 10,
          overall_conversion: Math.round(overallConversion * 10) / 10,
        },
        economics: {
          roi: Math.round(roi * 10) / 10,
          cpa: Math.round(cpa * 100) / 100,
          ltv: Math.round(ltv * 100) / 100,
          ltv_cac_ratio: cpa > 0 ? Math.round((ltv / cpa) * 10) / 10 : 0,
        },
        trends: {
          recent_revenue: Math.round(recentRevenue * 100) / 100,
          previous_revenue: Math.round(previousRevenue * 100) / 100,
          growth_rate: Math.round(revenueGrowth * 10) / 10,
        },
        insights,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
