import { motion } from 'framer-motion';
import { Crown, Medal, Award, TrendingUp, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFanLeaderboard, LeaderboardEntry } from '@/hooks/useFanLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { MixxCoin } from '@/components/economy/MixxCoin';

const TIER_COLORS: Record<string, string> = {
  newcomer: 'text-zinc-400',
  supporter: 'text-blue-400',
  advocate: 'text-purple-400',
  champion: 'text-amber-400',
  legend: 'text-pink-400',
};

const RANK_ICONS = [
  { icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { icon: Medal, color: 'text-zinc-300', bgColor: 'bg-zinc-500/20' },
  { icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-600/20' },
];

interface LeaderboardWidgetProps {
  compact?: boolean;
}

export function LeaderboardWidget({ compact = true }: LeaderboardWidgetProps) {
  const { user } = useAuth();
  const { leaderboard, userRank, isUserInTop, isLoading } = useFanLeaderboard(compact ? 5 : 10);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  const renderEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.user_id === user?.id;
    const rankConfig = RANK_ICONS[entry.rank - 1];
    const tierColor = TIER_COLORS[entry.current_tier] || TIER_COLORS.newcomer;

    return (
      <motion.div
        key={entry.user_id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
          isCurrentUser 
            ? 'bg-primary/10 border border-primary/20' 
            : 'hover:bg-accent/50'
        }`}
      >
        {/* Rank */}
        <div className="w-8 flex justify-center">
          {rankConfig ? (
            <div className={`p-1.5 rounded-full ${rankConfig.bgColor}`}>
              <rankConfig.icon className={`h-4 w-4 ${rankConfig.color}`} />
            </div>
          ) : (
            <span className="text-sm font-bold text-muted-foreground">
              {entry.rank}
            </span>
          )}
        </div>

        {/* Avatar & Name */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={entry.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
            {entry.username ? `@${entry.username}` : entry.full_name || 'Anonymous'}
            {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
          </p>
          <p className={`text-xs capitalize ${tierColor}`}>
            {entry.current_tier}
          </p>
        </div>

        {/* Coinz Earned */}
        <div className="flex items-center gap-1 text-right">
          <MixxCoin type="earned" size="sm" />
          <span className="text-sm font-semibold">
            {entry.mixxcoinz_earned.toLocaleString()}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20">
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className="font-semibold">Top Fans</h3>
        </div>
        {compact && (
          <Badge variant="outline" className="text-xs">
            This Week
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        {leaderboard.map((entry, i) => renderEntry(entry, i))}
      </div>

      {/* User's rank if not in top */}
      {!isUserInTop && userRank && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Rank</span>
            <Badge variant="secondary" className="font-mono">
              #{userRank.toLocaleString()}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}
