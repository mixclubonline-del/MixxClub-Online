/**
 * CommunityUnlocksWidget
 * 
 * Platform-wide progress display for CRM dashboards.
 * Shows next community milestone and recent unlocks.
 */

import { motion } from 'framer-motion';
import { Lock, Unlock, Users, Sparkles, Share2 } from 'lucide-react';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommunityUnlocksWidgetProps {
  className?: string;
}

export function CommunityUnlocksWidget({ className }: CommunityUnlocksWidgetProps) {
  const { data: milestones, isLoading } = useCommunityMilestones();

  if (isLoading) {
    return (
      <Card className={cn('bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader>
          <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
            <div className="h-8 w-full bg-muted/50 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const unlockedMilestones = milestones.filter((m) => m.is_unlocked);
  const lockedMilestones = milestones.filter((m) => !m.is_unlocked);
  const nextMilestone = lockedMilestones[0];
  const recentUnlocks = unlockedMilestones.slice(0, 3);

  const handleShare = () => {
    const shareText = nextMilestone
      ? `We're ${nextMilestone.progress_percentage}% of the way to unlocking ${nextMilestone.milestone_name} on MixxClub! Join us and help unlock new features.`
      : 'Join MixxClub and help unlock new features together!';
    
    if (navigator.share) {
      navigator.share({
        title: 'MixxClub Community Progress',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Card className={cn('bg-card/50 backdrop-blur-sm border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Community Progress</CardTitle>
              <CardDescription className="text-xs">
                {unlockedMilestones.length} of {milestones.length} unlocked
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Together
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Milestone */}
        {nextMilestone ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {nextMilestone.milestone_name}
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {nextMilestone.progress_percentage}%
              </span>
            </div>

            <Progress value={nextMilestone.progress_percentage} className="h-3 mb-2" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{nextMilestone.current_value} members</span>
              <span>{nextMilestone.target_value - nextMilestone.current_value} more needed</span>
            </div>

            {nextMilestone.reward_description && (
              <p className="mt-2 text-xs text-primary/80">
                🎁 Unlocks: {nextMilestone.reward_description}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-500">All milestones unlocked!</p>
            <p className="text-xs text-muted-foreground">You're part of something legendary.</p>
          </div>
        )}

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Unlocks
            </h4>
            <div className="space-y-1.5">
              {recentUnlocks.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Unlock className="w-3 h-3 text-green-500" />
                  <span className="text-foreground">{milestone.milestone_name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Share CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Invite Friends to Unlock Faster
        </Button>
      </CardContent>
    </Card>
  );
}
