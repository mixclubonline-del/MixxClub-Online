/**
 * MerchConfig — Garment types, size charts, color system, product categories.
 * 
 * The DNA of every merch item on MixxClub.
 * This file defines what can be created, what sizes exist, and how colors display.
 */

// ═══════════════════════════════════════════
// GARMENT TYPES
// ═══════════════════════════════════════════

export type GarmentType =
    | 'tee'
    | 'hoodie'
    | 'crewneck'
    | 'jacket'
    | 'joggers'
    | 'shorts'
    | 'tank'
    | 'hat'
    | 'beanie'
    | 'snapback'
    | 'dad_hat'
    | 'bucket_hat'
    | 'poster'
    | 'sticker_pack'
    | 'tote'
    | 'phone_case'
    | 'pin_set'
    | 'chain'
    | 'custom';

export interface GarmentTypeConfig {
    type: GarmentType;
    label: string;
    emoji: string;
    category: 'apparel' | 'headwear' | 'accessories' | 'art';
    hasSizes: boolean;
    sizeChart: string[];
    /** Typical retail price range in USD */
    priceRange: [number, number];
    /** Suggested markup from base cost */
    suggestedMargin: number;
}

export const GARMENT_TYPES: Record<GarmentType, GarmentTypeConfig> = {
    tee: {
        type: 'tee', label: 'T-Shirt', emoji: '👕',
        category: 'apparel', hasSizes: true,
        sizeChart: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        priceRange: [20, 40], suggestedMargin: 2.5,
    },
    hoodie: {
        type: 'hoodie', label: 'Hoodie', emoji: '🧥',
        category: 'apparel', hasSizes: true,
        sizeChart: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        priceRange: [45, 85], suggestedMargin: 2.0,
    },
    crewneck: {
        type: 'crewneck', label: 'Crewneck', emoji: '🧶',
        category: 'apparel', hasSizes: true,
        sizeChart: ['S', 'M', 'L', 'XL', '2XL'],
        priceRange: [35, 65], suggestedMargin: 2.2,
    },
    jacket: {
        type: 'jacket', label: 'Jacket', emoji: '🧥',
        category: 'apparel', hasSizes: true,
        sizeChart: ['S', 'M', 'L', 'XL', '2XL'],
        priceRange: [75, 200], suggestedMargin: 1.8,
    },
    joggers: {
        type: 'joggers', label: 'Joggers', emoji: '👖',
        category: 'apparel', hasSizes: true,
        sizeChart: ['S', 'M', 'L', 'XL', '2XL'],
        priceRange: [40, 70], suggestedMargin: 2.0,
    },
    shorts: {
        type: 'shorts', label: 'Shorts', emoji: '🩳',
        category: 'apparel', hasSizes: true,
        sizeChart: ['S', 'M', 'L', 'XL', '2XL'],
        priceRange: [30, 55], suggestedMargin: 2.2,
    },
    tank: {
        type: 'tank', label: 'Tank Top', emoji: '🎽',
        category: 'apparel', hasSizes: true,
        sizeChart: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        priceRange: [18, 35], suggestedMargin: 2.5,
    },
    hat: {
        type: 'hat', label: 'Hat', emoji: '🧢',
        category: 'headwear', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [25, 40], suggestedMargin: 2.5,
    },
    beanie: {
        type: 'beanie', label: 'Beanie', emoji: '🧣',
        category: 'headwear', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [20, 35], suggestedMargin: 2.5,
    },
    snapback: {
        type: 'snapback', label: 'Snapback', emoji: '🧢',
        category: 'headwear', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [28, 45], suggestedMargin: 2.3,
    },
    dad_hat: {
        type: 'dad_hat', label: 'Dad Hat', emoji: '🧢',
        category: 'headwear', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [22, 38], suggestedMargin: 2.5,
    },
    bucket_hat: {
        type: 'bucket_hat', label: 'Bucket Hat', emoji: '🎩',
        category: 'headwear', hasSizes: true,
        sizeChart: ['S/M', 'L/XL'],
        priceRange: [25, 42], suggestedMargin: 2.3,
    },
    poster: {
        type: 'poster', label: 'Poster', emoji: '🖼️',
        category: 'art', hasSizes: true,
        sizeChart: ['11x17"', '18x24"', '24x36"'],
        priceRange: [12, 35], suggestedMargin: 3.0,
    },
    sticker_pack: {
        type: 'sticker_pack', label: 'Sticker Pack', emoji: '✨',
        category: 'accessories', hasSizes: false,
        sizeChart: ['Pack'],
        priceRange: [5, 15], suggestedMargin: 4.0,
    },
    tote: {
        type: 'tote', label: 'Tote Bag', emoji: '👜',
        category: 'accessories', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [15, 30], suggestedMargin: 3.0,
    },
    phone_case: {
        type: 'phone_case', label: 'Phone Case', emoji: '📱',
        category: 'accessories', hasSizes: true,
        sizeChart: ['iPhone 14', 'iPhone 15', 'iPhone 15 Pro', 'iPhone 16', 'Galaxy S24', 'Pixel 8'],
        priceRange: [20, 40], suggestedMargin: 2.5,
    },
    pin_set: {
        type: 'pin_set', label: 'Pin Set', emoji: '📌',
        category: 'accessories', hasSizes: false,
        sizeChart: ['Set'],
        priceRange: [8, 20], suggestedMargin: 3.0,
    },
    chain: {
        type: 'chain', label: 'Chain / Pendant', emoji: '⛓️',
        category: 'accessories', hasSizes: true,
        sizeChart: ['18"', '20"', '24"', '30"'],
        priceRange: [25, 100], suggestedMargin: 2.0,
    },
    custom: {
        type: 'custom', label: 'Custom Item', emoji: '🎨',
        category: 'accessories', hasSizes: false,
        sizeChart: ['One Size'],
        priceRange: [10, 200], suggestedMargin: 2.0,
    },
};

// ═══════════════════════════════════════════
// COLOR SYSTEM
// ═══════════════════════════════════════════

export interface MerchColor {
    name: string;
    hex: string;
    textOnColor: 'white' | 'black';
}

export const MERCH_COLORS: MerchColor[] = [
    { name: 'Black', hex: '#0a0a0a', textOnColor: 'white' },
    { name: 'White', hex: '#f5f5f5', textOnColor: 'black' },
    { name: 'Charcoal', hex: '#2d2d2d', textOnColor: 'white' },
    { name: 'Heather Gray', hex: '#9ca3af', textOnColor: 'black' },
    { name: 'Navy', hex: '#1e3a5f', textOnColor: 'white' },
    { name: 'Forest Green', hex: '#14532d', textOnColor: 'white' },
    { name: 'Burgundy', hex: '#6b1d3a', textOnColor: 'white' },
    { name: 'Cream', hex: '#f5f0e1', textOnColor: 'black' },
    { name: 'Sand', hex: '#c2b280', textOnColor: 'black' },
    { name: 'Rust', hex: '#b7410e', textOnColor: 'white' },
    { name: 'Olive', hex: '#556b2f', textOnColor: 'white' },
    { name: 'Lavender', hex: '#b8a9c9', textOnColor: 'black' },
    { name: 'Powder Blue', hex: '#b0d4f1', textOnColor: 'black' },
    { name: 'Sage', hex: '#9CAF88', textOnColor: 'black' },
    { name: 'Bone', hex: '#e8dcc8', textOnColor: 'black' },
    { name: 'Vintage Black', hex: '#1a1a1a', textOnColor: 'white' },
    { name: 'Washed Black', hex: '#333333', textOnColor: 'white' },
    { name: 'Tie-Dye', hex: 'linear-gradient(135deg, #667eea, #764ba2, #f5af19)', textOnColor: 'white' },
];

// ═══════════════════════════════════════════
// DROP STATUS
// ═══════════════════════════════════════════

export type DropStatus = 'draft' | 'scheduled' | 'live' | 'sold_out' | 'ended';

export interface DropStatusConfig {
    label: string;
    color: string;
    bgColor: string;
}

export const DROP_STATUS_CONFIG: Record<DropStatus, DropStatusConfig> = {
    draft: { label: 'Draft', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
    scheduled: { label: 'Scheduled', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    live: { label: '🔴 LIVE', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    sold_out: { label: 'SOLD OUT', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    ended: { label: 'Ended', color: 'text-muted-foreground', bgColor: 'bg-white/5' },
};

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════

export const MERCH_CATEGORIES = [
    { key: 'apparel', label: 'Apparel', emoji: '👕', types: ['tee', 'hoodie', 'crewneck', 'jacket', 'joggers', 'shorts', 'tank'] },
    { key: 'headwear', label: 'Headwear', emoji: '🧢', types: ['hat', 'beanie', 'snapback', 'dad_hat', 'bucket_hat'] },
    { key: 'accessories', label: 'Accessories', emoji: '⛓️', types: ['chain', 'pin_set', 'sticker_pack', 'tote', 'phone_case'] },
    { key: 'art', label: 'Art & Prints', emoji: '🖼️', types: ['poster'] },
] as const;

/** Get garment types by category */
export function getTypesByCategory(category: string): GarmentTypeConfig[] {
    return Object.values(GARMENT_TYPES).filter(t => t.category === category);
}

/** Get all garment types as an array */
export function getAllGarmentTypes(): GarmentTypeConfig[] {
    return Object.values(GARMENT_TYPES);
}
