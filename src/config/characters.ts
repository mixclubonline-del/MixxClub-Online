/**
 * MixxClub Character System
 * 
 * Prime = The OG, North Star, Studio Owner
 * Jax = Artist Entry Point
 * Rell = Engineer Entry Point
 * Nova = Community/Culture Pulse
 */

export type CharacterId = 'prime' | 'jax' | 'rell' | 'nova';

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
    locations: ['GlobalPrimeChat', 'CRM coaching', 'Studio guidance', 'Dream Engine']
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
    locations: ['Artist landing hero', 'Upload CTAs', 'Artist onboarding', 'Artist CRM intro']
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
    locations: ['Engineer landing hero', 'Revenue sections', 'Engineer CRM', 'Membership tiers']
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
      "Everybody starts somewhere.",
      "You're in the right room.",
      "Who's dropping heat today?"
    ],
    locations: ['Community sections', 'Achievements', 'Success moments', 'Empty states']
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
