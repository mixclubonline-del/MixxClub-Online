import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logger = createLogger("create-presentation-share");

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify admin access
    const { data: isAdmin } = await supabaseClient.rpc("is_admin", { user_uuid: user.id });
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const {
      password,
      recipient_email,
      recipient_name,
      notes,
      expires_in_days = 30,
    } = await req.json();

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const shareToken = generateToken();
    const passwordHash = await bcrypt.hash(password);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    const { data: share, error: insertError } = await supabaseClient
      .from("presentation_shares")
      .insert({
        share_token: shareToken,
        password_hash: passwordHash,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        recipient_email,
        recipient_name,
        notes,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const shareUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app")}/presentation/share/${shareToken}`;

    logger.info("Presentation share link created", { shareId: share.id, expiresAt });

    return new Response(
      JSON.stringify({
        success: true,
        share_url: shareUrl,
        share_token: shareToken,
        expires_at: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logger.error("Error creating presentation share", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});