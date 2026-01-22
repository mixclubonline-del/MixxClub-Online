/**
 * MixxClub Character System
 * 
 * Prime = The OG, North Star, Studio Owner
 * Jax = Artist Entry Point
 * Rell = Engineer Entry Point
 * Nova = Community/Culture Pulse
 */

export type CharacterId = 'prime' | 'jax' | 'rell' | 'nova';

export type EmptyStateContext = 
  | 'sessions' 
  | 'projects' 
  | 'matches' 
  | 'messages' 
  | 'tracks'
  | 'clients'
  | 'loading'
  | 'search'
  | 'earnings'
  | 'partnerships'
  | 'saved-items'
  | 'notifications'
  | 'activity'
  | 'reviews'
  | 'payments'
  | 'generic';

export interface MixxClubCharacter {
  id: CharacterId;
  name: string;
  role: string;
  tagline: string;
  voiceId: string;
  avatarPath: string;
  accentColor: string;
  accentGlow: string;
  personality: string[];
  sampleQuotes: string[];
  locations: string[];
  contextQuotes?: Partial<Record<EmptyStateContext, string>>;
  onboardingQuotes?: string[];
}

export const MIXXCLUB_CHARACTERS: Record<CharacterId, MixxClubCharacter> = {
  prime: {
    id: 'prime',
    name: 'Prime',
    role: 'Studio Owner / Mentor',
    tagline: 'The OG. Your north star.',
    voiceId: 'n2GT0XqyIfmevnaDjYT0', // Mature Hip-hop head
    avatarPath: '/assets/prime-pointing.jpg',
    accentColor: 'hsl(var(--primary))',
    accentGlow: 'shadow-glow-raven',
    personality: ['Wise', 'Direct', 'Industry veteran'],
    sampleQuotes: [
      "Welcome to the club.",
      "I've been where you're trying to go.",
      "Let's build something legendary."
    ],
    locations: ['GlobalPrimeChat', 'CRM coaching', 'Studio guidance', 'Dream Engine'],
    onboardingQuotes: [
      "Welcome. Let's build something.",
      "I've been where you're trying to go.",
      "Trust the process.",
      "Welcome to the club. Let's get legendary."
    ]
  },
  jax: {
    id: 'jax',
    name: 'Jax',
    role: 'Artist Entry',
    tagline: 'Your vision. Perfected.',
    voiceId: '6OzrBCQf8cjERkYgzSg8', // Young energy voice
    avatarPath: '/assets/characters/jax-portrait.png',
    accentColor: 'hsl(142 76% 36%)', // Green accent
    accentGlow: 'shadow-[0_0_20px_hsl(142_76%_36%_/_0.4)]',
    personality: ['Quiet confidence', 'Curious', 'Straight talk'],
    sampleQuotes: [
      "I got the idea. I just need it to sound right.",
      "I'm not here to play—let's get it clean.",
      "Finally decided to stop guessing."
    ],
    locations: ['Artist landing hero', 'Upload CTAs', 'Artist onboarding', 'Artist CRM intro'],
    onboardingQuotes: [
      "Your name is your brand. Claim it.",
      "Hip-hop, R&B, Drill... what's in your DNA?",
      "Mixing? Mastering? Collabs? Let's lock it in.",
      "You did that. Prime's got you from here."
    ]
  },
  rell: {
    id: 'rell',
    name: 'Rell',
    role: 'Engineer Entry',
    tagline: 'The craft speaks for itself.',
    voiceId: 'CwhRBWXzGAHq8TQ4Fs17', // Professional male (Roger)
    avatarPath: '/assets/characters/rell-portrait.png',
    accentColor: 'hsl(var(--secondary))',
    accentGlow: 'shadow-[0_0_20px_hsl(var(--secondary)_/_0.4)]',
    personality: ['Direct', 'No ego', 'Business-aware'],
    sampleQuotes: [
      "I don't rush mixes. I deliver.",
      "If the system's solid, the work speaks.",
      "Tired of chasing invoices."
    ],
    locations: ['Engineer landing hero', 'Revenue sections', 'Engineer CRM', 'Membership tiers'],
    onboardingQuotes: [
      "Build your profile. Let the work speak.",
      "Mixing, mastering, sound design... what's your bag?",
      "Know your worth. Set your price.",
      "Locked in. Prime's got it from here."
    ]
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    role: 'Community Pulse',
    tagline: "You're in the right room.",
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Expressive female (Sarah)
    avatarPath: '/assets/characters/nova-portrait.png',
    accentColor: 'hsl(330 80% 60%)', // Pink/magenta accent
    accentGlow: 'shadow-[0_0_20px_hsl(330_80%_60%_/_0.4)]',
    personality: ['Expressive', 'Encouraging', 'Always in the mix'],
    sampleQuotes: [
      "Everybody starts somewhere. This is that somewhere.",
      "You're exactly where you need to be.",
      "The right connect is out here. We just gotta find them.",
      "Your work has value. We're here to prove it.",
      "This room's about to fill up. You're early.",
      "No gatekeepers. Just creators.",
      "What you build here is yours. Period.",
      "Your sound, your rules.",
      "The culture needs what you're making.",
      "Own your masters. Own your story."
    ],
    locations: ['Community sections', 'Achievements', 'Success moments', 'Empty states'],
    contextQuotes: {
      sessions: "The right session is out there. No cap, we'll find it.",
      projects: "Every legend started with one track. This is yours.",
      matches: "The right engineer is out here. We just gotta connect you.",
      messages: "Silence before the storm. When they slide in, you'll know.",
      tracks: "Your catalogue starts here. Own your sound, own your story.",
      clients: "Your first client is around the corner. Stay ready.",
      loading: "Good things take time. We're building something.",
      search: "Not what you were looking for? Adjust the frequency.",
      earnings: "Your bag is on the way. Stack it when it hits.",
      partnerships: "Collabs build empires. Your first one is coming.",
      'saved-items': "Save what matters. It'll be here when you need it.",
      notifications: "No noise right now. That's a good thing.",
      activity: "The timeline's quiet. Time to make some noise.",
      reviews: "No reviews yet. Your work will speak soon.",
      payments: "Payments hit different when they're for your art.",
      generic: "This room's empty, but not for long. You're building."
    }
  }
};

// Helper to get character by ID
export const getCharacter = (id: CharacterId): MixxClubCharacter => {
  return MIXXCLUB_CHARACTERS[id];
};

// Get a random quote from a character
export const getRandomQuote = (id: CharacterId): string => {
  const character = MIXXCLUB_CHARACTERS[id];
  const quotes = character.sampleQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Get context-specific quote for empty states (Nova speciality)
export const getContextQuote = (id: CharacterId, context: EmptyStateContext): string => {
  const character = MIXXCLUB_CHARACTERS[id];
  return character.contextQuotes?.[context] || getRandomQuote(id);
};

// Voice ID lookup for speech generation
export const CHARACTER_VOICES: Record<CharacterId, string> = {
  prime: 'n2GT0XqyIfmevnaDjYT0',
  jax: '6OzrBCQf8cjERkYgzSg8',
  rell: 'CwhRBWXzGAHq8TQ4Fs17',
  nova: 'EXAVITQu4vr4xnSDxMaL',
};

// Entry point mapping
export const ENTRY_POINT_CHARACTERS: Record<'artist' | 'engineer' | 'community', CharacterId> = {
  artist: 'jax',
  engineer: 'rell',
  community: 'nova',
};
