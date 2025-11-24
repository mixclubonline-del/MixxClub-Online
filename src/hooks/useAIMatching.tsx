import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProjectMatches = (projectId?: string) => {
  return useQuery({
    queryKey: ["ai-matches", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("ai_collaboration_matches")
        .select("*, profiles!ai_collaboration_matches_matched_user_id_fkey(full_name, email, avatar_url)")
        .eq("project_id", projectId)
        .order("match_score", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

export const useUserMatches = (userId?: string) => {
  return useQuery({
    queryKey: ["user-matches", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("ai_collaboration_matches")
        .select("*, projects!ai_collaboration_matches_project_id_fkey(title, description, genre)")
        .eq("matched_user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateMatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (match: {
      project_id: string;
      matched_user_id: string;
      artist_id?: string;
      engineer_id?: string;
      match_score?: number;
      match_reason?: string;
      genre_match_score?: number;
      style_match_score?: number;
      technical_match_score?: number;
      compatibility_score?: number;
      complementary_skills?: string[];
    }) => {
      const { data, error } = await supabase
        .from("ai_collaboration_matches")
        .insert({
          ...match,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-matches"] });
      queryClient.invalidateQueries({ queryKey: ["user-matches"] });
      toast({
        title: "Match created",
        description: "AI match has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Match creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMatchStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      status,
    }: {
      matchId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("ai_collaboration_matches")
        .update({ status })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-matches"] });
      queryClient.invalidateQueries({ queryKey: ["user-matches"] });
      
      const statusMessages = {
        accepted: "Match accepted! You can now collaborate.",
        rejected: "Match declined.",
        completed: "Match marked as completed.",
      };
      
      toast({
        title: "Match updated",
        description: statusMessages[variables.status as keyof typeof statusMessages] || "Match status updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useTopEngineerMatches = (projectId: string, limit = 5) => {
  return useQuery({
    queryKey: ["top-matches", projectId, limit],
    queryFn: async () => {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("genre, description")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Get engineers with matching skills
      const { data: engineers, error: engineersError } = await supabase
        .from("engineer_profiles")
        .select("*, profiles!engineer_profiles_user_id_fkey(id, full_name, email, avatar_url)")
        .contains("genres", [project.genre])
        .eq("availability_status", "available")
        .order("rating", { ascending: false })
        .limit(limit);

      if (engineersError) throw engineersError;

      return engineers?.map(eng => ({
        engineer: eng,
        match_score: calculateMatchScore(eng, project),
        match_reason: generateMatchReason(eng, project),
      }));
    },
    enabled: !!projectId,
  });
};

// Helper function to calculate match score
function calculateMatchScore(engineer: any, project: any): number {
  let score = 0;
  
  // Genre match (40 points)
  if (engineer.genres?.includes(project.genre)) {
    score += 40;
  }
  
  // Rating (30 points)
  score += (engineer.rating || 0) * 6;
  
  // Experience (20 points)
  const yearsExp = engineer.years_experience || 0;
  score += Math.min(yearsExp * 2, 20);
  
  // Availability (10 points)
  if (engineer.availability_status === "available") {
    score += 10;
  }
  
  return Math.min(score, 100);
}

// Helper function to generate match reason
function generateMatchReason(engineer: any, project: any): string {
  const reasons = [];
  
  if (engineer.genres?.includes(project.genre)) {
    reasons.push(`${project.genre} specialist`);
  }
  
  if (engineer.rating >= 4.5) {
    reasons.push("highly rated");
  }
  
  if (engineer.years_experience >= 5) {
    reasons.push(`${engineer.years_experience}+ years experience`);
  }
  
  if (engineer.completed_projects >= 10) {
    reasons.push(`${engineer.completed_projects} projects completed`);
  }
  
  return reasons.join(" • ") || "Good match";
}

export const useAIMixingSuggestions = (projectId?: string) => {
  return useQuery({
    queryKey: ["ai-mixing-suggestions", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("ai_mixing_suggestions")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_applied", false)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

export const useApplySuggestion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      suggestionId,
      feedback,
    }: {
      suggestionId: string;
      feedback?: string;
    }) => {
      const { data, error } = await supabase
        .from("ai_mixing_suggestions")
        .update({
          is_applied: true,
          applied: true,
          user_feedback: feedback,
        })
        .eq("id", suggestionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-mixing-suggestions"] });
      toast({
        title: "Suggestion applied",
        description: "AI mixing suggestion has been applied.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to apply suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
