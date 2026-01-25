
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { contentId, platforms, assets } = await req.json()

    if (!contentId || !platforms || !Array.isArray(platforms)) {
      throw new Error('Missing required fields: contentId, platforms (array)')
    }

    console.log(`Publishing content ${contentId} to: ${platforms.join(', ')}`)

    // MOCK PUBLISHING LOGIC
    // In a real scenario, we would:
    // 1. Fetch secure access tokens from DB (encryped)
    // 2. Call Instagram/TikTok APIs using fetch()
    // 3. Handle rate limits and retries
    
    // For now, we simulate success with a brief delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const platformIds: Record<string, string> = {};
    const failedPlatforms: string[] = [];

    for (const platform of platforms) {
      if (Math.random() > 0.1) { // 90% success rate mock
        platformIds[platform] = `ext_${platform}_${crypto.randomUUID().split('-')[0]}`;
      } else {
        failedPlatforms.push(platform);
        console.warn(`Simulated failure for ${platform}`);
      }
    }

    if (failedPlatforms.length === platforms.length) {
      throw new Error("All platform publications failed (simulated).");
    }

    // Return success logic
    return new Response(
      JSON.stringify({
        success: true,
        platformIds,
        failedPlatforms: failedPlatforms.length > 0 ? failedPlatforms : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Or 200 with success: false depending on client agreement
      }
    )
  }
})
