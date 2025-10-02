import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logger = createLogger("verify-presentation-share");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { share_token, password } = await req.json();
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    // Get share record
    const { data: share, error: shareError } = await supabaseClient
      .from("presentation_shares")
      .select("*")
      .eq("share_token", share_token)
      .single();

    if (shareError || !share) {
      logger.warn("Share not found", { share_token });
      return new Response(
        JSON.stringify({ success: false, error: "Share link not found or expired" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Share link has expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if active
    if (!share.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: "Share link has been disabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, share.password_hash);

    if (!passwordMatch) {
      // Log failed attempt
      await supabaseClient
        .from("share_link_security_logs")
        .upsert({
          share_id: share.id,
          ip_address: clientIp,
          failed_attempts: 1,
          last_attempt_at: new Date().toISOString(),
        }, {
          onConflict: "share_id,ip_address",
        });

      // Increment failed attempts on share
      const newFailedAttempts = (share.failed_attempts || 0) + 1;
      await supabaseClient
        .from("presentation_shares")
        .update({ failed_attempts: newFailedAttempts })
        .eq("id", share.id);

      // Check if we need to send alert (after 3 failed attempts)
      if (newFailedAttempts >= 3 && newFailedAttempts % 3 === 0) {
        // Send alert to admin
        const { data: creator } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("id", share.created_by)
          .single();

        if (creator) {
          await supabaseClient.from("notifications").insert({
            user_id: creator.id,
            type: "security_alert",
            title: "⚠️ Security Alert: Multiple Failed Access Attempts",
            message: `Multiple failed password attempts detected for shared presentation. IP: ${clientIp}`,
            metadata: {
              share_token,
              failed_attempts: newFailedAttempts,
              ip_address: clientIp,
            },
          });

          await supabaseClient
            .from("share_link_security_logs")
            .update({ alerted_at: new Date().toISOString() })
            .eq("share_id", share.id)
            .eq("ip_address", clientIp);
        }
      }

      // Disable link after 10 failed attempts
      if (newFailedAttempts >= 10) {
        await supabaseClient
          .from("presentation_shares")
          .update({ is_active: false })
          .eq("id", share.id);

        logger.warn("Share link disabled due to too many failed attempts", { shareId: share.id });
      }

      logger.warn("Invalid password attempt", { share_token, clientIp, failedAttempts: newFailedAttempts });

      return new Response(
        JSON.stringify({ success: false, error: "Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success - increment access count
    await supabaseClient
      .from("presentation_shares")
      .update({
        access_count: (share.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", share.id);

    logger.info("Presentation share accessed successfully", { shareId: share.id });

    return new Response(
      JSON.stringify({
        success: true,
        presentation_type: share.presentation_type,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logger.error("Error verifying presentation share", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});