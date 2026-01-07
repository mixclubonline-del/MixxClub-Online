import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_GENRES = ["Hip-Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz", "Latin", "Afrobeats"];
const DEMO_SPECIALTIES = ["Mixing", "Mastering", "Vocal Production", "Beat Making", "Sound Design", "Recording"];
const DEMO_ACTIVITY_TYPES = ["mixing", "mastering", "recording", "editing", "meeting", "admin"];
const DEMO_INSTRUMENTS = ["Guitar", "Piano", "Drums", "Bass", "Vocals", "Synthesizer", "Violin", "Saxophone"];

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Record<string, number> = {};

    // 1. Seed engineer_profiles for existing profiles without one
    const { data: profilesWithoutEngineer } = await supabase
      .from("profiles")
      .select("id, full_name")
      .is("stripe_connect_account_id", null)
      .limit(10);

    if (profilesWithoutEngineer && profilesWithoutEngineer.length > 0) {
      const engineerProfiles = profilesWithoutEngineer.map((profile) => ({
        user_id: profile.id,
        genres: randomItems(DEMO_GENRES, randomBetween(2, 4)),
        specialties: randomItems(DEMO_SPECIALTIES, randomBetween(2, 3)),
        hourly_rate: randomBetween(50, 200),
        years_experience: randomBetween(2, 15),
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        completed_projects: randomBetween(10, 150),
        availability_status: randomItem(["available", "busy", "unavailable"]),
        trending_score: randomBetween(50, 100),
      }));

      const { error: engineerError, data: insertedEngineers } = await supabase
        .from("engineer_profiles")
        .upsert(engineerProfiles, { onConflict: "user_id" })
        .select();

      results.engineer_profiles = insertedEngineers?.length || 0;
    }

    // 2. Seed time_tracking entries
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("id")
      .limit(5);

    if (existingUsers && existingUsers.length > 0) {
      const timeEntries = [];
      for (const user of existingUsers) {
        for (let i = 0; i < 4; i++) {
          const startTime = new Date();
          startTime.setDate(startTime.getDate() - randomBetween(0, 14));
          startTime.setHours(randomBetween(9, 17), 0, 0, 0);
          
          const durationMinutes = randomBetween(30, 240);
          const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

          timeEntries.push({
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_minutes: durationMinutes,
            activity_type: randomItem(DEMO_ACTIVITY_TYPES),
            notes: `Demo session - ${randomItem(["Client work", "Personal project", "Collaboration", "Practice"])}`,
            is_billable: Math.random() > 0.3,
            hourly_rate: randomBetween(50, 150),
          });
        }
      }

      const { error: timeError, data: insertedTime } = await supabase
        .from("time_tracking")
        .insert(timeEntries)
        .select();

      results.time_tracking = insertedTime?.length || 0;
    }

    // 3. Seed musical_profiles
    if (existingUsers && existingUsers.length > 0) {
      const musicalProfiles = existingUsers.map((user) => ({
        user_id: user.id,
        primary_genre: randomItem(DEMO_GENRES),
        secondary_genres: randomItems(DEMO_GENRES, randomBetween(1, 3)),
        influences: randomItems([
          "Drake", "Beyoncé", "Kendrick Lamar", "The Weeknd", "Tyler the Creator",
          "Frank Ocean", "SZA", "Metro Boomin", "Pharrell", "Timbaland"
        ], randomBetween(2, 5)),
        instruments: randomItems(DEMO_INSTRUMENTS, randomBetween(1, 3)),
        years_active: randomBetween(1, 15),
        bio: "Demo artist profile - passionate about creating unique sounds and collaborating with talented engineers.",
        spotify_url: null,
        soundcloud_url: null,
        preferred_daw: randomItem(["Pro Tools", "Logic Pro", "Ableton Live", "FL Studio"]),
      }));

      const { error: musicalError, data: insertedMusical } = await supabase
        .from("musical_profiles")
        .upsert(musicalProfiles, { onConflict: "user_id" })
        .select();

      results.musical_profiles = insertedMusical?.length || 0;
    }

    // 4. Seed engineer_earnings
    const { data: engineers } = await supabase
      .from("engineer_profiles")
      .select("user_id")
      .limit(8);

    if (engineers && engineers.length > 0) {
      const earnings = [];
      for (const engineer of engineers) {
        for (let i = 0; i < 3; i++) {
          const baseAmount = randomBetween(100, 500);
          const bonusAmount = Math.random() > 0.7 ? randomBetween(25, 100) : 0;

          earnings.push({
            engineer_id: engineer.user_id,
            amount: baseAmount + bonusAmount,
            base_amount: baseAmount,
            bonus_amount: bonusAmount,
            total_amount: baseAmount + bonusAmount,
            status: randomItem(["pending", "paid", "paid", "paid"]),
            payment_date: new Date(Date.now() - randomBetween(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
            currency: "USD",
          });
        }
      }

      const { error: earningsError, data: insertedEarnings } = await supabase
        .from("engineer_earnings")
        .insert(earnings)
        .select();

      results.engineer_earnings = insertedEarnings?.length || 0;
    }

    // 5. Seed achievements for users
    if (existingUsers && existingUsers.length > 0) {
      const achievementTypes = [
        { type: "first_upload", title: "First Track Dropped!", icon: "music", badge: "Beat Dropper" },
        { type: "first_project", title: "First Mix Complete!", icon: "check-circle", badge: "Debut Drop" },
        { type: "level_5", title: "Rising Star", icon: "star", badge: "Level 5" },
        { type: "points_milestone", title: "1K Club", icon: "zap", badge: "XP Master" },
      ];

      const achievements = existingUsers.flatMap((user) =>
        randomItems(achievementTypes, randomBetween(1, 3)).map((ach) => ({
          user_id: user.id,
          achievement_type: ach.type,
          title: ach.title,
          description: `Demo achievement - ${ach.title}`,
          icon: ach.icon,
          badge_name: ach.badge,
          badge_type: "milestone",
        }))
      );

      const { error: achError, data: insertedAch } = await supabase
        .from("achievements")
        .upsert(achievements, { onConflict: "user_id,achievement_type", ignoreDuplicates: true })
        .select();

      results.achievements = insertedAch?.length || 0;
    }

    // 6. Seed payout_requests
    if (engineers && engineers.length > 0) {
      const payouts = engineers.slice(0, 4).map((eng) => ({
        user_id: eng.user_id,
        amount: randomBetween(100, 1000),
        status: randomItem(["pending", "approved", "processing", "completed"]),
        payment_method: randomItem(["stripe", "paypal", "bank_transfer"]),
        notes: "Demo payout request",
      }));

      const { error: payoutError, data: insertedPayouts } = await supabase
        .from("payout_requests")
        .insert(payouts)
        .select();

      results.payout_requests = insertedPayouts?.length || 0;
    }

    console.log("Demo data seeded successfully:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demo data seeded successfully",
        records_created: results 
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
