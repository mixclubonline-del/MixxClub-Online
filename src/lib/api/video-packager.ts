import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PLATFORMS, getPlatformSpec, type PlatformVideoSpec } from "@/lib/config/platform-video-specs";

export interface PackagedAsset {
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

export interface PackageVideoRequest {
  contentId: string;
  sourceVideoUrl: string;
  platforms?: string[];
  script?: string;
  headline?: string;
}

export interface PackageVideoResponse {
  success: boolean;
  contentId?: string;
  packagedAssets?: PackagedAsset[];
  summary?: {
    totalPlatforms: number;
    vertical: number;
    square: number;
    horizontal: number;
  };
  error?: string;
}

/**
 * Package a video for multiple social platforms
 */
export async function packageVideoForPlatforms(
  request: PackageVideoRequest
): Promise<PackageVideoResponse> {
  const platforms = request.platforms || DEFAULT_PLATFORMS;
  
  const { data, error } = await supabase.functions.invoke('package-video-for-platforms', {
    body: {
      ...request,
      platforms
    }
  });

  if (error) {
    console.error('[VideoPackager] Error:', error);
    return { success: false, error: error.message };
  }

  return data;
}

/**
 * Get platform-specific video specifications
 */
export function getVideoSpecForPlatform(platform: string): PlatformVideoSpec | undefined {
  return getPlatformSpec(platform);
}

/**
 * Generate platform-optimized caption from script
 */
export function generatePlatformCaption(
  script: string,
  platform: string,
  hashtags: string[] = []
): string {
  const spec = getPlatformSpec(platform);
  if (!spec) return script;

  let caption = script;
  
  // Platform-specific formatting
  switch (platform) {
    case 'tiktok':
      // TikTok: Hook first, then value, hashtags at end
      caption = script.length > 150 ? script.substring(0, 147) + '...' : script;
      if (hashtags.length > 0) {
        caption += '\n\n' + hashtags.slice(0, 5).map(h => `#${h.replace('#', '')}`).join(' ');
      }
      break;
      
    case 'instagram_reels':
    case 'instagram_feed':
      // Instagram: Full caption ok, hashtags in comment or end
      if (hashtags.length > 0) {
        caption += '\n.\n.\n.\n' + hashtags.map(h => `#${h.replace('#', '')}`).join(' ');
      }
      break;
      
    case 'twitter':
    case 'twitter_square':
      // Twitter: 280 char limit, fewer hashtags
      caption = script.length > 250 ? script.substring(0, 247) + '...' : script;
      if (hashtags.length > 0) {
        caption += ' ' + hashtags.slice(0, 3).map(h => `#${h.replace('#', '')}`).join(' ');
      }
      break;
      
    case 'youtube_shorts':
      // YouTube: Title-style, searchable
      caption = script.length > 100 ? script.substring(0, 97) + '...' : script;
      if (hashtags.length > 0) {
        caption += ' ' + hashtags.slice(0, 3).map(h => `#${h.replace('#', '')}`).join(' ');
      }
      break;
      
    case 'linkedin':
      // LinkedIn: Professional, longer form ok
      if (hashtags.length > 0) {
        caption += '\n\n' + hashtags.slice(0, 5).map(h => `#${h.replace('#', '')}`).join(' ');
      }
      break;
  }
  
  return caption;
}

/**
 * Get recommended posting times for each platform (UTC)
 */
export function getOptimalPostingTimes(platform: string): { day: string; hour: number }[] {
  const times: Record<string, { day: string; hour: number }[]> = {
    tiktok: [
      { day: 'Tuesday', hour: 14 },
      { day: 'Thursday', hour: 15 },
      { day: 'Friday', hour: 13 }
    ],
    instagram_reels: [
      { day: 'Monday', hour: 11 },
      { day: 'Wednesday', hour: 14 },
      { day: 'Friday', hour: 10 }
    ],
    twitter: [
      { day: 'Tuesday', hour: 9 },
      { day: 'Wednesday', hour: 12 },
      { day: 'Thursday', hour: 9 }
    ],
    youtube_shorts: [
      { day: 'Friday', hour: 15 },
      { day: 'Saturday', hour: 12 },
      { day: 'Sunday', hour: 11 }
    ],
    linkedin: [
      { day: 'Tuesday', hour: 10 },
      { day: 'Wednesday', hour: 10 },
      { day: 'Thursday', hour: 10 }
    ]
  };
  
  return times[platform] || times.twitter;
}
