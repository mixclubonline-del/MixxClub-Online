/**
 * Social Presence types — Shared types for the social layer.
 */

export interface LinkCard {
    id: string;
    title: string;
    url: string;
    icon?: string;          // Emoji or icon name
    thumbnailUrl?: string;
    category: 'music' | 'merch' | 'booking' | 'social' | 'other';
    clicks?: number;
}

export interface StudioStatus {
    mode: 'available' | 'in-session' | 'mixing' | 'taking-bookings' | 'away' | 'offline';
    customText?: string;
    mood?: 'creative' | 'focused' | 'chill' | 'hype' | 'reflective';
    expiresAt?: string;
}

export interface CollabEntry {
    id: string;
    userId: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
    projectTitle?: string;
    endorsement?: string;
}

export interface StoryUpdate {
    id: string;
    type: 'text' | 'image' | 'audio';
    content: string;        // Text, image URL, or audio URL
    caption?: string;
    createdAt: string;
    expiresAt: string;       // 24h from creation
}

export const STATUS_MODES: { value: StudioStatus['mode']; label: string; emoji: string; color: string }[] = [
    { value: 'available', label: 'Available', emoji: '🟢', color: '#22c55e' },
    { value: 'in-session', label: 'In Session', emoji: '🔴', color: '#ef4444' },
    { value: 'mixing', label: 'Mixing', emoji: '🎛️', color: '#f59e0b' },
    { value: 'taking-bookings', label: 'Taking Bookings', emoji: '📅', color: '#3b82f6' },
    { value: 'away', label: 'Away', emoji: '🌙', color: '#8b5cf6' },
    { value: 'offline', label: 'Offline', emoji: '⚫', color: '#6b7280' },
];

export const MOOD_OPTIONS: { value: StudioStatus['mood']; label: string; emoji: string }[] = [
    { value: 'creative', label: 'Creative', emoji: '🎨' },
    { value: 'focused', label: 'Focused', emoji: '🎯' },
    { value: 'chill', label: 'Chill', emoji: '😎' },
    { value: 'hype', label: 'Hype', emoji: '🔥' },
    { value: 'reflective', label: 'Reflective', emoji: '💭' },
];

export const LINK_CATEGORIES: { value: LinkCard['category']; label: string; emoji: string }[] = [
    { value: 'music', label: 'Music', emoji: '🎵' },
    { value: 'merch', label: 'Merch', emoji: '🛍️' },
    { value: 'booking', label: 'Booking', emoji: '📅' },
    { value: 'social', label: 'Social', emoji: '📱' },
    { value: 'other', label: 'Other', emoji: '🔗' },
];
