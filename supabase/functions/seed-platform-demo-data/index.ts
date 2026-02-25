import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

// Realistic demo data
const FIRST_NAMES = ["Marcus", "Aaliyah", "Devon", "Jasmine", "Tyrell", "Keisha", "Brandon", "Destiny", "Jordan", "Brianna", "Malik", "Ciara", "Dwayne", "Tiffany", "Andre", "Monique", "Rashad", "Shaniqua", "Terrance", "Latoya", "Jamal", "Amber", "DeShawn", "Crystal", "Xavier", "Nicole", "Kendrick", "Janelle", "Jermaine", "Tamika"];
const LAST_NAMES = ["Williams", "Johnson", "Brown", "Davis", "Jackson", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Lewis", "Lee", "Walker"];
const STUDIO_NAMES = ["808 Lab", "Velvet Sound", "Crown Studios", "Midnight Mix", "Urban Audio", "Trap Kingdom", "Soul Factory", "Wave Forge", "Beat Cathedral", "Diamond Sound"];
const GENRES = ["Hip-Hop", "R&B", "Trap", "Drill", "Pop", "Afrobeats", "Reggaeton", "Soul", "Neo-Soul", "Alternative"];
const SPECIALTIES = ["Mixing", "Mastering", "Vocal Production", "Beat Making", "Sound Design", "Recording", "Vocal Tuning", "Stem Mixing", "Dolby Atmos"];
const ACTIVITY_TYPES = ["mixing", "mastering", "recording", "editing", "collaboration"];
const SESSION_TITLES = ["Late Night R&B", "Trap Session", "Vocal Production", "Album Mix", "Single Master", "EP Recording", "Collaboration Jam", "Beat Workshop", "Studio Vibes", "Creative Flow"];
const REVIEW_COMMENTS = [
  "Absolutely incredible work! The mix sounds professional and radio-ready.",
  "Fast turnaround and amazing attention to detail. Will definitely work together again!",
  "My vocals have never sounded this clean. True professional!",
  "The mastering took my track to the next level. Highly recommend!",
  "Great communication throughout the project. Exceeded my expectations.",
  "Studio magic! This engineer knows exactly what they're doing.",
  "Perfect mix for my drill track. Heavy 808s hit just right.",
  "Phenomenal vocal production. Added harmonies I never thought of.",
  "The best mixing experience I've had. Worth every penny!",
  "Turned my demo into a masterpiece. Can't thank them enough!"
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUsername(firstName: string, lastName: string): string {
  const variations = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase().charAt(0)}`,
    `${firstName.toLowerCase()}${randomBetween(1, 99)}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
  ];
  return randomItem(variations);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin authentication
    const auth = await requireAdmin(req);
    if ('error' in auth) return authErrorResponse(auth, corsHeaders);

    console.log("[Seeding] Admin:", auth.user.id);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Record<string, number> = {};
    const demoUserIds: string[] = [];

    // 1. Create demo profiles (50 engineers + 50 artists)
    console.log("Creating demo profiles...");
    
    // Check existing demo profiles count
    const { count: existingCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_demo", true);

    if ((existingCount || 0) < 50) {
      const newProfiles = [];
      for (let i = 0; i < 100 - (existingCount || 0); i++) {
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(LAST_NAMES);
        const role = i < 50 ? "engineer" : "artist";
        
        newProfiles.push({
          id: crypto.randomUUID(),
          full_name: `${firstName} ${lastName}`,
          username: generateUsername(firstName, lastName) + randomBetween(100, 999),
          email: `demo.${firstName.toLowerCase()}.${randomBetween(1000, 9999)}@mixclub.demo`,
          role: role,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
          bio: role === "engineer" 
            ? `Professional audio engineer at ${randomItem(STUDIO_NAMES)}. Specializing in ${randomItems(SPECIALTIES, 2).join(" & ")}.`
            : `Independent artist creating ${randomItem(GENRES)} music. Looking for professional mixing and mastering.`,
          city: randomItem(["Los Angeles", "Atlanta", "New York", "Chicago", "Houston", "Miami", "Detroit", "Philadelphia"]),
          is_demo: true,
          is_verified: Math.random() > 0.6,
          created_at: new Date(Date.now() - randomBetween(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { data: insertedProfiles, error: profileError } = await supabase
        .from("profiles")
        .upsert(newProfiles, { onConflict: "id" })
        .select("id");

      if (profileError) console.error("Profile error:", profileError);
      results.profiles = insertedProfiles?.length || 0;
      demoUserIds.push(...(insertedProfiles?.map(p => p.id) || []));
    }

    // Get all demo user IDs
    const { data: allDemoProfiles } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("is_demo", true);

    const demoEngineers = allDemoProfiles?.filter(p => p.role === "engineer").map(p => p.id) || [];
    const demoArtists = allDemoProfiles?.filter(p => p.role === "artist").map(p => p.id) || [];

    // 2. Create engineer profiles with detailed data
    console.log("Creating engineer profiles...");
    
    if (demoEngineers.length > 0) {
      const engineerProfiles = demoEngineers.map((userId) => ({
        user_id: userId,
        genres: randomItems(GENRES, randomBetween(2, 5)),
        specialties: randomItems(SPECIALTIES, randomBetween(2, 4)),
        hourly_rate: randomBetween(50, 300),
        years_experience: randomBetween(2, 20),
        rating: (3.8 + Math.random() * 1.2).toFixed(1),
        completed_projects: randomBetween(15, 500),
        availability_status: randomItem(["available", "available", "busy", "available"]),
        trending_score: randomBetween(60, 100),
        studio_name: randomItem(STUDIO_NAMES),
        portfolio_url: `https://mixclub.online/u/demo-engineer-${randomBetween(1, 999)}`,
      }));

      const { data: insertedEngineers, error: engineerError } = await supabase
        .from("engineer_profiles")
        .upsert(engineerProfiles, { onConflict: "user_id" })
        .select();

      if (engineerError) console.error("Engineer error:", engineerError);
      results.engineer_profiles = insertedEngineers?.length || 0;
    }

    // 3. Create public collaboration sessions (25 active/scheduled)
    console.log("Creating collaboration sessions...");
    
    const { count: existingSessions } = await supabase
      .from("collaboration_sessions")
      .select("*", { count: "exact", head: true });

    if ((existingSessions || 0) < 25) {
      const sessions = [];
      const hostPool = [...demoEngineers, ...demoArtists.slice(0, 10)];
      
      for (let i = 0; i < 25 - (existingSessions || 0); i++) {
        const scheduledStart = new Date(Date.now() + randomBetween(-2, 7) * 24 * 60 * 60 * 1000);
        const status = scheduledStart < new Date() ? randomItem(["active", "live", "completed"]) : "scheduled";
        
        sessions.push({
          host_user_id: randomItem(hostPool),
          title: randomItem(SESSION_TITLES),
          description: `Join this ${randomItem(GENRES)} ${randomItem(ACTIVITY_TYPES)} session. Looking for talented collaborators!`,
          status: status,
          visibility: "public",
          session_type: randomItem(["mixing", "mastering", "recording", "collaboration"]),
          max_participants: randomBetween(2, 8),
          scheduled_start: scheduledStart.toISOString(),
          audio_quality: randomItem(["high", "studio", "lossless"]),
        });
      }

      const { data: insertedSessions, error: sessionError } = await supabase
        .from("collaboration_sessions")
        .insert(sessions)
        .select();

      if (sessionError) console.error("Session error:", sessionError);
      results.collaboration_sessions = insertedSessions?.length || 0;
    }

    // 4. Create reviews for engineers (100+ reviews)
    console.log("Creating reviews...");
    
    const { count: existingReviews } = await supabase
      .from("engineer_reviews")
      .select("*", { count: "exact", head: true });

    if ((existingReviews || 0) < 100 && demoEngineers.length > 0 && demoArtists.length > 0) {
      const reviews = [];
      
      for (let i = 0; i < 100 - (existingReviews || 0); i++) {
        reviews.push({
          engineer_id: randomItem(demoEngineers),
          artist_id: randomItem(demoArtists),
          rating: randomBetween(4, 5),
          review_text: randomItem(REVIEW_COMMENTS),
          service_type: randomItem(["mixing", "mastering", "production"]),
          is_verified: Math.random() > 0.3,
          created_at: new Date(Date.now() - randomBetween(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { data: insertedReviews, error: reviewError } = await supabase
        .from("engineer_reviews")
        .insert(reviews)
        .select();

      if (reviewError) console.error("Review error:", reviewError);
      results.reviews = insertedReviews?.length || 0;
    }

    // 5. Create engineer earnings data
    console.log("Creating earnings data...");
    
    if (demoEngineers.length > 0) {
      const earnings = [];
      
      for (const engineerId of demoEngineers.slice(0, 30)) {
        for (let i = 0; i < randomBetween(3, 10); i++) {
          const baseAmount = randomBetween(75, 750);
          const bonusAmount = Math.random() > 0.7 ? randomBetween(25, 150) : 0;

          earnings.push({
            engineer_id: engineerId,
            amount: baseAmount + bonusAmount,
            base_amount: baseAmount,
            bonus_amount: bonusAmount,
            total_amount: baseAmount + bonusAmount,
            status: randomItem(["pending", "paid", "paid", "paid", "paid"]),
            payment_date: new Date(Date.now() - randomBetween(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
            currency: "USD",
          });
        }
      }

      const { data: insertedEarnings, error: earningsError } = await supabase
        .from("engineer_earnings")
        .insert(earnings)
        .select();

      if (earningsError) console.error("Earnings error:", earningsError);
      results.engineer_earnings = insertedEarnings?.length || 0;
    }

    // 6. Create achievements
    console.log("Creating achievements...");
    
    const achievementTypes = [
      { type: "first_upload", title: "First Track Dropped!", icon: "music", badge: "Beat Dropper" },
      { type: "first_project", title: "First Mix Complete!", icon: "check-circle", badge: "Debut Drop" },
      { type: "level_5", title: "Rising Star", icon: "star", badge: "Level 5" },
      { type: "points_milestone", title: "1K Club", icon: "zap", badge: "XP Master" },
      { type: "collab_master", title: "Collaboration Master", icon: "users", badge: "Team Player" },
      { type: "verified_engineer", title: "Verified Pro", icon: "check", badge: "Verified" },
    ];

    const allDemoUsers = [...demoEngineers, ...demoArtists].slice(0, 40);
    const achievements = allDemoUsers.flatMap((userId) =>
      randomItems(achievementTypes, randomBetween(1, 4)).map((ach) => ({
        user_id: userId,
        achievement_type: ach.type,
        title: ach.title,
        description: `Earned for platform excellence`,
        icon: ach.icon,
        badge_name: ach.badge,
        badge_type: "milestone",
        earned_at: new Date(Date.now() - randomBetween(1, 60) * 24 * 60 * 60 * 1000).toISOString(),
      }))
    );

    const { data: insertedAch, error: achError } = await supabase
      .from("achievements")
      .upsert(achievements, { onConflict: "user_id,achievement_type", ignoreDuplicates: true })
      .select();

    if (achError) console.error("Achievement error:", achError);
    results.achievements = insertedAch?.length || 0;

    // 7. Update community unlockables progress
    console.log("Updating community unlockables...");
    
    const { data: unlockables } = await supabase
      .from("community_unlockables")
      .select("*");

    if (unlockables && unlockables.length > 0) {
      // Update some to show progress
      for (const unlockable of unlockables.slice(0, 3)) {
        await supabase
          .from("community_unlockables")
          .update({
            is_unlocked: true,
            unlocked_at: new Date(Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", unlockable.id);
      }
      results.unlockables_updated = 3;
    }

    // 8. Create activity feed entries
    console.log("Creating activity feed...");
    
    const activityTypes = ["session_started", "project_completed", "user_joined", "achievement_unlocked", "review_posted"];
    const activities = [];
    
    for (let i = 0; i < 50; i++) {
      const activityType = randomItem(activityTypes);
      activities.push({
        user_id: randomItem([...demoEngineers, ...demoArtists]),
        activity_type: activityType,
        title: activityType === "session_started" ? "Started a new session" 
             : activityType === "project_completed" ? "Completed a project"
             : activityType === "user_joined" ? "Joined MixClub"
             : activityType === "achievement_unlocked" ? "Unlocked an achievement"
             : "Posted a review",
        description: `Demo activity for ${activityType}`,
        is_public: true,
        created_at: new Date(Date.now() - randomBetween(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const { data: insertedActivities, error: activityError } = await supabase
      .from("activity_feed")
      .insert(activities)
      .select();

    if (activityError) console.error("Activity error:", activityError);
    results.activity_feed = insertedActivities?.length || 0;

    console.log("Demo data seeding complete:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Platform demo data seeded successfully",
        records_created: results,
        summary: {
          total_engineers: demoEngineers.length,
          total_artists: demoArtists.length,
          active_sessions: results.collaboration_sessions || 0,
          total_reviews: results.reviews || 0,
          total_earnings_records: results.engineer_earnings || 0,
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Seeding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
