/**
 * Platform Video Specifications
 * Defines optimal video formats for each social platform
 */

export interface PlatformVideoSpec {
  platform: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  maxDurationSeconds: number;
  minDurationSeconds: number;
  maxFileSizeMB: number;
  captionsRequired: boolean;
  captionStyle: 'burned-in' | 'srt' | 'none';
  introOverlay: boolean;
  optimalHookSeconds: number;
  fileFormat: 'mp4' | 'mov';
  codec: string;
  bitrate: string;
}

export const PLATFORM_VIDEO_SPECS: Record<string, PlatformVideoSpec> = {
  tiktok: {
    platform: 'tiktok',
    displayName: 'TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 60,
    minDurationSeconds: 5,
    maxFileSizeMB: 287,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false,
    optimalHookSeconds: 3,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '6000k'
  },
  instagram_reels: {
    platform: 'instagram_reels',
    displayName: 'Instagram Reels',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 90,
    minDurationSeconds: 3,
    maxFileSizeMB: 250,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false,
    optimalHookSeconds: 3,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '5000k'
  },
  instagram_feed: {
    platform: 'instagram_feed',
    displayName: 'Instagram Feed',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    maxDurationSeconds: 60,
    minDurationSeconds: 3,
    maxFileSizeMB: 250,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false,
    optimalHookSeconds: 3,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '5000k'
  },
  twitter: {
    platform: 'twitter',
    displayName: 'Twitter/X',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    maxDurationSeconds: 140,
    minDurationSeconds: 1,
    maxFileSizeMB: 512,
    captionsRequired: false,
    captionStyle: 'none',
    introOverlay: true,
    optimalHookSeconds: 2,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '6000k'
  },
  twitter_square: {
    platform: 'twitter_square',
    displayName: 'Twitter/X Square',
    aspectRatio: '1:1',
    width: 1200,
    height: 1200,
    maxDurationSeconds: 140,
    minDurationSeconds: 1,
    maxFileSizeMB: 512,
    captionsRequired: false,
    captionStyle: 'none',
    introOverlay: true,
    optimalHookSeconds: 2,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '5000k'
  },
  youtube_shorts: {
    platform: 'youtube_shorts',
    displayName: 'YouTube Shorts',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSeconds: 60,
    minDurationSeconds: 15,
    maxFileSizeMB: 256,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: true,
    optimalHookSeconds: 3,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '8000k'
  },
  linkedin: {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    maxDurationSeconds: 600,
    minDurationSeconds: 3,
    maxFileSizeMB: 200,
    captionsRequired: true,
    captionStyle: 'burned-in',
    introOverlay: false,
    optimalHookSeconds: 5,
    fileFormat: 'mp4',
    codec: 'h264',
    bitrate: '5000k'
  }
};

export const DEFAULT_PLATFORMS = ['tiktok', 'instagram_reels', 'twitter', 'youtube_shorts'];

export function getPlatformSpec(platform: string): PlatformVideoSpec | undefined {
  return PLATFORM_VIDEO_SPECS[platform];
}

export function getAllPlatforms(): string[] {
  return Object.keys(PLATFORM_VIDEO_SPECS);
}

export function getVerticalPlatforms(): string[] {
  return Object.entries(PLATFORM_VIDEO_SPECS)
    .filter(([_, spec]) => spec.aspectRatio === '9:16')
    .map(([key]) => key);
}

export function getSquarePlatforms(): string[] {
  return Object.entries(PLATFORM_VIDEO_SPECS)
    .filter(([_, spec]) => spec.aspectRatio === '1:1')
    .map(([key]) => key);
}

export function getHorizontalPlatforms(): string[] {
  return Object.entries(PLATFORM_VIDEO_SPECS)
    .filter(([_, spec]) => spec.aspectRatio === '16:9')
    .map(([key]) => key);
}
