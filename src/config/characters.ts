/**
 * MixxClub Character System
 * 
 * Prime = Lead Engineer / The OG — "the adult in the room"
 * Jax = Artist Entry Point
 * Rell = Producer — beats, catalogs, legacy
 * Nova = Fan / Community Pulse
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
  | 'beats'
  | 'sales'
  | 'collabs'
  | 'catalog'
  | 'feed'
  | 'missions'
  | 'wallet'
  | 'favorites'
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
    role: 'Lead Engineer / The OG',
    tagline: 'The OG. The adult in the room.',
    voiceId: 'n2GT0XqyIfmevnaDjYT0', // Mature Hip-hop head
    avatarPath: '/assets/prime-pointing.jpg',
    accentColor: 'hsl(var(--primary))',
    accentGlow: 'shadow-glow-raven',
    personality: ['Wise', 'Direct', 'Industry veteran', 'Engineering authority'],
    sampleQuotes: [
      "Welcome to the club.",
      "I've been where you're trying to go.",
      "Let's build something legendary.",
      "I don't rush mixes. I deliver.",
      "If the system's solid, the work speaks.",
      "The mix is everything. Get it right."
    ],
    locations: ['GlobalPrimeChat', 'CRM coaching', 'Studio guidance', 'Dream Engine', 'Engineer CRM', 'Mixing sessions'],
    onboardingQuotes: [
      "Welcome. Let's build something.",
      "I've been where you're trying to go.",
      "Trust the process.",
      "Welcome to the club. Let's get legendary.",
      "Build your profile. Let the work speak.",
      "Know your worth. Set your price."
    ],
    contextQuotes: {
      sessions: "The right session is waiting. I've got ears on everything.",
      clients: "Your first client is around the corner. Stay ready.",
      earnings: "Your bag is on the way. Stack it when it hits.",
      reviews: "No reviews yet. Your work will speak soon.",
      payments: "Payments hit different when they're for your craft.",
      loading: "Good things take time. We're building something.",
      generic: "Empty for now. But I've seen empires start emptier."
    }
  },
  jax: {
    id: 'jax',
    name: 'Jax',
    role: 'The Artist',
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
      "Goals locked. Let's get you in the mix."
    ]
  },
  rell: {
    id: 'rell',
    name: 'Rell',
    role: 'The Producer',
    tagline: 'The beat is the foundation.',
    voiceId: 'CwhRBWXzGAHq8TQ4Fs17', // Professional male (Roger)
    avatarPath: '/assets/characters/rell-portrait.png',
    accentColor: 'hsl(var(--secondary))',
    accentGlow: 'shadow-[0_0_20px_hsl(var(--secondary)_/_0.4)]',
    personality: ['Creative', 'Rhythm-focused', 'Collaborative', 'Business-aware'],
    sampleQuotes: [
      "Every hit starts with a beat.",
      "I make the canvas. Artists paint on it.",
      "The pocket is everything.",
      "Your sound is your signature.",
      "Stack the catalog. Build the legacy."
    ],
    locations: ['Producer landing', 'Beat marketplace', 'Producer CRM', 'Producer onboarding', 'Revenue sections'],
    onboardingQuotes: [
      "Your sound. Your signature.",
      "What's your production style?",
      "Ready to get your beats heard.",
      "The game needs your sound."
    ],
    contextQuotes: {
      beats: "Your catalog is your legacy. Keep stacking.",
      sales: "Every sale is proof your sound connects.",
      collabs: "The right artist is out there. Let's link up.",
      catalog: "Your beats are your portfolio. Make them shine.",
      earnings: "Tired of chasing invoices. Not anymore.",
      loading: "Good things take time. We're building something.",
      search: "Searching for the right vibe? Adjust the frequency.",
      generic: "Empty for now, but not for long. Stack that catalog."
    }
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    role: 'The Fan / Community Pulse',
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
    locations: ['Community sections', 'Achievements', 'Success moments', 'Empty states', 'Fan CRM'],
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
      feed: "The feed is quiet. Be the first to set it off.",
      missions: "Missions unlock rewards. Your first one is loading.",
      wallet: "Your wallet's ready. Time to stack.",
      favorites: "Save what moves you. Build your collection.",
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

// Entry point mapping — which character greets each role
export const ENTRY_POINT_CHARACTERS: Record<'artist' | 'engineer' | 'producer' | 'fan' | 'community', CharacterId> = {
  artist: 'jax',
  engineer: 'prime',
  producer: 'rell',
  fan: 'nova',
  community: 'nova',
};
