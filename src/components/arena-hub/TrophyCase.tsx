import { useUserTrophies } from '@/hooks/useBattleSeasons';
import { GlassPanel } from '@/components/crm/design';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award } from 'lucide-react';

interface TrophyCaseProps {
  userId?: string;
}

export function TrophyCase({ userId }: TrophyCaseProps) {
  const { data: entries, isLoading } = useUserTrophies(userId);

  if (isLoading) {
    return (
      <GlassPanel padding="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 w-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </GlassPanel>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <GlassPanel padding="p-6" className="text-center">
        <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No battle trophies yet</p>
      </GlassPanel>
    );
  }

  const rankColors: Record<number, string> = {
    1: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    2: 'from-gray-300/20 to-gray-400/10 border-gray-400/30',
    3: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  };

  const rankEmoji: Record<number, string> = {
    1: '🏆', 2: '🥈', 3: '🥉',
  };

  return (
    <GlassPanel padding="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">Trophy Case</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map(entry => {
          const season = (entry as any).season;
          const rank = entry.rank || 0;
          const colorClass = rankColors[rank] || 'from-muted/20 to-muted/10 border-border/30';

          return (
            <div
              key={entry.id}
              className={`relative rounded-xl border bg-gradient-to-br p-4 text-center ${colorClass}`}
            >
              <span className="text-3xl block mb-1">
                {rankEmoji[rank] || '🎖️'}
              </span>
              <p className="text-xs font-medium truncate">
                {season?.name || `Season ${season?.season_number || '?'}`}
              </p>
              <Badge variant="outline" className="text-[10px] mt-1">
                #{rank || '—'} · {entry.points}pts
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {entry.wins}W/{entry.losses}L
              </p>
            </div>
          );
        })}
      </div>

      {/* Individual trophies from JSONB */}
      {entries.some(e => e.trophies.length > 0) && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium mb-2">Special Trophies</h4>
          <div className="flex flex-wrap gap-2">
            {entries.flatMap(e => e.trophies).map((trophy, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                <span>{trophy.icon}</span>
                <span className="text-xs">{trophy.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
