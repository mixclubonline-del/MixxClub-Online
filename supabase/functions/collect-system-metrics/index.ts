import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin authentication
    const auth = await requireAdmin(req);
    if ('error' in auth) return authErrorResponse(auth, corsHeaders);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const metrics: any[] = [];
    const recordedAt = new Date().toISOString();

    // Collect user metrics
    const { count: totalUsers } = await supabaseClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    metrics.push({
      metric_type: "total_users",
      metric_value: totalUsers || 0,
      metric_unit: "count",
      recorded_at: recordedAt,
    });

    // Collect project metrics
    const { count: totalProjects } = await supabaseClient
      .from("projects")
      .select("*", { count: "exact", head: true });

    metrics.push({
      metric_type: "total_projects",
      metric_value: totalProjects || 0,
      metric_unit: "count",
      recorded_at: recordedAt,
    });

    const { count: activeProjects } = await supabaseClient
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress");

    metrics.push({
      metric_type: "active_projects",
      metric_value: activeProjects || 0,
      metric_unit: "count",
      recorded_at: recordedAt,
    });

    // Collect payment metrics
    const { data: totalPayments } = await supabaseClient
      .from("payments")
      .select("amount")
      .eq("status", "completed");

    const totalRevenue = totalPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

    metrics.push({
      metric_type: "total_revenue",
      metric_value: totalRevenue,
      metric_unit: "USD",
      recorded_at: recordedAt,
    });

    // Collect engineer earnings
    const { data: engineerEarnings } = await supabaseClient
      .from("engineer_earnings")
      .select("total_amount")
      .eq("status", "paid");

    const totalPaidOut = engineerEarnings?.reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0) || 0;

    metrics.push({
      metric_type: "engineer_payouts",
      metric_value: totalPaidOut,
      metric_unit: "USD",
      recorded_at: recordedAt,
    });

    // Platform commission
    metrics.push({
      metric_type: "platform_commission",
      metric_value: totalRevenue - totalPaidOut,
      metric_unit: "USD",
      recorded_at: recordedAt,
    });

    // Active sessions
    const { count: activeSessions } = await supabaseClient
      .from("collaboration_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    metrics.push({
      metric_type: "active_sessions",
      metric_value: activeSessions || 0,
      metric_unit: "count",
      recorded_at: recordedAt,
    });

    // Insert all metrics
    const { error: insertError } = await supabaseClient
      .from("system_metrics")
      .insert(metrics);

    if (insertError) {
      throw insertError;
    }

    console.log("System metrics collected by admin:", auth.user.id, "count:", metrics.length);

    return new Response(
      JSON.stringify({ success: true, metrics_collected: metrics.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[INTERNAL] Error collecting system metrics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to collect metrics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
