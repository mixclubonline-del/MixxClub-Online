import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { useNavigate } from 'react-router-dom';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const CommunityMilestonesShowcase = () => {
  const { data: milestones, isLoading } = useCommunityMilestones();
  const navigate = useNavigate();

  if (!FEATURE_FLAGS.COMMUNITY_MILESTONES_HOMEPAGE || isLoading) {
    return null;
  }

  // Show only the next 2 unlockable milestones
  const featuredMilestones = milestones?.filter(m => !m.is_unlocked).slice(0, 2) || [];

  if (featuredMilestones.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Community Unlocks</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            Grow Together, <span className="text-primary">Unlock Together</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            As our community grows, everyone unlocks powerful new features. Every signup brings us closer!
          </motion.p>
        </div>

        {/* Milestones Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          {featuredMilestones.map((milestone, i) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-8 relative z-10">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                      {milestone.is_unlocked ? (
                        <Trophy className="w-8 h-8 text-primary" />
                      ) : (
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <Badge variant={milestone.is_unlocked ? "default" : "secondary"}>
                      {milestone.is_unlocked ? 'Unlocked!' : `${milestone.contributor_count} helping`}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold mb-3">{milestone.milestone_name}</h3>
                  <p className="text-muted-foreground mb-6">{milestone.milestone_description}</p>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">
                        {milestone.current_value} / {milestone.target_value} members
                      </span>
                    </div>
                    <Progress value={milestone.progress_percentage} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{milestone.progress_percentage}% Complete</span>
                      <span className="text-muted-foreground">
                        {milestone.target_value - milestone.current_value} more to go!
                      </span>
                    </div>
                  </div>

                  {/* Reward */}
                  {milestone.reward_description && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-semibold">Unlock Reward:</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.reward_description}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" onClick={() => navigate('/auth?signup=true')} className="gap-2 shadow-glow">
            <Users className="w-5 h-5" />
            Join & Help Unlock Features
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Get $10 AI Mastering credit when you sign up + help unlock features for everyone!
          </p>
        </motion.div>
      </div>
    </section>
  );
};
