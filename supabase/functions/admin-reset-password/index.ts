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
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Rate limiting check
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from("rate_limits")
      .select("*")
      .eq("identifier", `reset_${clientIp}`)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .maybeSingle();

    if (rateLimitData) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log rate limit
    await supabaseAdmin.from("rate_limits").insert({
      identifier: `reset_${clientIp}`,
      endpoint: "admin-reset-password",
    });

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `https://ee0645d0-cc4e-4e26-b5eb-b018162f6a50.lovableproject.com/auth?mode=reset`,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
