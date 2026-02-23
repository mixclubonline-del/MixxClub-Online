/**
 * ProfileConfig — Type definitions for the profile visual identity system.
 * 
 * Stored as JSONB in profiles.profile_config column.
 * Controls colors, gradients, fonts, layout, and avatar framing.
 */

export interface ProfileColors {
    primary: string;
    secondary: string;
    accent: string;
}

export interface ProfileGradient {
    enabled: boolean;
    from: string;
    to: string;
    direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
}

export interface ProfileBackground {
    pattern: 'none' | 'dots' | 'grid' | 'noise' | 'waves';
    opacity: number;
}

export interface ProfileFont {
    heading: string;
    body: string;
    size: 'sm' | 'md' | 'lg';
}

export type ProfileLayout = 'card' | 'fullbleed' | 'split' | 'bento';

export type AvatarFrame = 'none' | 'gold' | 'platinum' | 'fire' | 'electric' | 'holographic';

export interface ProfileConfig {
    colors: ProfileColors;
    gradient: ProfileGradient;
    background: ProfileBackground;
    layout: ProfileLayout;
    font: ProfileFont;
    avatarFrame: AvatarFrame;
    coverVideoUrl?: string;
    introVideoUrl?: string;
    brandLogoUrl?: string;
}

export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
    colors: {
        primary: '#f97316',    // MixxClub orange
        secondary: '#8b5cf6',  // Purple
        accent: '#06b6d4',     // Cyan
    },
    gradient: {
        enabled: false,
        from: '#f97316',
        to: '#8b5cf6',
        direction: 'to-br',
    },
    background: {
        pattern: 'none',
        opacity: 0.08,
    },
    layout: 'card',
    font: {
        heading: 'Inter',
        body: 'Inter',
        size: 'md',
    },
    avatarFrame: 'none',
};

/** Curated font list */
export const AVAILABLE_FONTS = [
    { value: 'Inter', label: 'Inter', style: 'Clean & Modern' },
    { value: 'Outfit', label: 'Outfit', style: 'Geometric' },
    { value: 'Space Grotesk', label: 'Space Grotesk', style: 'Techy' },
    { value: 'Sora', label: 'Sora', style: 'Futuristic' },
    { value: 'Plus Jakarta Sans', label: 'Jakarta', style: 'Premium' },
    { value: 'DM Sans', label: 'DM Sans', style: 'Neutral' },
    { value: 'Bricolage Grotesque', label: 'Bricolage', style: 'Editorial' },
    { value: 'Urbanist', label: 'Urbanist', style: 'Urban' },
    { value: 'Epilogue', label: 'Epilogue', style: 'Bold' },
    { value: 'Clash Display', label: 'Clash', style: 'Statement' },
    { value: 'Cabinet Grotesk', label: 'Cabinet', style: 'Gallery' },
    { value: 'Satoshi', label: 'Satoshi', style: 'Minimalist' },
];

/** Gradient direction options */
export const GRADIENT_DIRECTIONS = [
    { value: 'to-r', label: '→', title: 'Left to Right' },
    { value: 'to-l', label: '←', title: 'Right to Left' },
    { value: 'to-t', label: '↑', title: 'Bottom to Top' },
    { value: 'to-b', label: '↓', title: 'Top to Bottom' },
    { value: 'to-br', label: '↘', title: 'Diagonal Down' },
    { value: 'to-bl', label: '↙', title: 'Diagonal Down Left' },
    { value: 'to-tr', label: '↗', title: 'Diagonal Up' },
    { value: 'to-tl', label: '↖', title: 'Diagonal Up Left' },
] as const;

/** Avatar frame definitions */
export const AVATAR_FRAMES: { value: AvatarFrame; label: string; cssClass: string }[] = [
    { value: 'none', label: 'None', cssClass: '' },
    { value: 'gold', label: 'Gold Ring', cssClass: 'ring-4 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.4)]' },
    { value: 'platinum', label: 'Platinum', cssClass: 'ring-4 ring-slate-300/80 shadow-[0_0_20px_rgba(203,213,225,0.4)]' },
    { value: 'fire', label: 'Fire', cssClass: 'ring-4 ring-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)]' },
    { value: 'electric', label: 'Electric', cssClass: 'ring-4 ring-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.5)]' },
    { value: 'holographic', label: 'Holographic', cssClass: 'ring-4 ring-purple-400/60 shadow-[0_0_24px_rgba(192,132,252,0.5)] animate-pulse' },
];

/** Layout mode definitions */
export const LAYOUT_MODES: { value: ProfileLayout; label: string; description: string }[] = [
    { value: 'card', label: 'Card', description: 'Classic card layout with floating profile card' },
    { value: 'fullbleed', label: 'Full Bleed', description: 'Edge-to-edge immersive hero layout' },
    { value: 'split', label: 'Split', description: 'Left sidebar + right content panel' },
    { value: 'bento', label: 'Bento Grid', description: 'Grid-based modular layout' },
];

/** Convert Tailwind gradient direction to CSS */
export function gradientToCSS(gradient: ProfileGradient): string {
    if (!gradient.enabled) return 'none';
    const dirMap: Record<string, string> = {
        'to-r': 'to right', 'to-l': 'to left', 'to-t': 'to top', 'to-b': 'to bottom',
        'to-br': 'to bottom right', 'to-bl': 'to bottom left',
        'to-tr': 'to top right', 'to-tl': 'to top left',
    };
    return `linear-gradient(${dirMap[gradient.direction]}, ${gradient.from}, ${gradient.to})`;
}

/** Background pattern CSS */
export function patternToCSS(bg: ProfileBackground): string {
    const o = bg.opacity;
    switch (bg.pattern) {
        case 'dots':
            return `radial-gradient(circle, rgba(255,255,255,${o}) 1px, transparent 1px)`;
        case 'grid':
            return `linear-gradient(rgba(255,255,255,${o}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${o}) 1px, transparent 1px)`;
        case 'waves':
            return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,${o}) 10px, rgba(255,255,255,${o}) 11px)`;
        case 'noise':
            return 'none'; // Handled via SVG filter
        default:
            return 'none';
    }
}
