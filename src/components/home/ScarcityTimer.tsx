import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScarcityTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 23,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-2 border-orange-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-orange-500/20">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Weekend Rush Pricing Ends In:</h4>
              <p className="text-sm text-muted-foreground">Save 10% on 12-hour delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Seconds</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
