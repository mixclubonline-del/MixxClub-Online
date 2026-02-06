import { motion } from 'framer-motion';
import { Crown, Medal, Award, TrendingUp, User } from 'lucide-react';
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
  { icon: Crown, color: 'text-amber-400', glow: 'rgba(251,191,36,0.2)' },
  { icon: Medal, color: 'text-zinc-300', glow: 'rgba(212,212,216,0.15)' },
  { icon: Award, color: 'text-amber-600', glow: 'rgba(217,119,6,0.15)' },
];

interface LeaderboardWidgetProps {
  compact?: boolean;
}

export function LeaderboardWidget({ compact = true }: LeaderboardWidgetProps) {
  const { user } = useAuth();
  const { leaderboard, userRank, isUserInTop, isLoading } = useFanLeaderboard(compact ? 5 : 10);

  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-white/[0.06] p-4"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
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
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
          isCurrentUser 
            ? 'border border-primary/20' 
            : 'hover:bg-white/[0.03]'
        }`}
        style={isCurrentUser ? { background: 'rgba(var(--primary), 0.06)' } : undefined}
      >
        {/* Rank */}
        <div className="w-8 flex justify-center">
          {rankConfig ? (
            <div
              className="p-1.5 rounded-full"
              style={{ background: rankConfig.glow }}
            >
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div
        className="relative rounded-xl border border-purple-500/10 p-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(244,114,182,0.04) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'rgba(168,85,247,0.15)' }}
              >
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="font-semibold">Top Fans</h3>
            </div>
            {compact && (
              <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03]">
                This Week
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {leaderboard.map((entry, i) => renderEntry(entry, i))}
          </div>

          {/* User's rank if not in top */}
          {!isUserInTop && userRank && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Rank</span>
                <Badge variant="secondary" className="font-mono">
                  #{userRank.toLocaleString()}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
