import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  price: number;
  is_free: boolean;
  total_lessons: number;
  total_enrollments: number;
  average_rating: number;
  total_reviews: number;
  instructor_id: string;
}

export const useCourses = (filters?: {
  category?: string;
  difficulty?: string;
  isFree?: boolean;
}) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("*")
        .eq("is_published", true);

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq("difficulty_level", filters.difficulty);
      }
      if (filters?.isFree !== undefined) {
        query = query.eq("is_free", filters.isFree);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourseDetails = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          instructor:instructor_profiles(*)
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("user_enrollments")
        .insert({
          course_id: courseId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["user-enrollments"] });
      toast({
        title: "Enrolled Successfully!",
        description: "You can now access all course lessons.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });
};

export const useUserEnrollments = (userId: string) => {
  return useQuery({
    queryKey: ["user-enrollments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_enrollments")
        .select(`
          *,
          course:courses(*)
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
