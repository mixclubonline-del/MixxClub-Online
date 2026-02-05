 import { motion } from 'framer-motion';
 import { Flame, Check, Zap } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 
 interface StreakTrackerProps {
   currentStreak: number;
   longestStreak: number;
   todayComplete: boolean;
 }
 
 export function StreakTracker({ currentStreak, longestStreak, todayComplete }: StreakTrackerProps) {
   const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
   const todayIndex = new Date().getDay();
   const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Adjust for Monday start
 
   // Calculate bonus multiplier based on streak
   const getMultiplier = () => {
     if (currentStreak >= 30) return '3x';
     if (currentStreak >= 14) return '2x';
     if (currentStreak >= 7) return '1.5x';
     return '1x';
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
     >
       <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-orange-500/20">
               <Flame className="h-5 w-5 text-orange-400" />
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Current Streak</p>
               <p className="text-2xl font-bold text-orange-400">
                 {currentStreak} days
               </p>
             </div>
           </div>
           {currentStreak >= 7 && (
             <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
               <Zap className="h-3 w-3 mr-1" />
               {getMultiplier()} Bonus
             </Badge>
           )}
         </div>
 
         {/* Week progress */}
         <div className="flex items-center justify-between gap-1">
           {days.map((day, i) => {
             const isPast = i < adjustedTodayIndex;
             const isToday = i === adjustedTodayIndex;
             const isComplete = isPast || (isToday && todayComplete);
 
             return (
               <motion.div
                 key={i}
                 initial={{ scale: 0.8 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 className={`flex-1 flex flex-col items-center gap-1`}
               >
                 <div
                   className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                     isComplete
                       ? 'bg-orange-500 text-white'
                       : isToday
                       ? 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500'
                       : 'bg-muted text-muted-foreground'
                   }`}
                 >
                   {isComplete ? <Check className="h-4 w-4" /> : day}
                 </div>
               </motion.div>
             );
           })}
         </div>
 
         {/* Stats */}
         <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
           <span>Best streak: {longestStreak} days</span>
           {!todayComplete && (
             <span className="text-orange-400">Complete a mission today!</span>
           )}
         </div>
       </Card>
     </motion.div>
   );
 }