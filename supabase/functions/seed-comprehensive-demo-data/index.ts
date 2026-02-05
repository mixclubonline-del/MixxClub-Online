import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demo data constants
const FIRST_NAMES = [
  "Marcus", "Aaliyah", "Devon", "Jasmine", "Tyrell", "Keisha", "Brandon",
  "Destiny", "Jordan", "Brianna", "Malik", "Ciara", "Dwayne", "Tiffany",
  "Andre", "Latoya", "Terrence", "Monique", "Jamal", "Ebony", "Xavier",
  "Imani", "DeShawn", "Tamika", "Cedric", "Aisha", "Rashid", "Yolanda",
  "Kareem", "Shaniqua", "Darnell", "Felicia", "Lamar", "Porsha", "Marquis",
  "Kendra", "Jermaine", "Alicia", "Tyrone", "Niesha", "Clarence", "Janelle"
];

const LAST_NAMES = [
  "Williams", "Johnson", "Brown", "Jones", "Davis", "Miller", "Wilson",
  "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
  "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez",
  "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott"
];

const PRODUCER_NAMES = [
  "808Wizard", "BeatGenius", "TrappinTerry", "MelodyMaster", "BassBoss",
  "DrumKing", "SynthLord", "GrooveGod", "BangerzBoy", "HitMachine",
  "VibeMaker", "SoundSmith", "RhythmReaper", "ToneArtist", "LoopLegend",
  "ChopMaster", "SampleSage", "FlowFinder", "WaveCrafter", "BeatBaron"
];

const LOCATIONS = [
  "Los Angeles, CA", "Atlanta, GA", "New York, NY", "Chicago, IL",
  "Houston, TX", "Miami, FL", "Detroit, MI", "Philadelphia, PA",
  "Nashville, TN", "Austin, TX", "Toronto, ON", "London, UK"
];

const GENRES = [
  "Hip-Hop", "R&B", "Trap", "Drill", "Pop", "Afrobeats",
  "Reggaeton", "Soul", "Neo-Soul", "Alternative", "Electronic"
];

const SPECIALTIES = [
  "Mixing", "Mastering", "Vocal Production", "Beat Making",
  "Sound Design", "Recording", "Vocal Tuning", "Stem Mixing", "Dolby Atmos"
];

const BEAT_TITLES = [
  "Midnight Drip", "808 Madness", "Velvet Dreams", "Street Anthem",
  "Neon Nights", "Crown Royal", "Diamond Flow", "Trap Symphony",
  "Dark Nights", "Golden Hour", "Platinum Vibes", "Savage Mode",
  "Cloud Nine", "Purple Rain", "Red Alert", "Blue Monday",
  "Smoke Signals", "Night Owl", "Dawn Patrol", "Sunset Boulevard",
  "City Lights", "Ocean Drive", "Mountain High", "Valley Low",
  "Thunder Roll", "Lightning Strike", "Storm Chaser", "Wind Walker",
  "Fire Starter", "Ice Cold", "Hot Summer", "Cold Winter",
  "Spring Bloom", "Fall Leaves", "Endless Night", "Eternal Day",
  "Shadow Walker", "Light Bearer", "Dark Knight", "Bright Star"
];

const ENGINEER_BIOS = [
  "Grammy-nominated mixing engineer with 10+ years in the game. Specialized in creating radio-ready mixes that slap.",
  "Professional audio engineer focused on hip-hop and R&B. My mixes have over 100M streams on Spotify.",
  "Classically trained, hip-hop raised. I bring technical precision with street authenticity to every project.",
  "Mixing and mastering specialist with credits on major label releases. Let's make your vision reality.",
  "Dolby Atmos certified engineer bringing spatial audio expertise to your tracks.",
  "Vocal specialist who knows how to make your voice cut through any mix. Auto-tune to acoustic.",
  "Beat-focused engineer who understands the low end. Your 808s will hit different.",
  "Full-service audio engineer: tracking, editing, mixing, mastering. One-stop shop.",
  "Independent artist advocate. Boutique quality at indie prices. Let's grow together.",
  "Studio owner and engineer. State-of-the-art facility with vintage warmth."
];

const ARTIST_BIOS = [
  "Rising artist pushing boundaries in modern hip-hop. Next up from the underground.",
  "Genre-bending vocalist blending R&B, hip-hop, and soul. Emotionally raw, sonically refined.",
  "Independent rapper with a message. Real stories, real life, real music.",
  "Singer-songwriter crafting anthems for the culture. Melody meets meaning.",
  "Emerging artist from the streets to the booth. Authentic as it gets."
];

const REVIEW_TEXTS = [
  "Absolutely incredible work! The mix came back sounding better than I ever imagined. Professional, quick, and the attention to detail was unmatched.",
  "This engineer is a true professional. Communication was great throughout the process and the final product exceeded my expectations.",
  "The best mixing experience I've had. They really understood my vision and brought my track to life.",
  "Highly recommend! Quick turnaround without sacrificing quality. Will definitely be back for my next project.",
  "Game changer. My song went from bedroom demo to radio-ready. Worth every penny.",
  "Super talented and easy to work with. Made the whole process smooth and stress-free.",
  "Incredible ear for detail. Caught issues I didn't even notice and fixed them perfectly.",
  "Professional, patient, and passionate about the craft. Exactly what every artist needs.",
  "The vocals sound crystal clear and the mix is perfectly balanced. Amazing work!",
  "Exceeded all my expectations. This is the quality I've been searching for."
];

const ACTIVITY_TYPES = [
  { type: 'session_started', templates: ['Started a new mixing session', 'Kicked off a mastering session', 'Began a recording session'] },
  { type: 'project_completed', templates: ['Completed a mix project', 'Finished mastering an EP', 'Wrapped up a single'] },
  { type: 'achievement', templates: ['Earned the "Top Mixer" badge', 'Unlocked "5-Star Engineer"', 'Achieved "Rising Star" status'] },
  { type: 'review_posted', templates: ['Left a 5-star review', 'Shared positive feedback', 'Recommended an engineer'] },
  { type: 'beat_uploaded', templates: ['Uploaded a new beat', 'Dropped fresh production', 'Released new instrumentals'] },
  { type: 'collab', templates: ['Started collaborating', 'Joined a session', 'Connected with a new artist'] }
];

// Helper functions
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function generateUsername(name: string, index: number): string {
  const suffixes = ['beats', 'audio', 'music', 'sound', 'prod', 'mix', ''];
  const suffix = randomItem(suffixes);
  const base = name.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');
  return suffix ? `${base}${suffix}${index}` : `${base}${index}`;
}

function generateAvatarUrl(seed: string): string {
  const styles = ['avataaars', 'bottts', 'micah', 'adventurer', 'lorelei'];
  const style = randomItem(styles);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function getTimeAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return 'just now';
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
  const days = Math.floor(hoursAgo / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Seeding] Starting comprehensive demo data seeding...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results = {
      profiles: 0,
      engineerProfiles: 0,
      producerBeats: 0,
      sessions: 0,
      reviews: 0,
      follows: 0,
      wallets: 0,
      activities: 0,
      achievements: 0
    };

    // Phase 1: Get existing profiles and update them with demo data
    console.log('[Seeding] Phase 1: Fetching and enriching existing profiles...');
    
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .limit(100);

    if (fetchError) {
      console.error('[Seeding] Fetch error:', fetchError);
      throw new Error('Failed to fetch existing profiles');
    }

    const createdProfileIds: { engineers: string[], artists: string[], producers: string[] } = {
      engineers: [],
      artists: [],
      producers: []
    };

    if (!existingProfiles || existingProfiles.length === 0) {
      throw new Error('No existing profiles found. Please create users first.');
    }

    console.log(`[Seeding] Found ${existingProfiles.length} existing profiles`);

    // Assign roles and enrich profiles
    for (let i = 0; i < existingProfiles.length; i++) {
      const profile = existingProfiles[i];
      let role: string;
      let bio: string;
      
      // Distribute roles: 50% engineers, 30% artists, 20% producers
      if (i < existingProfiles.length * 0.5) {
        role = 'engineer';
        bio = randomItem(ENGINEER_BIOS);
        createdProfileIds.engineers.push(profile.id);
      } else if (i < existingProfiles.length * 0.8) {
        role = 'artist';
        bio = randomItem(ARTIST_BIOS);
        createdProfileIds.artists.push(profile.id);
      } else {
        role = 'producer';
        bio = `Producer crafting heat. Specializing in ${randomItem(GENRES)} beats.`;
        createdProfileIds.producers.push(profile.id);
      }

      // Update profile with enriched data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role,
          bio,
          avatar_url: generateAvatarUrl(profile.full_name || `user${i}`),
          location: randomItem(LOCATIONS),
          is_verified: Math.random() < 0.4,
          points: randomInt(100, 5000),
          level: randomInt(1, 15),
          follower_count: randomInt(50, 5000),
          following_count: randomInt(20, 300),
          profile_views_count: randomInt(100, 10000)
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`[Seeding] Error updating profile ${profile.id}:`, updateError);
      }
    }

    results.profiles = existingProfiles.length;
    console.log(`[Seeding] Enriched ${results.profiles} profiles (${createdProfileIds.engineers.length} engineers, ${createdProfileIds.artists.length} artists, ${createdProfileIds.producers.length} producers)`);

    // Phase 2: Create engineer_profiles for engineers
    console.log('[Seeding] Phase 2: Creating engineer profiles...');
    
    const engineerProfilesData = createdProfileIds.engineers.map((userId, i) => ({
      user_id: userId,
      hourly_rate: randomInt(50, 300),
      years_experience: randomInt(2, 20),
      specialties: randomItems(SPECIALTIES, 2, 4),
      genres: randomItems(GENRES, 2, 5),
      availability_status: Math.random() < 0.7 ? 'available' : 'busy',
      rating: randomFloat(4.2, 5.0),
      completed_projects: randomInt(15, 500)
    }));

    const { error: engineerError } = await supabase
      .from('engineer_profiles')
      .upsert(engineerProfilesData, { onConflict: 'user_id' });

    if (engineerError) {
      console.error('[Seeding] Engineer profile error:', engineerError);
    } else {
      results.engineerProfiles = engineerProfilesData.length;
      console.log(`[Seeding] Created ${results.engineerProfiles} engineer profiles`);
    }

    // Phase 3: Create producer_beats for producers
    console.log('[Seeding] Phase 3: Creating producer beats...');
    
    const beatsData: any[] = [];
    createdProfileIds.producers.forEach((producerId) => {
      const beatCount = randomInt(1, 3);
      for (let j = 0; j < beatCount; j++) {
        beatsData.push({
          producer_id: producerId,
          title: randomItem(BEAT_TITLES) + ` ${randomInt(1, 99)}`,
          genre: randomItem(GENRES),
          bpm: randomInt(80, 160),
          key_signature: randomItem(['C Major', 'A Minor', 'G Major', 'E Minor', 'D Major', 'B Minor']),
          price_cents: randomInt(1999, 9999),
          exclusive_price_cents: randomInt(9999, 49999),
          plays: randomInt(100, 50000),
          downloads: randomInt(10, 500),
          mood: [randomItem(['dark', 'energetic', 'chill', 'aggressive', 'melodic', 'bouncy'])],
          tags: randomItems(['trap', 'drill', 'melodic', 'hard', 'chill', 'vibe', 'club', 'radio'], 2, 4),
          is_exclusive_available: true,
          status: 'active'
        });
      }
    });

    if (beatsData.length > 0) {
      const { error: beatsError } = await supabase
        .from('producer_beats')
        .insert(beatsData);

      if (beatsError) {
        console.error('[Seeding] Beats error:', beatsError);
      } else {
        results.producerBeats = beatsData.length;
        console.log(`[Seeding] Created ${results.producerBeats} producer beats`);
      }
    }

    // Phase 4: Create collaboration_sessions (using valid status values: active, completed, cancelled)
    console.log('[Seeding] Phase 4: Creating collaboration sessions...');
    
    let createdSessionIds: string[] = [];
    
    if (createdProfileIds.engineers.length > 0) {
      const sessionsData = createdProfileIds.engineers.slice(0, Math.min(25, createdProfileIds.engineers.length)).map((engineerId, i) => {
        // Valid statuses per check constraint: active, completed, cancelled
        const statuses = ['active', 'active', 'active', 'completed', 'completed', 'cancelled'];
        const status = statuses[i % statuses.length];
        
        return {
          host_user_id: engineerId,
          title: `${randomItem(['Mixing', 'Mastering', 'Recording', 'Vocal'])} Session ${i + 1}`,
          description: `Professional ${randomItem(['mixing', 'mastering', 'recording'])} session. ${randomItem(['Bring your best work!', 'Let\'s create magic.', 'Quality guaranteed.'])}`,
          status,
          session_type: randomItem(['mixing', 'mastering', 'recording', 'collaboration']),
          visibility: Math.random() < 0.8 ? 'public' : 'private',
          max_participants: randomInt(2, 8),
          audio_quality: randomItem(['high', 'studio', 'lossless'])
        };
      });

      const { data: insertedSessions, error: sessionsError } = await supabase
        .from('collaboration_sessions')
        .insert(sessionsData)
        .select('id');

      if (sessionsError) {
        console.error('[Seeding] Sessions error:', sessionsError);
      } else {
        results.sessions = insertedSessions?.length || 0;
        createdSessionIds = insertedSessions?.map((s: any) => s.id) || [];
        console.log(`[Seeding] Created ${results.sessions} collaboration sessions`);
      }
    }

    // Phase 5: Create reviews (requires session_id and review_type)
    console.log('[Seeding] Phase 5: Creating reviews...');
    
    if (createdProfileIds.artists.length > 0 && createdProfileIds.engineers.length > 0 && createdSessionIds.length > 0) {
      const reviewsData: any[] = [];
      for (let i = 0; i < Math.min(50, createdSessionIds.length * 3); i++) {
        const reviewerId = randomItem(createdProfileIds.artists);
        const reviewedId = randomItem(createdProfileIds.engineers);
        const sessionId = randomItem(createdSessionIds);
        
        if (reviewerId !== reviewedId) {
          reviewsData.push({
            session_id: sessionId,
            reviewer_id: reviewerId,
            reviewed_id: reviewedId,
            rating: randomItem([4, 4, 5, 5, 5, 5, 5]),
            review_text: randomItem(REVIEW_TEXTS),
            review_type: randomItem(['engineer', 'session', 'artist']),
            professionalism_rating: randomInt(4, 5),
            communication_rating: randomInt(4, 5),
            quality_rating: randomInt(4, 5),
            would_work_again: Math.random() < 0.9,
            is_public: true
          });
        }
      }

      // Deduplicate by session_id + reviewer_id + reviewed_id
      const uniqueReviews = reviewsData.filter((r, i, arr) => 
        arr.findIndex(x => x.session_id === r.session_id && x.reviewer_id === r.reviewer_id && x.reviewed_id === r.reviewed_id) === i
      );

      if (uniqueReviews.length > 0) {
        const { error: reviewsError } = await supabase
          .from('reviews')
          .insert(uniqueReviews);

        if (reviewsError) {
          console.error('[Seeding] Reviews error:', reviewsError);
        } else {
          results.reviews = uniqueReviews.length;
          console.log(`[Seeding] Created ${results.reviews} reviews`);
        }
      }
    } else {
      console.log('[Seeding] Skipping reviews - need sessions first');
    }

    // Phase 6: Skip follows for now - trigger has schema mismatch with notifications.metadata
    console.log('[Seeding] Phase 6: Skipping social graph (trigger schema mismatch)...');
    results.follows = 0;
    
    const allProfileIds = [...createdProfileIds.engineers, ...createdProfileIds.artists, ...createdProfileIds.producers];

    // Phase 7: Create wallets (using correct column names)
    console.log('[Seeding] Phase 7: Creating wallets...');
    
    if (allProfileIds.length > 0) {
      const walletsData = allProfileIds.map(userId => ({
        user_id: userId,
        earned_balance: randomInt(0, 5000),
        purchased_balance: randomInt(0, 1000),
        total_earned: randomInt(0, 50000),
        total_purchased: randomInt(0, 5000),
        total_spent: randomInt(0, 10000)
      }));

      const { error: walletsError } = await supabase
        .from('mixx_wallets')
        .upsert(walletsData, { onConflict: 'user_id' });

      if (walletsError) {
        console.error('[Seeding] Wallets error:', walletsError);
      } else {
        results.wallets = walletsData.length;
        console.log(`[Seeding] Created ${results.wallets} wallets`);
      }
    }

    // Phase 8: Create activity feed
    console.log('[Seeding] Phase 8: Creating activity feed...');
    
    const activitiesData: any[] = [];
    for (let i = 0; i < 100; i++) {
      const activityType = randomItem(ACTIVITY_TYPES);
      const hoursAgo = randomInt(0, 168); // Last week
      
      activitiesData.push({
        user_id: randomItem(allProfileIds),
        activity_type: activityType.type,
        title: randomItem(activityType.templates),
        description: `Activity from ${getTimeAgo(hoursAgo)}`,
        is_public: true,
        metadata: { demo: true, hours_ago: hoursAgo }
      });
    }

    const { error: activitiesError } = await supabase
      .from('activity_feed')
      .insert(activitiesData);

    if (activitiesError) {
      console.error('[Seeding] Activities error:', activitiesError);
    } else {
      results.activities = activitiesData.length;
      console.log(`[Seeding] Created ${results.activities} activity entries`);
    }

    // Phase 9: Create achievements
    console.log('[Seeding] Phase 9: Creating achievements...');
    
    const achievementTypes = [
      { type: 'first_upload', title: 'First Track Dropped!', icon: 'music', badge_type: 'milestone' },
      { type: 'five_star', title: '5-Star Excellence', icon: 'star', badge_type: 'quality' },
      { type: 'first_collaboration', title: 'Team Player', icon: 'users', badge_type: 'social' },
      { type: 'level_5', title: 'Rising Star', icon: 'zap', badge_type: 'milestone' },
      { type: 'earnings_100', title: 'Money Maker', icon: 'dollar-sign', badge_type: 'financial' }
    ];

    const achievementsData: any[] = [];
    allProfileIds.slice(0, 50).forEach(userId => {
      const numAchievements = randomInt(1, 3);
      const selectedAchievements = randomItems(achievementTypes, 1, numAchievements);
      
      selectedAchievements.forEach(ach => {
        achievementsData.push({
          user_id: userId,
          achievement_type: ach.type,
          title: ach.title,
          icon: ach.icon,
          badge_type: ach.badge_type,
          description: `Earned for outstanding performance on MixxClub`
        });
      });
    });

    const { error: achievementsError } = await supabase
      .from('achievements')
      .insert(achievementsData);

    if (achievementsError) {
      console.error('[Seeding] Achievements error:', achievementsError);
    } else {
      results.achievements = achievementsData.length;
      console.log(`[Seeding] Created ${results.achievements} achievements`);
    }

    console.log('[Seeding] Complete! Results:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[Seeding] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Seeding failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
