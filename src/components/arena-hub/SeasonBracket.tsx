import { useCurrentSeason, useSeasonLeaderboard, useUserSeasonStats } from '@/hooks/useBattleSeasons';
import { GlassPanel, HubHeader, HubSkeleton } from '@/components/crm/design';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Calendar, Coins, Swords } from 'lucide-react';

export function SeasonBracket() {
  const { data: season, isLoading: seasonLoading } = useCurrentSeason();
  const { data: leaderboard, isLoading: lbLoading } = useSeasonLeaderboard(season?.id);
  const { data: userStats } = useUserSeasonStats(season?.id);

  if (seasonLoading || lbLoading) return <HubSkeleton variant="list" count={5} />;

  if (!season) {
    return (
      <GlassPanel padding="p-8" className="text-center">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-semibold mb-1">No Active Season</h3>
        <p className="text-sm text-muted-foreground">The next battle season will be announced soon.</p>
      </GlassPanel>
    );
  }

  const rankIcons: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Swords className="h-5 w-5 text-red-400" />}
        title={season.name}
        subtitle={`Season ${season.season_number} · ${season.status}`}
        accent="rgba(239, 68, 68, 0.5)"
      />

      {/* Season info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassPanel padding="p-4" accent="rgba(239, 68, 68, 0.3)">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Prize Pool</span>
          </div>
          <p className="text-xl font-bold">${((season.prize_pool_cents || 0) / 100).toFixed(0)}</p>
        </GlassPanel>
        <GlassPanel padding="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Started</span>
          </div>
          <p className="text-sm font-medium">{new Date(season.start_date).toLocaleDateString()}</p>
        </GlassPanel>
        <GlassPanel padding="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Medal className="h-4 w-4" />
            <span className="text-xs">Participants</span>
          </div>
          <p className="text-xl font-bold">{leaderboard?.length || 0}</p>
        </GlassPanel>
        {userStats && (
          <GlassPanel padding="p-4" accent="rgba(168, 85, 247, 0.3)">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="h-4 w-4" />
              <span className="text-xs">Your Rank</span>
            </div>
            <p className="text-xl font-bold">#{userStats.rank || '—'}</p>
            <p className="text-xs text-muted-foreground">
              {userStats.wins}W / {userStats.losses}L · {userStats.points} pts
            </p>
          </GlassPanel>
        )}
      </div>

      {/* Leaderboard */}
      <GlassPanel padding="p-4">
        <h3 className="font-semibold mb-4">Standings</h3>
        {(!leaderboard || leaderboard.length === 0) ? (
          <p className="text-center text-muted-foreground py-8">No entries yet for this season.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const profile = entry.profile;
              const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    rank <= 3 ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="text-lg w-8 text-center font-bold">
                    {rankIcons[rank] || `#${rank}`}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {profile?.full_name || profile?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.wins}W / {entry.losses}L / {entry.draws}D
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {entry.points} pts
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
