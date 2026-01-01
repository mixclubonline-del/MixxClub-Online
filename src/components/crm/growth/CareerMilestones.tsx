import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Crown, Target, Music, DollarSign, Users, Mic, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

interface CareerMilestonesProps {
  userType: 'artist' | 'engineer';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  target: number;
  unit: string;
  achieved: boolean;
  reward: string;
  category: string;
}

export const CareerMilestones: React.FC<CareerMilestonesProps> = ({ userType }) => {
  const milestones: Milestone[] = userType === 'artist' ? [
    { id: '1', title: 'First Release', description: 'Release your first track', icon: Music, progress: 1, target: 1, unit: 'track', achieved: true, reward: '100 XP + Badge', category: 'releases' },
    { id: '2', title: 'Rising Star', description: 'Reach 1,000 streams', icon: Star, progress: 850, target: 1000, unit: 'streams', achieved: false, reward: '250 XP + Badge', category: 'growth' },
    { id: '3', title: 'Collaboration King', description: 'Complete 5 collabs', icon: Users, progress: 3, target: 5, unit: 'collabs', achieved: false, reward: '300 XP + Badge', category: 'community' },
    { id: '4', title: 'First Dollar', description: 'Earn your first $100', icon: DollarSign, progress: 45, target: 100, unit: 'USD', achieved: false, reward: '200 XP + Badge', category: 'revenue' },
    { id: '5', title: 'Vocal Master', description: 'Complete vocal training', icon: Mic, progress: 1, target: 1, unit: 'course', achieved: true, reward: '150 XP + Badge', category: 'skills' },
    { id: '6', title: 'Community Leader', description: 'Help 10 new artists', icon: Crown, progress: 6, target: 10, unit: 'artists', achieved: false, reward: '500 XP + Badge', category: 'community' },
  ] : [
    { id: '1', title: 'First Mix', description: 'Complete your first mix', icon: Headphones, progress: 1, target: 1, unit: 'project', achieved: true, reward: '100 XP + Badge', category: 'projects' },
    { id: '2', title: 'Client Magnet', description: 'Work with 10 clients', icon: Users, progress: 8, target: 10, unit: 'clients', achieved: false, reward: '300 XP + Badge', category: 'growth' },
    { id: '3', title: 'Revenue Milestone', description: 'Earn $1,000 total', icon: DollarSign, progress: 750, target: 1000, unit: 'USD', achieved: false, reward: '400 XP + Badge', category: 'revenue' },
    { id: '4', title: 'Five Star Engineer', description: 'Get 5 five-star reviews', icon: Star, progress: 4, target: 5, unit: 'reviews', achieved: false, reward: '250 XP + Badge', category: 'reputation' },
    { id: '5', title: 'Pro Tools Certified', description: 'Earn certification', icon: Trophy, progress: 1, target: 1, unit: 'cert', achieved: true, reward: '500 XP + Badge', category: 'skills' },
    { id: '6', title: 'Speed Demon', description: 'Deliver 10 projects early', icon: Zap, progress: 7, target: 10, unit: 'projects', achieved: false, reward: '350 XP + Badge', category: 'performance' },
  ];

  const categories = [...new Set(milestones.map(m => m.category))];
  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{achievedCount} / {milestones.length}</h3>
            <p className="text-muted-foreground">Milestones Achieved</p>
          </div>
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Badge key={category} variant="outline" className="capitalize">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-card/50 border-border/50 transition-all ${milestone.achieved ? 'border-yellow-500/50 bg-yellow-500/5' : 'hover:border-primary/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${milestone.achieved ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-muted'}`}>
                    <milestone.icon className={`w-6 h-6 ${milestone.achieved ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{milestone.title}</h4>
                      {milestone.achieved && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                          Achieved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{milestone.description}</p>

                    {!milestone.achieved && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{milestone.progress}/{milestone.target} {milestone.unit}</span>
                        </div>
                        <Progress value={(milestone.progress / milestone.target) * 100} className="h-1.5" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{milestone.reward}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
