/**
 * EventTicketConfig — Event types, ticket tiers, venue types, ticket status.
 * 
 * Defines every kind of event an artist can host and every ticket tier
 * they can sell. From local club nights to virtual listening parties.
 */

// ═══════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════

export type EventType =
    | 'show'
    | 'listening_party'
    | 'meet_greet'
    | 'workshop'
    | 'studio_session'
    | 'release_party'
    | 'festival'
    | 'pop_up_shop'
    | 'virtual_concert'
    | 'virtual_listening'
    | 'open_mic'
    | 'cypher';

export interface EventTypeConfig {
    type: EventType;
    label: string;
    emoji: string;
    category: 'live' | 'virtual' | 'experience';
    description: string;
    /** Typical capacity range */
    capacityRange: [number, number];
    /** Suggested base ticket price range */
    priceRange: [number, number];
    /** Does this event support VIP/meet-greet add-ons */
    supportsVIP: boolean;
    /** Can be streamed to non-ticket holders */
    supportsLivestream: boolean;
}

export const EVENT_TYPES: Record<EventType, EventTypeConfig> = {
    show: {
        type: 'show', label: 'Live Show', emoji: '🎤',
        category: 'live', description: 'Full performance at a venue',
        capacityRange: [50, 5000], priceRange: [10, 100],
        supportsVIP: true, supportsLivestream: true,
    },
    listening_party: {
        type: 'listening_party', label: 'Listening Party', emoji: '🎧',
        category: 'live', description: 'Exclusive album preview with commentary',
        capacityRange: [20, 200], priceRange: [15, 50],
        supportsVIP: true, supportsLivestream: true,
    },
    meet_greet: {
        type: 'meet_greet', label: 'Meet & Greet', emoji: '🤝',
        category: 'experience', description: 'Intimate fan experience with photo ops',
        capacityRange: [10, 50], priceRange: [50, 250],
        supportsVIP: false, supportsLivestream: false,
    },
    workshop: {
        type: 'workshop', label: 'Production Workshop', emoji: '🎹',
        category: 'experience', description: 'Hands-on music production masterclass',
        capacityRange: [5, 30], priceRange: [25, 150],
        supportsVIP: false, supportsLivestream: true,
    },
    studio_session: {
        type: 'studio_session', label: 'Studio Session', emoji: '🎙️',
        category: 'experience', description: 'Watch/participate in a live recording session',
        capacityRange: [5, 15], priceRange: [75, 300],
        supportsVIP: false, supportsLivestream: true,
    },
    release_party: {
        type: 'release_party', label: 'Release Party', emoji: '🎉',
        category: 'live', description: 'Album/single release celebration event',
        capacityRange: [50, 500], priceRange: [15, 75],
        supportsVIP: true, supportsLivestream: true,
    },
    festival: {
        type: 'festival', label: 'Festival', emoji: '🎪',
        category: 'live', description: 'Multi-artist, multi-stage event',
        capacityRange: [500, 50000], priceRange: [50, 500],
        supportsVIP: true, supportsLivestream: true,
    },
    pop_up_shop: {
        type: 'pop_up_shop', label: 'Pop-Up Shop', emoji: '🏪',
        category: 'experience', description: 'Exclusive merch drop + in-person shopping',
        capacityRange: [20, 200], priceRange: [0, 25],
        supportsVIP: false, supportsLivestream: false,
    },
    virtual_concert: {
        type: 'virtual_concert', label: 'Virtual Concert', emoji: '📡',
        category: 'virtual', description: 'Live-streamed performance with virtual tickets',
        capacityRange: [100, 100000], priceRange: [5, 30],
        supportsVIP: true, supportsLivestream: true,
    },
    virtual_listening: {
        type: 'virtual_listening', label: 'Virtual Listening Party', emoji: '🖥️',
        category: 'virtual', description: 'Online album playback with live chat + commentary',
        capacityRange: [50, 10000], priceRange: [0, 15],
        supportsVIP: false, supportsLivestream: true,
    },
    open_mic: {
        type: 'open_mic', label: 'Open Mic', emoji: '🎙️',
        category: 'live', description: 'Community open mic night',
        capacityRange: [20, 200], priceRange: [0, 15],
        supportsVIP: false, supportsLivestream: true,
    },
    cypher: {
        type: 'cypher', label: 'Cypher / Freestyle', emoji: '🔥',
        category: 'live', description: 'Freestyle rap/music cypher session',
        capacityRange: [20, 300], priceRange: [5, 25],
        supportsVIP: false, supportsLivestream: true,
    },
};

// ═══════════════════════════════════════════
// TICKET TIERS
// ═══════════════════════════════════════════

export type TicketTier = 'general' | 'early_bird' | 'vip' | 'backstage' | 'platinum';

export interface TicketTierConfig {
    tier: TicketTier;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    /** Default multiplier from base price */
    priceMultiplier: number;
    description: string;
    perks: string[];
}

export const TICKET_TIERS: Record<TicketTier, TicketTierConfig> = {
    general: {
        tier: 'general', label: 'General Admission', emoji: '🎫',
        color: 'text-gray-300', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20',
        priceMultiplier: 1.0,
        description: 'Standard entry to the event',
        perks: ['Event access', 'Standing room'],
    },
    early_bird: {
        tier: 'early_bird', label: 'Early Bird', emoji: '🐦',
        color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20',
        priceMultiplier: 0.75,
        description: 'Discounted price for early supporters',
        perks: ['Event access', 'Standing room', '25% discount'],
    },
    vip: {
        tier: 'vip', label: 'VIP', emoji: '⭐',
        color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20',
        priceMultiplier: 2.0,
        description: 'Premium experience with exclusive access',
        perks: ['Priority entry', 'VIP lounge access', 'Free drink', 'Exclusive merch item'],
    },
    backstage: {
        tier: 'backstage', label: 'Backstage Pass', emoji: '🎤',
        color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
        priceMultiplier: 3.5,
        description: 'Backstage access + meet the artist',
        perks: ['All VIP perks', 'Backstage access', 'Meet & greet', 'Signed merch', 'Photo op'],
    },
    platinum: {
        tier: 'platinum', label: 'Platinum', emoji: '👑',
        color: 'text-cyan-300', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20',
        priceMultiplier: 5.0,
        description: 'Ultimate package — the full experience',
        perks: ['All Backstage perks', 'Private soundcheck viewing', 'Dinner with artist', 'Studio tour', 'Lifetime MixxClub Pro'],
    },
};

// ═══════════════════════════════════════════
// VENUE TYPES
// ═══════════════════════════════════════════

export type VenueType = 'club' | 'theater' | 'arena' | 'outdoor' | 'studio' | 'rooftop' | 'gallery' | 'virtual' | 'other';

export interface VenueTypeConfig {
    type: VenueType;
    label: string;
    emoji: string;
}

export const VENUE_TYPES: Record<VenueType, VenueTypeConfig> = {
    club: { type: 'club', label: 'Club / Bar', emoji: '🍸' },
    theater: { type: 'theater', label: 'Theater / Concert Hall', emoji: '🎭' },
    arena: { type: 'arena', label: 'Arena / Stadium', emoji: '🏟️' },
    outdoor: { type: 'outdoor', label: 'Outdoor / Park', emoji: '🌿' },
    studio: { type: 'studio', label: 'Recording Studio', emoji: '🎙️' },
    rooftop: { type: 'rooftop', label: 'Rooftop', emoji: '🌃' },
    gallery: { type: 'gallery', label: 'Art Gallery', emoji: '🖼️' },
    virtual: { type: 'virtual', label: 'Virtual / Online', emoji: '📡' },
    other: { type: 'other', label: 'Other', emoji: '📍' },
};

// ═══════════════════════════════════════════
// TICKET STATUS
// ═══════════════════════════════════════════

export type TicketStatus = 'valid' | 'used' | 'refunded' | 'expired' | 'transferred';

export interface TicketStatusConfig {
    label: string;
    color: string;
    bgColor: string;
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, TicketStatusConfig> = {
    valid: { label: 'Valid', color: 'text-green-400', bgColor: 'bg-green-500/10' },
    used: { label: 'Used', color: 'text-muted-foreground', bgColor: 'bg-white/5' },
    refunded: { label: 'Refunded', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    expired: { label: 'Expired', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    transferred: { label: 'Transferred', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
};

// ═══════════════════════════════════════════
// EVENT STATUS
// ═══════════════════════════════════════════

export type EventStatus = 'draft' | 'on_sale' | 'sold_out' | 'live' | 'ended' | 'cancelled';

export const EVENT_STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Draft', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
    on_sale: { label: 'On Sale', color: 'text-green-400', bgColor: 'bg-green-500/10' },
    sold_out: { label: 'SOLD OUT', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    live: { label: '🔴 LIVE NOW', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    ended: { label: 'Ended', color: 'text-muted-foreground', bgColor: 'bg-white/5' },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════

export const EVENT_CATEGORIES = [
    { key: 'live', label: 'Live Events', emoji: '🎤', types: ['show', 'listening_party', 'release_party', 'festival', 'open_mic', 'cypher'] },
    { key: 'virtual', label: 'Virtual', emoji: '📡', types: ['virtual_concert', 'virtual_listening'] },
    { key: 'experience', label: 'Experiences', emoji: '✨', types: ['meet_greet', 'workshop', 'studio_session', 'pop_up_shop'] },
] as const;
