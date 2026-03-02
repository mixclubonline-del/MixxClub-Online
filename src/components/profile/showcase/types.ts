/**
 * Media Showcase types — Shared types for the media showcase system.
 */

export interface FeaturedMediaItem {
    id: string;
    type: 'track' | 'image' | 'video';
    title: string;
    caption?: string;
    url: string;            // Media URL (audio file, image, or video)
    thumbnailUrl?: string;   // Cover art / thumbnail
    metadata?: {
        duration?: number;     // seconds
        bpm?: number;
        key?: string;
        genre?: string;
        artist?: string;
    };
}

export interface PortfolioItem {
    id: string;
    imageUrl: string;
    title: string;
    caption?: string;
    category?: 'cover-art' | 'studio' | 'live' | 'promo' | 'other';
    width?: number;
    height?: number;
}
