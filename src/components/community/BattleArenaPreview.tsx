import { motion } from 'framer-motion';
import { Swords, Trophy, Users, Timer, Vote, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

export const BattleArenaPreview = () => {
  const { data: battles, isLoading } = useQuery({
    queryKey: ['featured-battle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('votes_count', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const featuredBattle = battles?.[0];
  const otherBattles = battles?.slice(1) || [];

  // Calculate vote percentages (simulated if no real votes)
  const totalVotes = (featuredBattle?.votes_count || 0) + 10;
  const rapper1Votes = Math.floor(totalVotes * 0.45);
  const rapper2Votes = totalVotes - rapper1Votes;
  const rapper1Percent = Math.round((rapper1Votes / totalVotes) * 100);
  const rapper2Percent = 100 - rapper1Percent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Swords className="w-8 h-8 text-primary" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold">The Arena</h2>
        </div>
        <Link to="/community">
          <Button variant="outline" size="sm" className="gap-2">
            Enter Arena
            <Swords className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Featured Battle */}
      {featuredBattle ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent-blue/10 border border-primary/20 p-6"
        >
          {/* VS Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
              <Flame className="w-3 h-3" />
              HOT BATTLE
            </Badge>
          </div>

          <h3 className="text-xl font-bold mb-6">{featuredBattle.title}</h3>

          {/* Battle Participants */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
            {/* Rapper 1 */}
            <div className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold mb-2"
                animate={{ boxShadow: ['0 0 20px rgba(var(--primary), 0.3)', '0 0 40px rgba(var(--primary), 0.5)', '0 0 20px rgba(var(--primary), 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {featuredBattle.rapper1?.charAt(0) || 'A'}
              </motion.div>
              <div className="font-semibold">{featuredBattle.rapper1 || 'Artist A'}</div>
              <div className="text-sm text-muted-foreground">{rapper1Votes} votes</div>
            </div>

            {/* VS */}
            <motion.div
              className="text-4xl font-black text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              VS
            </motion.div>

            {/* Rapper 2 */}
            <div className="text-center">
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center text-3xl font-bold mb-2"
                animate={{ boxShadow: ['0 0 20px rgba(var(--accent-blue), 0.3)', '0 0 40px rgba(var(--accent-blue), 0.5)', '0 0 20px rgba(var(--accent-blue), 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {featuredBattle.rapper2?.charAt(0) || 'B'}
              </motion.div>
              <div className="font-semibold">{featuredBattle.rapper2 || 'Artist B'}</div>
              <div className="text-sm text-muted-foreground">{rapper2Votes} votes</div>
            </div>
          </div>

          {/* Vote Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">{rapper1Percent}%</span>
              <span className="text-accent-blue font-medium">{rapper2Percent}%</span>
            </div>
            <div className="h-3 rounded-full bg-background/50 overflow-hidden flex">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${rapper1Percent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.div
                className="h-full bg-gradient-to-r from-accent-blue/70 to-accent-blue"
                initial={{ width: 0 }}
                animate={{ width: `${rapper2Percent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Stats & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Vote className="w-4 h-4" />
                {totalVotes} total votes
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {featuredBattle.views_count || 0} views
              </span>
            </div>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Vote className="w-4 h-4" />
              Cast Your Vote
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="p-8 rounded-2xl bg-card/30 border border-white/5 text-center">
          <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active battles right now</p>
        </div>
      )}

      {/* Other Battles */}
      {otherBattles.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {otherBattles.map((battle, i) => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-xl bg-card/30 border border-white/5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold truncate">{battle.title}</span>
                {battle.battle_type === 'tournament' && (
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {battle.rapper1} vs {battle.rapper2}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{battle.votes_count || 0} votes</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  Vote
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleArenaPreview;
