import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BattleTournament {
  id: string;
  tournament_name: string;
  tournament_type: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  end_date: string | null;
  rules: any;
  bracket_data: any;
  created_at: string;
}

export const useBattleTournaments = () => {
  return useQuery({
    queryKey: ["battle-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("battle_tournaments")
        .select("*")
        .in("status", ["upcoming", "active", "completed"])
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as BattleTournament[];
    },
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tournamentId, userId }: { tournamentId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          entry_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle-tournaments"] });
      toast({
        title: "Joined Tournament!",
        description: "You've successfully entered the battle. Good luck!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join tournament",
        variant: "destructive",
      });
    },
  });
};
