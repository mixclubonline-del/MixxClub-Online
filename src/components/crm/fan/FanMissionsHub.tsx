import { MissionsList } from '@/components/economy';
import { StreakTracker, LeaderboardWidget, ReferralMissionsCard, BonusMissionsCard } from '@/components/fan';
import { useFanStats } from '@/hooks/useFanStats';
import { usePersonalUnlockables } from '@/hooks/useUnlockables';
import { PersonalUnlocksWidget } from '@/components/unlock/PersonalUnlocksWidget';

export const FanMissionsHub = () => {
  const { stats, todayComplete } = useFanStats();
  const { data: personalUnlockables, isLoading: unlockablesLoading } = usePersonalUnlockables('fan');

  const streakData = {
    currentStreak: stats?.engagement_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    todayComplete,
  };

  return (
    <div className="space-y-6">
      <StreakTracker {...streakData} />
      
      {/* Supporter Journey Progress */}
      <PersonalUnlocksWidget
        unlockables={personalUnlockables?.unlockables || []}
        title="Supporter Journey"
        description="Your path to legend status"
        isLoading={unlockablesLoading}
      />
      
      <BonusMissionsCard />
      <MissionsList />
      <ReferralMissionsCard />
      <LeaderboardWidget />
    </div>
  );
};