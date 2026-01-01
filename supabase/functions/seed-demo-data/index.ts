import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demo engineer data with realistic profiles
const demoEngineers = [
  {
    full_name: "Marcus Chen",
    email: "marcus.chen@demo.mixclub.com",
    bio: "Grammy-nominated mix engineer with 12+ years in hip-hop and R&B. Worked with major label artists and indie superstars alike.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "hip-hop", "R&B"],
    genres: ["Hip-Hop", "R&B", "Trap"],
    hourly_rate: 150,
    years_experience: 12,
    rating: 4.9,
    completed_projects: 287
  },
  {
    full_name: "Sarah Williams",
    email: "sarah.williams@demo.mixclub.com", 
    bio: "Mastering specialist focused on streaming-optimized releases. LUFS expert. Your tracks will sound perfect on every platform.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mastering", "vocals"],
    genres: ["Pop", "Electronic", "Indie"],
    hourly_rate: 200,
    years_experience: 8,
    rating: 4.8,
    completed_projects: 412
  },
  {
    full_name: "Darnell Thompson",
    email: "darnell.thompson@demo.mixclub.com",
    bio: "808 specialist. If it slaps, I mixed it. Trap, drill, and everything that hits hard. Let's make your low end legendary.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "808s", "trap"],
    genres: ["Trap", "Drill", "Hip-Hop"],
    hourly_rate: 125,
    years_experience: 6,
    rating: 4.7,
    completed_projects: 156
  },
  {
    full_name: "Elena Rodriguez",
    email: "elena.rodriguez@demo.mixclub.com",
    bio: "Vocal production specialist. From tuning to mixing, I make voices shine. Bilingual (English/Spanish) - Latin music welcome!",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["vocal production", "mixing"],
    genres: ["Pop", "Latin", "R&B"],
    hourly_rate: 100,
    years_experience: 5,
    rating: 4.9,
    completed_projects: 203
  },
  {
    full_name: "James Park",
    email: "james.park@demo.mixclub.com",
    bio: "Full-service audio engineer. Mixing, mastering, and sound design. I bring cinematic quality to every project.",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "mastering", "sound design"],
    genres: ["Electronic", "Ambient", "Film Score"],
    hourly_rate: 175,
    years_experience: 10,
    rating: 4.8,
    completed_projects: 341
  },
  {
    full_name: "Aisha Johnson",
    email: "aisha.johnson@demo.mixclub.com",
    bio: "Rising star in the mixing world. Fresh ears, modern sound. Specializing in contemporary R&B and neo-soul.",
    avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "R&B"],
    genres: ["R&B", "Neo-Soul", "Jazz"],
    hourly_rate: 75,
    years_experience: 3,
    rating: 4.6,
    completed_projects: 67
  },
  {
    full_name: "Viktor Kowalski",
    email: "viktor.kowalski@demo.mixclub.com",
    bio: "European electronic music specialist. Deep house to techno, I understand the club. Based in Berlin, working worldwide.",
    avatar_url: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "mastering"],
    genres: ["House", "Techno", "Electronic"],
    hourly_rate: 130,
    years_experience: 7,
    rating: 4.7,
    completed_projects: 189
  },
  {
    full_name: "Destiny Moore",
    email: "destiny.moore@demo.mixclub.com",
    bio: "Pop and commercial specialist. Radio-ready mixes that compete with the majors. Let's get you on the charts.",
    avatar_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "pop"],
    genres: ["Pop", "Dance Pop", "Commercial"],
    hourly_rate: 185,
    years_experience: 9,
    rating: 4.9,
    completed_projects: 276
  },
  {
    full_name: "Andre Baptiste",
    email: "andre.baptiste@demo.mixclub.com",
    bio: "Caribbean vibes specialist. Reggae, dancehall, Afrobeats - I bring the island flavor. Let's make it bounce.",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "production"],
    genres: ["Reggae", "Dancehall", "Afrobeats"],
    hourly_rate: 95,
    years_experience: 6,
    rating: 4.8,
    completed_projects: 134
  },
  {
    full_name: "Michelle Torres",
    email: "michelle.torres@demo.mixclub.com",
    bio: "Rock and alternative specialist. From punk to prog, I understand guitars. Analog warmth meets digital precision.",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    role: "engineer",
    specialties: ["mixing", "rock"],
    genres: ["Rock", "Alternative", "Indie Rock"],
    hourly_rate: 110,
    years_experience: 8,
    rating: 4.7,
    completed_projects: 198
  }
];

// Demo reviews
const reviewTemplates = [
  { rating: 5, text: "Absolutely incredible work! The mix came back sounding exactly how I envisioned it. Will definitely be working together again." },
  { rating: 5, text: "Fast turnaround and amazing attention to detail. My vocals have never sounded this good. Thank you!" },
  { rating: 5, text: "Professional from start to finish. Great communication throughout the project. The master sounds radio-ready." },
  { rating: 4, text: "Really solid work. A few revisions needed but the final result exceeded my expectations." },
  { rating: 5, text: "This engineer gets it. Understood my vision immediately and brought the track to life. 10/10 would recommend." },
  { rating: 5, text: "My new go-to engineer on MIXXCLUB. Quality work at a fair price. The 808s hit so hard now!" },
  { rating: 4, text: "Great mix! Only wish the turnaround was a bit faster, but the quality made it worth the wait." },
  { rating: 5, text: "Transformed my bedroom recording into something I'm actually proud to release. Magic hands!" },
  { rating: 5, text: "Third time working together and still impressed every time. Consistent excellence." },
  { rating: 5, text: "The vocal production alone was worth every penny. My voice sounds like a whole different person (in a good way)." }
];

// Demo session titles
const sessionTitles = [
  "Need aggressive trap mix - 808 heavy",
  "R&B ballad - vocal-focused mix needed",
  "Mastering for Spotify release - 5 tracks",
  "Hip-hop album - 12 tracks, consistent sound",
  "Pop single - radio-ready master wanted",
  "Afrobeats track - need that bounce",
  "Lo-fi chill mix - aesthetic vibes only",
  "Rock mix - live drums, real guitars",
  "EDM drop - make it festival-ready",
  "Soul/Gospel mix - warm vintage tone"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting demo data seeding...");

    const results = {
      engineers: 0,
      engineerProfiles: 0,
      sessions: 0,
      reviews: 0,
      errors: [] as string[]
    };

    // Create demo engineer profiles
    for (const engineer of demoEngineers) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', engineer.email)
          .single();

        if (existing) {
          console.log(`Engineer ${engineer.email} already exists, skipping...`);
          continue;
        }

        // Create auth user first (using admin API)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: engineer.email,
          password: 'DemoUser123!',
          email_confirm: true,
          user_metadata: {
            full_name: engineer.full_name,
            role: 'engineer'
          }
        });

        if (authError) {
          console.error(`Error creating auth user for ${engineer.email}:`, authError);
          results.errors.push(`Auth: ${engineer.email} - ${authError.message}`);
          continue;
        }

        const userId = authUser.user.id;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: engineer.full_name,
            bio: engineer.bio,
            avatar_url: engineer.avatar_url,
            role: 'engineer'
          })
          .eq('id', userId);

        if (profileError) {
          console.error(`Error updating profile for ${engineer.email}:`, profileError);
          results.errors.push(`Profile: ${engineer.email} - ${profileError.message}`);
        } else {
          results.engineers++;
        }

        // Create engineer_profile entry
        const { error: engProfileError } = await supabase
          .from('engineer_profiles')
          .insert({
            user_id: userId,
            specialties: engineer.specialties,
            genres: engineer.genres,
            hourly_rate: engineer.hourly_rate,
            years_experience: engineer.years_experience,
            rating: engineer.rating,
            completed_projects: engineer.completed_projects,
            availability_status: 'available'
          });

        if (engProfileError) {
          console.error(`Error creating engineer profile for ${engineer.email}:`, engProfileError);
          results.errors.push(`EngProfile: ${engineer.email} - ${engProfileError.message}`);
        } else {
          results.engineerProfiles++;
        }

      } catch (e) {
        console.error(`Unexpected error for ${engineer.email}:`, e);
        results.errors.push(`Unexpected: ${engineer.email} - ${e.message}`);
      }
    }

    // Get all demo engineer IDs for sessions and reviews
    const { data: demoProfiles } = await supabase
      .from('profiles')
      .select('id, email')
      .like('email', '%@demo.mixclub.com');

    const engineerIds = demoProfiles?.map(p => p.id) || [];

    // Create demo collaboration sessions
    if (engineerIds.length > 0) {
      for (let i = 0; i < sessionTitles.length; i++) {
        const hostId = engineerIds[i % engineerIds.length];
        const { error: sessionError } = await supabase
          .from('collaboration_sessions')
          .insert({
            host_user_id: hostId,
            title: sessionTitles[i],
            description: `Looking for a professional engineer to help with this project. Quick turnaround preferred.`,
            status: i < 3 ? 'active' : i < 7 ? 'completed' : 'scheduled',
            visibility: 'public',
            session_type: 'mixing'
          });

        if (!sessionError) {
          results.sessions++;
        } else {
          results.errors.push(`Session: ${sessionTitles[i]} - ${sessionError.message}`);
        }
      }
    }

    // Create demo reviews between engineers
    if (engineerIds.length > 1) {
      for (let i = 0; i < reviewTemplates.length; i++) {
        const reviewerId = engineerIds[i % engineerIds.length];
        const reviewedId = engineerIds[(i + 1) % engineerIds.length];
        
        if (reviewerId === reviewedId) continue;

        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            reviewer_id: reviewerId,
            reviewed_id: reviewedId,
            rating: reviewTemplates[i].rating,
            review_text: reviewTemplates[i].text
          });

        if (!reviewError) {
          results.reviews++;
        } else if (!reviewError.message.includes('duplicate')) {
          results.errors.push(`Review: ${i} - ${reviewError.message}`);
        }
      }
    }

    console.log("Demo data seeding complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeding complete",
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Seeding error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
