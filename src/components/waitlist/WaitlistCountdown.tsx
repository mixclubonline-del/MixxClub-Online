/**
 * WaitlistCountdown — Animated countdown timer + progress bar toward 100 users
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useWaitlistStats } from '@/hooks/useWaitlist';

interface WaitlistCountdownProps {
  launchDate?: string | null;
  className?: string;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function WaitlistCountdown({ launchDate, className }: WaitlistCountdownProps) {
  const { data: stats } = useWaitlistStats();
  const timeLeft = useCountdown(launchDate || null);
  const target = 100;
  const current = stats?.totalSignups || 0;
  const progress = Math.min(100, (current / target) * 100);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Countdown timer */}
      {launchDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1"
        >
          <Clock className="w-3.5 h-3.5 text-primary mr-1" />
          {[
            { value: timeLeft.days, label: 'd' },
            { value: timeLeft.hours, label: 'h' },
            { value: timeLeft.minutes, label: 'm' },
            { value: timeLeft.seconds, label: 's' },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-baseline">
              {i > 0 && <span className="text-muted-foreground mx-0.5">:</span>}
              <motion.span
                key={unit.value}
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-lg font-mono font-bold text-foreground tabular-nums"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
              <span className="text-[10px] text-muted-foreground ml-0.5">{unit.label}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Progress toward 100 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            First 100 Goal
          </span>
          <span className="font-semibold text-foreground">
            {current} / {target}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-muted/40" />
        {current >= 50 && current < 100 && (
          <p className="text-[10px] text-center text-primary animate-pulse">
            🔥 Over halfway there — spots filling fast
          </p>
        )}
      </motion.div>
    </div>
  );
}
