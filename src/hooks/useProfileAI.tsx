import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useProfileAI() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateBio = async (tone: "professional" | "creative" | "casual"): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    setIsGenerating(true);
    try {
      // Fetch user's profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: engineerProfile } = await supabase
        .from("engineer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch user's achievements and projects
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(5);

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
        .eq("status", "completed")
        .limit(10);

      const toneInstructions = {
        professional: "Write in a formal, business-like tone that emphasizes expertise and credibility.",
        creative: "Write in an engaging, artistic tone that showcases passion and unique style.",
        casual: "Write in a friendly, approachable tone that feels authentic and relatable.",
      };

      const prompt = `Create a compelling professional bio for a music professional with the following information:

Name: ${profile?.full_name || "User"}
Role: ${engineerProfile ? "Audio Engineer" : "Artist"}
Experience: ${engineerProfile?.years_experience || 0} years
Specialties: ${engineerProfile?.specialties?.join(", ") || "N/A"}
Completed Projects: ${projects?.length || 0}
Achievements: ${achievements?.map((a) => a.badge_name).join(", ") || "N/A"}

${toneInstructions[tone]}

Keep it to 2-3 paragraphs, highlighting their unique value proposition and what makes them stand out in the music industry.`;

      const { data, error } = await supabase.functions.invoke("chat-simple", {
        body: { prompt },
      });

      if (error) throw error;

      return data.response || "";
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeMusicalDNA = async (audioFileId: string): Promise<any> => {
    if (!user) throw new Error("User not authenticated");

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-audio", {
        body: { audioFileId },
      });

      if (error) throw error;

      return data;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateProfileInsights = async (): Promise<string[]> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: engineerProfile } = await supabase
        .from("engineer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const insights: string[] = [];

      // Profile completeness check
      const completeness = [
        profile?.full_name,
        profile?.bio,
        profile?.avatar_url,
        engineerProfile?.specialties?.length,
        engineerProfile?.portfolio_links?.length,
      ].filter(Boolean).length;

      if (completeness < 5) {
        insights.push(
          `Your profile is ${Math.round((completeness / 5) * 100)}% complete. Add missing information to attract more collaborations.`
        );
      }

      // Bio quality check
      if (!profile?.bio || profile.bio.length < 100) {
        insights.push("Your bio is too short. Use AI to generate a compelling bio that showcases your expertise.");
      }

      // Portfolio check
      if (!engineerProfile?.portfolio_links?.length) {
        insights.push("Add portfolio links to showcase your work and increase your credibility.");
      }

      // Photo check
      if (!profile?.avatar_url) {
        insights.push("Add a professional profile photo with background removal for a polished look.");
      }

      return insights;
    } catch (error) {
      console.error("Error generating insights:", error);
      return [];
    }
  };

  return {
    generateBio,
    analyzeMusicalDNA,
    generateProfileInsights,
    isGenerating,
    isAnalyzing,
  };
}
