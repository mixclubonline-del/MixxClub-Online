import { useEffect, useState } from "react";
import { Music, UserPlus, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  type: "join" | "upload" | "competition" | "achievement";
  message: string;
  icon: typeof UserPlus;
  timestamp: Date;
}

const activityTemplates = [
  { type: "join" as const, messages: ["Alex joined MixClub", "Sarah just signed up", "Mike joined the community", "Emma started their journey"], icon: UserPlus },
  { type: "upload" as const, messages: ["New track uploaded to mixing", "Fresh beat ready for mastering", "Producer uploaded new project", "Artist shared new vocals"], icon: Music },
  { type: "competition" as const, messages: ["Vote cast in Mix Battle", "New battle entry submitted", "Competition vote recorded", "Battle participant joined"], icon: Trophy },
  { type: "achievement" as const, messages: ["Badge unlocked: First Mix", "Milestone reached!", "New certification earned", "Level up achieved"], icon: Sparkles },
];

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const generateActivity = (): Activity => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const message = template.messages[Math.floor(Math.random() * template.messages.length)];
      
      return {
        id: Math.random().toString(36),
        type: template.type,
        message,
        icon: template.icon,
        timestamp: new Date(),
      };
    };

    // Initial activities
    const initial = Array.from({ length: 3 }, generateActivity);
    setActivities(initial);

    // Add new activity every 4 seconds
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity();
        return [newActivity, ...prev].slice(0, 5);
      });
      setCurrentIndex(prev => (prev + 1) % 1000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "join": return "text-primary";
      case "upload": return "text-accent-blue";
      case "competition": return "text-warning";
      case "achievement": return "text-success";
    }
  };

  const getActivityBg = (type: Activity["type"]) => {
    switch (type) {
      case "join": return "bg-primary/20";
      case "upload": return "bg-accent-blue/20";
      case "competition": return "bg-warning/20";
      case "achievement": return "bg-success/20";
    }
  };

  return (
    <div className="glass-studio rounded-2xl p-6 border-2 border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping" />
        </div>
        <h3 className="text-xl font-bold">Live Activity</h3>
      </div>

      <div className="space-y-3 h-[240px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {activities.slice(0, 4).map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: 1 - (index * 0.2), 
                  x: 0, 
                  height: "auto",
                  scale: 1 - (index * 0.05)
                }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${getActivityBg(activity.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${getActivityColor(activity.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Just now
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-center text-muted-foreground">
          Join the action • Real-time updates
        </p>
      </div>
    </div>
  );
};
