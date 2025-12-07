import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demo engineers data - these represent what real engineers would look like
const demoEngineers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Marcus "808King" Williams',
    email: 'marcus@mixclub.demo',
    bio: 'Grammy-nominated mixing engineer specializing in trap and hip-hop. Known for hard-hitting 808s and crystal-clear vocals. Worked with major labels.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus808',
    role: 'engineer',
    specialties: ['Mixing', 'Trap', '808s', 'Hip-Hop'],
    hourly_rate: 150,
    years_experience: 8,
    genres: ['Trap', 'Hip-Hop', 'Drill'],
    rating: 4.9,
    completed_projects: 247,
    availability_status: 'available',
    points: 15000,
    level: 12
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Jasmine "VelvetMix" Chen',
    email: 'jasmine@mixclub.demo',
    bio: 'R&B and soul specialist with 10+ years experience. Platinum credits on multiple projects. I bring warmth and depth to every mix.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JasmineVelvet',
    role: 'engineer',
    specialties: ['Mixing', 'R&B', 'Vocals', 'Soul'],
    hourly_rate: 200,
    years_experience: 12,
    genres: ['R&B', 'Soul', 'Neo-Soul', 'Pop'],
    rating: 4.95,
    completed_projects: 312,
    availability_status: 'available',
    points: 22000,
    level: 16
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'DeShawn "BoomBap" Thompson',
    email: 'deshawn@mixclub.demo',
    bio: 'Old school meets new school. J Dilla-inspired production and mixing. Vinyl textures, MPC swing, and that authentic boom bap sound.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeShawnBoomBap',
    role: 'engineer',
    specialties: ['Mixing', 'Boom Bap', 'Sampling', 'Vinyl'],
    hourly_rate: 125,
    years_experience: 15,
    genres: ['Boom Bap', 'Jazz Rap', 'Lo-Fi', 'Hip-Hop'],
    rating: 4.85,
    completed_projects: 189,
    availability_status: 'busy',
    points: 18000,
    level: 14
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Luna "MasterLuna" Rodriguez',
    email: 'luna@mixclub.demo',
    bio: 'Mastering engineer with Dolby Atmos certification. I make your music streaming-ready while preserving dynamics. -14 LUFS done right.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LunaMaster',
    role: 'engineer',
    specialties: ['Mastering', 'Dolby Atmos', 'Streaming', 'Vinyl Prep'],
    hourly_rate: 250,
    years_experience: 10,
    genres: ['All Genres'],
    rating: 4.98,
    completed_projects: 523,
    availability_status: 'available',
    points: 28000,
    level: 18
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Kwame "DrillKing" Asante',
    email: 'kwame@mixclub.demo',
    bio: 'UK Drill and Chicago Drill specialist. Dark atmospheres, sliding 808s, and aggressive drums. Let me bring that raw energy to your tracks.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KwameDrill',
    role: 'engineer',
    specialties: ['Mixing', 'UK Drill', 'Chicago Drill', 'Dark Beats'],
    hourly_rate: 100,
    years_experience: 5,
    genres: ['UK Drill', 'Chicago Drill', 'Trap', 'Grime'],
    rating: 4.75,
    completed_projects: 98,
    availability_status: 'available',
    points: 9500,
    level: 8
  }
];

// Demo sessions - open collaborations
const demoSessions = [
  {
    id: '11111111-aaaa-1111-aaaa-111111111111',
    title: 'Need mixing for 808-heavy trap banger',
    description: 'Got a hard-hitting trap track that needs professional mixing. Heavy 808s, crispy hi-hats, and aggressive vocals. Looking for someone who knows that Metro Boomin sound.',
    status: 'open',
    session_type: 'mixing',
    visibility: 'public',
    audio_quality: 'high',
    budget_range: '$150-300',
    genre: 'Trap',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    host: {
      name: 'YoungArtist2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YoungArtist'
    }
  },
  {
    id: '22222222-bbbb-2222-bbbb-222222222222',
    title: 'Looking for mastering on EP - 6 tracks',
    description: 'R&B/Soul EP ready for mastering. Tracks are mixed and need that final polish. Need someone who understands the genre and can make it sound warm but competitive on streaming.',
    status: 'open',
    session_type: 'mastering',
    visibility: 'public',
    audio_quality: 'high',
    budget_range: '$400-600',
    genre: 'R&B',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    host: {
      name: 'SoulSingerK',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SoulSinger'
    }
  },
  {
    id: '33333333-cccc-3333-cccc-333333333333',
    title: 'Vocals need tuning and FX for drill track',
    description: 'UK Drill track with raw vocals recorded. Need pitch correction, ad-libs processed, and that signature drill vocal chain. Reference: Central Cee style.',
    status: 'open',
    session_type: 'vocal_production',
    visibility: 'public',
    audio_quality: 'high',
    budget_range: '$100-200',
    genre: 'UK Drill',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    host: {
      name: 'DrillRapper_UK',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrillRapper'
    }
  },
  {
    id: '44444444-dddd-4444-dddd-444444444444',
    title: 'Full mix + master for debut single',
    description: 'Hip-hop/Pop crossover single. Female vocals over melodic trap production. This is my first official release so I want it done right. Budget flexible for the right engineer.',
    status: 'open',
    session_type: 'full_production',
    visibility: 'public',
    audio_quality: 'high',
    budget_range: '$300-500',
    genre: 'Hip-Hop/Pop',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    host: {
      name: 'RisingStarMel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RisingStar'
    }
  },
  {
    id: '55555555-eeee-5555-eeee-555555555555',
    title: 'Lo-fi hip-hop beat needs mixing',
    description: 'Chill lo-fi beat with jazz samples and vinyl texture. Looking for someone who knows the lo-fi aesthetic - warm, nostalgic, with that tape saturation feel.',
    status: 'open',
    session_type: 'mixing',
    visibility: 'public',
    audio_quality: 'standard',
    budget_range: '$75-150',
    genre: 'Lo-Fi',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    host: {
      name: 'ChillBeats247',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChillBeats'
    }
  }
];

// Demo activity feed
const demoActivity = [
  {
    type: 'session_completed',
    message: 'Marcus "808King" completed a mixing session',
    time: '5 minutes ago',
    icon: 'check-circle'
  },
  {
    type: 'new_engineer',
    message: 'New engineer joined: Kwame "DrillKing" Asante',
    time: '1 hour ago',
    icon: 'user-plus'
  },
  {
    type: 'payment',
    message: 'Luna "MasterLuna" earned $500 for mastering EP',
    time: '2 hours ago',
    icon: 'dollar-sign'
  },
  {
    type: 'session_started',
    message: 'Live collaboration session started',
    time: '3 hours ago',
    icon: 'play-circle'
  },
  {
    type: 'review',
    message: 'Jasmine "VelvetMix" received a 5-star review',
    time: '4 hours ago',
    icon: 'star'
  }
];

// Platform stats
const platformStats = {
  totalEngineers: 247,
  activeSession: 18,
  projectsCompleted: 3847,
  totalEarnings: 892450
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json().catch(() => ({ type: 'all' }));

    let responseData: any = {};

    switch (type) {
      case 'engineers':
        responseData = { engineers: demoEngineers };
        break;
      case 'sessions':
        responseData = { sessions: demoSessions };
        break;
      case 'activity':
        responseData = { activity: demoActivity };
        break;
      case 'stats':
        responseData = { stats: platformStats };
        break;
      case 'all':
      default:
        responseData = {
          engineers: demoEngineers,
          sessions: demoSessions,
          activity: demoActivity,
          stats: platformStats
        };
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get demo data error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
