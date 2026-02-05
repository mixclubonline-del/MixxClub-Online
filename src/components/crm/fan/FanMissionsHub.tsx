 import { MissionsList } from '@/components/economy';
 import { StreakTracker } from '@/components/fan';
 
 export const FanMissionsHub = () => {
   // TODO: Fetch streak data from fan_stats
   const streakData = {
     currentStreak: 3,
     longestStreak: 7,
     todayComplete: false,
   };
 
   return (
     <div className="space-y-6">
       <StreakTracker {...streakData} />
       <MissionsList />
     </div>
   );
 };