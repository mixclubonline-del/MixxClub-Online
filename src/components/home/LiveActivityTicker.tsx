import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Users } from 'lucide-react';

interface Activity {
  id: number;
  type: 'booking' | 'availability';
  message: string;
  icon: typeof Music;
}

const activities: Activity[] = [
  { id: 1, type: 'booking', message: 'Artist in Miami just joined the network', icon: Music },
  { id: 2, type: 'availability', message: 'Engineer in London signed up 2 min ago', icon: Users },
  { id: 3, type: 'booking', message: 'Producer from Lagos connected with a rapper in Chicago', icon: Music },
  { id: 4, type: 'availability', message: 'New mastering session started: Artist in Tokyo × Engineer in LA', icon: Users },
  { id: 5, type: 'booking', message: 'Beat dropped: Producer in Atlanta just uploaded fire', icon: Music },
  { id: 6, type: 'availability', message: 'Artist in Brooklyn found her engineer in 12 minutes', icon: Users },
];

export const LiveActivityTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentActivity = activities[currentIndex];

  return (
    <div className="mt-6 flex justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
        >
          <currentActivity.icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{currentActivity.message}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
