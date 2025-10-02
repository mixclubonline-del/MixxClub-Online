import { useEffect, useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { useCommunityMilestones } from "@/hooks/useCommunityMilestones";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const LiveCommunityCounter = () => {
  const { data: milestones } = useCommunityMilestones();
  const [userCount, setUserCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (count !== null) {
        setUserCount(count);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    };

    fetchUserCount();
    const interval = setInterval(fetchUserCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const nextMilestone = milestones?.find(m => !m.is_unlocked);
  const progress = nextMilestone 
    ? (userCount / nextMilestone.target_value) * 100 
    : 100;
  const remaining = nextMilestone 
    ? nextMilestone.target_value - userCount 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="glass-studio rounded-3xl p-8 border-2 border-primary/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary animate-pulse-glow" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Community Size</h3>
              <motion.p 
                className="text-4xl font-black bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent"
                animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
              >
                {userCount.toLocaleString()}
              </motion.p>
            </div>
          </div>
          
          {nextMilestone && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Next Unlock</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {nextMilestone.target_value.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {nextMilestone && (
          <div className="space-y-3">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-accent-blue to-accent-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Only <span className="text-primary font-bold">{remaining}</span> more members needed!
              </span>
              <span className="text-primary font-bold">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="pt-3 border-t border-border/50">
              <p className="text-sm font-medium text-foreground mb-1">
                🎉 Unlocking: {nextMilestone.milestone_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {nextMilestone.milestone_description}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
