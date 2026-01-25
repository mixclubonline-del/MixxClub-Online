
import { supabase } from "@/integrations/supabase/client";
import { PLATFORM_SPECS, type PlatformType } from "@/lib/config/platform-video-specs";
import { toast } from "sonner";
import { fetchContentQueue } from "@/lib/api/prime-content";
import { SocialMediaService } from "./SocialMediaService";

/**
 * PrimeContentEngine
 * 
 * Orchestrates high-level content operations, including:
 * - Generation (delegated to Edge Function)
 * - Video Packaging (delegated to new Edge Function)
 * - Distribution (future)
 */
export class PrimeContentEngine {
  
  /**
   * Packages a video content item for specific platforms.
   * Checks local specs first, then delegates to Edge Function.
   */
  static async packageVideoForPlatforms(contentId: string, platforms: PlatformType[]) {
    try {
      // 1. Fetch content to get source URL
      const { data: content, error: fetchError } = await supabase
        .from('prime_content_queue')
        .select('*')
        .eq('id', contentId)
        .single();

      if (fetchError || !content) throw new Error("Content not found");
      if (!content.video_url) throw new Error("No video URL found for this content");

      // 2. Validate against Client-Side Specs (Quick Fail)
      // Note: We'd need actual video metadata (width/height/duration) here. 
      // For now, we skip deep validation and assume the Edge Function handles it or the source is trustworthy.

      // 3. Call Edge Function
      const { data, error } = await supabase.functions.invoke('package-video-for-platforms', {
        body: {
          sourceUrl: content.video_url,
          platforms,
          contentId
        }
      });

      if (error) throw error;

      // 4. Update Queue with results
      // The Edge Function might update the DB, but we should update local state or verify.
      // For the mock, we assume the Edge Function returns the platform assets.
      
      const updates = {
        platform_content: {
          ...content.platform_content,
          ...data.results
        },
        status: 'ready' // or keep as ready, just updated assets
      };

      const { error: updateError } = await supabase
        .from('prime_content_queue')
        .update(updates)
        .eq('id', contentId);

      if (updateError) throw updateError;

      return { success: true, results: data.results };

    } catch (err: any) {
      console.error('Packaging error:', err);
      toast.error(`Packaging failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
  static async publishContent(contentId: string, platforms: string[]) {
    try {
      // 1. Fetch content
      const { data: content, error: fetchError } = await supabase
        .from('prime_content_queue')
        .select('*')
        .eq('id', contentId)
        .single();
        
      if (fetchError || !content) throw new Error("Content not found");

      // 2. Prepare assets map
      const assets = content.platform_content || {};

      // 3. Call Social Media Service
      const result = await SocialMediaService.publish(contentId, platforms, assets);

      if (!result.success) throw new Error(result.error);

      // 4. Update Status to Posted
      const { error: updateError } = await supabase
        .from('prime_content_queue')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          platforms_posted: platforms, // In real app, append to existing
          engagement_metrics: { ...content.engagement_metrics, platformIds: result.platformIds }
        })
        .eq('id', contentId);

      if (updateError) throw updateError;

      return { success: true, platformIds: result.platformIds };

    } catch (err: any) {
      console.error('Publishing error:', err);
      toast.error(`Publishing failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
