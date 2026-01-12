import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Create client with user's auth token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: adminRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !adminRole) {
      console.error('[SECURITY] Non-admin attempted password reset:', user.id);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email } = await req.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client for password reset
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Enhanced rate limiting - per admin and per target email
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    // Check admin rate limit (5 per minute)
    const { data: adminRateLimitData } = await supabaseAdmin
      .from("rate_limits")
      .select("*")
      .eq("identifier", `admin_reset_${user.id}`)
      .gte("created_at", oneMinuteAgo);

    if (adminRateLimitData && adminRateLimitData.length >= 5) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check target email rate limit (1 per 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();
    const { data: emailRateLimitData } = await supabaseAdmin
      .from("rate_limits")
      .select("*")
      .eq("identifier", `reset_target_${email}`)
      .gte("created_at", fiveMinutesAgo)
      .maybeSingle();

    if (emailRateLimitData) {
      return new Response(JSON.stringify({ error: "Reset already sent to this email recently." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log rate limit entries
    await supabaseAdmin.from("rate_limits").insert([
      { identifier: `admin_reset_${user.id}`, endpoint: "admin-reset-password" },
      { identifier: `reset_target_${email}`, endpoint: "admin-reset-password" },
    ]);

    // Log the admin action for audit
    await supabaseAdmin.from('admin_security_events').insert({
      admin_id: user.id,
      event_type: 'password_reset_initiated',
      description: `Admin initiated password reset for ${email}`,
      severity: 'high',
      metadata: {
        target_email: email,
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent'),
      }
    });

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `https://ee0645d0-cc4e-4e26-b5eb-b018162f6a50.lovableproject.com/auth?mode=reset`,
    });

    if (error) {
      console.error('[INTERNAL] Password reset error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send reset email' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error('[INTERNAL] Admin reset password error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
