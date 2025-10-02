import { useState } from 'react';
import { Music, Trophy, Users, Clock, Zap, Star, TrendingUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Battle {
  id: string;
  title: string;
  description: string;
  prize: string;
  entries: number;
  maxEntries: number;
  deadline: string;
  genre: string;
  status: 'active' | 'voting' | 'completed';
  topEntries?: Array<{
    artist: string;
    title: string;
    votes: number;
  }>;
}

const BeatBattle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null);

  const activeBattles: Battle[] = [
    {
      id: '1',
      title: 'Winter Trap Championship',
      description: 'Create the hardest trap beat with winter vibes',
      prize: '$500 + Featured Placement',
      entries: 47,
      maxEntries: 100,
      deadline: '3 days',
      genre: 'Trap',
      status: 'active'
    },
    {
      id: '2',
      title: 'Boom Bap Revival',
      description: 'Bring back the golden age of hip hop',
      prize: '$300 + Studio Session',
      entries: 89,
      maxEntries: 100,
      deadline: '1 day',
      genre: 'Boom Bap',
      status: 'voting',
      topEntries: [
        { artist: 'BeatMaker Pro', title: 'Classic Flow', votes: 234 },
        { artist: 'DJ Nostalgia', title: '90s Revival', votes: 187 },
        { artist: 'Sample King', title: 'Back to the Roots', votes: 156 }
      ]
    },
    {
      id: '3',
      title: 'Melodic Drill Battle',
      description: 'Combine drill energy with melodic elements',
      prize: '$400 + Engineer Collab',
      entries: 34,
      maxEntries: 75,
      deadline: '5 days',
      genre: 'Drill',
      status: 'active'
    }
  ];

  const pastWinners = [
    {
      battle: 'November Trap Battle',
      winner: 'Marcus Chen',
      track: 'Dark Nights',
      prize: '$500',
      votes: 423
    },
    {
      battle: 'October Lo-Fi Challenge',
      winner: 'Sarah M.',
      track: 'Sunset Dreams',
      prize: '$300',
      votes: 387
    }
  ];

  const handleJoinBattle = (battleId: string) => {
    if (!user) {
      navigate('/auth?signup=true');
      return;
    }
    setSelectedBattle(battleId);
    // In production, this would open an upload modal
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
              Monthly Beat Battles
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Compete. Create. Win.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Join our monthly beat battles, showcase your skills, and win cash prizes. 
              Get feedback from top engineers and grow your reputation.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass-studio rounded-xl p-4 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">$1,200</div>
                <div className="text-sm text-muted-foreground">Monthly Prizes</div>
              </div>
              <div className="glass-studio rounded-xl p-4 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">170+</div>
                <div className="text-sm text-muted-foreground">Active Battles</div>
              </div>
              <div className="glass-studio rounded-xl p-4 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">5K+</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Battles Section */}
      <section className="py-20">
        <div className="container px-6">
          <Tabs defaultValue="active" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="active">Active Battles</TabsTrigger>
              <TabsTrigger value="voting">Voting Phase</TabsTrigger>
              <TabsTrigger value="past">Past Winners</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeBattles.filter(b => b.status === 'active').map(battle => (
                <div
                  key={battle.id}
                  className="glass-studio rounded-2xl p-8 border border-primary/30 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Music className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">{battle.title}</h3>
                            <Badge variant="outline" className="border-primary/30">
                              {battle.genre}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{battle.description}</p>
                          
                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-yellow-500">{battle.prize}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              <span>{battle.entries}/{battle.maxEntries} entries</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-accent" />
                              <span>{battle.deadline} remaining</span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mt-4">
                            <Progress value={(battle.entries / battle.maxEntries) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleJoinBattle(battle.id)}
                      size="lg"
                      className="shadow-glow"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Submit Entry
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="voting" className="space-y-6">
              {activeBattles.filter(b => b.status === 'voting').map(battle => (
                <div
                  key={battle.id}
                  className="glass-studio rounded-2xl p-8 border border-primary/30"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{battle.title}</h3>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          Voting Open
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{battle.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Voting ends in {battle.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Entries */}
                  {battle.topEntries && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Leading Entries
                      </h4>
                      {battle.topEntries.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-muted-foreground">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{entry.title}</div>
                              <div className="text-sm text-muted-foreground">by {entry.artist}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-primary">{entry.votes}</div>
                              <div className="text-xs text-muted-foreground">votes</div>
                            </div>
                            <Button size="sm" variant="outline">
                              Vote
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastWinners.map((winner, index) => (
                <div
                  key={index}
                  className="glass-studio rounded-2xl p-8 border border-yellow-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">{winner.battle}</div>
                      <h3 className="text-xl font-bold mb-2">{winner.track}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">by <span className="font-semibold text-foreground">{winner.winner}</span></span>
                        <span>•</span>
                        <span className="text-yellow-500 font-semibold">{winner.prize}</span>
                        <span>•</span>
                        <span className="text-muted-foreground">{winner.votes} votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How Beat Battles Work</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">1. Submit Your Beat</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your best work before the deadline
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">2. Community Votes</h3>
                <p className="text-sm text-muted-foreground">
                  Artists and engineers vote for their favorites
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">3. Win Prizes</h3>
                <p className="text-sm text-muted-foreground">
                  Top entries win cash and recognition
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeatBattle;