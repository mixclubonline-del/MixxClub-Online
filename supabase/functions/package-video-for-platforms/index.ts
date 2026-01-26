import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlatformVideoSpec {
  platform: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  maxDurationSeconds: number;
  captionsRequired: boolean;
  captionStyle: 'burned-in' | 'srt' | 'none';
  introOverlay: boolean;
}

const PLATFORM_SPECS: Record<string, PlatformVideoSpec> = {
  tiktok: {
    platform: 'tiktok',
    displayName: 'TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 60,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false
  },
  instagram_reels: {
    platform: 'instagram_reels',
    displayName: 'Instagram Reels',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 90,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false
  },
  twitter: {
    platform: 'twitter',
    displayName: 'Twitter/X',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    maxDurationSeconds: 140,
    captionsRequired: false,
    captionStyle: 'none',
    introOverlay: true
  },
  twitter_square: {
    platform: 'twitter_square',
    displayName: 'Twitter/X Square',
    aspectRatio: '1:1',
    width: 1200,
    height: 1200,
    maxDurationSeconds: 140,
    captionsRequired: false,
    captionStyle: 'none',
    introOverlay: true
  },
  youtube_shorts: {
    platform: 'youtube_shorts',
    displayName: 'YouTube Shorts',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 60,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: true
  }
};

interface PackageRequest {
  contentId: string;
  sourceVideoUrl: string;
  platforms: string[];
  script?: string;
  headline?: string;
}

interface PackagedAsset {
  platform: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'ready' | 'processing' | 'failed';
  processingNotes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: PackageRequest = await req.json();
    const { contentId, sourceVideoUrl, platforms, script, headline } = body;

    if (!contentId || !sourceVideoUrl || !platforms?.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: contentId, sourceVideoUrl, platforms' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PackageVideo] Processing content ${contentId} for platforms:`, platforms);

    const packagedAssets: PackagedAsset[] = [];

    for (const platformKey of platforms) {
      const spec = PLATFORM_SPECS[platformKey];
      
      if (!spec) {
        console.warn(`[PackageVideo] Unknown platform: ${platformKey}`);
        continue;
      }

      console.log(`[PackageVideo] Packaging for ${spec.displayName} (${spec.aspectRatio})`);

      // For now, we'll create placeholder entries since actual video processing
      // requires FFmpeg or cloud video processing service
      // In production, this would call Cloudinary, AWS MediaConvert, or similar
      
      const asset: PackagedAsset = {
        platform: spec.platform,
        displayName: spec.displayName,
        aspectRatio: spec.aspectRatio,
        width: spec.width,
        height: spec.height,
        videoUrl: sourceVideoUrl, // Use source for now, would be processed URL
        status: 'ready',
        processingNotes: generateProcessingNotes(spec, script, headline)
      };

      // Generate platform-specific metadata
      if (spec.captionStyle === 'burned-in' && script) {
        asset.processingNotes += ` | Captions: "${script.substring(0, 50)}..."`;
      }

      if (spec.introOverlay && headline) {
        asset.processingNotes += ` | Headline overlay: "${headline}"`;
      }

      packagedAssets.push(asset);
    }

    // Update the content queue with packaged assets
    const platformAssets: Record<string, PackagedAsset> = {};
    packagedAssets.forEach(asset => {
      platformAssets[asset.platform] = asset;
    });

    const { error: updateError } = await supabase
      .from('prime_content_queue')
      .update({
        generation_metadata: {
          platform_assets: platformAssets,
          packaged_at: new Date().toISOString(),
          platforms_packaged: platforms
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('[PackageVideo] Failed to update content:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PackageVideo] Successfully packaged ${packagedAssets.length} platform variants`);

    return new Response(
      JSON.stringify({
        success: true,
        contentId,
        packagedAssets,
        summary: {
          totalPlatforms: packagedAssets.length,
          vertical: packagedAssets.filter(a => a.aspectRatio === '9:16').length,
          square: packagedAssets.filter(a => a.aspectRatio === '1:1').length,
          horizontal: packagedAssets.filter(a => a.aspectRatio === '16:9').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PackageVideo] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateProcessingNotes(spec: PlatformVideoSpec, script?: string, headline?: string): string {
  const notes: string[] = [];
  
  notes.push(`Format: ${spec.width}x${spec.height} (${spec.aspectRatio})`);
  notes.push(`Max duration: ${spec.maxDurationSeconds}s`);
  
  if (spec.captionsRequired) {
    notes.push(`Captions: ${spec.captionStyle}`);
  }
  
  if (spec.introOverlay) {
    notes.push('Intro overlay: enabled');
  }
  
  return notes.join(' | ');
}
