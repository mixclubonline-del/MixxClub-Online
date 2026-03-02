/**
 * PhysicalMediaConfig — Format types, pressing options, packaging tiers.
 * 
 * Defines every physical music format an artist can sell:
 * Vinyl (standard/colored/picture disc/180g), CDs (jewel/digipak/deluxe),
 * Cassettes (standard/chrome), USB drives, and bundles.
 */

// ═══════════════════════════════════════════
// FORMAT TYPES
// ═══════════════════════════════════════════

export type PhysicalFormat =
    | 'vinyl_standard'
    | 'vinyl_colored'
    | 'vinyl_picture_disc'
    | 'vinyl_180g'
    | 'vinyl_7inch'
    | 'cd_jewel'
    | 'cd_digipak'
    | 'cd_deluxe'
    | 'cassette_standard'
    | 'cassette_chrome'
    | 'usb_custom'
    | 'bundle';

export interface PhysicalFormatConfig {
    format: PhysicalFormat;
    label: string;
    emoji: string;
    category: 'vinyl' | 'cd' | 'cassette' | 'usb' | 'bundle';
    /** Speed/size info */
    specs: string;
    /** Typical retail price range */
    priceRange: [number, number];
    /** Minimum pressing/production run */
    minRun: number;
    /** Production lead time in weeks */
    leadTimeWeeks: number;
    /** Can be numbered/limited edition */
    supportsNumbered: boolean;
    /** Can be signed */
    supportsSigned: boolean;
}

export const PHYSICAL_FORMATS: Record<PhysicalFormat, PhysicalFormatConfig> = {
    vinyl_standard: {
        format: 'vinyl_standard', label: 'Vinyl (Standard Black)', emoji: '🎵',
        category: 'vinyl', specs: '12" 33⅓ RPM, Standard weight',
        priceRange: [25, 35], minRun: 100, leadTimeWeeks: 12,
        supportsNumbered: true, supportsSigned: true,
    },
    vinyl_colored: {
        format: 'vinyl_colored', label: 'Vinyl (Colored)', emoji: '🌈',
        category: 'vinyl', specs: '12" 33⅓ RPM, Custom color splatter/swirl',
        priceRange: [30, 45], minRun: 100, leadTimeWeeks: 14,
        supportsNumbered: true, supportsSigned: true,
    },
    vinyl_picture_disc: {
        format: 'vinyl_picture_disc', label: 'Picture Disc', emoji: '🖼️',
        category: 'vinyl', specs: '12" 33⅓ RPM, Full artwork pressed into disc',
        priceRange: [35, 55], minRun: 200, leadTimeWeeks: 16,
        supportsNumbered: true, supportsSigned: true,
    },
    vinyl_180g: {
        format: 'vinyl_180g', label: 'Vinyl (180g Audiophile)', emoji: '🎧',
        category: 'vinyl', specs: '12" 33⅓ RPM, 180g heavyweight audiophile press',
        priceRange: [35, 50], minRun: 200, leadTimeWeeks: 14,
        supportsNumbered: true, supportsSigned: true,
    },
    vinyl_7inch: {
        format: 'vinyl_7inch', label: '7" Single', emoji: '💿',
        category: 'vinyl', specs: '7" 45 RPM, A-side/B-side single',
        priceRange: [10, 18], minRun: 100, leadTimeWeeks: 10,
        supportsNumbered: true, supportsSigned: true,
    },
    cd_jewel: {
        format: 'cd_jewel', label: 'CD (Jewel Case)', emoji: '💿',
        category: 'cd', specs: 'Standard jewel case with booklet',
        priceRange: [10, 15], minRun: 50, leadTimeWeeks: 4,
        supportsNumbered: false, supportsSigned: true,
    },
    cd_digipak: {
        format: 'cd_digipak', label: 'CD (Digipak)', emoji: '📀',
        category: 'cd', specs: 'Premium cardboard digipak with booklet',
        priceRange: [12, 20], minRun: 100, leadTimeWeeks: 6,
        supportsNumbered: true, supportsSigned: true,
    },
    cd_deluxe: {
        format: 'cd_deluxe', label: 'CD (Deluxe Edition)', emoji: '✨',
        category: 'cd', specs: 'Hardcover book packaging, bonus tracks, poster insert',
        priceRange: [20, 40], minRun: 100, leadTimeWeeks: 8,
        supportsNumbered: true, supportsSigned: true,
    },
    cassette_standard: {
        format: 'cassette_standard', label: 'Cassette', emoji: '📼',
        category: 'cassette', specs: 'Type I (Normal), custom shell color + j-card',
        priceRange: [8, 15], minRun: 25, leadTimeWeeks: 4,
        supportsNumbered: true, supportsSigned: false,
    },
    cassette_chrome: {
        format: 'cassette_chrome', label: 'Cassette (Chrome)', emoji: '🔊',
        category: 'cassette', specs: 'Type II (Chrome), hi-fi quality + custom shell',
        priceRange: [12, 20], minRun: 50, leadTimeWeeks: 6,
        supportsNumbered: true, supportsSigned: false,
    },
    usb_custom: {
        format: 'usb_custom', label: 'USB Drive', emoji: '🔌',
        category: 'usb', specs: 'Custom-shaped USB with WAV/FLAC + bonus content + stems',
        priceRange: [15, 35], minRun: 25, leadTimeWeeks: 3,
        supportsNumbered: true, supportsSigned: false,
    },
    bundle: {
        format: 'bundle', label: 'Collector\'s Bundle', emoji: '🎁',
        category: 'bundle', specs: 'Vinyl + CD + Merch + Digital, boxed set',
        priceRange: [60, 150], minRun: 25, leadTimeWeeks: 16,
        supportsNumbered: true, supportsSigned: true,
    },
};

// ═══════════════════════════════════════════
// PACKAGING OPTIONS
// ═══════════════════════════════════════════

export type PackagingTier = 'standard' | 'premium' | 'deluxe' | 'collectors';

export interface PackagingConfig {
    tier: PackagingTier;
    label: string;
    emoji: string;
    description: string;
    /** Price adder in USD */
    priceAdd: number;
    features: string[];
}

export const PACKAGING_TIERS: Record<PackagingTier, PackagingConfig> = {
    standard: {
        tier: 'standard', label: 'Standard', emoji: '📦',
        description: 'Clean packaging, protective sleeve',
        priceAdd: 0,
        features: ['Protective inner sleeve', 'Standard outer jacket', 'Download card'],
    },
    premium: {
        tier: 'premium', label: 'Premium', emoji: '🎨',
        description: 'Gatefold jacket, lyric insert, download card',
        priceAdd: 5,
        features: ['Gatefold jacket', 'Printed inner sleeve', 'Lyric sheet/booklet', 'Download card with bonus tracks'],
    },
    deluxe: {
        tier: 'deluxe', label: 'Deluxe', emoji: '⭐',
        description: 'Heavy-stock gatefold, poster, sticker sheet, OBI strip',
        priceAdd: 12,
        features: ['Heavy-stock gatefold', '12x12" art print', 'Sticker sheet', 'OBI strip', 'Numbered certificate', 'Hi-res download'],
    },
    collectors: {
        tier: 'collectors', label: 'Collector\'s Edition', emoji: '👑',
        description: 'Rigid box, signed insert, photo set, exclusive stem download',
        priceAdd: 25,
        features: ['Rigid slipcase box', 'Hand-signed art print', 'Photo card set', 'Exclusive stem downloads', 'Numbered certificate of authenticity', 'Gold foil stamping'],
    },
};

// ═══════════════════════════════════════════
// VINYL COLOR OPTIONS
// ═══════════════════════════════════════════

export interface VinylColor {
    name: string;
    hex: string;
    type: 'solid' | 'splatter' | 'swirl' | 'half_half' | 'galaxy' | 'transparent';
}

export const VINYL_COLORS: VinylColor[] = [
    { name: 'Classic Black', hex: '#0a0a0a', type: 'solid' },
    { name: 'Red', hex: '#dc2626', type: 'solid' },
    { name: 'Blue', hex: '#2563eb', type: 'solid' },
    { name: 'Green', hex: '#16a34a', type: 'solid' },
    { name: 'White', hex: '#f5f5f5', type: 'solid' },
    { name: 'Gold', hex: '#d4a843', type: 'solid' },
    { name: 'Clear', hex: 'rgba(200,200,200,0.3)', type: 'transparent' },
    { name: 'Smoky Clear', hex: 'rgba(100,100,100,0.4)', type: 'transparent' },
    { name: 'Orange Splatter', hex: '#ea580c', type: 'splatter' },
    { name: 'Purple Splatter', hex: '#9333ea', type: 'splatter' },
    { name: 'Red/Black Swirl', hex: '#991b1b', type: 'swirl' },
    { name: 'Blue/White Swirl', hex: '#3b82f6', type: 'swirl' },
    { name: 'Half Black / Half White', hex: '#555', type: 'half_half' },
    { name: 'Galaxy Purple', hex: '#581c87', type: 'galaxy' },
    { name: 'Galaxy Blue', hex: '#1e3a5f', type: 'galaxy' },
];

// ═══════════════════════════════════════════
// ORDER STATUS
// ═══════════════════════════════════════════

export type PhysicalOrderStatus =
    | 'preorder'
    | 'in_production'
    | 'pressing'
    | 'quality_check'
    | 'ready_to_ship'
    | 'shipped'
    | 'delivered';

export interface OrderStatusConfig {
    label: string;
    color: string;
    bgColor: string;
    description: string;
}

export const ORDER_STATUS_CONFIG: Record<PhysicalOrderStatus, OrderStatusConfig> = {
    preorder: { label: 'Pre-Order', color: 'text-blue-400', bgColor: 'bg-blue-500/10', description: 'Your order is confirmed. Production begins soon.' },
    in_production: { label: 'In Production', color: 'text-amber-400', bgColor: 'bg-amber-500/10', description: 'Your release is being manufactured.' },
    pressing: { label: 'Pressing', color: 'text-orange-400', bgColor: 'bg-orange-500/10', description: 'Vinyl is being pressed at the plant.' },
    quality_check: { label: 'Quality Check', color: 'text-purple-400', bgColor: 'bg-purple-500/10', description: 'Final quality inspection before shipping.' },
    ready_to_ship: { label: 'Ready to Ship', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', description: 'Packed and ready for the courier.' },
    shipped: { label: 'Shipped', color: 'text-green-400', bgColor: 'bg-green-500/10', description: 'On its way to you!' },
    delivered: { label: 'Delivered', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', description: 'Enjoy your music.' },
};

// ═══════════════════════════════════════════
// FORMAT CATEGORIES
// ═══════════════════════════════════════════

export const FORMAT_CATEGORIES = [
    { key: 'vinyl', label: 'Vinyl', emoji: '🎵', formats: ['vinyl_standard', 'vinyl_colored', 'vinyl_picture_disc', 'vinyl_180g', 'vinyl_7inch'] },
    { key: 'cd', label: 'CD', emoji: '💿', formats: ['cd_jewel', 'cd_digipak', 'cd_deluxe'] },
    { key: 'cassette', label: 'Cassette', emoji: '📼', formats: ['cassette_standard', 'cassette_chrome'] },
    { key: 'usb', label: 'USB', emoji: '🔌', formats: ['usb_custom'] },
    { key: 'bundle', label: 'Bundle', emoji: '🎁', formats: ['bundle'] },
] as const;

/** Get formats by category */
export function getFormatsByCategory(category: string): PhysicalFormatConfig[] {
    return Object.values(PHYSICAL_FORMATS).filter(f => f.category === category);
}
