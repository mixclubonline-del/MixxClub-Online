import { toast } from "sonner";

export type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy';

export interface ShareContent {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
}

const SHARE_TEMPLATES = {
  joined: {
    title: "I just joined Mixxclub!",
    text: "I just joined Mixxclub - the professional mixing & mastering platform for artists. Join me and let's level up our music together! 🎵",
    hashtags: ["Mixxclub", "MusicProduction", "MixingMastering"],
  },
  engineer_profile: (name: string) => ({
    title: `Check out ${name} on Mixxclub`,
    text: `I found an amazing engineer on Mixxclub! Check out ${name}'s work - professional mixing & mastering services.`,
    hashtags: ["Mixxclub", "MixingEngineer", "MusicProduction"],
  }),
  project_complete: (trackName: string) => ({
    title: `Just finished "${trackName}" on Mixxclub!`,
    text: `Just got my track "${trackName}" professionally mixed on Mixxclub! The collaboration was amazing. 🔥`,
    hashtags: ["Mixxclub", "NewMusic", "Collaboration"],
  }),
  premiere: (trackName: string, artistName: string) => ({
    title: `Premiere: ${trackName} by ${artistName}`,
    text: `🎵 PREMIERE: "${trackName}" by ${artistName} is now live on Mixxclub! Listen now and vote!`,
    hashtags: ["Mixxclub", "Premiere", "NewMusic"],
  }),
};

export const generateShareUrl = (platform: SharePlatform, content: ShareContent): string => {
  const { title, text, url, hashtags = [] } = content;
  const hashtagString = hashtags.map(h => `#${h}`).join(' ');
  const fullText = `${text} ${hashtagString}`.trim();

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    
    case 'email':
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    
    default:
      return url;
  }
};

export const shareToSocial = (platform: SharePlatform, content: ShareContent): void => {
  if (platform === 'copy') {
    copyShareLink(content.url);
    return;
  }

  const shareUrl = generateShareUrl(platform, content);
  
  if (platform === 'email') {
    window.location.href = shareUrl;
  } else {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};

export const copyShareLink = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("Failed to copy link");
    return false;
  }
};

export const getShareTemplate = (
  type: 'joined' | 'engineer_profile' | 'project_complete' | 'premiere',
  params?: { name?: string; trackName?: string; artistName?: string },
  url?: string
): ShareContent => {
  let template;

  switch (type) {
    case 'joined':
      template = SHARE_TEMPLATES.joined;
      break;
    case 'engineer_profile':
      template = SHARE_TEMPLATES.engineer_profile(params?.name || 'this engineer');
      break;
    case 'project_complete':
      template = SHARE_TEMPLATES.project_complete(params?.trackName || 'my track');
      break;
    case 'premiere':
      template = SHARE_TEMPLATES.premiere(
        params?.trackName || 'New Track',
        params?.artistName || 'Artist'
      );
      break;
  }

  return {
    ...template,
    url: url || window.location.href,
  };
};

// Native Web Share API (for mobile)
export const useNativeShare = async (content: ShareContent): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: content.title,
      text: content.text,
      url: content.url,
    });
    return true;
  } catch (error) {
    // User cancelled or error
    console.error("Share failed:", error);
    return false;
  }
};

// Check if native share is available
export const isNativeShareAvailable = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};
