import { motion } from 'framer-motion';
import { Lock, Unlock, Users, Trophy, Sparkles, Zap, Crown, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';

// Icon mapping for milestone types
const iconMap: Record<string, any> = {
  Users,
  Trophy,
  Sparkles,
  Zap,
  Crown,
  Rocket,
};

export const UnlockablesSection = () => {
  const { data: milestones, isLoading } = useCommunityMilestones();

  if (isLoading) {
    return (
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">Loading community milestones...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/50">
            <Users className="w-4 h-4 mr-2" />
            Community Milestones
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Unlock the Future Together
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            As our community grows, new features and tools become available to everyone. 
            Your participation helps unlock powerful capabilities for the entire network.
          </p>
        </motion.div>

        {/* Milestones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(milestones || []).map((milestone, index) => {
            const progress = milestone.progress_percentage;
            const Icon = iconMap[milestone.icon_name || 'Trophy'] || Trophy;
            
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className={`relative p-6 glass border transition-all duration-300 ${
                  milestone.is_unlocked 
                    ? 'border-primary shadow-glow' 
                    : progress > 80 
                    ? 'border-primary/50' 
                    : 'border-border hover:border-primary/30'
                }`}>
                  {/* Status indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      milestone.is_unlocked 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        milestone.is_unlocked 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    {milestone.is_unlocked ? (
                      <Unlock className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{milestone.milestone_name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {milestone.milestone_description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {milestone.current_value.toLocaleString()} / {milestone.target_value.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>

                  {/* Reward */}
                  {milestone.reward_description && (
                    <div className={`p-3 rounded-lg border ${
                      milestone.is_unlocked 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-muted/50 border-border'
                    }`}>
                      <p className="text-xs font-medium">
                        {milestone.is_unlocked ? '✓ Unlocked:' : '🔒 Unlocks:'} {milestone.reward_description}
                      </p>
                    </div>
                  )}

                  {/* Pulse effect for near completion */}
                  {!milestone.is_unlocked && progress > 80 && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary/50"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Community CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl glass border border-primary/30">
            <Users className="w-12 h-12 text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Be Part of the Journey</h3>
              <p className="text-muted-foreground">
                Every project, every collaboration, every achievement brings us closer to unlocking the next milestone.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};
