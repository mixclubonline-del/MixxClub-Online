import { Trophy, Users, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const CommunityShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-6 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Join the Community
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Compete. Collaborate. Grow.
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of creators in monthly beat battles, climb the leaderboards, 
              and unlock exclusive achievements.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Beat Battles */}
            <div
              onClick={() => navigate('/beat-battle')}
              className="glass-studio rounded-3xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">Beat Battles</h3>
                  <p className="text-muted-foreground">
                    Monthly competitions with cash prizes and recognition
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <div className="text-2xl font-bold text-primary mb-1">$1.2K</div>
                  <div className="text-xs text-muted-foreground">Monthly Prizes</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <div className="text-2xl font-bold text-primary mb-1">170+</div>
                  <div className="text-xs text-muted-foreground">Active Battles</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <div className="text-2xl font-bold text-primary mb-1">5K+</div>
                  <div className="text-xs text-muted-foreground">Participants</div>
                </div>
              </div>

              <Button className="w-full shadow-glow">
                <Zap className="w-4 h-4 mr-2" />
                Join a Battle
              </Button>
            </div>

            {/* Leaderboards */}
            <div
              onClick={() => navigate('/leaderboard')}
              className="glass-studio rounded-3xl p-8 border-2 border-accent/30 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">Leaderboards</h3>
                  <p className="text-muted-foreground">
                    Compete for top spots and unlock exclusive badges
                  </p>
                </div>
              </div>

              {/* Top Performers Preview */}
              <div className="space-y-3 mb-6">
                {['Marcus Chen - 9,847 pts', 'Sarah Rodriguez - 8,923 pts', 'DJ Apex - 7,654 pts'].map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center text-sm font-bold">
                      #{i + 1}
                    </div>
                    <span className="text-sm flex-1">{entry}</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-500 text-xs">
                      🔥
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full border-2 border-accent/30 hover:bg-accent/10">
                View Full Leaderboard
              </Button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center glass-studio rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Start Building Your Reputation</h3>
            <p className="text-muted-foreground mb-6">
              Complete projects, win battles, and climb to the top. Unlock achievements and exclusive perks.
            </p>
            <Button onClick={() => navigate('/auth?signup=true')} size="lg" className="shadow-glow">
              Join the Community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};