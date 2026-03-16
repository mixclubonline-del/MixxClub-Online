import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Generate Beat Download — Secure download fulfillment
 * Verifies ownership, checks license type, returns signed URLs, records download.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { purchaseId } = await req.json();
    if (!purchaseId) {
      return new Response(JSON.stringify({ error: "Purchase ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify ownership — buyer must match authenticated user, purchase must be completed
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("beat_purchases")
      .select(`
        id, buyer_id, license_type, status, downloaded_at,
        beat:beat_id(id, title, audio_url, wav_url, stems_url)
      `)
      .eq("id", purchaseId)
      .eq("buyer_id", user.id)
      .eq("status", "completed")
      .single();

    if (purchaseError || !purchase) {
      return new Response(JSON.stringify({ error: "Purchase not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const beat = Array.isArray(purchase.beat) ? purchase.beat[0] : purchase.beat;
    if (!beat) {
      return new Response(JSON.stringify({ error: "Beat data unavailable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build download URLs based on license type
    const downloads: { label: string; url: string }[] = [];
    const SIGNED_URL_EXPIRY = 3600; // 60 minutes

    // Helper to create signed URL from a storage path or return direct URL
    const resolveUrl = async (rawUrl: string, label: string) => {
      // If it's a storage path (starts with bucket prefix), generate signed URL
      if (rawUrl.startsWith("beat-files/") || rawUrl.startsWith("producer-beats/")) {
        const bucket = rawUrl.split("/")[0];
        const path = rawUrl.substring(bucket.length + 1);
        const { data: signed, error: signErr } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(path, SIGNED_URL_EXPIRY);

        if (signErr || !signed?.signedUrl) {
          console.error(`Failed to sign URL for ${label}:`, signErr);
          return;
        }
        downloads.push({ label, url: signed.signedUrl });
      } else {
        // Already a full URL (public bucket or external) — pass through
        downloads.push({ label, url: rawUrl });
      }
    };

    // MP3 always included for all license types
    if (beat.audio_url) {
      await resolveUrl(beat.audio_url, "MP3");
    }

    // WAV + Stems only for exclusive licenses
    if (purchase.license_type === "exclusive") {
      if (beat.wav_url) {
        await resolveUrl(beat.wav_url, "WAV");
      }
      if (beat.stems_url) {
        await resolveUrl(beat.stems_url, "Stems (ZIP)");
      }
    }

    if (downloads.length === 0) {
      return new Response(JSON.stringify({ error: "No downloadable files available for this beat" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record download timestamp
    if (!purchase.downloaded_at) {
      await supabaseAdmin
        .from("beat_purchases")
        .update({ downloaded_at: new Date().toISOString() })
        .eq("id", purchaseId);
    }

    console.log(`[BEAT-DOWNLOAD] User ${user.id} downloading purchase ${purchaseId} (${purchase.license_type}), ${downloads.length} files`);

    return new Response(
      JSON.stringify({ downloads, licenseType: purchase.license_type, beatTitle: beat.title }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[BEAT-DOWNLOAD] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
