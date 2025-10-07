import { motion } from 'framer-motion';
import { Lock, Unlock, Users, Trophy, Sparkles, Zap, Crown, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unlocked: boolean;
  icon: any;
  reward: string;
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'Community Foundations',
    description: 'Reach 100 active members',
    target: 100,
    current: 87,
    unlocked: false,
    icon: Users,
    reward: 'Unlock Group Collaboration Rooms'
  },
  {
    id: '2',
    title: 'First 1000',
    description: 'Welcome 1,000 artists & engineers',
    target: 1000,
    current: 234,
    unlocked: false,
    icon: Trophy,
    reward: 'Unlock Advanced AI Mastering Tools'
  },
  {
    id: '3',
    title: 'Battle Ready',
    description: 'Host 50 mix battles',
    target: 50,
    current: 12,
    unlocked: false,
    icon: Zap,
    reward: 'Unlock Tournament Mode & Prize Pool'
  },
  {
    id: '4',
    title: 'Global Network',
    description: 'Reach 5,000 community members',
    target: 5000,
    current: 234,
    unlocked: false,
    icon: Rocket,
    reward: 'Unlock Regional Hubs & Local Events'
  },
  {
    id: '5',
    title: 'Industry Standard',
    description: 'Complete 10,000 projects',
    target: 10000,
    current: 1456,
    unlocked: false,
    icon: Crown,
    reward: 'Unlock Professional Certification Program'
  },
  {
    id: '6',
    title: 'AI Evolution',
    description: '100,000 AI analyses completed',
    target: 100000,
    current: 8934,
    unlocked: false,
    icon: Sparkles,
    reward: 'Unlock Prime 5.0 Beta Access'
  }
];

export const UnlockablesSection = () => {
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
          {milestones.map((milestone, index) => {
            const progress = (milestone.current / milestone.target) * 100;
            const Icon = milestone.icon;
            
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
                  milestone.unlocked 
                    ? 'border-primary shadow-glow' 
                    : progress > 80 
                    ? 'border-primary/50' 
                    : 'border-border hover:border-primary/30'
                }`}>
                  {/* Status indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      milestone.unlocked 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        milestone.unlocked 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    {milestone.unlocked ? (
                      <Unlock className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {milestone.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>

                  {/* Reward */}
                  <div className={`p-3 rounded-lg border ${
                    milestone.unlocked 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/50 border-border'
                  }`}>
                    <p className="text-xs font-medium">
                      {milestone.unlocked ? '✓ Unlocked:' : '🔒 Unlocks:'} {milestone.reward}
                    </p>
                  </div>

                  {/* Pulse effect for near completion */}
                  {!milestone.unlocked && progress > 80 && (
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
