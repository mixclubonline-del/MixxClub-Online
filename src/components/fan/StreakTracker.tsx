import { motion } from 'framer-motion';
import { Flame, Check, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  todayComplete: boolean;
}

export function StreakTracker({ currentStreak, longestStreak, todayComplete }: StreakTrackerProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = new Date().getDay();
  const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const getMultiplier = () => {
    if (currentStreak >= 30) return '3x';
    if (currentStreak >= 14) return '2x';
    if (currentStreak >= 7) return '1.5x';
    return '1x';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative rounded-xl border border-orange-500/20 p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(239,68,68,0.06) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.15)', backdropFilter: 'blur(8px)' }}
              >
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Current Streak</p>
                <p className="text-2xl font-bold text-orange-400">
                  {currentStreak} days
                </p>
              </div>
            </div>
            {currentStreak >= 7 && (
              <Badge
                className="border-orange-500/30 text-orange-400"
                style={{ background: 'rgba(249,115,22,0.12)', backdropFilter: 'blur(8px)' }}
              >
                <Zap className="h-3 w-3 mr-1" />
                {getMultiplier()} Bonus
              </Badge>
            )}
          </div>

          {/* Week progress */}
          <div className="flex items-center justify-between gap-1.5">
            {days.map((day, i) => {
              const isPast = i < adjustedTodayIndex;
              const isToday = i === adjustedTodayIndex;
              const isComplete = isPast || (isToday && todayComplete);

              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isComplete
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                        : isToday
                        ? 'text-orange-400 ring-2 ring-orange-500'
                        : 'text-muted-foreground'
                    }`}
                    style={
                      !isComplete && isToday
                        ? { background: 'rgba(249,115,22,0.12)' }
                        : !isComplete
                        ? { background: 'rgba(255,255,255,0.04)' }
                        : undefined
                    }
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : day}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground">
            <span>Best streak: {longestStreak} days</span>
            {!todayComplete && (
              <span className="text-orange-400 font-medium">Complete a mission today!</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
