import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, CheckCircle } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  location: string;
}

const notifications: Notification[] = [
  { id: 1, message: 'Marcus from Atlanta just booked mixing', location: 'Atlanta' },
  { id: 2, message: 'Sarah completed a mastering project', location: 'Los Angeles' },
  { id: 3, message: 'Jordan upgraded to Pro subscription', location: 'New York' },
  { id: 4, message: 'Alex just booked a Premium engineer', location: 'Miami' },
  { id: 5, message: 'Taylor finished mixing an EP', location: 'Nashville' },
];

export const LiveNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotification(randomNotification);
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 5000);
    };

    // Show first notification after 8 seconds
    const initialTimeout = setTimeout(showNotification, 8000);

    // Then show every 15 seconds
    const interval = setInterval(showNotification, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: -20 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-card border border-border rounded-lg shadow-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{currentNotification.message}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Just now • {currentNotification.location}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
