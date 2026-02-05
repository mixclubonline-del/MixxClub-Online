import { MissionsList } from '@/components/economy';
import { StreakTracker, LeaderboardWidget, ReferralMissionsCard, BonusMissionsCard } from '@/components/fan';
import { useFanStats } from '@/hooks/useFanStats';

export const FanMissionsHub = () => {
  const { stats, todayComplete } = useFanStats();

  const streakData = {
    currentStreak: stats?.engagement_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    todayComplete,
  };

  return (
    <div className="space-y-6">
      <StreakTracker {...streakData} />
      <BonusMissionsCard />
      <MissionsList />
      <ReferralMissionsCard />
      <LeaderboardWidget />
    </div>
  );
};