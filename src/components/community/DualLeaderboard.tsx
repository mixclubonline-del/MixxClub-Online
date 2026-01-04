import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Trophy, Mic2, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface LeaderboardUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number | null;
  level: number | null;
  role: string | null;
}

export const DualLeaderboard = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const { data: allUsers } = useQuery({
    queryKey: ['leaderboard-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_xp, level, role')
        .order('total_xp', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as LeaderboardUser[];
    }
  });

  // Split into artists and engineers based on role
  const artists = allUsers?.filter(u => u.role === 'artist' || !u.role).slice(0, 10) || [];
  const engineers = allUsers?.filter(u => u.role === 'engineer').slice(0, 10) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 0) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rank === 1) return 'bg-gray-400/10 border-gray-400/30';
    if (rank === 2) return 'bg-orange-600/10 border-orange-600/30';
    return 'bg-card/30 border-white/5';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'GOAT';
    if (level >= 40) return 'Legend';
    if (level >= 30) return 'Master';
    if (level >= 20) return 'Pro';
    if (level >= 10) return 'Rising';
    return 'Newcomer';
  };

  const LeaderboardList = ({ users, type }: { users: LeaderboardUser[], type: 'artist' | 'engineer' }) => (
    <div className="space-y-2">
      {users.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: type === 'artist' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(i)}`}
        >
          {/* Rank */}
          <div className="w-8 text-center">
            {getRankIcon(i) || (
              <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
            )}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent-cyan/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold">{user.full_name?.charAt(0) || '?'}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.full_name || 'Anonymous'}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs h-5">
                Lv.{user.level || 1}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getLevelTitle(user.level || 1)}
              </span>
            </div>
          </div>

          {/* XP */}
          <div className="text-right">
            <div className="font-bold text-primary">{(user.total_xp || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
        </motion.div>
      ))}

      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No {type}s ranked yet
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold">Leaderboard</h2>
        </div>
        <div className="flex gap-1 bg-card/30 rounded-lg p-1">
          {(['weekly', 'monthly', 'alltime'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                timeframe === tf 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf === 'alltime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Leaderboard */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Mic2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Top Artists</h3>
          </div>
          <LeaderboardList users={artists} type="artist" />
        </motion.div>

        {/* Engineers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Headphones className="w-5 h-5 text-accent-cyan" />
            <h3 className="font-semibold">Top Engineers</h3>
          </div>
          <LeaderboardList users={engineers} type="engineer" />
        </motion.div>
      </div>
    </div>
  );
};

export default DualLeaderboard;
