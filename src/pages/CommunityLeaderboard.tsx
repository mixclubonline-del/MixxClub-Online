import { useState } from 'react';
import { Trophy, Star, TrendingUp, Award, Users, Zap, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  badge?: string;
  streak?: number;
  achievements?: number;
}

const CommunityLeaderboard = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const topArtists: LeaderboardEntry[] = [
    { rank: 1, userId: '1', name: 'Marcus Chen', avatar: '/placeholder.svg', score: 9847, badge: 'Platinum', streak: 23, achievements: 47 },
    { rank: 2, userId: '2', name: 'Sarah Rodriguez', avatar: '/placeholder.svg', score: 8923, badge: 'Gold', streak: 15, achievements: 42 },
    { rank: 3, userId: '3', name: 'DJ Apex', avatar: '/placeholder.svg', score: 7654, badge: 'Gold', streak: 12, achievements: 38 },
    { rank: 4, userId: '4', name: 'Lisa Chen', avatar: '/placeholder.svg', score: 7234, achievements: 35 },
    { rank: 5, userId: '5', name: 'Mike Johnson', avatar: '/placeholder.svg', score: 6892, achievements: 32 },
  ];

  const topEngineers: LeaderboardEntry[] = [
    { rank: 1, userId: '10', name: 'Pro Audio Mike', avatar: '/placeholder.svg', score: 12847, badge: 'Diamond', streak: 45, achievements: 67 },
    { rank: 2, userId: '11', name: 'Mix Master J', avatar: '/placeholder.svg', score: 11234, badge: 'Platinum', streak: 32, achievements: 58 },
    { rank: 3, userId: '12', name: 'Studio Ace', avatar: '/placeholder.svg', score: 9876, badge: 'Gold', streak: 28, achievements: 52 },
    { rank: 4, userId: '13', name: 'Sound Wizard', avatar: '/placeholder.svg', score: 8654, achievements: 45 },
    { rank: 5, userId: '14', name: 'Audio Pro', avatar: '/placeholder.svg', score: 7892, achievements: 41 },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 via-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-400 via-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-600 via-orange-500 to-orange-600';
    return 'from-primary/50 to-accent/50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-500" />;
    return <Star className="w-4 h-4 text-primary" />;
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`glass-studio rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
            entry.rank <= 3 
              ? 'border-primary/50 shadow-glow' 
              : 'border-primary/20 hover:border-primary/40'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center flex-shrink-0`}>
              {entry.rank <= 3 ? (
                getRankIcon(entry.rank)
              ) : (
                <span className="text-xl font-black text-white">#{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold truncate">{entry.name}</h3>
                {entry.badge && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                    {entry.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{entry.score.toLocaleString()} pts</span>
                </div>
                {entry.streak && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>{entry.streak} day streak</span>
                  </div>
                )}
                {entry.achievements && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-green-500" />
                    <span>{entry.achievements} achievements</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score Badge */}
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Community Leaderboards
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Top Creators
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Compete with the best artists and engineers. Earn points through projects, 
              beat battles, and community engagement.
            </p>

            {/* Period Selector */}
            <div className="flex justify-center gap-2 mb-12">
              {(['weekly', 'monthly', 'alltime'] as const).map((p) => (
                <Badge
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 transition-all"
                  onClick={() => setPeriod(p)}
                >
                  {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-20">
        <div className="container px-6">
          <Tabs defaultValue="artists" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12">
              <TabsTrigger value="artists">Top Artists</TabsTrigger>
              <TabsTrigger value="engineers">Top Engineers</TabsTrigger>
            </TabsList>

            <TabsContent value="artists">
              {renderLeaderboard(topArtists)}
            </TabsContent>

            <TabsContent value="engineers">
              {renderLeaderboard(topEngineers)}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How Points Work */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How to Earn Points</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-studio rounded-xl p-6 border border-primary/20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Complete Projects</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Earn points for every completed mixing or mastering project
                </p>
                <div className="text-2xl font-bold text-primary">+100 pts</div>
              </div>

              <div className="glass-studio rounded-xl p-6 border border-primary/20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Win Beat Battles</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  First place in beat battles gets massive point bonuses
                </p>
                <div className="text-2xl font-bold text-primary">+500 pts</div>
              </div>

              <div className="glass-studio rounded-xl p-6 border border-primary/20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Get Reviews</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  5-star reviews from clients boost your score
                </p>
                <div className="text-2xl font-bold text-primary">+50 pts</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityLeaderboard;