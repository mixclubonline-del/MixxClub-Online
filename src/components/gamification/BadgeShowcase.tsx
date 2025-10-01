import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Target, Award, Crown, Flame } from "lucide-react";

interface BadgeItem {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

interface BadgeShowcaseProps {
  badges: BadgeItem[];
}

export const BadgeShowcase = ({ badges }: BadgeShowcaseProps) => {
  const getBadgeIcon = (type: string) => {
    if (type.includes('project')) return <Trophy className="h-6 w-6" />;
    if (type.includes('star') || type.includes('rating')) return <Star className="h-6 w-6" />;
    if (type.includes('streak')) return <Flame className="h-6 w-6" />;
    if (type.includes('speed')) return <Zap className="h-6 w-6" />;
    if (type.includes('earner')) return <Crown className="h-6 w-6" />;
    return <Award className="h-6 w-6" />;
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic': return 'from-purple-400 via-pink-500 to-purple-600';
      case 'rare': return 'from-blue-400 via-cyan-500 to-blue-600';
      default: return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 shadow-yellow-500/20';
      case 'epic': return 'border-purple-500 shadow-purple-500/20';
      case 'rare': return 'border-blue-500 shadow-blue-500/20';
      default: return 'border-gray-500 shadow-gray-500/20';
    }
  };

  const sortedBadges = [...badges].sort((a, b) => {
    const rarityOrder: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return (rarityOrder[b.badge_rarity || 'common'] || 0) - (rarityOrder[a.badge_rarity || 'common'] || 0);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Award className="h-5 w-5" />
        Badge Collection ({badges.length})
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedBadges.map((badge) => (
          <Card 
            key={badge.id}
            className={`relative overflow-hidden border-2 ${getRarityBorder(badge.badge_rarity)} transition-all hover:scale-105 hover:shadow-lg`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(badge.badge_rarity)} opacity-10`} />
            
            <div className="relative p-4 space-y-3 text-center">
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(badge.badge_rarity)} flex items-center justify-center text-white shadow-lg`}>
                {getBadgeIcon(badge.badge_type)}
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1">{badge.badge_name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {badge.badge_description}
                </p>
              </div>

              <Badge 
                variant="secondary" 
                className={`text-xs capitalize bg-gradient-to-r ${getRarityColor(badge.badge_rarity)} text-white border-0`}
              >
                {badge.badge_rarity || 'common'}
              </Badge>

              <p className="text-xs text-muted-foreground">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}

        {badges.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h4 className="font-semibold mb-2">No Badges Yet</h4>
            <p className="text-sm text-muted-foreground">
              Complete projects to earn badges and build your collection!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
