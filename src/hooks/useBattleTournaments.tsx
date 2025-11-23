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
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

export const useJoinTournament = () => {
  return {
    mutate: async () => {},
    isLoading: false,
  };
};
