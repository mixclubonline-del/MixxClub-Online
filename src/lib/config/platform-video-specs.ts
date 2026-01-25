
export const PLATFORM_SPECS = {
  tiktok: {
    maxDuration: 180, // Seconds
    maxSizeMB: 287,
    codecs: ['h264', 'hevc'],
    ratio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 60,
  },
  youtube_shorts: {
    maxDuration: 60,
    maxSizeMB: 1000, // Loose limit, effectively 10GB but practically restricted by duration
    codecs: ['h264'],
    ratio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 60,
  },
  instagram_reels: {
    maxDuration: 90,
    maxSizeMB: 4000, 
    codecs: ['h264'],
    ratio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 30, // 30 is safer for IG, though 60 is supported in some contexts
  }
};

export type PlatformType = keyof typeof PLATFORM_SPECS;

export interface VideoAsset {
  url: string;
  duration: number; // in seconds
  sizeMB: number;
  width: number;
  height: number;
  format: string;
}

export function validateAssetForPlatform(asset: VideoAsset, platform: PlatformType): { valid: boolean; errors: string[] } {
  const specs = PLATFORM_SPECS[platform];
  const errors: string[] = [];

  if (asset.duration > specs.maxDuration) {
    errors.push(`Duration ${asset.duration}s exceeds platform limit of ${specs.maxDuration}s`);
  }
  
  if (asset.sizeMB > specs.maxSizeMB) {
    errors.push(`Size ${asset.sizeMB}MB exceeds platform limit of ${specs.maxSizeMB}MB`);
  }

  // Simplified aspect ratio check - assuming strict 9:16 for vertical
  const aspect = asset.width / asset.height;
  const targetAspect = specs.resolution.width / specs.resolution.height;
  
  // Allow small epsilon for floating point aspect ratio comparisons
  if (Math.abs(aspect - targetAspect) > 0.01) {
     errors.push(`Aspect ratio ${aspect.toFixed(2)} does not match target ${targetAspect.toFixed(2)} (${specs.ratio})`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
