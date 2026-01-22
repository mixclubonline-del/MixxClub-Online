import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, Gift, Flame, Calendar, Award, Users, Share2, MessageCircle, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMissions, MissionWithProgress } from '@/hooks/useMissions';

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  Check,
  Gift,
  Flame,
  Calendar,
  Award,
  Users,
  Share2,
  MessageCircle,
  UserPlus,
  Zap: Flame,
  Sparkles: Award,
  Vote: Check,
};

interface MissionCardProps {
  mission: MissionWithProgress;
  onClaim: (id: string) => void;
  isClaiming: boolean;
}

function MissionCard({ mission, onClaim, isClaiming }: MissionCardProps) {
  const Icon = ICON_MAP[mission.icon_name] || Target;
  const canClaim = mission.isCompleted && !mission.isClaimed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className={`p-4 transition-all ${
        mission.isClaimed 
          ? 'bg-muted/30 opacity-60' 
          : canClaim 
            ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/30' 
            : 'hover:bg-accent/50'
      }`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${
            mission.isClaimed 
              ? 'bg-muted' 
              : canClaim 
                ? 'bg-emerald-500/20' 
                : 'bg-primary/10'
          }`}>
            {mission.isClaimed ? (
              <Check className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Icon className={`h-5 w-5 ${canClaim ? 'text-emerald-400' : 'text-primary'}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{mission.name}</h4>
              {mission.repeatable && (
                <Badge variant="outline" className="text-[10px] px-1.5">
                  {mission.reset_interval?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {mission.progress?.current_value || 0} / {mission.target_value}
                </span>
                <span className="font-medium text-amber-400">
                  +{mission.coinz_reward} coinz
                </span>
              </div>
              <Progress 
                value={mission.progressPercent} 
                className="h-2"
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            {canClaim ? (
              <Button
                size="sm"
                onClick={() => onClaim(mission.id)}
                disabled={isClaiming}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Gift className="h-4 w-4 mr-1" />
                Claim
              </Button>
            ) : mission.isClaimed ? (
              <Badge variant="secondary">Claimed</Badge>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function MissionsList() {
  const {
    dailyMissions,
    weeklyMissions,
    achievementMissions,
    isLoading,
    unclaimedRewards,
    claimReward,
    isClaiming,
  } = useMissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unclaimed Rewards Banner */}
      {unclaimedRewards > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Gift className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Unclaimed Rewards!</p>
                  <p className="text-sm text-muted-foreground">
                    You have {unclaimedRewards} coinz waiting to be claimed
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Mission Tabs */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Flame className="h-4 w-4" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {dailyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={claimReward}
                isClaiming={isClaiming}
              />
            ))}
          </AnimatePresence>
          {dailyMissions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No daily missions available
            </p>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {weeklyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={claimReward}
                isClaiming={isClaiming}
              />
            ))}
          </AnimatePresence>
          {weeklyMissions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No weekly missions available
            </p>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {achievementMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={claimReward}
                isClaiming={isClaiming}
              />
            ))}
          </AnimatePresence>
          {achievementMissions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No achievements available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
